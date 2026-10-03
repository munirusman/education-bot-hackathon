import { createServer, type IncomingMessage, type Server } from "node:http";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { openMemoryDb } from "@/lib/db/client.ts";
import { createRepo, type Repo } from "@/lib/db/repo.ts";
import { createMemoryBus } from "@/lib/platform/realtime.ts";
import { resolveEffectivePolicy } from "@/lib/platform/policy.ts";
import type { DriverEvent, TurnContext, TurnDriver } from "@/lib/runtime/driver.ts";
import { LocalDriver } from "@/lib/runtime/local-driver.ts";
import { EnvironmentServiceImpl } from "@/lib/runtime/service.ts";
import { buildUsageEvent, chargebeeConfig, sendUsageEvent, type ChargebeeConfig } from "./chargebee.ts";
import { flushUsage, monthRange, recordTurnUsage, summarizeUsage, type TurnUsage } from "./meter.ts";
import { estimateCharge, formatMoney, rateCard } from "./pricing.ts";

process.env.RESUME_STATE_KEY = "22".repeat(32);
process.env.TUTOR_FAST = "1";

// ---- a local stand-in for Chargebee's ingest endpoint -------------------------
type Seen = { url: string; auth: string; type: string; body: any };
let server: Server;
let origin: string;
let seen: Seen[];
let respond: (n: number) => { status: number; body?: unknown };

beforeEach(async () => {
  seen = [];
  respond = () => ({ status: 200, body: { usage_event: {} } });
  server = createServer((req: IncomingMessage, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      seen.push({ url: `${req.method} ${req.url}`, auth: String(req.headers.authorization), type: String(req.headers["content-type"]), body: JSON.parse(raw || "{}") });
      const r = respond(seen.length);
      res.writeHead(r.status, { "content-type": "application/json" });
      res.end(JSON.stringify(r.body ?? {}));
    });
  });
  await new Promise<void>((ok) => server.listen(0, "127.0.0.1", ok));
  origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterEach(() => new Promise<void>((ok) => server.close(() => ok())));

const cfg = (): ChargebeeConfig => ({ site: "demo", apiKey: "test_SECRETKEY", subscriptionId: "sub-1", ingestOrigin: origin });

const row = (over: Partial<Parameters<typeof buildUsageEvent>[0]> = {}) => ({
  turnId: "turn_0123456789abcdef", classId: "cls_1", model: "space-bunny-free", inputTokens: 1200, outputTokens: 300, tokenSource: "provider" as const, usageAt: "2026-10-03T12:00:00.000Z", ...over,
});

describe("chargebee config", () => {
  it("is null unless site, key and subscription are all set", () => {
    expect(chargebeeConfig({})).toBeNull();
    expect(chargebeeConfig({ CHARGEBEE_SITE: "acme", CHARGEBEE_API_KEY: "k" })).toBeNull();
    expect(chargebeeConfig({ CHARGEBEE_SITE: "acme", CHARGEBEE_API_KEY: "k", CHARGEBEE_SUBSCRIPTION_ID: "s" })?.ingestOrigin).toBe("https://acme.ingest.chargebee.com");
  });
  it("rejects a site that isn't a plain subdomain (it becomes part of a hostname)", () => {
    for (const site of ["evil.com/x", "a.b", "acme@evil.com", "-bad", "a b", ""]) {
      expect(chargebeeConfig({ CHARGEBEE_SITE: site, CHARGEBEE_API_KEY: "k", CHARGEBEE_SUBSCRIPTION_ID: "s" })).toBeNull();
    }
  });
  it("only allows an ingest override over https or loopback http", () => {
    const base = { CHARGEBEE_SITE: "acme", CHARGEBEE_API_KEY: "k", CHARGEBEE_SUBSCRIPTION_ID: "s" };
    expect(chargebeeConfig({ ...base, CHARGEBEE_INGEST_URL: "http://127.0.0.1:9" })?.ingestOrigin).toBe("http://127.0.0.1:9");
    expect(chargebeeConfig({ ...base, CHARGEBEE_INGEST_URL: "http://example.com" })).toBeNull();
  });
});

describe("usage event shape", () => {
  it("matches the Usage Events API: dedup id <= 36, ms timestamp, flat properties", () => {
    const e = buildUsageEvent(row(), "sub-1");
    expect(e.deduplication_id).toBe("turn_0123456789abcdef");
    expect(e.deduplication_id.length).toBeLessThanOrEqual(36);
    expect(e.subscription_id).toBe("sub-1");
    expect(e.usage_timestamp).toBe(Date.parse("2026-10-03T12:00:00.000Z"));
    expect(Object.values(e.properties).every((v) => ["string", "number", "boolean"].includes(typeof v))).toBe(true);
    expect(e.properties).toMatchObject({ orbit_questions: 1, orbit_input_tokens: 1200, orbit_output_tokens: 300, orbit_total_tokens: 1500, orbit_model: "space-bunny-free", orbit_token_source: "provider" });
  });
  it("carries no student identity", () => {
    expect(JSON.stringify(buildUsageEvent(row(), "sub-1"))).not.toMatch(/usr_|student|prompt|name/i);
  });
});

describe("sending to chargebee", () => {
  it("posts JSON to /api/v2/usage_events with basic auth (key as username, empty password)", async () => {
    expect(await sendUsageEvent(cfg(), buildUsageEvent(row(), "sub-1"))).toEqual({ ok: true });
    expect(seen).toHaveLength(1);
    expect(seen[0]!.url).toBe("POST /api/v2/usage_events");
    expect(seen[0]!.type).toContain("application/json");
    expect(seen[0]!.auth).toBe(`Basic ${Buffer.from("test_SECRETKEY:").toString("base64")}`);
    expect(seen[0]!.body.deduplication_id).toBe("turn_0123456789abcdef");
  });
  it("treats 429 and 5xx as retryable", async () => {
    for (const status of [429, 500, 503]) {
      respond = () => ({ status });
      expect(await sendUsageEvent(cfg(), buildUsageEvent(row(), "s"))).toMatchObject({ ok: false, retryable: true });
    }
  });
  it("treats a bad key as retryable (config problem, not a bad event) and never leaks the key", async () => {
    respond = () => ({ status: 401, body: { message: "Invalid API key" } });
    const r = await sendUsageEvent(cfg(), buildUsageEvent(row(), "s"));
    expect(r).toMatchObject({ ok: false, retryable: true });
    expect((r as { error: string }).error).toContain("API key");
    expect(JSON.stringify(r)).not.toContain("SECRETKEY");
  });
  it("treats other 4xx as a permanent refusal", async () => {
    respond = () => ({ status: 400, body: { message: "properties is invalid" } });
    const r = await sendUsageEvent(cfg(), buildUsageEvent(row(), "s"));
    expect(r).toMatchObject({ ok: false, retryable: false });
    expect((r as { error: string }).error).toContain("properties is invalid");
  });
  it("treats an unreachable server as retryable", async () => {
    await new Promise<void>((ok) => server.close(() => ok()));
    expect(await sendUsageEvent(cfg(), buildUsageEvent(row(), "s"))).toMatchObject({ ok: false, retryable: true });
    server = createServer().listen(0, "127.0.0.1"); // so afterEach has something to close
  });
});

// ---- outbox + runtime integration ---------------------------------------------
let repo: Repo;
const usage = (n: number, over: Partial<TurnUsage> = {}): TurnUsage => ({ turnId: `turn_${String(n).padStart(16, "0")}`, environmentId: "env1", classId: "cls1", studentId: "stu1", model: "m", inputTokens: 100, outputTokens: 50, source: "estimate", at: new Date("2026-10-03T12:00:00Z"), ...over });

async function seedBase() {
  repo = createRepo(await openMemoryDb());
  await repo.upsertUser({ id: "t1", name: "Teach", role: "teacher" });
  await repo.upsertUser({ id: "stu1", name: "Ava", role: "student" });
  const cls = await repo.createClass({ teacherId: "t1", name: "Phys", policy: { name: "p", subject: "Physics", style: "guided-steps", tools: {}, materials: [], approvalRequired: [], model: "default", limits: { turnsPerDay: 40, maxTokensPerTurn: 4000 }, assessmentWindow: null, teacherTools: [], guidance: "" } });
  await repo.enroll(cls.id, "stu1");
  const env = await repo.insertEnvironment({ id: "env1", classId: cls.id, studentId: "stu1", sandboxId: "env-env1" });
  return { cls, env };
}

describe("usage outbox", () => {
  let classId: string;
  beforeEach(async () => {
    const { cls } = await seedBase();
    classId = cls.id;
  });

  it("records one row per turn and ignores a repeat for the same turn", async () => {
    expect(await recordTurnUsage(repo, usage(1, { classId }))).toBe(true);
    expect(await recordTurnUsage(repo, usage(1, { classId }))).toBe(false);
    expect(await repo.usageSyncCounts("t1")).toEqual({ pending: 1 });
  });

  it("does nothing and keeps records pending when Chargebee isn't configured", async () => {
    await recordTurnUsage(repo, usage(1, { classId }));
    expect(await flushUsage({ repo, cfg: null })).toMatchObject({ configured: false, sent: 0 });
    expect(await repo.usageSyncCounts("t1")).toEqual({ pending: 1 });
  });

  it("sends once, then never resends a sent record", async () => {
    await recordTurnUsage(repo, usage(1, { classId }));
    const now = () => new Date("2026-10-03T12:05:00Z").getTime();
    expect(await flushUsage({ repo, cfg: cfg(), now })).toMatchObject({ sent: 1 });
    expect(await flushUsage({ repo, cfg: cfg(), now })).toMatchObject({ sent: 0 });
    expect(seen).toHaveLength(1);
    expect(await repo.usageSyncCounts("t1")).toEqual({ sent: 1 });
  });

  it("retries after a server error with the identical dedup id and timestamp, so it cannot double count", async () => {
    await recordTurnUsage(repo, usage(1, { classId }));
    const now = () => new Date("2026-10-03T12:05:00Z").getTime();
    respond = (n) => (n === 1 ? { status: 503 } : { status: 200 });
    expect(await flushUsage({ repo, cfg: cfg(), now })).toMatchObject({ retrying: 1, sent: 0 });
    expect((await repo.listPendingUsage())[0]).toMatchObject({ syncAttempts: 1 });
    expect(await flushUsage({ repo, cfg: cfg(), now })).toMatchObject({ sent: 1 });
    expect(seen).toHaveLength(2);
    expect(seen[1]!.body).toEqual(seen[0]!.body);
  });

  it("marks a refused event failed with the reason, and stops retrying it", async () => {
    await recordTurnUsage(repo, usage(1, { classId }));
    respond = () => ({ status: 400, body: { message: "nope" } });
    const now = () => new Date("2026-10-03T12:05:00Z").getTime();
    expect(await flushUsage({ repo, cfg: cfg(), now })).toMatchObject({ failed: 1 });
    expect(await flushUsage({ repo, cfg: cfg(), now })).toMatchObject({ failed: 0, sent: 0 });
    expect(seen).toHaveLength(1);
    const [r] = await repo.usageBetween("t1", new Date("2026-10-01"), new Date("2026-11-01"));
    expect(r).toMatchObject({ syncStatus: "failed" });
    expect(r!.syncError).toContain("nope");
  });

  it("expires events older than Chargebee's 12-hour window instead of sending them", async () => {
    await recordTurnUsage(repo, usage(1, { classId }));
    const now = () => new Date("2026-10-04T01:00:00Z").getTime(); // 13h later
    expect(await flushUsage({ repo, cfg: cfg(), now })).toMatchObject({ expired: 1, sent: 0 });
    expect(seen).toHaveLength(0);
    expect(await repo.usageSyncCounts("t1")).toEqual({ expired: 1 });
  });
});

describe("summary and pricing", () => {
  it("monthRange is a UTC half-open month and falls back on bad input", () => {
    const r = monthRange("2026-02", new Date("2026-10-03"));
    expect(r.key).toBe("2026-02");
    expect(r.from.toISOString()).toBe("2026-02-01T00:00:00.000Z");
    expect(r.to.toISOString()).toBe("2026-03-01T00:00:00.000Z");
    expect(monthRange("garbage", new Date("2026-10-03")).key).toBe("2026-10");
    expect(monthRange("2026-13", new Date("2026-10-03")).key).toBe("2026-10");
  });
  it("prices per million tokens and formats money", () => {
    const card = { currency: "USD", perMillionInput: 3, perMillionOutput: 15 };
    expect(estimateCharge({ inputTokens: 1_000_000, outputTokens: 1_000_000 }, card)).toBeCloseTo(18);
    expect(rateCard({ BILLING_PRICE_PER_1M_INPUT_TOKENS: "-5", BILLING_PRICE_PER_1M_OUTPUT_TOKENS: "abc" })).toMatchObject({ perMillionInput: 3, perMillionOutput: 15 });
    expect(formatMoney(18, "USD")).toBe("$18.00");
  });
  it("summarizes by day, class, student and model, and counts estimated tokens", () => {
    const mk = (id: string, day: string, tokens: [number, number], source: "provider" | "estimate", student = "s1", model = "m1") => ({ id, turnId: id, environmentId: "e", classId: "c1", teacherId: "t", studentId: student, model, inputTokens: tokens[0], outputTokens: tokens[1], tokenSource: source, usageAt: `${day}T10:00:00.000Z`, syncStatus: "pending" as const, syncAttempts: 0, syncError: null, syncedAt: null });
    const rows = [mk("a", "2026-10-01", [100, 50], "provider"), mk("b", "2026-10-01", [10, 5], "estimate", "s2"), mk("c", "2026-10-02", [1000, 500], "estimate", "s1", "m2")];
    const s = summarizeUsage(rows, { classes: new Map([["c1", "Physics"]]), students: new Map([["s1", "Ava"], ["s2", "Ben"]]) }, { currency: "USD", perMillionInput: 3, perMillionOutput: 15 });
    expect(s.totals).toMatchObject({ questions: 3, inputTokens: 1110, outputTokens: 555, estimatedTokens: 1515 });
    expect(s.byDay.map((d) => [d.day, d.questions])).toEqual([["2026-10-01", 2], ["2026-10-02", 1]]);
    expect(s.byClass[0]).toMatchObject({ name: "Physics", questions: 3 });
    expect(s.byStudent[0]).toMatchObject({ name: "Ava", questions: 2 });
    expect(s.byModel.map((m) => m.model)).toEqual(["m2", "m1"]);
  });
});

describe("runtime metering", () => {
  async function build(driver?: TurnDriver) {
    const { cls, env } = await seedBase();
    const recorded: TurnUsage[] = [];
    const svc = new EnvironmentServiceImpl({
      repo, bus: createMemoryBus(), driver: driver ?? new LocalDriver(mkdtempSync(path.join(tmpdir(), "ch-bill-"))),
      onUsage: async (u) => { recorded.push(u); await recordTurnUsage(repo, u); },
    });
    const resolvePolicy = async () => resolveEffectivePolicy({ classPolicy: await repo.getActivePolicy(cls.id), classPolicyId: cls.activePolicyId!, override: null });
    const ask = async (prompt: string) => { for await (const _ of svc.runTurn({ environmentId: env.id, prompt, resolvePolicy })) void _; };
    return { ask, recorded };
  }

  it("meters every finished turn once, as an estimate when the tutor reports no counts", async () => {
    const { ask, recorded } = await build();
    await ask("How far does a cart go?");
    await ask("and the second question?");
    expect(recorded).toHaveLength(2);
    expect(recorded[0]).toMatchObject({ source: "estimate", classId: expect.any(String), studentId: "stu1" });
    expect(recorded[0]!.inputTokens).toBeGreaterThan(100); // includes the instructions, not just the question
    expect(new Set(recorded.map((r) => r.turnId)).size).toBe(2);
  });

  it("prefers provider-reported tokens and model", async () => {
    const driver: TurnDriver = {
      mode: "local",
      async *runTurn(ctx: TurnContext): AsyncGenerator<DriverEvent> {
        yield { type: "text", blockId: "b", delta: "hi" };
        yield { type: "text-end", blockId: "b" };
        ctx.reportUsage({ inputTokens: 4321, outputTokens: 99, model: "real-model" });
      },
      detach: async (_e, r) => r, stop: async (_e, r) => r, destroy: async () => {},
      readTree: async () => ({ root: "", files: [], totalBytes: 0 }), readFile: async () => "",
    };
    const { ask, recorded } = await build(driver);
    await ask("hello");
    expect(recorded[0]).toMatchObject({ source: "provider", inputTokens: 4321, outputTokens: 99, model: "real-model" });
  });

  it("a billing failure never breaks the student's turn", async () => {
    const { cls, env } = await seedBase();
    const svc = new EnvironmentServiceImpl({ repo, bus: createMemoryBus(), driver: new LocalDriver(mkdtempSync(path.join(tmpdir(), "ch-bill-"))), onUsage: async () => { throw new Error("db down"); } });
    const events: string[] = [];
    for await (const e of svc.runTurn({ environmentId: env.id, prompt: "hi", resolvePolicy: async () => resolveEffectivePolicy({ classPolicy: await repo.getActivePolicy(cls.id), classPolicyId: cls.activePolicyId!, override: null }) })) events.push(e.type);
    expect(events.at(-1)).toBe("turn-end");
  });
});
