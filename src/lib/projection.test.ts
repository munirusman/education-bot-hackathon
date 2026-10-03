import { describe, expect, it } from "vitest";
import type { HarnessEvent } from "@/lib/contracts";
import { topicRollup } from "@/lib/platform/dashboard";
import { looksStuck } from "@/lib/platform/classifier";
import { buildMessages, createChunkProjector } from "./projection";

const at = "2026-01-01T00:00:00.000Z";
const turn: HarnessEvent[] = [
  { type: "turn-start", seq: 0, at, turnId: "t1", prompt: "How far?", policyVersion: 1, model: "m", activeTools: [], gatedTools: [] },
  { type: "tool-call", seq: 1, at, toolCallId: "c1", toolName: "read", input: { file_path: "a.md" }, providerExecuted: true },
  { type: "tool-result", seq: 2, at, toolCallId: "c1", toolName: "read", output: "hi", isError: false },
  { type: "text", seq: 3, at, blockId: "b", delta: "Hel" },
  { type: "text", seq: 4, at, blockId: "b", delta: "lo" },
  { type: "text-end", seq: 5, at, blockId: "b" },
  { type: "approval-request", seq: 6, at, approvalId: "a1", toolCallId: "c2", toolName: "write", input: {} },
  { type: "approval-resolved", seq: 7, at, approvalId: "a1", approved: false, reason: "no", teacherId: "t" },
  { type: "turn-end", seq: 8, at, turnId: "t1", finishReason: "stop", usage: { inputTokens: 1, outputTokens: 1 }, stopReason: "complete" },
];
const note: HarnessEvent = { type: "teacher-note", seq: 0, at, noteId: "n1", teacherId: "t", teacherName: "Ms R", text: "Draw it", visibleToStudent: true };

describe("projection", () => {
  it("live chunks open and close blocks and bracket the turn", () => {
    const p = createChunkProjector();
    const types = turn.flatMap((e) => p.push(e)).map((c) => c.type);
    expect(types[0]).toBe("start");
    expect(types).toEqual(expect.arrayContaining(["text-start", "text-delta", "text-end", "tool-input-available", "tool-output-available", "data-approval"]));
    expect(types.filter((t) => t === "text-start")).toHaveLength(1);
    expect(types.at(-1)).toBe("finish");
  });

  it("history folds the same events into a user + assistant message with tool and approval parts", () => {
    const msgs = buildMessages([...turn, note]);
    expect(msgs.map((m) => m.role)).toEqual(["user", "assistant", "assistant"]);
    const parts = msgs[1]!.parts as { type: string; text?: string; state?: string; data?: { state: string } }[];
    expect(parts.find((p) => p.type === "text")?.text).toBe("Hello");
    expect(parts.find((p) => p.type === "dynamic-tool")?.state).toBe("output-available");
    expect(parts.find((p) => p.type === "data-approval")?.data?.state).toBe("denied");
    expect(msgs[2]!.parts[0]).toMatchObject({ type: "data-teacher-note" });
  });

  it("hides audit-only teacher notes from the student", () => {
    const hidden = { ...note, visibleToStudent: false } as HarnessEvent;
    expect(buildMessages([hidden], { forStudent: true })).toHaveLength(0);
    expect(buildMessages([hidden])).toHaveLength(1);
  });
});

describe("dashboard helpers", () => {
  it("rolls up the most-asked concepts by distinct question", () => {
    const top = topicRollup(["How does acceleration work?", "acceleration of a cart", "What is velocity"]);
    expect(top[0]).toEqual({ term: "acceleration", count: 2 });
  });
  it("detects a student stuck on one problem", () => {
    const q = "why is the cart acceleration wrong here";
    expect(looksStuck([q, q + " again", q, q + " please"])).toBe(true);
    expect(looksStuck(["what is velocity", "explain photosynthesis", "capital of france", "solve quadratic"])).toBe(false);
  });
});
