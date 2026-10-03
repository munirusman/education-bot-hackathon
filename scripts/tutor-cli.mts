/**
 * Drive the runtime from a terminal with an in-memory database: no UI, no
 * server. Usage: npm run tutor -- [hint-only|guided-steps|explain] "your question"
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { openMemoryDb } from "../src/lib/db/client.ts";
import { createRepo } from "../src/lib/db/repo.ts";
import { createMemoryBus } from "../src/lib/platform/realtime.ts";
import { resolveEffectivePolicy } from "../src/lib/platform/policy.ts";
import { seedDemo, DEMO } from "../src/lib/platform/seed.ts";
import { LocalDriver } from "../src/lib/runtime/local-driver.ts";
import { EnvironmentServiceImpl } from "../src/lib/runtime/service.ts";

process.env.RESUME_STATE_KEY ??= "00".repeat(32);
process.env.TUTOR_FAST ??= "1";

const [style, ...rest] = process.argv.slice(2);
const styles = ["hint-only", "guided-steps", "explain"];
const prompt = (styles.includes(style ?? "") ? rest : [style ?? "", ...rest]).join(" ").trim() || "How far does the cart go? See the worksheet.";

const repo = createRepo(await openMemoryDb());
await seedDemo(repo);
const svc = new EnvironmentServiceImpl({ repo, bus: createMemoryBus(), driver: new LocalDriver(mkdtempSync(path.join(tmpdir(), "ch-cli-"))) });
const [cls] = await repo.listClassesForTeacher(DEMO.teacher.id);
const env = await svc.ensureEnvironment({ classId: cls!.id, studentId: DEMO.students[0]!.id });
if (styles.includes(style ?? "")) await svc.setPolicyOverride(env.id, { style: style as never });

for await (const e of svc.runTurn({
  environmentId: env.id,
  prompt,
  resolvePolicy: async () =>
    resolveEffectivePolicy({
      classPolicy: await repo.getActivePolicy(cls!.id),
      classPolicyId: cls!.activePolicyId!,
      override: (await repo.getEnvironment(env.id))?.policyOverride ?? null,
    }),
  requestApproval: async () => ({ approved: true, teacherId: "cli" }),
})) {
  if (e.type === "text") process.stdout.write(e.delta);
  else if (e.type === "tool-call") console.log(`\n[tool] ${e.toolName} ${JSON.stringify(e.input)}`);
  else if (e.type === "turn-end") console.log(`\n[done] ${e.stopReason}`);
}
