import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { openMemoryDb } from "@/lib/db/client.ts";
import { createRepo } from "@/lib/db/repo.ts";
import { createMemoryBus } from "@/lib/platform/realtime.ts";
import { resolveEffectivePolicy } from "@/lib/platform/policy.ts";
import { LocalDriver } from "@/lib/runtime/local-driver.ts";
import { EnvironmentServiceImpl } from "@/lib/runtime/service.ts";
import { upgradeTeacher } from "./upgrade.ts";
import { activeSubscription, enforceUsageLimit, getAllowance, resetAllowanceCache, usageStatus, type Allowance } from "./limit.ts";
import { recordTurnUsage } from "./meter.ts";

const cfg = { site: "t", apiKey: "k", subscriptionId: "sub1", upgradeSubscriptionId: "sub2", ingestOrigin: "https://x", apiOrigin: "https://t.chargebee.com" };
const ents = (value: string, over: Record<string, unknown> = {}) => ({ list: [{ subscription_entitlement: { feature_id: "ai_tokens_per_month", value, is_enabled: true, ...over } }] });
const reply = (body: unknown, status = 200): typeof fetch => (async () => new Response(JSON.stringify(body), { status })) as typeof fetch;

describe("allowance from Chargebee", () => {
  beforeEach(() => resetAllowanceCache());

  it("reads the plan's entitlement and sends the right request", async () => {
    let seen: { url: string; auth: string | null } | null = null;
    const f = (async (url: string, init?: RequestInit) => { seen = { url, auth: new Headers(init?.headers).get("authorization") }; return new Response(JSON.stringify(ents("2000"))); }) as unknown as typeof fetch;
    expect(await getAllowance({ cfg, fetchImpl: f })).toEqual({ limit: 2000, state: "ok" });
    expect(seen!.url).toBe("https://t.chargebee.com/api/v2/subscriptions/sub1/subscription_entitlements?limit=100");
    expect(seen!.auth).toBe(`Basic ${Buffer.from("k:").toString("base64")}`);
  });

  it("treats unlimited, a missing entitlement, or a disabled one as no limit", async () => {
    expect((await getAllowance({ cfg, fetchImpl: reply(ents("Unlimited")) })).limit).toBeNull();
    resetAllowanceCache();
    expect((await getAllowance({ cfg, fetchImpl: reply({ list: [] }) })).limit).toBeNull();
    resetAllowanceCache();
    expect((await getAllowance({ cfg, fetchImpl: reply(ents("2000", { is_enabled: false })) })).limit).toBeNull();
  });

  it("caches for a minute, then follows an upgrade", async () => {
    let n = 0, value = "2000";
    const f = (async () => { n++; return new Response(JSON.stringify(ents(value))); }) as unknown as typeof fetch;
    let t = 1_000;
    expect((await getAllowance({ cfg, fetchImpl: f, now: () => t })).limit).toBe(2000);
    value = "50000";
    t += 30_000;
    expect((await getAllowance({ cfg, fetchImpl: f, now: () => t })).limit).toBe(2000);
    t += 31_000;
    expect((await getAllowance({ cfg, fetchImpl: f, now: () => t })).limit).toBe(50000);
    expect(n).toBe(2);
  });

  it("keeps the last known value if Chargebee fails, and doesn't block when it never answered", async () => {
    expect(await getAllowance({ cfg, fetchImpl: reply({}, 500), now: () => 1 })).toEqual({ limit: null, state: "unavailable" });
    await getAllowance({ cfg, fetchImpl: reply(ents("2000")), now: () => 10 });
    expect(await getAllowance({ cfg, fetchImpl: reply({}, 503), now: () => 100_000 })).toEqual({ limit: 2000, state: "stale" });
  });

  it("does nothing without a Chargebee connection", async () => {
    expect(await getAllowance({ cfg: null })).toEqual({ limit: null, state: "not-configured" });
  });
});

const A2000: Allowance = { limit: 2000, state: "ok" };

describe("usage gate", () => {
  async function setup() {
    const repo = createRepo(await openMemoryDb());
    await repo.upsertUser({ id: "t1", name: "Teach", role: "teacher" });
    await repo.upsertUser({ id: "stu1", name: "Ava", role: "student" });
    const cls = await repo.createClass({ teacherId: "t1", name: "Phys", policy: { name: "p", subject: "Physics", style: "guided-steps", tools: {}, materials: [], approvalRequired: [], model: "default", limits: { turnsPerDay: 40, maxTokensPerTurn: 4000 }, assessmentWindow: null, teacherTools: [], guidance: "" } });
    await repo.enroll(cls.id, "stu1");
    const env = await repo.insertEnvironment({ id: "env1", classId: cls.id, studentId: "stu1", sandboxId: "env-env1" });
    return { repo, cls, env };
  }
  const use = (n: number, classId: string, tokens: number, at = new Date()) => ({ turnId: `turn_${String(n).padStart(16, "0")}`, environmentId: "env1", classId, studentId: "stu1", model: "m", inputTokens: tokens, outputTokens: 0, source: "provider" as const, at });

  it("counts this month only and flips at the limit", async () => {
    const { repo, cls } = await setup();
    await recordTurnUsage(repo, use(1, cls.id, 1999));
    expect(await usageStatus(repo, "t1", new Date(), A2000)).toMatchObject({ used: 1999, exceeded: false });
    await recordTurnUsage(repo, use(2, cls.id, 1));
    expect(await usageStatus(repo, "t1", new Date(), A2000)).toMatchObject({ used: 2000, exceeded: true });
    // next month starts clean
    expect((await usageStatus(repo, "t1", new Date(Date.UTC(2099, 0, 5)), A2000)).used).toBe(0);
  });

  it("stops the next turn with an upgrade message, and does not run the tutor", async () => {
    const { repo, cls, env } = await setup();
    const svc = new EnvironmentServiceImpl({ repo, bus: createMemoryBus(), driver: new LocalDriver(mkdtempSync(path.join(tmpdir(), "ch-lim-"))), usageGate: (id) => enforceUsageLimit(repo, id, A2000) });
    const resolvePolicy = async () => resolveEffectivePolicy({ classPolicy: await repo.getActivePolicy(cls.id), classPolicyId: cls.activePolicyId!, override: null });
    const ask = async () => { for await (const _ of svc.runTurn({ environmentId: env.id, prompt: "hi", resolvePolicy })) void _; };
    await recordTurnUsage(repo, use(1, cls.id, 2500));
    await expect(ask()).rejects.toMatchObject({ name: "UsageLimitError", message: expect.stringContaining("upgrade") });
    expect(await repo.countTurnsToday(env.id)).toBe(0);
  });

  it("never blocks when there is no limit", async () => {
    const { repo, cls } = await setup();
    await recordTurnUsage(repo, use(1, cls.id, 999_999));
    await expect(enforceUsageLimit(repo, cls.id, { limit: null, state: "ok" })).resolves.toBeUndefined();
  });
});

describe("upgrade", () => {
  const sub = (status = "active") => ({ subscription: { status, subscription_items: [{ item_price_id: "orbit-pro-USD-Monthly", item_type: "plan" }] } });
  const route = (map: Record<string, { status?: number; body: unknown }>): typeof fetch =>
    (async (url: string) => {
      const hit = Object.entries(map).find(([k]) => String(url).includes(k));
      return new Response(JSON.stringify(hit?.[1].body ?? {}), { status: hit?.[1].status ?? 404 });
    }) as unknown as typeof fetch;
  const world = (over: Record<string, { status?: number; body: unknown }> = {}) =>
    route({
      "subscriptions/sub2/subscription_entitlements": { status: 200, body: ents("1000000000") },
      "subscriptions/sub1/subscription_entitlements": { status: 200, body: ents("2000") },
      "subscriptions/sub2": { status: 200, body: sub() },
      ...over,
    });

  async function seed() {
    const repo = createRepo(await openMemoryDb());
    await repo.upsertUser({ id: "t1", name: "Teach", role: "teacher" });
    return repo;
  }

  it("switches the teacher to the bigger subscription, and the gate follows", async () => {
    resetAllowanceCache();
    const repo = await seed();
    const f = world();
    expect(await activeSubscription(repo, "t1", cfg)).toBe("sub1");
    expect(await upgradeTeacher(repo, "t1", { cfg, fetchImpl: f })).toEqual({ subscriptionId: "sub2", plan: "orbit-pro-USD-Monthly", limit: 1_000_000_000 });
    expect(await activeSubscription(repo, "t1", cfg)).toBe("sub2");
    expect(await getAllowance({ cfg, fetchImpl: f, subscriptionId: "sub2" })).toEqual({ limit: 1_000_000_000, state: "ok" });
  });

  it("refuses when already upgraded, not configured, missing, inactive, or not larger", async () => {
    const repo = await seed();
    await expect(upgradeTeacher(repo, "t1", { cfg: null })).rejects.toMatchObject({ status: 409 });
    await expect(upgradeTeacher(repo, "t1", { cfg: { ...cfg, upgradeSubscriptionId: null } })).rejects.toMatchObject({ status: 409 });
    await expect(upgradeTeacher(repo, "t1", { cfg, fetchImpl: world({ "subscriptions/sub2": { status: 404, body: {} } }) })).rejects.toMatchObject({ status: 404 });
    await expect(upgradeTeacher(repo, "t1", { cfg, fetchImpl: world({ "subscriptions/sub2": { status: 200, body: sub("cancelled") } }) })).rejects.toMatchObject({ status: 409 });
    await expect(upgradeTeacher(repo, "t1", { cfg, fetchImpl: world({ "subscriptions/sub2/subscription_entitlements": { status: 200, body: ents("500") } }) })).rejects.toMatchObject({ message: expect.stringContaining("more tokens") });
    expect(await activeSubscription(repo, "t1", cfg)).toBe("sub1"); // none of the refusals switched anything
    await upgradeTeacher(repo, "t1", { cfg, fetchImpl: world() });
    await expect(upgradeTeacher(repo, "t1", { cfg, fetchImpl: world() })).rejects.toMatchObject({ message: expect.stringContaining("already") });
  });
});
