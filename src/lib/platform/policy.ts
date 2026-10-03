import {
  BUILTIN_TOOL_NAMES,
  DEFAULT_TOOLS,
  policySchema,
  type EffectivePolicy,
  type Policy,
  type PolicyOverride,
} from "@/lib/contracts";

/**
 * Fold class policy, per-student override and any live assessment window into
 * the policy a turn actually runs under. Pure; the server calls it per turn.
 */
export function resolveEffectivePolicy(input: {
  classPolicy: Policy;
  classPolicyId: string;
  override: PolicyOverride | null;
  now?: Date;
}): EffectivePolicy {
  const { classPolicy, classPolicyId, override } = input;
  const now = input.now ?? new Date();

  let merged: Policy = classPolicy;
  const layers: EffectivePolicy["layers"] = [{ source: "class", policyId: classPolicyId, version: classPolicy.version }];

  if (override && Object.keys(override).length) {
    const { tools, limits, ...rest } = override;
    merged = policySchema.parse({
      ...classPolicy,
      ...Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)),
      tools: { ...classPolicy.tools, ...(tools ?? {}) },
      limits: { ...classPolicy.limits, ...(limits ?? {}) },
      version: classPolicy.version,
    });
    layers.push({ source: "override", policyId: `${classPolicyId}:override`, version: classPolicy.version });
  }

  const w = merged.assessmentWindow;
  const live = w && new Date(w.startsAt) <= now && (!w.endsAt || now < new Date(w.endsAt));
  if (w && live) {
    const tools = Object.fromEntries(BUILTIN_TOOL_NAMES.map((n) => [n, w.lockedTools.includes(n)]));
    merged = { ...merged, style: w.style, tools, approvalRequired: [] };
    layers.push({ source: "assessment", policyId: `${classPolicyId}:assessment`, version: classPolicy.version });
  }

  return { ...merged, layers, assessmentActive: Boolean(live) };
}

export function isToolEnabled(policy: Policy, name: (typeof BUILTIN_TOOL_NAMES)[number]) {
  return policy.tools[name] ?? DEFAULT_TOOLS[name];
}
