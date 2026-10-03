/**
 * Pure projection from persisted HarnessEvents to AI SDK UI messages.
 *
 * One function feeds three consumers so there is no second rendering path:
 *   - `createChunkProjector` : live /api/chat stream for the student,
 *   - `buildMessages`        : thread history for the student on reload,
 *   - the same `buildMessages` output for the teacher's read-only replay and
 *     (event by event) the live mirror.
 */
import type { UIMessage, UIMessageChunk } from "ai";
import type { HarnessEvent } from "@/lib/contracts";

type AnyEvent = HarnessEvent & { turnId?: string };

export function createChunkProjector() {
  const open = new Set<string>();
  const openReasoning = new Set<string>();
  let started = false;

  return {
    push(e: HarnessEvent): UIMessageChunk[] {
      const out: UIMessageChunk[] = [];
      switch (e.type) {
        case "turn-start":
          started = true;
          out.push({ type: "start" }, { type: "start-step" });
          break;
        case "text":
          if (!open.has(e.blockId)) {
            open.add(e.blockId);
            out.push({ type: "text-start", id: e.blockId });
          }
          out.push({ type: "text-delta", id: e.blockId, delta: e.delta });
          break;
        case "text-end":
          if (open.delete(e.blockId)) out.push({ type: "text-end", id: e.blockId });
          break;
        case "reasoning":
          if (!openReasoning.has(e.blockId)) {
            openReasoning.add(e.blockId);
            out.push({ type: "reasoning-start", id: e.blockId });
          }
          out.push({ type: "reasoning-delta", id: e.blockId, delta: e.delta });
          break;
        case "reasoning-end":
          if (openReasoning.delete(e.blockId)) out.push({ type: "reasoning-end", id: e.blockId });
          break;
        case "tool-call":
          out.push({ type: "tool-input-available", toolCallId: e.toolCallId, toolName: e.toolName, input: e.input, providerExecuted: e.providerExecuted, dynamic: true });
          break;
        case "tool-result":
          out.push(
            e.isError
              ? { type: "tool-output-error", toolCallId: e.toolCallId, errorText: typeof e.output === "string" ? e.output : JSON.stringify(e.output), dynamic: true }
              : { type: "tool-output-available", toolCallId: e.toolCallId, output: e.output, dynamic: true },
          );
          break;
        case "file-change":
          out.push({ type: "data-file-change", data: { change: e.change, path: e.path } } as UIMessageChunk);
          break;
        case "approval-request":
          out.push({ type: "data-approval", id: e.approvalId, data: { approvalId: e.approvalId, toolName: e.toolName, state: "pending" } } as UIMessageChunk);
          break;
        case "approval-resolved":
          out.push({ type: "data-approval", id: e.approvalId, data: { approvalId: e.approvalId, state: e.approved ? "approved" : "denied", reason: e.reason } } as UIMessageChunk);
          break;
        case "teacher-note":
          out.push({ type: "data-teacher-note", data: { text: e.text, teacherName: e.teacherName } } as UIMessageChunk);
          break;
        case "turn-end":
          for (const id of open) out.push({ type: "text-end", id });
          for (const id of openReasoning) out.push({ type: "reasoning-end", id });
          open.clear();
          openReasoning.clear();
          if (started) out.push({ type: "finish-step" }, { type: "finish" });
          break;
        default:
          break; // status, flag, tool-input deltas are not student-visible message content
      }
      return out;
    },
  };
}

type Part = Record<string, unknown> & { type: string };

/** Fold an ordered event log into UI messages (one user + one assistant per turn). */
export function buildMessages(events: readonly AnyEvent[], opts: { forStudent?: boolean } = {}): UIMessage[] {
  const messages: UIMessage[] = [];
  let current: { parts: Part[] } | null = null;

  const textPart = (id: string, type: "text" | "reasoning") => {
    const parts = current!.parts;
    let p = parts.find((x) => x.type === type && x.blockId === id);
    if (!p) parts.push((p = { type, text: "", state: "streaming", blockId: id }));
    return p;
  };

  for (const e of events) {
    switch (e.type) {
      case "turn-start": {
        messages.push({ id: `${e.turnId}-u`, role: "user", parts: [{ type: "text", text: e.prompt }] });
        const parts: Part[] = [];
        current = { parts };
        messages.push({ id: `${e.turnId}-a`, role: "assistant", parts: parts as UIMessage["parts"] });
        break;
      }
      case "text":
      case "reasoning":
        if (current) {
          const p = textPart(e.blockId, e.type);
          p.text = (p.text as string) + e.delta;
        }
        break;
      case "text-end":
      case "reasoning-end":
        if (current) textPart(e.blockId, e.type === "text-end" ? "text" : "reasoning").state = "done";
        break;
      case "tool-call":
        current?.parts.push({ type: "dynamic-tool", toolName: e.toolName, toolCallId: e.toolCallId, state: "input-available", input: e.input });
        break;
      case "tool-result": {
        const p = current?.parts.find((x) => x.type === "dynamic-tool" && x.toolCallId === e.toolCallId);
        if (p) {
          if (e.isError) Object.assign(p, { state: "output-error", errorText: typeof e.output === "string" ? e.output : JSON.stringify(e.output) });
          else Object.assign(p, { state: "output-available", output: e.output });
        }
        break;
      }
      case "file-change":
        current?.parts.push({ type: "data-file-change", data: { change: e.change, path: e.path } });
        break;
      case "approval-request":
        current?.parts.push({ type: "data-approval", id: e.approvalId, data: { approvalId: e.approvalId, toolName: e.toolName, state: "pending" } });
        break;
      case "approval-resolved": {
        const p = current?.parts.find((x) => x.type === "data-approval" && x.id === e.approvalId);
        if (p) p.data = { approvalId: e.approvalId, toolName: (p.data as { toolName?: string }).toolName, state: e.approved ? "approved" : "denied", reason: e.reason };
        break;
      }
      case "teacher-note":
        if (!opts.forStudent || e.visibleToStudent)
          messages.push({ id: e.noteId, role: "assistant", parts: [{ type: "data-teacher-note", data: { text: e.text, teacherName: e.teacherName } }] as UIMessage["parts"] });
        break;
      case "turn-end":
        current = null;
        break;
      default:
        break;
    }
  }
  return messages;
}
