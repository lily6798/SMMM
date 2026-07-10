import { cache } from "react";
import { CHARCOAL } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

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

export function coverageStatus(weeks: number | null) {
  if (weeks === null) return null;
  if (weeks < 52)
    return { t: "Not yet modellable — keep collecting", bg: "#FFE9A8", c: "#8A6400" };
  if (weeks < 104)
    return { t: "Directional model — wider uncertainty", bg: "#FFF3D6", c: "#8A6400" };
  return { t: "Full model — good history", bg: "#E8F5E9", c: "#2E7D32" };
}

export type ClientRow = {
  id: string;
  slug: string;
  name: string;
  status: string;
  kpi_data_from: string | null;
  media_data_from: string | null;
};

export const getClientBySlug = cache(async (slug: string): Promise<ClientRow | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("id, slug, name, status, kpi_data_from, media_data_from")
    .eq("slug", slug)
    .maybeSingle();
  return data;
});
