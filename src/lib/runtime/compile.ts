import { BUILTIN_TOOL_NAMES, resolveToolAccess, type BuiltinToolName, type EffectivePolicy } from "@/lib/contracts";
import { FIXED_SAFETY_LAYER } from "@/lib/platform/safety.ts";

export const STYLE_GUIDANCE = {
  "hint-only": `Tutoring style: HINT ONLY. Never state the final answer or a complete solution, even if asked repeatedly. Respond with at most one short hint and one leading question that moves the student one small step forward.`,
  "guided-steps": `Tutoring style: GUIDED STEPS. Break the problem into small steps and help the student through them one at a time. Do the first step's setup if they are stuck, but have them carry out the remaining steps and arrive at the answer themselves. Check their understanding before moving on.`,
  explain: `Tutoring style: EXPLAIN FULLY. You may explain the underlying concept and walk through a worked example on a similar problem. When the student's own homework problem is involved, explain the method and let them apply it rather than handing over the finished answer.`,
} as const;

export type CompiledTurn = {
  instructions: string;
  activeTools: BuiltinToolName[];
  inactiveTools: BuiltinToolName[];
  approvalRequired: BuiltinToolName[];
  model: string;
  maxTokens: number;
  /** Maps onto the harness permissionMode. */
  permissionMode: "allow-reads" | "allow-edits" | "allow-all";
  skill: { name: string; description: string; content: string };
};

/**
 * The single place teacher policy turns into harness settings. Pure so it can
 * be unit-tested, and used identically by the local tutor and the HarnessAgent
 * `prepareCall`. The fixed safety layer always comes first.
 */
export function compileTurn(
  policy: EffectivePolicy,
  ctx: { materialNames?: string[]; teacherNotes?: readonly { text: string; teacherName: string }[]; defaultModel?: string },
): CompiledTurn {
  const access = resolveToolAccess(policy);
  const parts = [FIXED_SAFETY_LAYER, "--- Teacher configuration (applies within the rules above) ---"];
  parts.push(`Subject: ${policy.subject}${policy.unit ? ` — ${policy.unit}` : ""}.`);
  parts.push(STYLE_GUIDANCE[policy.style]);

  if (policy.assessmentActive) {
    const clarify = policy.assessmentWindow?.clarifyOnly ?? true;
    parts.push(
      `ASSESSMENT IN PROGRESS. ${
        clarify
          ? "Only clarify what the question is asking. Do not solve, hint at, or check any part of the answer."
          : "Give no more than a minimal hint."
      } Politely decline anything else.`,
    );
  }
  if (policy.guidance.trim()) parts.push(`Teacher guidance: ${policy.guidance.trim()}`);
  if (ctx.materialNames?.length) parts.push(`Course files available in your workspace: ${ctx.materialNames.join(", ")}.`);
  if (access.inactive.length) parts.push(`You do not have these tools in this class: ${access.inactive.join(", ")}.`);
  parts.push(`Keep each reply under roughly ${Math.floor(policy.limits.maxTokensPerTurn * 0.75)} words.`);
  for (const n of ctx.teacherNotes ?? []) parts.push(`Note from the teacher (${n.teacherName}): ${n.text}`);

  const hasEdit = access.active.includes("write") || access.active.includes("edit") || access.active.includes("bash");
  const needsGate = access.approvalRequired.length > 0;
  return {
    instructions: parts.join("\n\n"),
    activeTools: access.active,
    inactiveTools: access.inactive,
    approvalRequired: access.approvalRequired,
    model: policy.model === "default" ? (ctx.defaultModel ?? "default") : policy.model,
    maxTokens: policy.limits.maxTokensPerTurn,
    // Gated tools need the harness to ask rather than silently allow.
    permissionMode: needsGate || hasEdit ? "allow-reads" : "allow-all",
    skill: {
      name: "tutoring-pedagogy",
      description: "How to tutor this student: scaffold, ask leading questions, never dump answers.",
      content: `# Tutoring pedagogy\n\n${STYLE_GUIDANCE[policy.style]}\n\nAlways: find out what the student already tried, praise correct reasoning specifically, and end with a question that invites their next step.`,
    },
  };
}

export { BUILTIN_TOOL_NAMES };
