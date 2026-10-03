import type { Repo, UsageRow } from "@/lib/db/repo.ts";
import { newId } from "@/lib/db/repo.ts";
import { buildUsageEvent, chargebeeConfig, sendUsageEvent, type ChargebeeConfig } from "./chargebee.ts";
import { estimateCharge, type RateCard } from "./pricing.ts";

/** What the runtime reports for a finished turn. Provider counts when the model gave them, else an estimate. */
export type TurnUsage = {
  turnId: string;
  environmentId: string;
  classId: string;
  studentId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  source: "provider" | "estimate";
  at: Date;
};

/** Chargebee only accepts events from the last 12 hours; stop a little short of that. */
export const MAX_EVENT_AGE_MS = 11.5 * 60 * 60 * 1000;

export async function recordTurnUsage(repo: Repo, u: TurnUsage): Promise<boolean> {
  const cls = await repo.getClass(u.classId);
  if (!cls) return false;
  return repo.insertUsage({
    id: newId("use"),
    turnId: u.turnId,
    environmentId: u.environmentId,
    classId: u.classId,
    teacherId: cls.teacherId,
    studentId: u.studentId,
    model: u.model,
    inputTokens: u.inputTokens,
    outputTokens: u.outputTokens,
    tokenSource: u.source,
    usageAt: u.at.toISOString(),
  });
}

export type FlushResult = { configured: boolean; sent: number; retrying: number; failed: number; expired: number };

let flushing: Promise<FlushResult> | null = null;

/**
 * Send pending usage to Chargebee. Safe to call often and concurrently (calls
 * share one run). Without Chargebee config it does nothing and leaves records
 * pending, so connecting later still bills anything inside the 12-hour window.
 */
export function flushUsage(deps: { repo: Repo; cfg?: ChargebeeConfig | null; fetchImpl?: typeof fetch; now?: () => number }): Promise<FlushResult> {
  flushing ??= run(deps).finally(() => {
    flushing = null;
  });
  return flushing;
}

async function run({ repo, cfg = chargebeeConfig(), fetchImpl, now = Date.now }: Parameters<typeof flushUsage>[0]): Promise<FlushResult> {
  const out: FlushResult = { configured: Boolean(cfg), sent: 0, retrying: 0, failed: 0, expired: 0 };
  if (!cfg) return out;
  for (const r of await repo.listPendingUsage(100)) {
    if (now() - new Date(r.usageAt).getTime() > MAX_EVENT_AGE_MS) {
      await repo.markUsage(r.id, { status: "expired", error: "Too old to send: Chargebee only accepts usage from the last 12 hours." });
      out.expired++;
      continue;
    }
    const sub = (await repo.getBillingSubscription(r.teacherId)) ?? cfg.subscriptionId;
    const result = await sendUsageEvent(cfg, buildUsageEvent(r, sub), fetchImpl);
    if (result.ok) {
      await repo.markUsage(r.id, { status: "sent", error: null, attempted: true });
      out.sent++;
    } else if (result.retryable) {
      await repo.markUsage(r.id, { error: result.error, attempted: true });
      out.retrying++;
    } else {
      await repo.markUsage(r.id, { status: "failed", error: result.error, attempted: true });
      out.failed++;
    }
  }
  return out;
}

// ---- Teacher-facing summary ---------------------------------------------------

export type UsageSummary = {
  totals: { questions: number; inputTokens: number; outputTokens: number; estimatedTokens: number; charge: number };
  byDay: { day: string; questions: number; tokens: number }[];
  byClass: { classId: string; name: string; questions: number; tokens: number; charge: number }[];
  byStudent: { studentId: string; name: string; questions: number; tokens: number }[];
  byModel: { model: string; questions: number; tokens: number }[];
};

/** `YYYY-MM` (UTC) to a half-open range. Falls back to the current month on bad input. */
export function monthRange(month: string | undefined, now = new Date()): { key: string; from: Date; to: Date } {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month ?? "");
  const y = m ? Number(m[1]) : now.getUTCFullYear();
  const mo = m ? Number(m[2]) - 1 : now.getUTCMonth();
  return { key: `${y}-${String(mo + 1).padStart(2, "0")}`, from: new Date(Date.UTC(y, mo, 1)), to: new Date(Date.UTC(y, mo + 1, 1)) };
}

export function summarizeUsage(rows: UsageRow[], names: { classes: Map<string, string>; students: Map<string, string> }, card: RateCard): UsageSummary {
  const totals = { questions: 0, inputTokens: 0, outputTokens: 0, estimatedTokens: 0, charge: 0 };
  const day = new Map<string, { questions: number; tokens: number }>();
  const cls = new Map<string, { questions: number; tokens: number; charge: number }>();
  const stu = new Map<string, { questions: number; tokens: number }>();
  const mod = new Map<string, { questions: number; tokens: number }>();
  const bump = <T extends { questions: number; tokens: number }>(m: Map<string, T>, k: string, init: T, tokens: number, extra?: (v: T) => void) => {
    const v = m.get(k) ?? init;
    v.questions++;
    v.tokens += tokens;
    extra?.(v);
    m.set(k, v);
  };

  for (const r of rows) {
    const tokens = r.inputTokens + r.outputTokens;
    const charge = estimateCharge(r, card);
    totals.questions++;
    totals.inputTokens += r.inputTokens;
    totals.outputTokens += r.outputTokens;
    if (r.tokenSource === "estimate") totals.estimatedTokens += tokens;
    totals.charge += charge;
    bump(day, r.usageAt.slice(0, 10), { questions: 0, tokens: 0 }, tokens);
    bump(cls, r.classId, { questions: 0, tokens: 0, charge: 0 }, tokens, (v) => (v.charge += charge));
    bump(stu, r.studentId, { questions: 0, tokens: 0 }, tokens);
    bump(mod, r.model, { questions: 0, tokens: 0 }, tokens);
  }

  return {
    totals,
    byDay: [...day].map(([d, v]) => ({ day: d, ...v })).sort((a, b) => a.day.localeCompare(b.day)),
    byClass: [...cls].map(([id, v]) => ({ classId: id, name: names.classes.get(id) ?? "Deleted class", ...v })).sort((a, b) => b.tokens - a.tokens),
    byStudent: [...stu].map(([id, v]) => ({ studentId: id, name: names.students.get(id) ?? "Unknown student", ...v })).sort((a, b) => b.tokens - a.tokens),
    byModel: [...mod].map(([model, v]) => ({ model, ...v })).sort((a, b) => b.tokens - a.tokens),
  };
}
