/**
 * The rate card used for the teacher's *estimated* charge. Chargebee's plan is
 * the source of truth for the real invoice; these defaults are placeholders to
 * be set to the actual plan prices via env.
 */
export type RateCard = { currency: string; perMillionInput: number; perMillionOutput: number };

const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return v !== undefined && v !== "" && Number.isFinite(n) && n >= 0 ? n : d;
};

export function rateCard(env: Record<string, string | undefined> = process.env): RateCard {
  return {
    currency: (env.BILLING_CURRENCY ?? "USD").toUpperCase().slice(0, 3),
    perMillionInput: num(env.BILLING_PRICE_PER_1M_INPUT_TOKENS, 3),
    perMillionOutput: num(env.BILLING_PRICE_PER_1M_OUTPUT_TOKENS, 15),
  };
}

export function estimateCharge(u: { inputTokens: number; outputTokens: number }, card: RateCard = rateCard()): number {
  return (u.inputTokens / 1_000_000) * card.perMillionInput + (u.outputTokens / 1_000_000) * card.perMillionOutput;
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: amount > 0 && amount < 0.01 ? 4 : 2 }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
