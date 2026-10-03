/**
 * CONTRACT 3 of 5 — the Event schema.
 *
 * Events are the normalised projection of a harness turn. The harness produces
 * AI SDK UI message parts; we persist a flat, ordered, append-only event log
 * per turn. Two consumers read that log:
 *
 *   - the student's own thread, when reloading history from the database, and
 *   - the teacher's read-only mirror and replay view.
 *
 * Both are rendered by the *same* assistant-ui components, so replay is a pure
 * function of the event log — no second rendering path to keep in sync.
 *
 * Every event carries the harness metadata the teacher needs to make sense of
 * it: which tool ran, which file changed, whether a teacher approved it.
 *
 * FROZEN after day 1.
 */
import { z } from "zod";
import { builtinToolNameSchema, tutoringStyleSchema } from "./policy.ts";

/** Everything the app records about one stream position. */
const eventBase = {
  /** Monotonic per turn. Lets a late subscriber detect gaps and re-sync. */
  seq: z.number().int().nonnegative(),
  at: z.string().datetime(),
};

export const turnStartEventSchema = z.object({
  ...eventBase,
  type: z.literal("turn-start"),
  turnId: z.string(),
  /** The student question, so replay and the live mirror show both sides. */
  prompt: z.string().default(""),
  /** Policy version this turn ran under. Recorded on the turn row too. */
  policyVersion: z.number().int().positive(),
  model: z.string(),
  /** Free-text record of the resolved tool access, for the teacher UI. */
  activeTools: z.array(z.string()),
  gatedTools: z.array(z.string()),
  /** The style and test-mode lock this turn actually ran under (drives the rule footnote). */
  style: tutoringStyleSchema.optional(),
  assessment: z.boolean().default(false),
});

export const textEventSchema = z.object({
  ...eventBase,
  type: z.literal("text"),
  /** Stable across deltas of the same block, so the UI can coalesce. */
  blockId: z.string(),
  delta: z.string(),
});

export const textEndEventSchema = z.object({
  ...eventBase,
  type: z.literal("text-end"),
  blockId: z.string(),
});

export const reasoningEventSchema = z.object({
  ...eventBase,
  type: z.literal("reasoning"),
  blockId: z.string(),
  delta: z.string(),
});

export const reasoningEndEventSchema = z.object({
  ...eventBase,
  type: z.literal("reasoning-end"),
  blockId: z.string(),
});

/**
 * Streamed JSON arguments for a tool call. Kept separate from the terminal
 * `tool-call` event so the teacher sees arguments filling in live.
 */
export const toolInputEventSchema = z.object({
  ...eventBase,
  type: z.literal("tool-input"),
  toolCallId: z.string(),
  toolName: z.string(),
  delta: z.string(),
});

export const toolCallEventSchema = z.object({
  ...eventBase,
  type: z.literal("tool-call"),
  toolCallId: z.string(),
  /** Harness-native name (e.g. "Bash") when it differs from the common name. */
  nativeName: z.string().optional(),
  toolName: z.string(),
  input: z.unknown(),
  /** True when the runtime ran this itself rather than the host. */
  providerExecuted: z.boolean().default(false),
});

export const toolResultEventSchema = z.object({
  ...eventBase,
  type: z.literal("tool-result"),
  toolCallId: z.string(),
  toolName: z.string(),
  output: z.unknown(),
  isError: z.boolean().default(false),
});

export const fileChangeEventSchema = z.object({
  ...eventBase,
  type: z.literal("file-change"),
  change: z.enum(["create", "modify", "delete"]),
  path: z.string(),
});

/** A gated tool call waiting on a teacher decision. Ends the turn's stream. */
export const approvalRequestEventSchema = z.object({
  ...eventBase,
  type: z.literal("approval-request"),
  approvalId: z.string(),
  toolCallId: z.string(),
  toolName: z.string(),
  input: z.unknown(),
});

export const approvalResolvedEventSchema = z.object({
  ...eventBase,
  type: z.literal("approval-resolved"),
  approvalId: z.string(),
  approved: z.boolean(),
  /** Populated on denial so the tutor can explain itself to the student. */
  reason: z.string().optional(),
  teacherId: z.string(),
});

/**
 * A note the teacher injected mid-session. Rendered with a distinct Teacher
 * style in the student's thread and replayed as context on the next turn.
 */
export const teacherNoteEventSchema = z.object({
  ...eventBase,
  type: z.literal("teacher-note"),
  noteId: z.string(),
  teacherId: z.string(),
  teacherName: z.string(),
  text: z.string(),
  /**
   * Whether the note is only visible to the teacher. Visible notes are injected
   * into the student's next turn; hidden ones are audit-only.
   */
  visibleToStudent: z.boolean().default(true),
});

export const flagKindSchema = z.enum([
  "wellbeing",
  "answer-seeking",
  "instruction-bypass",
  "off-topic",
  "stuck",
]);

export type FlagKind = z.infer<typeof flagKindSchema>;

/**
 * A classifier finding on a finished turn. `wellbeing` is the only kind that
 * pages the teacher immediately.
 */
export const flagEventSchema = z.object({
  ...eventBase,
  type: z.literal("flag"),
  flagId: z.string(),
  turnId: z.string(),
  kind: flagKindSchema,
  /** 0..1. Teachers sort by confidence to triage the inbox. */
  confidence: z.number().min(0).max(1),
  /** Short, human-readable justification. Shown verbatim in the flag inbox. */
  detail: z.string(),
  /** The student text that triggered it, for context. */
  evidence: z.string(),
});

export const turnEndEventSchema = z.object({
  ...eventBase,
  type: z.literal("turn-end"),
  turnId: z.string(),
  finishReason: z.string(),
  usage: z
    .object({
      inputTokens: z.number().nonnegative().default(0),
      outputTokens: z.number().nonnegative().default(0),
    })
    .default({ inputTokens: 0, outputTokens: 0 }),
  /** Set when the turn stopped early for a reason the student should see. */
  stopReason: z
    .enum(["policy", "limit", "approval-pending", "teacher-pause", "error", "complete"])
    .default("complete"),
});

/**
 * Lifecycle status changes that are not part of a turn: environment created,
 * sandbox detached, teacher paused the student. Drives the dashboard tile.
 */
export const statusEventSchema = z.object({
  ...eventBase,
  type: z.literal("status"),
  environmentId: z.string(),
  status: z.enum([
    "created",
    "resuming",
    "active",
    "idle",
    "detached",
    "paused",
    "stopped",
    "reset",
    "error",
  ]),
  detail: z.string().optional(),
});

export const harnessEventSchema = z.discriminatedUnion("type", [
  turnStartEventSchema,
  textEventSchema,
  textEndEventSchema,
  reasoningEventSchema,
  reasoningEndEventSchema,
  toolInputEventSchema,
  toolCallEventSchema,
  toolResultEventSchema,
  fileChangeEventSchema,
  approvalRequestEventSchema,
  approvalResolvedEventSchema,
  teacherNoteEventSchema,
  flagEventSchema,
  turnEndEventSchema,
  statusEventSchema,
]);

export type HarnessEvent = z.infer<typeof harnessEventSchema>;
export type HarnessEventType = HarnessEvent["type"];

export const EVENT_TYPES: readonly HarnessEventType[] = harnessEventSchema.options.map(
  (o) => o.shape.type.value,
);

/** Narrowing helpers — used all over the runtime and UI. */
export const isToolEvent = (e: HarnessEvent) =>
  e.type === "tool-call" || e.type === "tool-result" || e.type === "tool-input";

export const isFlagEvent = (e: HarnessEvent): e is z.infer<typeof flagEventSchema> =>
  e.type === "flag";

/**
 * The tool name a teacher sees. Prefers the cross-harness common name so a
 * policy saying `bash` matches a Claude Code `Bash` call.
 */
export function displayToolName(toolName: string): string {
  return builtinToolNameSchema.safeParse(toolName).success
    ? toolName
    : toolName.toLowerCase();
}