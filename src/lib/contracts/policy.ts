/**
 * CONTRACT 1 of 5 — the Policy schema.
 *
 * This single schema is both:
 *   1. the validation schema for a teacher-authored assistant policy, and
 *   2. the `callOptionsSchema` the agent is constructed with.
 *
 * Keeping one schema for both means a policy that validates in the editor is
 * guaranteed to be expressible as agent call options. `packages/runtime`
 * compiles this into `prepareCall` — instructions, skills, activeTools /
 * inactiveTools, permissionMode and toolApproval — so a teacher edit lands on
 * the student's very next turn with no environment restart.
 *
 * FROZEN after day 1. Changes need sign-off from all four workstreams.
 */
import { z } from "zod";

/** How much help the tutor is allowed to give. Ordered least → most help. */
export const tutoringStyleSchema = z.enum(["hint-only", "guided-steps", "explain"]);
export type TutoringStyle = z.infer<typeof tutoringStyleSchema>;

export const TUTORING_STYLES: readonly TutoringStyle[] = [
  "hint-only",
  "guided-steps",
  "explain",
] as const;

/**
 * The cross-harness built-in tool vocabulary.
 *
 * These are the `commonName`s the AI SDK harness spec standardises on
 * (`HARNESS_V1_BUILTIN_TOOL_NAMES`), so a policy written here keeps working
 * when the Claude Code adapter is swapped for Codex.
 */
export const BUILTIN_TOOL_NAMES = [
  "read",
  "write",
  "edit",
  "bash",
  "grep",
  "glob",
  "webSearch",
  "askUserQuestions",
] as const;

export const builtinToolNameSchema = z.enum(BUILTIN_TOOL_NAMES);
export type BuiltinToolName = z.infer<typeof builtinToolNameSchema>;

/**
 * Per-tool switches. `true` means the tool is reachable this turn, `false`
 * means it is filtered out. Omitted tools default per `defaultTools`.
 *
 * Note `webSearch` exists in the vocabulary but is denied everywhere by
 * default — student sandboxes have no open internet. A policy has to opt in
 * explicitly, and the safety layer logs when it does.
 */
export const toolPolicySchema = z
  .object({
    read: z.boolean().optional(),
    write: z.boolean().optional(),
    edit: z.boolean().optional(),
    bash: z.boolean().optional(),
    grep: z.boolean().optional(),
    glob: z.boolean().optional(),
    webSearch: z.boolean().optional(),
    askUserQuestions: z.boolean().optional(),
  })
  .strict();

export type ToolPolicy = z.infer<typeof toolPolicySchema>;

/**
 * Defaults applied to any tool a policy does not mention. Reads are safe and
 * pedagogically useful; writes and shell are not, so they start off.
 */
export const DEFAULT_TOOLS: Required<ToolPolicy> = {
  read: true,
  write: false,
  edit: false,
  bash: false,
  grep: true,
  glob: true,
  webSearch: false,
  askUserQuestions: true,
};

export const policyLimitsSchema = z
  .object({
    /** Hard cap on turns per student per day. App-enforced before the turn runs. */
    turnsPerDay: z.number().int().min(1).max(500).default(40),
    /** Soft token ceiling for one turn. Surfaced to the agent as a budget. */
    maxTokensPerTurn: z.number().int().min(256).max(200_000).default(4_000),
  })
  .strict();

export type PolicyLimits = z.infer<typeof policyLimitsSchema>;

export const assessmentWindowSchema = z
  .object({
    /** ISO-8601 instants. Absent `endsAt` means open-ended. */
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime().optional(),
    /** Replaces the class style while the window is live. */
    style: tutoringStyleSchema.default("hint-only"),
    /** Locks tools to this list for the duration, ignoring the class policy. */
    lockedTools: z.array(builtinToolNameSchema).default([]),
    /** When set, the tutor may only restate the question. No solving at all. */
    clarifyOnly: z.boolean().default(true),
  })
  .strict();

export type AssessmentWindow = z.infer<typeof assessmentWindowSchema>;

export const policySchema = z
  .object({
    name: z.string().min(1).max(120),
    version: z.number().int().positive(),
    /** e.g. "Grade 11 physics" */
    subject: z.string().min(1).max(200),
    /** e.g. "Unit 3: kinematics" */
    unit: z.string().max(200).optional(),
    style: tutoringStyleSchema.default("guided-steps"),
    tools: toolPolicySchema.default({}),
    /** Material ids from the `materials` table, copied into the sandbox. */
    materials: z.array(z.string().min(1)).max(50).default([]),
    /**
     * Tools the tutor may attempt but must not run without a teacher decision.
     * A call on a gated tool pauses the turn and surfaces in the teacher's
     * approval inbox.
     */
    approvalRequired: z.array(builtinToolNameSchema).max(BUILTIN_TOOL_NAMES.length).default([]),
    /** `"default"` defers to the agent's configured model. */
    model: z.string().max(120).default("default"),
    limits: policyLimitsSchema.default({ turnsPerDay: 40, maxTokensPerTurn: 4_000 }),
    assessmentWindow: assessmentWindowSchema.nullable().default(null),
    /**
     * Host-executed teacher-defined tools the tutor may call, by name. These run
     * outside the sandbox with the teacher's credentials, never inside it.
     */
    teacherTools: z.array(z.string().min(1)).max(20).default([]),
    /** Free-form notes appended to the tutor's instructions. */
    guidance: z.string().max(4_000).default(""),
  })
  .strict();

export type Policy = z.infer<typeof policySchema>;

/**
 * Per-student override. Deliberately NOT `policySchema.partial()`: in Zod 4 a
 * partial of a schema with `.default()` fields re-applies the defaults, so an
 * override of just `style` would silently reset the student's materials,
 * approval gates and limits. Every field here is genuinely optional.
 */
export const policyOverrideSchema = z
  .object({
    subject: z.string().min(1).max(200).optional(),
    unit: z.string().max(200).optional(),
    style: tutoringStyleSchema.optional(),
    tools: toolPolicySchema.optional(),
    materials: z.array(z.string().min(1)).max(50).optional(),
    approvalRequired: z.array(builtinToolNameSchema).max(BUILTIN_TOOL_NAMES.length).optional(),
    model: z.string().max(120).optional(),
    limits: z
      .object({
        turnsPerDay: z.number().int().min(1).max(500).optional(),
        maxTokensPerTurn: z.number().int().min(256).max(200_000).optional(),
      })
      .strict()
      .optional(),
    assessmentWindow: assessmentWindowSchema.nullable().optional(),
    teacherTools: z.array(z.string().min(1)).max(20).optional(),
    guidance: z.string().max(4_000).optional(),
  })
  .strict();

export type PolicyOverride = z.infer<typeof policyOverrideSchema>;

/** A policy plus where it came from — used for the teacher's override editor. */
export const effectivePolicySchema = policySchema.extend({
  /** Which policy layers are folded in, most general first. */
  layers: z
    .array(
      z.object({
        source: z.enum(["class", "override", "assessment"]),
        policyId: z.string(),
        version: z.number().int().positive(),
      }),
    )
    .default([]),
  /** True when an assessment window replaced the class style this turn. */
  assessmentActive: z.boolean().default(false),
});

export type EffectivePolicy = z.infer<typeof effectivePolicySchema>;

/**
 * Resolved tool access for a single turn: which built-ins survive filtering, and
 * which of those additionally need a teacher decision.
 */
export type ResolvedToolAccess = {
  active: BuiltinToolName[];
  inactive: BuiltinToolName[];
  approvalRequired: BuiltinToolName[];
};

export function resolveToolAccess(policy: Policy): ResolvedToolAccess {
  const active: BuiltinToolName[] = [];
  const inactive: BuiltinToolName[] = [];

  for (const name of BUILTIN_TOOL_NAMES) {
    const enabled = policy.tools[name] ?? DEFAULT_TOOLS[name];
    (enabled ? active : inactive).push(name);
  }

  // A gated tool that is switched off cannot be called, so gating it would be a
  // promise we cannot keep. Approval gates only ever narrow the active set.
  const approvalRequired = policy.approvalRequired.filter(
    (name) => active.includes(name),
  );

  return { active, inactive, approvalRequired };
}

/** A sensible starting policy so a brand-new class is never unconfigured. */
export function defaultPolicy(overrides: Partial<Policy> = {}): Policy {
  return policySchema.parse({
    name: "Default tutoring policy",
    version: 1,
    subject: "General",
    ...overrides,
  });
}