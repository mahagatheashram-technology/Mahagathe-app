/** Source: https://github.com/mahagatheashram-technology/guna-profile
 * Commit: 2f6b99d99df53073f1c920ad1e65a0d015ac2a1b; src/lib/scoring.ts. Logic and content unchanged; imports localized.
 */
import { coreQuestions, Guna, LIKERT_MIN, LIKERT_MAX } from "./questions";

export interface Scores {
  sattva: number;
  rajas: number;
  tamas: number;
}

export type ProfileType = "dominant" | "dual" | "balanced";

export interface Result {
  scores0to100: Scores;
  profilePercent: Scores;
  dominantGuna: Guna;
  secondaryGuna: Guna;
  tertiaryGuna: Guna;
  profileType: ProfileType;
  blendLabel?: string;
  confidence: number;
  confidenceLabel: "high" | "medium" | "low";
  dataQualityFlags: string[];
}

const GUNAS: Guna[] = ["sattva", "rajas", "tamas"];

const MARGIN_STRONG = 12;
const MARGIN_BLEND = 6;
const TRIPLE_CLOSE_BAND = 5;

export function computeResult(
  responses: Record<string, number>,
  completionTimeSeconds?: number
): Result {
  // 1) Prepare per-item scaled weights (normalize so primary+secondary sum to 1)
  const scaledWeights: Record<string, { primary: number; secondary: number }> = {};
  for (const q of coreQuestions) {
    const wP = q.mapping.primary.weight;
    const wS = q.mapping.secondary.weight;
    const total = wP + wS;
    if (total > 0) {
      const k = 1 / total;
      scaledWeights[q.id] = { primary: wP * k, secondary: wS * k };
    } else {
      scaledWeights[q.id] = { primary: 0, secondary: 0 };
    }
  }

  // 2) Compute per-guna weighted means on 1–5 scale
  const sumW: Scores = { sattva: 0, rajas: 0, tamas: 0 };
  const sumWX: Scores = { sattva: 0, rajas: 0, tamas: 0 };

  for (const q of coreQuestions) {
    const rawVal = responses[q.id];
    if (rawVal === undefined) continue;

    // Reverse scoring: scored = (max + min) - raw = 6 - raw
    const scored = q.reverseScored ? (LIKERT_MAX + LIKERT_MIN) - rawVal : rawVal;

    for (const g of GUNAS) {
      let w = 0;
      if (q.mapping.primary.guna === g) {
        w += scaledWeights[q.id].primary;
      }
      if (q.mapping.secondary.guna === g) {
        w += scaledWeights[q.id].secondary;
      }
      if (w > 0) {
        sumW[g] += w;
        sumWX[g] += w * scored;
      }
    }
  }

  // Weighted mean → 0-100
  const scores0to100: Scores = { sattva: 0, rajas: 0, tamas: 0 };
  for (const g of GUNAS) {
    const mean = sumW[g] > 0 ? sumWX[g] / sumW[g] : 3; // default to midpoint
    scores0to100[g] = Math.round(((mean - LIKERT_MIN) / (LIKERT_MAX - LIKERT_MIN)) * 100 * 10) / 10;
  }

  // 3) Profile percent (sum to 100)
  const scoreTotal = scores0to100.sattva + scores0to100.rajas + scores0to100.tamas;
  const profilePercent: Scores = { sattva: 0, rajas: 0, tamas: 0 };
  if (scoreTotal > 0) {
    // Use largest remainder to ensure integer sum = 100
    const exact = GUNAS.map((g) => ({
      guna: g,
      exact: (scores0to100[g] / scoreTotal) * 100,
    }));
    const floored = exact.map((e) => ({ ...e, floor: Math.floor(e.exact) }));
    let remainder = 100 - floored.reduce((s, f) => s + f.floor, 0);
    floored.sort((a, b) => (b.exact - b.floor) - (a.exact - a.floor));
    for (const f of floored) {
      if (remainder > 0) {
        f.floor += 1;
        remainder--;
      }
      profilePercent[f.guna] = f.floor;
    }
  }

  // 4) Rank and determine profile type
  const ranked = GUNAS.map((g) => ({ guna: g, score: scores0to100[g] }))
    .sort((a, b) => b.score - a.score);

  const dominantGuna = ranked[0].guna;
  const secondaryGuna = ranked[1].guna;
  const tertiaryGuna = ranked[2].guna;

  const margin = ranked[0].score - ranked[1].score;
  const spread = ranked[0].score - ranked[2].score;

  let profileType: ProfileType;
  if (spread <= TRIPLE_CLOSE_BAND) {
    profileType = "balanced";
  } else if (margin >= MARGIN_STRONG) {
    profileType = "dominant";
  } else if (margin >= MARGIN_BLEND) {
    profileType = "dual";
  } else {
    profileType = "balanced";
  }

  const blendLabel = profileType === "dual"
    ? `${dominantGuna}-${secondaryGuna}`
    : profileType === "balanced"
      ? "balanced"
      : undefined;

  // 5) Data quality flags
  const dataQualityFlags: string[] = [];
  const answeredCore = coreQuestions.filter((q) => responses[q.id] !== undefined).length;

  if (completionTimeSeconds !== undefined && completionTimeSeconds < 240) {
    dataQualityFlags.push("speeding");
  }

  // Straightlining check: >=85% same raw value
  const rawValues = coreQuestions
    .map((q) => responses[q.id])
    .filter((v) => v !== undefined);
  if (rawValues.length > 0) {
    const counts: Record<number, number> = {};
    for (const v of rawValues) {
      counts[v] = (counts[v] || 0) + 1;
    }
    const maxCount = Math.max(...Object.values(counts));
    if (maxCount / rawValues.length >= 0.85) {
      dataQualityFlags.push("straightlining");
    }
  }

  // 6) Confidence (0–1)
  const marginScore = Math.min(Math.max(margin / 30, 0), 1);
  const completionScore = Math.min(Math.max((answeredCore - 20) / 4, 0), 1);
  let qualityScore = 1.0;
  if (dataQualityFlags.includes("speeding")) qualityScore -= 0.5;
  if (dataQualityFlags.includes("straightlining")) qualityScore -= 0.5;
  qualityScore = Math.max(qualityScore, 0);

  const confidence = Math.min(Math.max(
    0.65 * marginScore + 0.25 * completionScore + 0.10 * qualityScore,
    0
  ), 1);

  const confidenceLabel: "high" | "medium" | "low" =
    confidence >= 0.75 ? "high" : confidence >= 0.55 ? "medium" : "low";

  return {
    scores0to100,
    profilePercent,
    dominantGuna,
    secondaryGuna,
    tertiaryGuna,
    profileType,
    blendLabel,
    confidence,
    confidenceLabel,
    dataQualityFlags,
  };
}
