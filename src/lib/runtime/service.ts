import {
  EnvironmentLimitError,
  EnvironmentPausedError,
  classTopic,
  deriveSandboxId,
  envTopic,
  type ApprovalDecision,
  type ApprovalRequest,
  type Environment,
  type EnvironmentService,
  type HarnessEvent,
  type PolicyOverride,
  type RealtimeBus,
  type RunTurnInput,
} from "@/lib/contracts";
import { classifyTurn, looksStuck } from "@/lib/platform/classifier.ts";
import { openState, sealState } from "@/lib/platform/crypto.ts";
import { newId, type EnvRow, type Repo } from "@/lib/db/repo.ts";
import { compileTurn } from "./compile.ts";
import type { DriverEvent, TurnDriver } from "./driver.ts";

type Stamp = (e: DriverEvent) => HarnessEvent;

const toEnvironment = (r: EnvRow): Environment => ({
  id: r.id,
  classId: r.classId,
  studentId: r.studentId,
  sandboxId: r.sandboxId,
  status: r.status as Environment["status"],
  hasOverride: r.policyOverride !== null,
  createdAt: r.createdAt,
  lastActiveAt: r.lastActiveAt,
});

export class EnvironmentServiceImpl implements EnvironmentService {
  /** One live turn per environment. */
  private running = new Map<string, AbortController>();

  constructor(
    private readonly deps: { repo: Repo; bus: RealtimeBus; driver: TurnDriver; defaultModel?: string },
  ) {}

  get mode() {
    return this.deps.driver.mode;
  }

  private async load(id: string): Promise<EnvRow> {
    const env = await this.deps.repo.getEnvironment(id);
    if (!env) throw new Error(`unknown environment ${id}`);
    return env;
  }

  private async emitStatus(env: EnvRow, status: Extract<HarnessEvent, { type: "status" }>["status"], detail?: string) {
    const event: HarnessEvent = { type: "status", seq: 0, at: new Date().toISOString(), environmentId: env.id, status, detail };
    await this.deps.repo.appendEvent(env.id, null, event);
    this.deps.bus.publish(envTopic(env.id), event);
    this.deps.bus.publish(classTopic(env.classId), { type: "tile", environmentId: env.id });
  }

  private async setStatus(env: EnvRow, status: EnvRow["status"], resume?: unknown) {
    await this.deps.repo.updateEnvironment(env.id, {
      status,
      ...(resume !== undefined ? { resumeState: resume === null ? null : sealState(resume) } : {}),
    });
    await this.emitStatus(env, status as never);
  }

  private resumeOf(env: EnvRow): unknown {
    if (!env.resumeState) return null;
    try {
      return openState(env.resumeState);
    } catch {
      return null; // unreadable state starts a fresh conversation rather than failing the student
    }
  }

  async ensureEnvironment(input: { classId: string; studentId: string }): Promise<Environment> {
    const existing = await this.deps.repo.findEnvironment(input.classId, input.studentId);
    if (existing) return toEnvironment(existing);
    const id = newId("e").replace("e_", "");
    const env = await this.deps.repo.insertEnvironment({ id, ...input, sandboxId: deriveSandboxId(id) });
    await this.emitStatus(env, "created");
    return toEnvironment(env);
  }

  async resume(environmentId: string): Promise<Environment> {
    const env = await this.load(environmentId);
    if (env.status === "paused") return toEnvironment(env);
    if (env.status === "detached" || env.status === "stopped" || env.status === "reset") {
      await this.emitStatus(env, "resuming");
      await this.setStatus(env, "active");
    }
    return toEnvironment((await this.load(environmentId)));
  }

  async detach(environmentId: string) {
    const env = await this.load(environmentId);
    if (env.status === "paused") return;
    const state = await this.deps.driver.detach(env, this.resumeOf(env));
    await this.setStatus(env, "detached", state);
  }

  async stop(environmentId: string) {
    const env = await this.load(environmentId);
    this.running.get(environmentId)?.abort();
    const state = await this.deps.driver.stop(env, this.resumeOf(env));
    await this.setStatus(env, "stopped", state);
  }

  async pause(environmentId: string) {
    const env = await this.load(environmentId);
    this.running.get(environmentId)?.abort();
    const state = await this.deps.driver.stop(env, this.resumeOf(env));
    await this.setStatus(env, "paused", state);
  }

  async unpause(environmentId: string) {
    const env = await this.load(environmentId);
    if (env.status === "paused") await this.setStatus(env, "active");
  }

  async reset(environmentId: string): Promise<Environment> {
    const env = await this.load(environmentId);
    this.running.get(environmentId)?.abort();
    await this.deps.driver.destroy(env);
    await this.deps.repo.resolveStaleApprovals(env.id);
    await this.deps.repo.updateEnvironment(env.id, { resumeState: null, harnessSessionId: null });
    await this.setStatus(env, "reset");
    await this.setStatus(env, "created");
    return toEnvironment(await this.load(environmentId));
  }

  /** Detach environments idle longer than `idleMs` to cap sandbox cost. */
  async reapIdle(idleMs: number): Promise<number> {
    const idle = await this.deps.repo.listIdleEnvironments(idleMs);
    for (const env of idle) if (!this.running.has(env.id)) await this.detach(env.id);
    return idle.length;
  }

  async setPolicyOverride(environmentId: string, override: PolicyOverride | null) {
    await this.deps.repo.updateEnvironment(environmentId, { policyOverride: override });
  }

  readSandboxTree(environmentId: string) {
    return this.load(environmentId).then((e) => this.deps.driver.readTree(e));
  }
  readSandboxFile(environmentId: string, path: string) {
    return this.load(environmentId).then((e) => this.deps.driver.readFile(e, path));
  }

  async *runTurn(input: RunTurnInput): AsyncGenerator<HarnessEvent> {
    const { repo, bus, driver } = this.deps;
    let env = await this.load(input.environmentId);
    if (env.status === "paused") throw new EnvironmentPausedError(env.id);
    if (this.running.has(env.id)) throw new Error("A turn is already running for this environment.");

    // Policy is re-read on every turn by the server, never accepted from the caller.
    const policy = await input.resolvePolicy();
    if ((await repo.countTurnsToday(env.id)) >= policy.limits.turnsPerDay) {
      throw new EnvironmentLimitError("turnsPerDay", `Daily limit of ${policy.limits.turnsPerDay} questions reached. Try again tomorrow.`);
    }

    const abort = new AbortController();
    this.running.set(env.id, abort);
    input.abortSignal?.addEventListener("abort", () => abort.abort());

    const turnId = newId("turn");
    let seq = 0;
    const stamp: Stamp = (e) => ({ ...e, seq: seq++, at: new Date().toISOString() }) as HarnessEvent;
    const emit = async (e: DriverEvent | HarnessEvent, visible = true) => {
      const event = "seq" in e ? e : stamp(e);
      await repo.appendEvent(env.id, turnId, event);
      bus.publish(envTopic(env.id), event);
      return visible ? event : null;
    };

    const compiled = compileTurn(policy, {
      materialNames: (await repo.getMaterials(env.classId, policy.materials)).map((m) => `materials/${m.name}`),
      teacherNotes: input.teacherNotes,
      defaultModel: this.deps.defaultModel,
    });
    const materials = await repo.getMaterials(env.classId, policy.materials);

    await repo.insertTurn({ id: turnId, environmentId: env.id, policyVersion: policy.version, prompt: input.prompt, model: compiled.model });
    if (env.status !== "active") await this.setStatus(env, "active");
    await repo.updateEnvironment(env.id, { touch: true });
    env = await this.load(env.id);

    bus.publish(classTopic(env.classId), { type: "tile", environmentId: env.id });
    yield (await emit({ type: "turn-start", turnId, prompt: input.prompt, policyVersion: policy.version, model: compiled.model, activeTools: compiled.activeTools, gatedTools: compiled.approvalRequired, style: policy.style, assessment: policy.assessmentActive }))!;

    const requestApproval = async (req: ApprovalRequest): Promise<ApprovalDecision> => {
      const handler = input.requestApproval;
      if (!handler) return { approved: false, reason: "No approver is available." }; // fail closed
      return handler(req);
    };

    let reply = "";
    let stopReason: "complete" | "error" | "teacher-pause" = "complete";
    let finishReason = "stop";
    try {
      for await (const ev of driver.runTurn({
        env,
        turnId,
        prompt: input.prompt,
        policy,
        compiled,
        materials,
        teacherNotes: input.teacherNotes ?? [],
        requestApproval,
        resumeState: this.resumeOf(env),
        saveResume: async (state) => repo.updateEnvironment(env.id, { resumeState: sealState(state) }),
        abortSignal: abort.signal,
      })) {
        if (abort.signal.aborted) break;
        if (ev.type === "text") reply += ev.delta;
        yield (await emit(ev))!;
      }
      if (abort.signal.aborted) {
        stopReason = "teacher-pause";
        finishReason = "aborted";
      }
    } catch (err) {
      stopReason = "error";
      finishReason = "error";
      yield (await emit({ type: "text", blockId: "err", delta: "Sorry — something went wrong on my side. Please try again." }))!;
      console.error("[runtime] turn failed", err);
    } finally {
      this.running.delete(env.id);
    }

    const usage = { inputTokens: Math.ceil(input.prompt.length / 4), outputTokens: Math.ceil(reply.length / 4) };
    yield (await emit({ type: "turn-end", turnId, finishReason, usage, stopReason }))!;

    // Post-turn classifier: flags go to the dashboard, never back to the student.
    const findings = classifyTurn({ prompt: input.prompt, reply, policy });
    const recentForEnv = (await repo.listTurns(env.id, 6)).map((t) => t.prompt).reverse();
    if (looksStuck(recentForEnv)) {
      findings.push({ kind: "stuck", confidence: 0.6, detail: "Several recent questions look like the same problem.", evidence: input.prompt });
    }
    for (const f of findings) {
      const flagId = newId("flag");
      await repo.insertFlag({ id: flagId, environmentId: env.id, turnId, kind: f.kind, confidence: f.confidence, detail: f.detail, evidence: f.evidence });
      await emit({ type: "flag", turnId, flagId, kind: f.kind, confidence: f.confidence, detail: f.detail, evidence: f.evidence }, false);
      bus.publish(classTopic(env.classId), { type: "flag", environmentId: env.id, flagId, kind: f.kind, urgent: f.kind === "wellbeing" });
    }
    await repo.endTurn(turnId, { stopReason, ...usage, flags: findings.map((f) => f.kind) });
    bus.publish(classTopic(env.classId), { type: "tile", environmentId: env.id });
  }
}
