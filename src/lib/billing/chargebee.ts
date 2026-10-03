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

export type ChargebeeConfig = { site: string; apiKey: string; subscriptionId: string; ingestOrigin: string };

const SITE_RE = /^[a-z0-9][a-z0-9-]{0,62}$/i;

export function chargebeeConfig(env: Record<string, string | undefined> = process.env): ChargebeeConfig | null {
  const site = env.CHARGEBEE_SITE?.trim();
  const apiKey = env.CHARGEBEE_API_KEY?.trim();
  const subscriptionId = env.CHARGEBEE_SUBSCRIPTION_ID?.trim();
  if (!site || !apiKey || !subscriptionId) return null;
  // The site becomes part of a hostname, so it must look like a subdomain, nothing else.
  if (!SITE_RE.test(site)) return null;
  if (subscriptionId.length > 50) return null;

  let ingestOrigin = `https://${site}.ingest.chargebee.com`;
  const override = env.CHARGEBEE_INGEST_URL?.trim();
  if (override) {
    // For tests and mocks only: plain http is allowed solely for loopback.
    const u = new URL(override);
    if (u.protocol === "https:" || (u.protocol === "http:" && ["localhost", "127.0.0.1"].includes(u.hostname))) ingestOrigin = u.origin;
    else return null;
  }
  return { site, apiKey, subscriptionId, ingestOrigin };
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
