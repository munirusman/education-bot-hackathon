import { createRepo, type Repo } from "@/lib/db/repo.ts";
import { createMemoryBus } from "./realtime.ts";
import { createApprovalBroker } from "./approvals.ts";
import { EnvironmentServiceImpl } from "@/lib/runtime/service.ts";
import { createDriver } from "@/lib/runtime/factory.ts";
import { seedDemo } from "./seed.ts";
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
    const env = new EnvironmentServiceImpl({ repo, bus, driver: await createDriver() });
    const broker = createApprovalBroker(repo, bus);
    if (process.env.DEMO_MODE !== "false") await seedDemo(repo);
    return { repo, bus, env, broker };
  })().catch((e) => {
    g.__chServices = undefined;
    throw e;
  });
  return g.__chServices;
}
