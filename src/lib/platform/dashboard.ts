import type { Repo } from "@/lib/db/repo.ts";
import { looksStuck } from "./classifier.ts";

export type Tile = {
  environmentId: string;
  studentId: string;
  studentName: string;
  status: string;
  /** Active within the last 2 minutes. */
  online: boolean;
  idle: boolean;
  currentQuestion: string | null;
  turnsToday: number;
  flagCount: number;
  urgentFlag: boolean;
  stuck: boolean;
  pendingApprovals: number;
  lastActiveAt: string | null;
};

export type Dashboard = {
  tiles: Tile[];
  topics: { term: string; count: number }[];
  notStarted: { studentId: string; studentName: string }[];
};

const STOP = new Set(
  "the and for with this that what how why does can you your are was were have has not but from into about which when where who help need want please give tell show explain solve find make get just like some more than then them they their there here would could should will its it's i'm don't dont".split(" "),
);

export function topicRollup(prompts: string[], limit = 8) {
  const counts = new Map<string, number>();
  for (const p of prompts) {
    const seen = new Set((p.toLowerCase().match(/[a-z]{4,}/g) ?? []).filter((w) => !STOP.has(w)));
    for (const w of seen) counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts]
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
    .slice(0, limit);
}

const ONLINE_MS = 2 * 60_000;
const IDLE_MS = 10 * 60_000;

export async function loadDashboard(repo: Repo, classId: string, now = Date.now()): Promise<Dashboard> {
  const students = await repo.listStudents(classId);
  const envs = new Map((await repo.listEnvironmentsForClass(classId)).map((e) => [e.studentId, e]));
  const flags = await repo.listFlags(classId);
  const approvals = await repo.listPendingApprovalsForClass(classId);
  const tiles: Tile[] = [];
  const notStarted: Dashboard["notStarted"] = [];

  for (const s of students) {
    const env = envs.get(s.id);
    if (!env) {
      notStarted.push({ studentId: s.id, studentName: s.name });
      continue;
    }
    const mine = flags.filter((f) => f.environmentId === env.id);
    const turns = await repo.listTurns(env.id, 6);
    const age = env.lastActiveAt ? now - new Date(env.lastActiveAt).getTime() : Infinity;
    tiles.push({
      environmentId: env.id,
      studentId: s.id,
      studentName: s.name,
      status: env.status,
      online: age < ONLINE_MS && env.status === "active",
      idle: age > IDLE_MS,
      currentQuestion: turns[0]?.prompt ?? null,
      turnsToday: await repo.countTurnsToday(env.id),
      flagCount: mine.length,
      urgentFlag: mine.some((f) => f.kind === "wellbeing"),
      stuck: looksStuck(turns.map((t) => t.prompt).reverse()),
      pendingApprovals: approvals.filter((a) => a.environmentId === env.id).length,
      lastActiveAt: env.lastActiveAt,
    });
  }
  return { tiles, topics: topicRollup(await repo.recentPrompts(classId, 7)), notStarted };
}
