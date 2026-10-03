import type { FlagKind, Policy } from "@/lib/contracts";

export type Finding = { kind: FlagKind; confidence: number; detail: string; evidence: string };

const WELLBEING = [
  /\b(kill|hurt|harm)\s+(myself|me)\b/i,
  /\bsuicid/i,
  /\bwant to die\b/i,
  /\bend it all\b/i,
  /\bself[- ]?harm/i,
  /\b(nobody|no one) (cares|would miss)/i,
  /\b(being|getting) (bullied|abused|hit)\b/i,
];
const BYPASS = [
  /ignore (all |your |the )?(previous|prior|above)? ?(instructions|rules)/i,
  /\b(jailbreak|dan mode|developer mode)\b/i,
  /pretend (you are|to be)/i,
  /(reveal|show|print) (your|the) (system )?(prompt|instructions)/i,
  /you (are|have) no (rules|restrictions)/i,
];
const ANSWER_SEEKING = [
  /\bjust (give|tell) me the (answer|solution)/i,
  /\bgive me the (final )?(answer|solution)\b/i,
  /\bwhat('s| is) the answer\b/i,
  /\bsolve (it|this) for me\b/i,
  /\bdo (my|the) (homework|assignment)\b/i,
  /\bwrite (it|this|my (essay|code)) for me\b/i,
];
const OFF_TOPIC = [/\b(tiktok|fortnite|minecraft|roblox|celebrity|gossip|dating|crush)\b/i, /\btell me a joke\b/i];

const first = (patterns: RegExp[], text: string) => {
  for (const p of patterns) {
    const m = p.exec(text);
    if (m) return m[0];
  }
  return null;
};

/**
 * Lightweight post-turn classifier. Heuristic by design: it runs on every
 * finished turn with no model call, errs toward flagging wellbeing, and gives
 * the teacher a reason they can read. Swap for a model-backed classifier behind
 * the same signature.
 */
export function classifyTurn(input: { prompt: string; reply: string; policy: Pick<Policy, "style" | "assessmentWindow"> }): Finding[] {
  const out: Finding[] = [];
  const { prompt } = input;

  const w = first(WELLBEING, prompt);
  if (w) out.push({ kind: "wellbeing", confidence: 0.9, detail: "Possible wellbeing concern in the student's message.", evidence: w });

  const b = first(BYPASS, prompt);
  if (b) out.push({ kind: "instruction-bypass", confidence: 0.8, detail: "Student tried to override the tutor's instructions.", evidence: b });

  const a = first(ANSWER_SEEKING, prompt);
  if (a && (input.policy.style !== "explain" || input.policy.assessmentWindow)) {
    out.push({
      kind: "answer-seeking",
      confidence: input.policy.style === "hint-only" ? 0.85 : 0.6,
      detail: `Student asked for the full answer while the tutor is in ${input.policy.style} mode.`,
      evidence: a,
    });
  }

  const o = first(OFF_TOPIC, prompt);
  if (o) out.push({ kind: "off-topic", confidence: 0.5, detail: "Message looks unrelated to the class subject.", evidence: o });

  return out;
}

/** "Stuck": many recent turns that share most of their words. */
export function looksStuck(prompts: string[], window = 4): boolean {
  const recent = prompts.slice(-window);
  if (recent.length < window) return false;
  const bags = recent.map((p) => new Set(p.toLowerCase().match(/[a-z]{4,}/g) ?? []));
  const base = bags[0]!;
  if (!base.size) return false;
  return bags.slice(1).every((b) => [...b].filter((w) => base.has(w)).length / Math.max(1, Math.min(b.size, base.size)) >= 0.4);
}
