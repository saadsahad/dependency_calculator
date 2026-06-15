export interface DependencyInputs {
  /** Q1: Monthly Meta ad spend ($) */
  metaSpend: number;
  /** Q2: Total monthly paid ad spend across all channels ($) */
  totalSpend: number;
  /** Q3: Do they run any active paid channel outside Meta and Google? */
  hasOtherChannel: boolean;
  /** Q4: Monthly revenue from email ($) */
  emailRevenue: number;
  /** Q5: Monthly new-customer revenue ($) */
  newCustomerRevenue: number;
  /** Q6a: Meta spend 12 months ago ($) */
  metaSpend12moAgo: number;
  /** Q6b: Meta spend today ($) - defaults to metaSpend (Q1) in the UI */
  metaSpendToday: number;
}

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ScoreBand {
  min: number;
  max: number;
  label: string;
  headline: string;
  description: string;
  level: RiskLevel;
}

export interface ScoreAdjustment {
  label: string;
  value: number;
}

export interface ScoreBreakdown {
  /** Final score, clamped to the 18-97 range defined in the scoring brief */
  score: number;
  /** Score before clamping - useful for debugging, not shown to prospects */
  rawScore: number;
  /** Meta spend as a % of total paid spend, before adjustments */
  baseScore: number;
  adjustments: ScoreAdjustment[];
  band: ScoreBand;
}

export const SCORE_BANDS: ScoreBand[] = [
  {
    min: 18,
    max: 35,
    label: "Reasonable shape",
    headline: "You're in reasonable shape",
    description:
      "Your revenue isn't riding on one platform. You either have a second acquisition channel running, a strong email base, or both. The risk is real but manageable. The question worth asking is whether the diversification you have is genuine, or whether your \"other channels\" are mostly Google capturing demand that Meta already created.",
    level: "low",
  },
  {
    min: 36,
    max: 55,
    label: "Concentration risk",
    headline: "Concentration risk",
    description:
      "More than a third of your acquisition infrastructure runs through one platform you don't control. A CPM spike, a policy change, or a bad algorithm week costs you real money and you have limited buffer. This is the range where most brands tell themselves they'll sort it next quarter, and then don't, until something forces the issue.",
    level: "medium",
  },
  {
    min: 56,
    max: 74,
    label: "High exposure",
    headline: "High exposure",
    description:
      "A single platform decision (an account flag, an iOS-style update, a CPM spike) could take out the majority of your new customer pipeline with no immediate alternative. You're not in crisis yet. But you're one bad week away from being in one, and right now you have no second lane to keep revenue flowing while you recover.",
    level: "high",
  },
  {
    min: 75,
    max: 97,
    label: "Single point of failure",
    headline: "Single point of failure",
    description:
      "High risk. Your business runs on one platform you don't own, can't control, and can't negotiate with. The brands that have been here and had Meta break on them describe it the same way: everything looked fine until it didn't, and by the time it didn't there was nothing to fall back on. The window to fix this is before it happens, not after.",
    level: "critical",
  },
];

const SCORE_FLOOR = 18;
const SCORE_CEILING = 97;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function getScoreBand(score: number): ScoreBand {
  return (
    SCORE_BANDS.find((band) => score >= band.min && score <= band.max) ??
    SCORE_BANDS[SCORE_BANDS.length - 1]
  );
}

/**
 * Implements the "Dependency Calculator" scoring logic from the strategy doc.
 *
 * Two inputs the questionnaire collects (Q2 total spend, Q3 other-channel flag,
 * Q4/Q5 revenue figures) feed adjustments that reference figures the brief
 * names but the questions don't collect directly (a standalone "Google spend %"
 * and a standalone "monthly revenue" base for the email %). Documented
 * assumptions, made in the spirit of the brief's "ballpark numbers are fine":
 *
 * - Google spend % = (total spend - Meta spend) / total spend. Everything
 *   that isn't Meta spend is treated as the Google share for this adjustment.
 * - "Email revenue as % of monthly revenue" is read against monthly
 *   new-customer revenue (Q5), the only other revenue figure collected.
 */
export function calculateDependencyScore(inputs: DependencyInputs): ScoreBreakdown {
  const {
    metaSpend,
    totalSpend,
    hasOtherChannel,
    emailRevenue,
    newCustomerRevenue,
    metaSpend12moAgo,
    metaSpendToday,
  } = inputs;

  const adjustments: ScoreAdjustment[] = [];

  // Base score: Meta spend as a share of total paid spend.
  const baseScore = (metaSpend / totalSpend) * 100;

  // Google is harvesting demand Meta already created, so weight its share of
  // spend into the score too (at half strength).
  const googlePercent = ((totalSpend - metaSpend) / totalSpend) * 100;
  adjustments.push({
    label: "Google spend likely harvesting Meta-driven demand",
    value: googlePercent * 0.5,
  });

  // Whether there's a genuine second cold-acquisition channel running.
  if (hasOtherChannel) {
    adjustments.push({
      label: "Active acquisition channel outside Meta/Google",
      value: -6,
    });
  } else {
    adjustments.push({
      label: "No active acquisition channel outside Meta/Google",
      value: 8,
    });
  }

  // Email revenue as a share of new-customer revenue - a proxy for how much
  // owned-audience demand exists to fall back on.
  const emailPercent =
    newCustomerRevenue > 0
      ? (emailRevenue / newCustomerRevenue) * 100
      : emailRevenue > 0
        ? Infinity
        : 0;

  if (emailPercent > 30) {
    adjustments.push({ label: "Email revenue above 30% of new-customer revenue", value: -8 });
  } else if (emailPercent < 10) {
    adjustments.push({ label: "Email revenue under 10% of new-customer revenue", value: 7 });
  } else if (emailPercent <= 20) {
    adjustments.push({ label: "Email revenue 10-20% of new-customer revenue", value: 3 });
  }

  // Meta spend trajectory - a proxy for CAC inflation on the platform.
  const metaChangePercent =
    metaSpend12moAgo > 0
      ? ((metaSpendToday - metaSpend12moAgo) / metaSpend12moAgo) * 100
      : metaSpendToday > 0
        ? Infinity
        : 0;

  if (metaChangePercent > 30) {
    adjustments.push({ label: "Meta spend up more than 30% year-on-year", value: 7 });
  } else if (metaChangePercent > 15) {
    adjustments.push({ label: "Meta spend up more than 15% year-on-year", value: 3 });
  } else if (metaChangePercent <= 0) {
    adjustments.push({ label: "Meta spend flat or down year-on-year", value: -4 });
  }

  const adjustmentTotal = adjustments.reduce((sum, a) => sum + a.value, 0);
  const rawScore = baseScore + adjustmentTotal;
  const score = clamp(Math.round(rawScore), SCORE_FLOOR, SCORE_CEILING);

  return {
    score,
    rawScore,
    baseScore,
    adjustments,
    band: getScoreBand(score),
  };
}
