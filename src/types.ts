export type ViewType = "cps" | "spacebar" | "rightclick" | "polling" | "ghosting" | "jitter" | "butterfly" | "kohi" | "reaction" | "menu" | "dragclick" | "doubleclick" | "aim" | "scroll";

export interface HistoryItem {
  id: string;
  timestamp: number;
  testType: string;
  duration: number;
  score: number;
  rating: string;
}

export interface RatingTier {
  label: string;
  min: number;
  max?: number;
  color: string;
}

export const RATING_TIERS: RatingTier[] = [
  { label: "Beginner", min: 0, max: 3, color: "text-slate-400" },
  { label: "Novice", min: 3, max: 5, color: "text-cyan-400" },
  { label: "Average", min: 5, max: 7, color: "text-sky-400" },
  { label: "Skilled", min: 7, max: 9, color: "text-teal-400" },
  { label: "Pro", min: 9, max: 11, color: "text-amber-400" },
  { label: "Elite", min: 11, max: 13, color: "text-orange-400" },
  { label: "Master", min: 13, max: 16, color: "text-rose-400" },
  { label: "Legendary", min: 16, color: "text-fuchsia-400" }
];

export function getRating(cps: number): RatingTier {
  if (cps >= 20) {
    return { label: "⚡ Godlike", min: 20, color: "text-amber-500 font-extrabold animate-pulse godlike-glow" };
  }
  let matched = RATING_TIERS[0];
  for (const tier of RATING_TIERS) {
    if (cps >= tier.min) {
      matched = tier;
    }
  }
  return matched;
}

export interface Ripple {
  id: number;
  x: number;
  y: number;
}
