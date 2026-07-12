export type ViewType = "cps" | "spacebar" | "rightclick" | "polling" | "ghosting" | "jitter" | "butterfly" | "kohi" | "reaction" | "menu";

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
  color: string;
}

export interface Ripple {
  id: number;
  x: number;
  y: number;
}
