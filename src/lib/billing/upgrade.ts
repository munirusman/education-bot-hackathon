import type { Repo } from "@/lib/db/repo.ts";
import { chargebeeConfig, fetchSubscription, fetchTokenAllowance, type ChargebeeConfig } from "./chargebee.ts";
import { activeSubscription } from "./limit.ts";

export class UpgradeError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "UpgradeError";
  }
}

export type UpgradeResult = { subscriptionId: string; plan: string | null; limit: number | null };

/**
 * Move a teacher onto the upgrade subscription. The target comes from server
 * config (CHARGEBEE_UPGRADE_SUBSCRIPTION_ID), never from the request, so the
 * button can't point billing at an arbitrary subscription. It's checked live in
 * Chargebee first: it must exist, be usable, and not lower the allowance.
 */
export async function upgradeTeacher(repo: Repo, teacherId: string, deps: { cfg?: ChargebeeConfig | null; fetchImpl?: typeof fetch } = {}): Promise<UpgradeResult> {
  const cfg = deps.cfg === undefined ? chargebeeConfig() : deps.cfg;
  if (!cfg) throw new UpgradeError(409, "Billing isn’t connected to Chargebee yet.");
  const target = cfg.upgradeSubscriptionId;
  if (!target) throw new UpgradeError(409, "No upgrade subscription is configured.");
  const current = (await activeSubscription(repo, teacherId, cfg))!;
  if (current === target) throw new UpgradeError(409, "You’re already on the upgraded subscription.");

  const info = await fetchSubscription(cfg, target, deps.fetchImpl);
  if (!info.ok) throw new UpgradeError(info.notFound ? 404 : 502, info.error);
  if (!["active", "in_trial"].includes(info.status)) throw new UpgradeError(409, `The upgrade subscription is ${info.status.replace("_", " ")}, so it can’t be used right now.`);

  const next = await fetchTokenAllowance(cfg, deps.fetchImpl, target);
  if (!next.ok) throw new UpgradeError(502, "Couldn’t read the upgrade’s token allowance from Chargebee. Try again.");
  const now = await fetchTokenAllowance(cfg, deps.fetchImpl, current);
  if (now.ok && now.limit !== null && next.limit !== null && next.limit <= now.limit) throw new UpgradeError(409, "That subscription doesn’t include more tokens than your current one.");

  await repo.setBillingSubscription(teacherId, target);
  return { subscriptionId: target, plan: info.plan, limit: next.limit };
}
