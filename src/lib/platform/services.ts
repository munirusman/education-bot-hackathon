import { createRepo, type Repo } from "@/lib/db/repo.ts";
import { createMemoryBus } from "./realtime.ts";
import { createApprovalBroker } from "./approvals.ts";
import { EnvironmentServiceImpl } from "@/lib/runtime/service.ts";
import { createDriver } from "@/lib/runtime/factory.ts";
import { seedDemo } from "./seed.ts";
import { flushUsage, recordTurnUsage } from "@/lib/billing/meter.ts";
import { enforceUsageLimit } from "@/lib/billing/limit.ts";
import type { RealtimeBus } from "@/lib/contracts";

export type Services = {
  repo: Repo;
  bus: RealtimeBus;
  env: EnvironmentServiceImpl;
  broker: ReturnType<typeof createApprovalBroker>;
};

const g = globalThis as unknown as { __chServices?: Promise<Services> };

/** Process-wide singletons, created once and shared across route handlers. */
export function getServices(): Promise<Services> {
  g.__chServices ??= (async () => {
    const repo = createRepo();
    const bus = createMemoryBus();
    const env = new EnvironmentServiceImpl({
      repo,
      bus,
      driver: await createDriver(),
      usageGate: (classId) => enforceUsageLimit(repo, classId),
      onUsage: async (u) => {
        await recordTurnUsage(repo, u);
        // Send to Chargebee in the background; failures stay on the record and are retried.
        void flushUsage({ repo }).catch((e) => console.error("[billing] sync failed", e instanceof Error ? e.message : e));
      },
    });
    const broker = createApprovalBroker(repo, bus);
    if (process.env.DEMO_MODE !== "false") await seedDemo(repo);
    return { repo, bus, env, broker };
  })().catch((e) => {
    g.__chServices = undefined;
    throw e;
  });
  return g.__chServices;
}
