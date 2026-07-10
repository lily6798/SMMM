import { CHARCOAL } from "@/components/ui";

export const STATUS_CHIP: Record<
  string,
  { t: string; bg: string; col: string }
> = {
  modelled: { t: "Modelled", bg: "#E8F5E9", col: "#2E7D32" },
  qa: { t: "QA pending", bg: "#FFE9A8", col: "#8A6400" },
  collecting: { t: "Collecting", bg: "#EEF3FB", col: "#3B5B8C" },
  intake: { t: "Intake", bg: "#F2F2F2", col: CHARCOAL },
};

export const STATUS_DETAIL: Record<string, string> = {
  modelled: "Modelled — view results",
  qa: "QA review — pending sign-off",
  collecting: "Collecting data",
  intake: "Intake — awaiting uploads",
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Weeks of history usable by the model = time since the LATER of the two
// coverage dates, since that's the binding constraint on the overlap window.
export function weeksOfHistory(
  kpiFrom: string | null,
  mediaFrom: string | null,
): number | null {
  if (!kpiFrom || !mediaFrom) return null;
  const later = Math.max(new Date(kpiFrom).getTime(), new Date(mediaFrom).getTime());
  return Math.max(0, Math.floor((Date.now() - later) / WEEK_MS));
}
