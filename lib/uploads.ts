// Which weekly_data columns each intake slot's file is expected to populate.
// This is an inferred mapping (not specified in the original schema) — worth
// double-checking against real files once they exist, especially "tv_bvod"
// which currently maps onto the same BVOD columns as "stackadapt".
export const SLOT_COLUMNS: Record<string, string[]> = {
  kpi: ["kpi_revenue", "kpi_conversions"],
  stackadapt: [
    "sa_display_spend",
    "sa_display_impressions",
    "sa_native_spend",
    "sa_native_impressions",
    "sa_olv_spend",
    "sa_olv_impressions",
    "sa_bvod_spend",
    "sa_bvod_impressions",
  ],
  meta: ["meta_spend", "meta_impressions"],
  google: ["search_spend", "search_clicks"],
  radio: ["radio_spend", "radio_spots"],
  ooh: ["ooh_spend", "ooh_panels_live"],
  tv_bvod: ["sa_bvod_spend", "sa_bvod_impressions"],
  promo_pricing: ["promo_flag", "promo_depth_pct", "avg_price"],
  nielsen: ["competitor_spend"],
};

export const TEXT_EXTENSIONS = [".csv", ".tsv", ".txt"];
