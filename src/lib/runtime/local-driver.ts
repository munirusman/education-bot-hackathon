import type { EnvRow } from "@/lib/db/repo.ts";
import type { DriverEvent, TurnContext, TurnDriver } from "./driver.ts";
import { createLocalSandbox, type SandboxFs } from "./sandbox.ts";
import { modelTutor, scriptedTutor, type LocalResume, type TutorHistory } from "./tutor.ts";

const HISTORY_CAP = 24;

/**
 * Runs the tutor in-process against a private local directory sandbox. This is
 * the default so everything works without keys; the HarnessDriver replaces it
 * for real Claude Code sessions in real sandboxes.
 */
export class LocalDriver implements TurnDriver {
  readonly mode = "local" as const;
  private sandboxes = new Map<string, SandboxFs>();

  constructor(private readonly baseDir?: string) {}

  private sandbox(env: EnvRow): SandboxFs {
    let s = this.sandboxes.get(env.sandboxId);
    if (!s) this.sandboxes.set(env.sandboxId, (s = createLocalSandbox(env.sandboxId, this.baseDir)));
    return s;
  }

  async *runTurn(ctx: TurnContext): AsyncGenerator<DriverEvent> {
    const sandbox = this.sandbox(ctx.env);
    // Equivalent of sandboxConfig.onSession: only teacher-allowed files are present.
    await sandbox.replaceDir("materials", ctx.materials);

    const history: TutorHistory = (ctx.resumeState as LocalResume | null)?.history ?? [];
    let reply = "";
    const source = process.env.TUTOR_MODEL ? modelTutor(ctx, history) : scriptedTutor(ctx, sandbox);
    for await (const ev of source) {
      if (ev.type === "text") reply += ev.delta;
      yield ev;
    }
    const next: LocalResume = {
      history: [...history, { role: "user" as const, text: ctx.prompt }, { role: "assistant" as const, text: reply }].slice(-HISTORY_CAP),
    };
    await ctx.saveResume(next);
  }

  async detach(_env: EnvRow, resume: unknown) {
    return resume;
  }
  async stop(_env: EnvRow, resume: unknown) {
    return resume;
  }
  async destroy(env: EnvRow) {
    await this.sandbox(env).destroy();
    this.sandboxes.delete(env.sandboxId);
  }
  readTree(env: EnvRow) {
    return this.sandbox(env).tree();
  }
  readFile(env: EnvRow, path: string) {
    return this.sandbox(env).read(path);
  }
}
