/**
 * Chargebee usage ingestion, per the Usage Events API
 * (POST https://{site}.ingest.chargebee.com/api/v2/usage_events, basic auth with
 * the API key as username and an empty password). Plain REST, because it is one
 * endpoint and this keeps the request shape testable against a local mock.
 *
 * Nothing student-identifying is ever put in an event: only counts, the model
 * name and the class id. Keys come from env and are never logged.
 */
import type { UsageRow } from "@/lib/db/repo.ts";

export type ChargebeeConfig = { site: string; apiKey: string; subscriptionId: string; upgradeSubscriptionId: string | null; ingestOrigin: string; apiOrigin: string };

const SUB_ID_RE = /^[A-Za-z0-9_-]{1,50}$/;
const SITE_RE = /^[a-z0-9][a-z0-9-]{0,62}$/i;

export function chargebeeConfig(env: Record<string, string | undefined> = process.env): ChargebeeConfig | null {
  const site = env.CHARGEBEE_SITE?.trim();
  const apiKey = env.CHARGEBEE_API_KEY?.trim();
  const subscriptionId = env.CHARGEBEE_SUBSCRIPTION_ID?.trim();
  if (!site || !apiKey || !subscriptionId) return null;
  // The site becomes part of a hostname, so it must look like a subdomain, nothing else.
  if (!SITE_RE.test(site)) return null;
  if (subscriptionId.length > 50) return null;
  const upgrade = env.CHARGEBEE_UPGRADE_SUBSCRIPTION_ID?.trim() || null;
  if (upgrade && !SUB_ID_RE.test(upgrade)) return null;

  let ingestOrigin = `https://${site}.ingest.chargebee.com`;
  const override = env.CHARGEBEE_INGEST_URL?.trim();
  if (override) {
    // For tests and mocks only: plain http is allowed solely for loopback.
    const u = new URL(override);
    if (u.protocol === "https:" || (u.protocol === "http:" && ["localhost", "127.0.0.1"].includes(u.hostname))) ingestOrigin = u.origin;
    else return null;
  }
  let apiOrigin = `https://${site}.chargebee.com`;
  const apiOverride = env.CHARGEBEE_API_URL?.trim();
  if (apiOverride) {
    const u = new URL(apiOverride);
    if (u.protocol === "https:" || (u.protocol === "http:" && ["localhost", "127.0.0.1"].includes(u.hostname))) apiOrigin = u.origin;
    else return null;
  }
  return { site, apiKey, subscriptionId, upgradeSubscriptionId: upgrade, ingestOrigin, apiOrigin };
}

/** The Chargebee feature (type range, unit token) whose plan entitlement is the monthly allowance. */
export const TOKEN_FEATURE_ID = "ai_tokens_per_month";

export type AllowanceResult = { ok: true; limit: number | null } | { ok: false; error: string };

/**
 * Read the monthly token allowance from the subscription's entitlements, so
 * changing plan in Chargebee changes the limit. `limit: null` means no limit
 * (unlimited, or the plan has no such entitlement).
 */
export async function fetchTokenAllowance(cfg: ChargebeeConfig, fetchImpl: typeof fetch = fetch, subscriptionId: string = cfg.subscriptionId): Promise<AllowanceResult> {
  try {
    const res = await fetchImpl(`${cfg.apiOrigin}/api/v2/subscriptions/${encodeURIComponent(subscriptionId)}/subscription_entitlements?limit=100`, {
      headers: { authorization: `Basic ${Buffer.from(`${cfg.apiKey}:`).toString("base64")}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { ok: false, error: `Chargebee returned ${res.status}` };
    const body = (await res.json()) as { list?: { subscription_entitlement?: { feature_id?: string; value?: string; is_enabled?: boolean } }[] };
    const ent = body.list?.map((x) => x.subscription_entitlement).find((e) => e?.feature_id === TOKEN_FEATURE_ID);
    if (!ent || ent.is_enabled === false) return { ok: true, limit: null };
    if (String(ent.value).toLowerCase() === "unlimited") return { ok: true, limit: null };
    const n = Number(ent.value);
    return Number.isFinite(n) && n >= 0 ? { ok: true, limit: Math.floor(n) } : { ok: false, error: "Unreadable allowance value" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Request failed" };
  }
}

export type UsageEventBody = {
  deduplication_id: string;
  subscription_id: string;
  usage_timestamp: number;
  properties: Record<string, string | number | boolean>;
};

/** Flat, uniquely named meter fields (Chargebee recommends unique names for metering). */
export function buildUsageEvent(r: Pick<UsageRow, "turnId" | "classId" | "model" | "inputTokens" | "outputTokens" | "tokenSource" | "usageAt">, subscriptionId: string): UsageEventBody {
  if (r.turnId.length > 36) throw new Error("deduplication_id must be at most 36 characters");
  return {
    // Same turn id + same timestamp on every retry, so resending can never double-count.
    deduplication_id: r.turnId,
    subscription_id: subscriptionId,
    usage_timestamp: new Date(r.usageAt).getTime(),
    properties: {
      orbit_questions: 1,
      orbit_input_tokens: r.inputTokens,
      orbit_output_tokens: r.outputTokens,
      orbit_total_tokens: r.inputTokens + r.outputTokens,
      orbit_model: r.model,
      orbit_token_source: r.tokenSource,
      orbit_class_id: r.classId,
    },
  };
}

export type SendResult = { ok: true } | { ok: false; retryable: boolean; error: string };

export async function sendUsageEvent(cfg: ChargebeeConfig, body: UsageEventBody, fetchImpl: typeof fetch = fetch): Promise<SendResult> {
  let res: Response;
  try {
    res = await fetchImpl(`${cfg.ingestOrigin}/api/v2/usage_events`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${cfg.apiKey}:`).toString("base64")}`,
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    return { ok: false, retryable: true, error: `Couldn’t reach Chargebee (${e instanceof Error ? e.name : "network error"}).` };
  }
  if (res.ok) return { ok: true };

  const detail = await res.json().then((j: { message?: string }) => (typeof j?.message === "string" ? j.message.slice(0, 200) : "")).catch(() => "");
  const suffix = detail ? `: ${detail}` : "";
  if (res.status === 401 || res.status === 403) return { ok: false, retryable: true, error: `Chargebee rejected the API key (${res.status}). Check CHARGEBEE_API_KEY${suffix}` };
  if (res.status === 429 || res.status >= 500) return { ok: false, retryable: true, error: `Chargebee is busy or unavailable (${res.status})${suffix}` };
  return { ok: false, retryable: false, error: `Chargebee refused this event (${res.status})${suffix}` };
}

export type SubscriptionInfo = { ok: true; status: string; plan: string | null } | { ok: false; error: string; notFound?: boolean };

/** Read-only look at a subscription: is it live, and which plan is it on. */
export async function fetchSubscription(cfg: ChargebeeConfig, subscriptionId: string, fetchImpl: typeof fetch = fetch): Promise<SubscriptionInfo> {
  try {
    const res = await fetchImpl(`${cfg.apiOrigin}/api/v2/subscriptions/${encodeURIComponent(subscriptionId)}`, {
      headers: { authorization: `Basic ${Buffer.from(`${cfg.apiKey}:`).toString("base64")}` },
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 404) return { ok: false, error: "That subscription doesn’t exist in Chargebee.", notFound: true };
    if (!res.ok) return { ok: false, error: `Chargebee returned ${res.status}` };
    const body = (await res.json()) as { subscription?: { status?: string; subscription_items?: { item_price_id?: string; item_type?: string }[] } };
    const plan = body.subscription?.subscription_items?.find((i) => i.item_type === "plan")?.item_price_id ?? null;
    return { ok: true, status: body.subscription?.status ?? "unknown", plan };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Request failed" };
  }
}
