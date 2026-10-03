import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";
import { classifyTurn } from "@/lib/platform/classifier.ts";
import { newId } from "@/lib/db/repo.ts";
import type { DriverEvent, TurnContext } from "./driver.ts";
import type { SandboxFs } from "./sandbox.ts";

export type TutorHistory = { role: "user" | "assistant"; text: string }[];
export type LocalResume = { history: TutorHistory };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const delay = () => (process.env.TUTOR_FAST === "1" ? 0 : 18);

async function* say(text: string): AsyncGenerator<DriverEvent> {
  const blockId = newId("blk");
  const tokens = text.match(/\S+\s*|\n+/g) ?? [];
  for (let i = 0; i < tokens.length; i += 3) {
    yield { type: "text", blockId, delta: tokens.slice(i, i + 3).join("") };
    const d = delay();
    if (d) await sleep(d);
  }
  yield { type: "text-end", blockId };
}

function scaffold(style: string, subject: string): string {
  const topic = "your question";
  if (style === "hint-only")
    return `I won't hand you the answer, but I can nudge you. You're working on ${topic} in ${subject}.\n\nHere's one hint: write down what the question *gives* you and what it *asks for*. What's the first thing you notice connecting the two?\n\nTell me what you come up with.`;
  if (style === "explain")
    return `Let's build the idea behind ${topic} (${subject}).\n\n**The concept.** Identify the quantities involved and the relationship that links them in ${subject}. Once you know the relationship, the problem becomes a matter of substituting what you know and solving for what you don't.\n\n**A similar example.** Try a simpler version of your question with easy numbers and see how the relationship behaves. Then return to your own problem.\n\nWhich part of this still feels fuzzy? I'll go deeper there.`;
  return `Let's take ${topic} one step at a time (${subject}).\n\n1. **What do you know?** List the facts the question gives you.\n2. **What do you need?** State the unknown in your own words.\n3. **What connects them?** Think about the rule or formula from class that relates the two.\n\nStart with step 1 and send me your list. I'll check it before we do step 2.`;
}

const MATERIAL_REF = /\b(worksheet|handout|materials?|the file|reading)\b/i;
const SAVE_NOTES = /\b(save|keep|write down|jot)\b.*\b(notes?|work|progress)\b/i;
const RUN_CODE = /```|\brun (this|my|the) (code|program|script)\b/i;

/**
 * Scripted guided-help tutor. Used when no model is configured so the whole
 * product (tools, approvals, files, flags, teacher view) runs end to end with
 * no API key. It follows the compiled policy exactly like the real runtime.
 */
export async function* scriptedTutor(ctx: TurnContext, sandbox: SandboxFs): AsyncGenerator<DriverEvent> {
  const { prompt, policy, compiled } = ctx;
  const active = new Set<string>(compiled.activeTools);
  const inputTokens = Math.ceil(prompt.length / 4);

  // Safety first: mirrors the fixed layer even without a model.
  const findings = classifyTurn({ prompt, reply: "", policy });
  if (findings.some((f) => f.kind === "wellbeing")) {
    yield* say("I'm really glad you told me, and I'm sorry things feel so heavy right now. I'm just a study helper, so I can't give you the support you deserve. Please talk to a trusted adult today: a parent, a teacher or your school counsellor. If you might be in danger right now, contact your local emergency number or a crisis line straight away.");
    return;
  }
  if (findings.some((f) => f.kind === "instruction-bypass")) {
    yield* say("I can't change how I work, but I'm happy to help you learn this topic. What part of your question would you like to work on?");
    return;
  }
  if (policy.assessmentActive) {
    yield* say(`This is an assessment, so I can only help you understand what the question is asking. Can you tell me in your own words what it wants you to find out? I won't be able to check or hint at the solution.`);
    return;
  }

  let toolNote = "";

  if (MATERIAL_REF.test(prompt) || ctx.materials.some((m) => prompt.toLowerCase().includes(m.name.toLowerCase().replace(/\.\w+$/, "")))) {
    if (!active.has("read")) toolNote = "I can't open course files in this class, so I'm working from your question alone.\n\n";
    else if (!ctx.materials.length) toolNote = "There are no course files shared with this class yet.\n\n";
    else {
      const m = ctx.materials.find((x) => prompt.toLowerCase().includes(x.name.toLowerCase().replace(/\.\w+$/, ""))) ?? ctx.materials[0]!;
      const toolCallId = newId("call");
      const input = { file_path: `materials/${m.name}` };
      yield { type: "tool-call", toolCallId, toolName: "read", input, providerExecuted: true };
      try {
        const content = await sandbox.read(input.file_path);
        yield { type: "tool-result", toolCallId, toolName: "read", output: { content: content.slice(0, 2000) }, isError: false };
        toolNote = `I looked at **${m.name}**. ${content.split("\n").find((l) => l.trim()) ?? ""}\n\n`;
      } catch (e) {
        yield { type: "tool-result", toolCallId, toolName: "read", output: String(e), isError: true };
      }
    }
  }

  if (SAVE_NOTES.test(prompt)) {
    if (!active.has("write")) toolNote += "I can't save files in this class, so keep your notes on paper for now.\n\n";
    else {
      const toolCallId = newId("call");
      const input = { file_path: "notes.md", content: `# My notes\n\n## Question\n${prompt}\n\n## What I tried\n\n\n## Next step\n\n` };
      yield { type: "tool-call", toolCallId, toolName: "write", input, providerExecuted: true };
      if (compiled.approvalRequired.includes("write")) {
        const denied = yield* gate(ctx, toolCallId, "write", input);
        if (denied) {
          toolNote += `Saving was not approved${denied === true ? "" : `: ${denied}`}.\n\n`;
          yield { type: "tool-result", toolCallId, toolName: "write", output: "denied by teacher", isError: true };
        } else yield* doWrite();
      } else yield* doWrite();

      async function* doWrite(): AsyncGenerator<DriverEvent> {
        const change = await sandbox.write(input.file_path, input.content);
        yield { type: "tool-result", toolCallId, toolName: "write", output: "ok", isError: false };
        yield { type: "file-change", change, path: input.file_path };
        toolNote += "I started a **notes.md** in your workspace for you to fill in.\n\n";
      }
    }
  }

  if (RUN_CODE.test(prompt)) {
    if (!active.has("bash")) toolNote += "Running code isn't enabled in this class, so let's reason through it instead.\n\n";
    else {
      const code = /```(?:\w+)?\n([\s\S]*?)```/.exec(prompt)?.[1]?.trim() ?? "";
      const toolCallId = newId("call");
      const input = { command: code ? `python3 - <<'EOF'\n${code}\nEOF` : "(no code provided)" };
      yield { type: "tool-call", toolCallId, toolName: "bash", input, providerExecuted: true };
      const denied = compiled.approvalRequired.includes("bash") ? yield* gate(ctx, toolCallId, "bash", input) : false;
      if (denied) {
        toolNote += `Running that code wasn't approved${denied === true ? "" : `: ${denied}`}. Try tracing it by hand.\n\n`;
        yield { type: "tool-result", toolCallId, toolName: "bash", output: "denied by teacher", isError: true };
      } else {
        // The built-in tutor never executes student code on the host.
        yield { type: "tool-result", toolCallId, toolName: "bash", output: { stdout: "", note: "Demo mode: code execution is simulated. Use the harness runtime with a real sandbox to run code." }, isError: false };
        toolNote += "Code execution is simulated in demo mode, so predict what it prints, then we'll compare.\n\n";
      }
    }
  }

  yield* say(toolNote + scaffold(policy.style, policy.unit ?? policy.subject));
  void inputTokens;
}

/** Ask the teacher; returns false when approved, else the denial reason (or true). */
async function* gate(ctx: TurnContext, toolCallId: string, toolName: string, input: unknown): AsyncGenerator<DriverEvent, string | boolean> {
  const approvalId = newId("apr");
  yield { type: "approval-request", approvalId, toolCallId, toolName, input };
  const decision = await ctx.requestApproval({ approvalId, toolCallId, toolName, input });
  yield { type: "approval-resolved", approvalId, approved: decision.approved, reason: decision.reason, teacherId: decision.teacherId ?? "teacher" };
  return decision.approved ? false : (decision.reason ?? true);
}

/** Model-backed tutor on the OpenCode Zen account (TUTOR_MODEL + ZEN_API_KEY). Same policy compilation. */
export async function* modelTutor(ctx: TurnContext, history: TutorHistory): AsyncGenerator<DriverEvent> {
  const zen = createOpenAICompatible({
    name: "opencode-zen",
    baseURL: process.env.ZEN_BASE_URL ?? "https://opencode.ai/zen/v1",
    apiKey: process.env.ZEN_API_KEY || "public", // free models accept the anonymous "public" key
  });
  const result = streamText({
    model: zen.chatModel(process.env.TUTOR_MODEL!),
    system: ctx.compiled.instructions,
    messages: [...history.map((h) => ({ role: h.role, content: h.text })), { role: "user" as const, content: ctx.prompt }],
    maxOutputTokens: ctx.compiled.maxTokens,
    abortSignal: ctx.abortSignal,
  });
  const blockId = newId("blk");
  for await (const delta of result.textStream) yield { type: "text", blockId, delta };
  yield { type: "text-end", blockId };
}
