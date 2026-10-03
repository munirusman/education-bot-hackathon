import type { Repo } from "@/lib/db/repo.ts";
import { UsageLimitError } from "@/lib/contracts";
import { chargebeeConfig, fetchTokenAllowance, type ChargebeeConfig } from "./chargebee.ts";
import { monthRange } from "./meter.ts";

/**
 * Where the allowance comes from: the `ai_tokens_per_month` entitlement on the
 * Chargebee subscription. There is deliberately no local override. If Chargebee
 * isn't configured or can't be reached and nothing is cached, students are NOT
 * blocked (an outage on our billing side shouldn't stop a classroom).
 */
export type Allowance = { limit: number | null; state: "ok" | "stale" | "unavailable" | "not-configured" };

const TTL_MS = 60_000;
const cache = new Map<string, { at: number; limit: number | null }>();

export function resetAllowanceCache() {
  cache.clear();
}

export async function getAllowance(deps: { cfg?: ChargebeeConfig | null; fetchImpl?: typeof fetch; now?: () => number; subscriptionId?: string } = {}): Promise<Allowance> {
  const cfg = deps.cfg === undefined ? chargebeeConfig() : deps.cfg;
  if (!cfg) return { limit: null, state: "not-configured" };
  const now = (deps.now ?? Date.now)();
  const sub = deps.subscriptionId ?? cfg.subscriptionId;
  const key = `${cfg.site}/${sub}`;
  const hit = cache.get(key);
  if (hit && now - hit.at < TTL_MS) return { limit: hit.limit, state: "ok" };
  const r = await fetchTokenAllowance(cfg, deps.fetchImpl, sub);
  if (r.ok) {
    cache.set(key, { at: now, limit: r.limit });
    return { limit: r.limit, state: "ok" };
  }
  console.error("[billing] could not read the token allowance from Chargebee:", r.error);
  // Keep serving the last known value rather than flip-flopping on a blip.
  if (hit) return { limit: hit.limit, state: "stale" };
  return { limit: null, state: "unavailable" };
}

/** The subscription this teacher is billed on: the one they upgraded to, else the env default. */
export async function activeSubscription(repo: Repo, teacherId: string, cfg: ChargebeeConfig | null = chargebeeConfig()): Promise<string | null> {
  if (!cfg) return null;
  return (await repo.getBillingSubscription(teacherId)) ?? cfg.subscriptionId;
}

export async function allowanceFor(repo: Repo, teacherId: string): Promise<Allowance> {
  const cfg = chargebeeConfig();
  const sub = await activeSubscription(repo, teacherId, cfg);
  return sub ? getAllowance({ cfg, subscriptionId: sub }) : { limit: null, state: "not-configured" };
}

export const upgradeMessage = (limit: number) =>
  `Your teacher’s plan has used its ${limit.toLocaleString("en-US")} tokens for this month, so the tutor is paused. Ask your teacher to upgrade the subscription to keep going.`;

export const teacherUpgradeMessage = (limit: number) =>
  `You’ve used all ${limit.toLocaleString("en-US")} tokens in your plan this month. Upgrade your subscription to get more; until then your students’ tutors are paused.`;

export type UsageStatus = { limit: number | null; used: number; exceeded: boolean; allowanceState: Allowance["state"] };

/** Tokens a teacher has used this month (UTC) against the plan allowance. */
export async function usageStatus(repo: Repo, teacherId: string, now = new Date(), allowance?: Allowance): Promise<UsageStatus> {
  const a = allowance ?? (await allowanceFor(repo, teacherId));
  const { from, to } = monthRange(undefined, now);
  const used = await repo.tokensUsedBetween(teacherId, from, to);
  return { limit: a.limit, used, exceeded: a.limit !== null && used >= a.limit, allowanceState: a.state };
}

/**
 * Gate checked before each turn. The turn that crosses the limit is allowed to
 * finish (its size isn't known in advance); the next one is refused.
 */
export async function enforceUsageLimit(repo: Repo, classId: string, allowance?: Allowance): Promise<void> {
  const cls = await repo.getClass(classId);
  if (!cls) return;
  const a = allowance ?? (await allowanceFor(repo, cls.teacherId));
  if (a.limit === null) return;
  const s = await usageStatus(repo, cls.teacherId, new Date(), a);
  if (s.exceeded && s.limit !== null) throw new UsageLimitError(s.used, s.limit, upgradeMessage(s.limit));
}
