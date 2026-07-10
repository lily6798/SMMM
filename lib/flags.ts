import type { SupabaseClient } from "@supabase/supabase-js";

const CHANNEL_SPEND_COLUMNS: Record<string, string> = {
  sa_display_spend: "Programmatic Display",
  sa_native_spend: "Programmatic Native",
  sa_olv_spend: "Online Video",
  sa_bvod_spend: "BVOD",
  meta_spend: "Meta",
  search_spend: "Search",
  radio_spend: "Radio",
  ooh_spend: "OOH",
};

// Regenerates the system-derived flags for a dataset (missing KPI, low
// history, missing channel data). Idempotent — skips inserting a flag if an
// unresolved one with the same area+message already exists, so re-parsing
// doesn't pile up duplicates.
export async function refreshFlags(supabase: SupabaseClient, datasetId: string) {
  const { data: rawRows } = await supabase
    .from("weekly_data")
    .select("week_start, kpi_revenue, " + Object.keys(CHANNEL_SPEND_COLUMNS).join(", "))
    .eq("dataset_id", datasetId)
    .order("week_start");

  const rows = rawRows as unknown as Array<Record<string, string | number | null>> | null;
  if (!rows || rows.length === 0) return;

  const { data: existing } = await supabase
    .from("flags")
    .select("area, message")
    .eq("dataset_id", datasetId)
    .eq("resolved", false);

  const existingKeys = new Set((existing ?? []).map((f) => `${f.area}::${f.message}`));

  const toInsert: Array<{ dataset_id: string; level: string; area: string; message: string }> = [];
  const addFlag = (level: string, area: string, message: string) => {
    const key = `${area}::${message}`;
    if (!existingKeys.has(key)) {
      toInsert.push({ dataset_id: datasetId, level, area, message });
      existingKeys.add(key);
    }
  };

  for (const row of rows) {
    if (row.kpi_revenue === null || row.kpi_revenue === undefined) {
      addFlag("blocker", "KPI", `Missing KPI revenue for week ${row.week_start}.`);
    }
  }

  if (rows.length < 52) {
    addFlag(
      "info",
      "History",
      `Only ${rows.length} weeks of history — model will run with wider uncertainty ranges until 52+ weeks exist.`,
    );
  }

  for (const [col, label] of Object.entries(CHANNEL_SPEND_COLUMNS)) {
    const hasAny = rows.some((r) => r[col as keyof typeof r] !== null && r[col as keyof typeof r] !== undefined);
    if (!hasAny) {
      addFlag("warning", label, `No ${label} data uploaded yet — model will exclude this channel until it is.`);
    }
  }

  if (toInsert.length > 0) {
    await supabase.from("flags").insert(toInsert);
  }
}
