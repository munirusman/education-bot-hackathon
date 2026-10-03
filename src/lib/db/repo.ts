import { randomUUID } from "node:crypto";
import type { HarnessEvent, Policy, PolicyOverride } from "@/lib/contracts";
import { policySchema } from "@/lib/contracts";
import { getDb, type Db } from "./client.ts";

export const newId = (prefix: string) => `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
const iso = (v: unknown): string | null => (v == null ? null : new Date(v as string | Date).toISOString());

export type User = { id: string; name: string; role: "teacher" | "student" | "admin" };
export type ClassRow = { id: string; teacherId: string; name: string; joinCode: string; activePolicyId: string | null };
export type EnvRow = {
  id: string;
  classId: string;
  studentId: string;
  harnessSessionId: string | null;
  sandboxId: string;
  resumeState: string | null;
  status: string;
  policyOverride: PolicyOverride | null;
  lastActiveAt: string | null;
  createdAt: string;
};
export type FlagRow = {
  id: string;
  environmentId: string;
  turnId: string | null;
  kind: string;
  confidence: number;
  detail: string;
  evidence: string;
  resolved: boolean;
  at: string;
};
export type ApprovalRow = {
  id: string;
  environmentId: string;
  turnId: string | null;
  toolCallId: string;
  toolName: string;
  input: unknown;
  status: "pending" | "approved" | "denied";
  reason: string | null;
};
export type TurnRow = {
  id: string;
  environmentId: string;
  policyVersion: number;
  prompt: string;
  startedAt: string;
  endedAt: string | null;
  model: string | null;
  stopReason: string | null;
  flags: string[];
};

type Row = Record<string, any>;

const mapEnv = (r: Row): EnvRow => ({
  id: r.id,
  classId: r.class_id,
  studentId: r.student_id,
  harnessSessionId: r.harness_session_id,
  sandboxId: r.sandbox_id,
  resumeState: r.resume_state,
  status: r.status,
  policyOverride: r.policy_override_json ?? null,
  lastActiveAt: iso(r.last_active_at),
  createdAt: iso(r.created_at)!,
});
const mapFlag = (r: Row): FlagRow => ({
  id: r.id,
  environmentId: r.environment_id,
  turnId: r.turn_id,
  kind: r.kind,
  confidence: r.confidence,
  detail: r.detail,
  evidence: r.evidence,
  resolved: r.resolved,
  at: iso(r.at)!,
});
const mapApproval = (r: Row): ApprovalRow => ({
  id: r.id,
  environmentId: r.environment_id,
  turnId: r.turn_id,
  toolCallId: r.tool_call_id,
  toolName: r.tool_name,
  input: r.input,
  status: r.status,
  reason: r.reason,
});
const mapTurn = (r: Row): TurnRow => ({
  id: r.id,
  environmentId: r.environment_id,
  policyVersion: r.policy_version,
  prompt: r.prompt,
  startedAt: iso(r.started_at)!,
  endedAt: iso(r.ended_at),
  model: r.model,
  stopReason: r.stop_reason,
  flags: r.flags ?? [],
});

/** Typed repository functions. Takes a Db so tests can pass an in-memory one. */
export function createRepo(dbp: Promise<Db> | Db = getDb()) {
  const q = async <T = Row>(sql: string, params?: unknown[]) => (await dbp).query<T>(sql, params);

  return {
    // ---- users ----------------------------------------------------------
    async upsertUser(u: User & { schoolId?: string }) {
      await q(
        `INSERT INTO users (id,name,role,school_id) VALUES ($1,$2,$3,$4)
         ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, role=EXCLUDED.role`,
        [u.id, u.name, u.role, u.schoolId ?? null],
      );
    },
    async getUser(id: string): Promise<User | null> {
      const [r] = await q(`SELECT id,name,role FROM users WHERE id=$1`, [id]);
      return r ? { id: r.id, name: r.name, role: r.role } : null;
    },
    async listUsers(role?: User["role"]): Promise<User[]> {
      const rows = role
        ? await q(`SELECT id,name,role FROM users WHERE role=$1 ORDER BY name`, [role])
        : await q(`SELECT id,name,role FROM users ORDER BY role,name`);
      return rows.map((r) => ({ id: r.id, name: r.name, role: r.role }));
    },

    // ---- classes & enrollment ---------------------------------------------
    async createClass(input: { teacherId: string; name: string; policy: Omit<Policy, "version"> }) {
      const id = newId("cls");
      const joinCode = randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
      await q(`INSERT INTO classes (id,teacher_id,name,join_code) VALUES ($1,$2,$3,$4)`, [
        id,
        input.teacherId,
        input.name,
        joinCode,
      ]);
      await this.savePolicy(id, input.policy);
      return (await this.getClass(id))!;
    },
    async getClass(id: string): Promise<ClassRow | null> {
      const [r] = await q(`SELECT * FROM classes WHERE id=$1`, [id]);
      return r ? { id: r.id, teacherId: r.teacher_id, name: r.name, joinCode: r.join_code, activePolicyId: r.active_policy_id } : null;
    },
    async getClassByJoinCode(code: string) {
      const [r] = await q(`SELECT id FROM classes WHERE join_code=$1`, [code.toUpperCase()]);
      return r ? this.getClass(r.id) : null;
    },
    async listClassesForTeacher(teacherId: string): Promise<ClassRow[]> {
      const rows = await q(`SELECT * FROM classes WHERE teacher_id=$1 ORDER BY name`, [teacherId]);
      return rows.map((r) => ({ id: r.id, teacherId: r.teacher_id, name: r.name, joinCode: r.join_code, activePolicyId: r.active_policy_id }));
    },
    async listClassesForStudent(studentId: string): Promise<ClassRow[]> {
      const rows = await q(
        `SELECT c.* FROM classes c JOIN enrollments e ON e.class_id=c.id
         WHERE e.student_id=$1 AND e.status='active' ORDER BY c.name`,
        [studentId],
      );
      return rows.map((r) => ({ id: r.id, teacherId: r.teacher_id, name: r.name, joinCode: r.join_code, activePolicyId: r.active_policy_id }));
    },
    async enroll(classId: string, studentId: string) {
      await q(
        `INSERT INTO enrollments (class_id,student_id) VALUES ($1,$2)
         ON CONFLICT (class_id,student_id) DO UPDATE SET status='active'`,
        [classId, studentId],
      );
    },
    async isEnrolled(classId: string, studentId: string) {
      const rows = await q(`SELECT 1 FROM enrollments WHERE class_id=$1 AND student_id=$2 AND status='active'`, [classId, studentId]);
      return rows.length > 0;
    },
    async listStudents(classId: string): Promise<User[]> {
      const rows = await q(
        `SELECT u.id,u.name,u.role FROM users u JOIN enrollments e ON e.student_id=u.id
         WHERE e.class_id=$1 AND e.status='active' ORDER BY u.name`,
        [classId],
      );
      return rows.map((r) => ({ id: r.id, name: r.name, role: r.role }));
    },

    // ---- policies ---------------------------------------------------------
    /** Versioned: every save is a new row, and becomes the class's active policy. */
    async savePolicy(classId: string, policy: Omit<Policy, "version">): Promise<Policy> {
      const [row] = await q(`SELECT COALESCE(MAX(version),0)+1 AS v FROM policies WHERE class_id=$1`, [classId]);
      const full = policySchema.parse({ ...policy, version: Number(row?.v ?? 1) });
      const id = newId("pol");
      await q(`INSERT INTO policies (id,class_id,version,json) VALUES ($1,$2,$3,$4)`, [id, classId, full.version, JSON.stringify(full)]);
      await q(`UPDATE classes SET active_policy_id=$1 WHERE id=$2`, [id, classId]);
      return full;
    },
    async getActivePolicy(classId: string): Promise<Policy> {
      const [r] = await q(
        `SELECT p.json FROM policies p JOIN classes c ON c.active_policy_id=p.id WHERE c.id=$1`,
        [classId],
      );
      if (!r) throw new Error(`class ${classId} has no active policy`);
      return policySchema.parse(r.json);
    },
    async listPolicies(classId: string): Promise<Policy[]> {
      const rows = await q(`SELECT json FROM policies WHERE class_id=$1 ORDER BY version DESC`, [classId]);
      return rows.map((r) => policySchema.parse(r.json));
    },

    // ---- environments -----------------------------------------------------
    async getEnvironment(id: string): Promise<EnvRow | null> {
      const [r] = await q(`SELECT * FROM environments WHERE id=$1`, [id]);
      return r ? mapEnv(r) : null;
    },
    async findEnvironment(classId: string, studentId: string): Promise<EnvRow | null> {
      const [r] = await q(`SELECT * FROM environments WHERE class_id=$1 AND student_id=$2`, [classId, studentId]);
      return r ? mapEnv(r) : null;
    },
    async insertEnvironment(input: { id: string; classId: string; studentId: string; sandboxId: string }) {
      await q(
        `INSERT INTO environments (id,class_id,student_id,sandbox_id) VALUES ($1,$2,$3,$4)
         ON CONFLICT (class_id,student_id) DO NOTHING`,
        [input.id, input.classId, input.studentId, input.sandboxId],
      );
      return (await this.findEnvironment(input.classId, input.studentId))!;
    },
    async updateEnvironment(
      id: string,
      patch: Partial<{ status: string; resumeState: string | null; harnessSessionId: string | null; policyOverride: PolicyOverride | null; touch: boolean }>,
    ) {
      const sets: string[] = [];
      const vals: unknown[] = [];
      const add = (col: string, v: unknown) => {
        vals.push(v);
        sets.push(`${col}=$${vals.length}`);
      };
      if (patch.status !== undefined) add("status", patch.status);
      if (patch.resumeState !== undefined) add("resume_state", patch.resumeState);
      if (patch.harnessSessionId !== undefined) add("harness_session_id", patch.harnessSessionId);
      if (patch.policyOverride !== undefined) add("policy_override_json", patch.policyOverride === null ? null : JSON.stringify(patch.policyOverride));
      if (patch.touch) sets.push(`last_active_at=now()`);
      if (!sets.length) return;
      vals.push(id);
      await q(`UPDATE environments SET ${sets.join(",")} WHERE id=$${vals.length}`, vals);
    },
    async listEnvironmentsForClass(classId: string): Promise<EnvRow[]> {
      return (await q(`SELECT * FROM environments WHERE class_id=$1`, [classId])).map(mapEnv);
    },
    async listIdleEnvironments(olderThanMs: number): Promise<EnvRow[]> {
      const rows = await q(
        `SELECT * FROM environments WHERE status IN ('active','idle')
         AND COALESCE(last_active_at, created_at) < now() - ($1 || ' milliseconds')::interval`,
        [String(olderThanMs)],
      );
      return rows.map(mapEnv);
    },

    // ---- turns & events ---------------------------------------------------
    async insertTurn(t: { id: string; environmentId: string; policyVersion: number; prompt: string; model: string }) {
      await q(`INSERT INTO turns (id,environment_id,policy_version,prompt,model) VALUES ($1,$2,$3,$4,$5)`, [
        t.id,
        t.environmentId,
        t.policyVersion,
        t.prompt,
        t.model,
      ]);
    },
    async endTurn(id: string, r: { stopReason: string; inputTokens: number; outputTokens: number; flags: string[] }) {
      await q(
        `UPDATE turns SET ended_at=now(), stop_reason=$2, input_tokens=$3, output_tokens=$4, flags=$5 WHERE id=$1`,
        [id, r.stopReason, r.inputTokens, r.outputTokens, JSON.stringify(r.flags)],
      );
    },
    async countTurnsToday(environmentId: string): Promise<number> {
      const [r] = await q(`SELECT count(*)::int AS n FROM turns WHERE environment_id=$1 AND started_at >= date_trunc('day', now())`, [environmentId]);
      return r?.n ?? 0;
    },
    async listTurns(environmentId: string, limit = 50): Promise<TurnRow[]> {
      const rows = await q(`SELECT * FROM turns WHERE environment_id=$1 ORDER BY started_at DESC LIMIT $2`, [environmentId, limit]);
      return rows.map(mapTurn);
    },
    async appendEvent(environmentId: string, turnId: string | null, event: HarnessEvent) {
      await q(`INSERT INTO events (environment_id,turn_id,seq,type,payload) VALUES ($1,$2,$3,$4,$5)`, [
        environmentId,
        turnId,
        event.seq,
        event.type,
        JSON.stringify(event),
      ]);
    },
    async listEvents(environmentId: string): Promise<(HarnessEvent & { turnId?: string })[]> {
      const rows = await q(`SELECT payload, turn_id FROM events WHERE environment_id=$1 ORDER BY id`, [environmentId]);
      return rows.map((r) => ({ ...r.payload, turnId: r.turn_id ?? undefined }));
    },
    /** Student questions plus the events of each turn, for replay. */
    async listTurnsWithPrompts(environmentId: string) {
      return (await q(`SELECT id,prompt,started_at FROM turns WHERE environment_id=$1 ORDER BY started_at`, [environmentId])).map((r) => ({
        id: r.id as string,
        prompt: r.prompt as string,
        startedAt: iso(r.started_at)!,
      }));
    },
    async currentQuestion(environmentId: string): Promise<string | null> {
      const [r] = await q(`SELECT prompt FROM turns WHERE environment_id=$1 ORDER BY started_at DESC LIMIT 1`, [environmentId]);
      return r?.prompt ?? null;
    },
    async recentPrompts(classId: string, sinceDays = 7): Promise<string[]> {
      const rows = await q(
        `SELECT t.prompt FROM turns t JOIN environments e ON e.id=t.environment_id
         WHERE e.class_id=$1 AND t.started_at > now() - ($2 || ' days')::interval`,
        [classId, String(sinceDays)],
      );
      return rows.map((r) => r.prompt);
    },

    // ---- teacher actions ----------------------------------------------------
    async logTeacherAction(a: { environmentId: string; teacherId: string; action: string; payload?: unknown }) {
      await q(`INSERT INTO teacher_actions (id,environment_id,teacher_id,action,payload) VALUES ($1,$2,$3,$4,$5)`, [
        newId("act"),
        a.environmentId,
        a.teacherId,
        a.action,
        JSON.stringify(a.payload ?? {}),
      ]);
    },
    async listTeacherActions(environmentId: string) {
      return (await q(`SELECT * FROM teacher_actions WHERE environment_id=$1 ORDER BY at DESC LIMIT 100`, [environmentId])).map((r) => ({
        id: r.id as string,
        teacherId: r.teacher_id as string,
        action: r.action as string,
        payload: r.payload as unknown,
        at: iso(r.at)!,
      }));
    },
    /** Notes injected since the last turn started, to pass as context. */
    async pendingTeacherNotes(environmentId: string): Promise<{ id: string; text: string; teacherName: string }[]> {
      const rows = await q(
        `SELECT a.id, a.payload FROM teacher_actions a
         WHERE a.environment_id=$1 AND a.action='note'
           AND a.at > COALESCE((SELECT max(started_at) FROM turns WHERE environment_id=$1), 'epoch'::timestamptz)
         ORDER BY a.at`,
        [environmentId],
      );
      return rows.map((r) => ({ id: r.id, text: r.payload.text, teacherName: r.payload.teacherName ?? "Teacher" }));
    },

    // ---- materials ----------------------------------------------------------
    async addMaterial(m: { classId: string; name: string; content: string }) {
      const id = newId("mat");
      await q(`INSERT INTO materials (id,class_id,name,storage_key,content) VALUES ($1,$2,$3,$4,$5)`, [id, m.classId, m.name, `${m.classId}/${m.name}`, m.content]);
      return id;
    },
    async listMaterials(classId: string) {
      return (await q(`SELECT id,name,storage_key FROM materials WHERE class_id=$1 ORDER BY name`, [classId])).map((r) => ({
        id: r.id as string,
        name: r.name as string,
        storageKey: r.storage_key as string,
      }));
    },
    async getMaterials(classId: string, ids: string[]) {
      if (!ids.length) return [];
      return (await q(`SELECT id,name,content FROM materials WHERE class_id=$1 AND id = ANY($2)`, [classId, ids])).map((r) => ({
        id: r.id as string,
        name: r.name as string,
        content: r.content as string,
      }));
    },

    // ---- flags --------------------------------------------------------------
    async insertFlag(f: Omit<FlagRow, "resolved" | "at">) {
      await q(`INSERT INTO flags (id,environment_id,turn_id,kind,confidence,detail,evidence) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
        f.id,
        f.environmentId,
        f.turnId,
        f.kind,
        f.confidence,
        f.detail,
        f.evidence,
      ]);
    },
    async listFlags(classId: string, includeResolved = false): Promise<(FlagRow & { studentName: string })[]> {
      const rows = await q(
        `SELECT f.*, u.name AS student_name FROM flags f
         JOIN environments e ON e.id=f.environment_id JOIN users u ON u.id=e.student_id
         WHERE e.class_id=$1 ${includeResolved ? "" : "AND NOT f.resolved"} ORDER BY f.at DESC`,
        [classId],
      );
      return rows.map((r) => ({ ...mapFlag(r), studentName: r.student_name }));
    },
    async listFlagsForEnvironment(environmentId: string): Promise<FlagRow[]> {
      return (await q(`SELECT * FROM flags WHERE environment_id=$1 AND NOT resolved ORDER BY at DESC`, [environmentId])).map(mapFlag);
    },
    async resolveFlag(id: string) {
      await q(`UPDATE flags SET resolved=true WHERE id=$1`, [id]);
    },

    // ---- approvals ----------------------------------------------------------
    async createApproval(a: { id: string; environmentId: string; turnId: string | null; toolCallId: string; toolName: string; input: unknown }) {
      await q(`INSERT INTO approvals (id,environment_id,turn_id,tool_call_id,tool_name,input) VALUES ($1,$2,$3,$4,$5,$6)`, [
        a.id,
        a.environmentId,
        a.turnId,
        a.toolCallId,
        a.toolName,
        JSON.stringify(a.input ?? null),
      ]);
    },
    async getApproval(id: string): Promise<ApprovalRow | null> {
      const [r] = await q(`SELECT * FROM approvals WHERE id=$1`, [id]);
      return r ? mapApproval(r) : null;
    },
    async resolveApproval(id: string, approved: boolean, reason?: string) {
      const rows = await q(
        `UPDATE approvals SET status=$2, reason=$3 WHERE id=$1 AND status='pending' RETURNING id`,
        [id, approved ? "approved" : "denied", reason ?? null],
      );
      return rows.length > 0;
    },
    async listPendingApprovals(environmentId: string): Promise<ApprovalRow[]> {
      return (await q(`SELECT * FROM approvals WHERE environment_id=$1 AND status='pending' ORDER BY at`, [environmentId])).map(mapApproval);
    },
    async listPendingApprovalsForClass(classId: string): Promise<(ApprovalRow & { studentName: string })[]> {
      const rows = await q(
        `SELECT a.*, u.name AS student_name FROM approvals a JOIN environments e ON e.id=a.environment_id
         JOIN users u ON u.id=e.student_id WHERE e.class_id=$1 AND a.status='pending' ORDER BY a.at`,
        [classId],
      );
      return rows.map((r) => ({ ...mapApproval(r), studentName: r.student_name }));
    },
    async resolveStaleApprovals(environmentId: string) {
      await q(`UPDATE approvals SET status='denied', reason='expired' WHERE environment_id=$1 AND status='pending'`, [environmentId]);
    },
  };
}

export type Repo = ReturnType<typeof createRepo>;
