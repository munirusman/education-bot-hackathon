/**
 * The only file that imports the (experimental) AI SDK harness packages.
 *
 * Teacher policy is compiled per turn (see compile.ts) and applied to a fresh,
 * config-only HarnessAgent; the live conversation lives in the resumable
 * HarnessAgentSession, so the harness owns history and nothing is replayed.
 * Not exercised against a live sandbox in this repo's tests: it needs
 * ANTHROPIC_API_KEY and Vercel sandbox credentials.
 */
import { HarnessAgent } from "@ai-sdk/harness/agent";
import { claudeCode } from "@ai-sdk/harness-claude-code";
import { createVercelNetworkSandboxSession, resumeVercelNetworkSandboxSession } from "@ai-sdk/sandbox-vercel";
import type { HarnessV1NetworkSandboxSession } from "@ai-sdk/harness";
import type { SandboxTree } from "@/lib/contracts";
import type { EnvRow } from "@/lib/db/repo.ts";
import type { DriverEvent, TurnContext, TurnDriver } from "./driver.ts";

type Resume = { sessionId: string; state: unknown };

const WRITE_TOOLS = new Set(["write", "edit"]);
const EXCLUDE = "-not -path './.agent-runs/*' -not -path './node_modules/*' -not -path './.git/*'";

export class HarnessDriver implements TurnDriver {
  readonly mode = "harness" as const;
  private sandboxes = new Map<string, HarnessV1NetworkSandboxSession>();

  /** Reattach by derived id, else create it with outbound network denied. */
  private async sandbox(env: EnvRow, abortSignal?: AbortSignal): Promise<HarnessV1NetworkSandboxSession> {
    const cached = this.sandboxes.get(env.sandboxId);
    if (cached) return cached;
    let session: HarnessV1NetworkSandboxSession;
    try {
      session = await resumeVercelNetworkSandboxSession({ sandboxId: env.sandboxId, abortSignal });
    } catch {
      session = await createVercelNetworkSandboxSession({
        sandboxId: env.sandboxId,
        runtime: "node24",
        networkPolicy: "deny-all",
        abortSignal,
      } as never);
    }
    this.sandboxes.set(env.sandboxId, session);
    return session;
  }

  async *runTurn(ctx: TurnContext): AsyncGenerator<DriverEvent> {
    const { compiled } = ctx;
    const sandboxSession = await this.sandbox(ctx.env, ctx.abortSignal);

    const agent = new HarnessAgent({
      harness: claudeCode,
      id: "classroom-tutor",
      model: compiled.model === "default" ? undefined : compiled.model,
      instructions: compiled.instructions,
      skills: [compiled.skill],
      // Teacher policy -> harness gating, re-derived each turn.
      activeTools: compiled.activeTools as never,
      permissionMode: compiled.permissionMode,
      sandboxConfig: {
        // Only teacher-allowed course files are ever present in the sandbox.
        onSession: async ({ session, sessionWorkDir, abortSignal }) => {
          await session.run({ command: `rm -rf '${sessionWorkDir}/materials' && mkdir -p '${sessionWorkDir}/materials'`, abortSignal });
          for (const m of ctx.materials) {
            await session.writeTextFile({ path: `${sessionWorkDir}/materials/${m.name.replace(/[^\w.-]/g, "_")}`, content: m.content, abortSignal });
          }
        },
      },
    });

    const resume = ctx.resumeState as Resume | null;
    const session = await agent.createSession({
      sandboxSession,
      abortSignal: ctx.abortSignal,
      ...(resume ? { sessionId: resume.sessionId, resumeFrom: resume.state as never } : {}),
    });

    const notes = ctx.teacherNotes.map((n) => `[Teacher note from ${n.teacherName}] ${n.text}`).join("\n");
    let prompt = notes ? `${notes}\n\n${ctx.prompt}` : ctx.prompt;

    try {
      const inputs = new Map<string, { toolName: string; input: any }>();
      let continuations: any[] | undefined;
      for (let round = 0; round < 8; round++) {
        const result: any = continuations
          ? await agent.continueStream({ session, toolApprovalContinuations: continuations, abortSignal: ctx.abortSignal })
          : await agent.stream({ session, prompt, abortSignal: ctx.abortSignal });
        const pending: { approvalId: string; toolCallId: string; toolName: string; input: unknown }[] = [];

        for await (const part of result.fullStream as AsyncIterable<any>) {
          switch (part.type) {
            case "text-delta":
              yield { type: "text", blockId: part.id, delta: part.text };
              break;
            case "text-end":
              yield { type: "text-end", blockId: part.id };
              break;
            case "reasoning-delta":
              yield { type: "reasoning", blockId: part.id, delta: part.text };
              break;
            case "reasoning-end":
              yield { type: "reasoning-end", blockId: part.id };
              break;
            case "tool-input-delta":
              yield { type: "tool-input", toolCallId: part.id, toolName: part.toolName ?? "", delta: part.delta };
              break;
            case "tool-call":
              inputs.set(part.toolCallId, { toolName: part.toolName, input: part.input });
              yield { type: "tool-call", toolCallId: part.toolCallId, toolName: part.toolName, input: part.input, providerExecuted: Boolean(part.providerExecuted) };
              break;
            case "tool-result": {
              yield { type: "tool-result", toolCallId: part.toolCallId, toolName: part.toolName, output: part.output, isError: false };
              const call = inputs.get(part.toolCallId);
              const file = call?.input?.file_path;
              if (WRITE_TOOLS.has(part.toolName) && typeof file === "string") yield { type: "file-change", change: part.toolName === "write" ? "create" : "modify", path: file };
              break;
            }
            case "tool-error":
              yield { type: "tool-result", toolCallId: part.toolCallId, toolName: part.toolName, output: String(part.error), isError: true };
              break;
            case "tool-approval-request":
              pending.push({ approvalId: part.approvalId, toolCallId: part.toolCall.toolCallId, toolName: part.toolCall.toolName, input: part.toolCall.input });
              break;
          }
        }

        if (!pending.length) break;
        continuations = [];
        for (const p of pending) {
          yield { type: "approval-request", ...p };
          const d = await ctx.requestApproval(p);
          yield { type: "approval-resolved", approvalId: p.approvalId, approved: d.approved, reason: d.reason, teacherId: d.teacherId ?? "teacher" };
          continuations.push({ type: "tool-approval-response", approvalId: p.approvalId, approved: d.approved, reason: d.reason });
        }
        prompt = "";
      }
    } finally {
      // Keep the sandbox warm and hand the opaque state back to be encrypted.
      const state = await session.detach();
      await ctx.saveResume({ sessionId: session.sessionId, state } satisfies Resume);
    }
  }

  async detach(_env: EnvRow, resume: unknown) {
    return resume; // runTurn already detached the session; the sandbox stays warm
  }

  async stop(env: EnvRow, resume: unknown) {
    const s = this.sandboxes.get(env.sandboxId);
    await (s as { stop?: () => Promise<void> } | undefined)?.stop?.();
    this.sandboxes.delete(env.sandboxId);
    return resume;
  }

  async destroy(env: EnvRow) {
    const s = await this.sandbox(env).catch(() => null);
    await s?.destroy();
    this.sandboxes.delete(env.sandboxId);
  }

  async readTree(env: EnvRow): Promise<SandboxTree> {
    const s = await this.sandbox(env);
    const out = await s.run({ command: `find . -type f ${EXCLUDE} -printf '%s %p\\n' | head -200` });
    const files = out.stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const i = line.indexOf(" ");
        return { size: Number(line.slice(0, i)), path: line.slice(i + 3), preview: "" };
      });
    return { root: env.sandboxId, files, totalBytes: files.reduce((n, f) => n + f.size, 0) };
  }

  async readFile(env: EnvRow, path: string) {
    if (path.includes("..")) throw new Error("path escapes sandbox");
    const s = await this.sandbox(env);
    const text = await s.readTextFile({ path });
    return text ?? "";
  }
}
