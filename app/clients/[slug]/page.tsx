import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { H2, cardStyle, GOLD, CHARCOAL, LINE_GREY } from "@/components/ui";
import { getClientBySlug, weeksOfHistory, coverageStatus } from "@/lib/clients";
import { updateDataCoverage } from "./actions";
import { UploadButton } from "@/components/UploadButton";
import { ViewFileLink } from "@/components/ViewFileLink";

const UPLOAD_SLOTS = [
  { slot: "kpi", label: "KPI export (booking system / GA4 / CRM)" },
  { slot: "stackadapt", label: "StackAdapt delivery (display / native / OLV / BVOD)" },
  { slot: "meta", label: "Meta Ads export" },
  { slot: "google", label: "Google Ads export" },
  { slot: "radio", label: "Radio schedules + post-analysis" },
  { slot: "ooh", label: "OOH schedules" },
  { slot: "tv_bvod", label: "TV / BVOD PRPs" },
  { slot: "promo_pricing", label: "Promo & pricing calendar" },
  { slot: "nielsen", label: "Nielsen Ad Intel competitor export" },
];

export default async function IntakePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await getClientBySlug(slug);
  if (!client) {
    notFound();
  }

  const supabase = await createClient();
  const { data: uploads } = await supabase
    .from("uploads")
    .select("slot, original_filename, file_path, uploaded_at")
    .eq("client_id", client.id);

  const uploadedSlots = new Map((uploads ?? []).map((u) => [u.slot, u]));
  const boundUpdateCoverage = updateDataCoverage.bind(null, client.id, slug);

  const coverageFields = [
    {
      id: "kpi_data_from" as const,
      label: "KPI data available from",
      help: "Booking system / GA4 / CRM history usually predates us — ask the client, it's often years.",
      value: client.kpi_data_from,
    },
    {
      id: "media_data_from" as const,
      label: "Media data available from",
      help: "Usually the onboarding date. Pre-Sunny media from a previous agency can be added later if the client has records.",
      value: client.media_data_from,
    },
  ];

  const weeks = weeksOfHistory(client.kpi_data_from, client.media_data_from);

  return (
    <>
      <H2 hint="Tell us what history actually exists. New client with no data before they joined Sunny? Totally fine — the model starts where the data starts. Just make sure the KPI export covers the same window as the media data.">
        Data Coverage
      </H2>
      <form action={boundUpdateCoverage}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {coverageFields.map((f) => (
            <div key={f.id} style={{ ...cardStyle, padding: 18 }}>
              <div style={{ fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9E9E9E", marginBottom: 6, fontWeight: 500 }}>
                {f.label}
              </div>
              <input
                type="date"
                name={f.id}
                defaultValue={f.value ?? ""}
                style={{ background: "#fff", border: `1px solid ${LINE_GREY}`, borderRadius: 8, color: "#0A0A0A", padding: "9px 12px", fontFamily: "inherit", fontSize: 13, width: "100%", boxSizing: "border-box" }}
              />
              <div style={{ fontSize: 11, color: CHARCOAL, marginTop: 8, lineHeight: 1.5 }}>{f.help}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, flexWrap: "wrap", gap: 12 }}>
          <div>
            {weeks !== null && coverageStatus(weeks) && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: GOLD }}>{weeks} weeks</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    background: coverageStatus(weeks)!.bg,
                    color: coverageStatus(weeks)!.c,
                    borderRadius: 999,
                    padding: "4px 10px",
                  }}
                >
                  {coverageStatus(weeks)!.t}
                </span>
              </span>
            )}
          </div>
          <button
            type="submit"
            style={{ background: GOLD, color: "#0A0A0A", border: "none", borderRadius: 999, padding: "10px 22px", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer" }}
          >
            Save coverage dates
          </button>
        </div>
      </form>
      <div style={{ fontSize: 12, color: CHARCOAL, marginTop: 10, lineHeight: 1.6 }}>
        Under 52 weeks? Data collection starts now regardless — this just tracks when the client crosses the modellable threshold.
      </div>

      <H2 hint="Upload the source files for each category. Files land in Supabase Storage, scoped to this client only. Parsing them into weekly model rows automatically is the next piece — for now, uploaded files are just stored and viewable.">
        Intake Status
      </H2>
      <div style={{ ...cardStyle, padding: 22 }}>
        {UPLOAD_SLOTS.map(({ slot, label }, i) => {
          const uploaded = uploadedSlots.get(slot);
          return (
            <div
              key={slot}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "9px 0",
                borderBottom: i < UPLOAD_SLOTS.length - 1 ? `1px solid ${LINE_GREY}` : "none",
                fontSize: 13,
              }}
            >
              <span style={{ fontWeight: 500 }}>{label}</span>
              {uploaded ? (
                <span style={{ display: "flex", alignItems: "center", gap: 10, color: CHARCOAL, fontSize: 12 }}>
                  {uploaded.original_filename}
                  <ViewFileLink path={uploaded.file_path} />
                  <span style={{ color: "#2E7D32", fontWeight: 700 }}>✓</span>
                </span>
              ) : (
                <UploadButton clientId={client.id} slot={slot} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
