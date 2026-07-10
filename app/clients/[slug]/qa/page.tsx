import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { H2, cardStyle, CHARCOAL, LINE_GREY } from "@/components/ui";
import { getClientBySlug } from "@/lib/clients";
import { EditableCell } from "@/components/EditableCell";
import { FlagRow } from "@/components/FlagRow";
import { SignOffButton } from "@/components/SignOffButton";

const EXCLUDED_COLUMNS = new Set(["id", "dataset_id", "created_at", "notes", "source", "week_start"]);

export default async function QaPage({
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
  const { data: datasets } = await supabase
    .from("datasets")
    .select("id, version, status, created_at")
    .eq("client_id", client.id)
    .order("version", { ascending: false });

  const latest = datasets?.[0];

  const { data: weeklyRows } = latest
    ? await supabase.from("weekly_data").select("*").eq("dataset_id", latest.id).order("week_start")
    : { data: null };

  const { data: flags } = latest
    ? await supabase
        .from("flags")
        .select("id, level, area, message, resolved")
        .eq("dataset_id", latest.id)
        .order("created_at")
    : { data: null };

  const columns =
    weeklyRows && weeklyRows.length > 0
      ? Object.keys(weeklyRows[0])
          .filter((k) => !EXCLUDED_COLUMNS.has(k))
          .filter((k) => weeklyRows.some((r) => r[k] !== null))
      : [];

  const openCount = (flags ?? []).filter((f) => !f.resolved && f.level !== "info").length;

  return (
    <>
      <H2 hint="Every parsed row shown here, fully overrideable with an audit trail — edit a cell and it's logged with the original value, who changed it, and when. Resolve every flag below, then sign off to lock this dataset and unlock the Model tab.">
        QA Review
      </H2>

      {!latest ? (
        <div style={{ ...cardStyle, padding: 22 }}>
          <p style={{ fontSize: 13, color: CHARCOAL, margin: 0, lineHeight: 1.6 }}>
            No data has been parsed for this client yet. Complete intake (Step 1) first — once files
            are uploaded and parsed into a dataset, the weekly rows and any data-quality flags will
            show up here for review and sign-off.
          </p>
        </div>
      ) : (
        <>
          {flags && flags.length > 0 && (
            <div style={{ ...cardStyle, padding: 22, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: CHARCOAL, marginBottom: 12 }}>
                What we found
              </div>
              {flags.map((f, i) => (
                <FlagRow
                  key={f.id}
                  flagId={f.id}
                  level={f.level as "blocker" | "warning" | "info"}
                  area={f.area}
                  message={f.message}
                  slug={slug}
                  isLast={i === flags.length - 1}
                />
              ))}
            </div>
          )}

          <div style={{ ...cardStyle, padding: "18px 22px", marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: CHARCOAL, margin: "0 0 14px" }}>
              Dataset v{latest.version} — status: {latest.status} · {weeklyRows?.length ?? 0} weeks
            </p>
            {weeklyRows && weeklyRows.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11.5 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "right", padding: "8px 10px", background: "#0A0A0A", color: "#fff", fontWeight: 600, fontSize: 10, whiteSpace: "nowrap" }}>
                        week_start
                      </th>
                      {columns.map((col) => (
                        <th
                          key={col}
                          style={{ textAlign: "right", padding: "8px 10px", background: "#0A0A0A", color: "#fff", fontWeight: 600, fontSize: 10, whiteSpace: "nowrap" }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyRows.map((row, i) => (
                      <tr key={row.id} style={{ background: i % 2 ? "#FAFAFA" : "#fff" }}>
                        <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 600, whiteSpace: "nowrap", borderBottom: `1px solid ${LINE_GREY}` }}>
                          {row.week_start}
                        </td>
                        {columns.map((col) => (
                          <td key={col} style={{ padding: "3px 4px", textAlign: "right", borderBottom: `1px solid ${LINE_GREY}` }}>
                            <EditableCell
                              weeklyDataId={row.id}
                              fieldName={col}
                              initialValue={row[col] === null || row[col] === undefined ? "" : String(row[col])}
                              slug={slug}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: CHARCOAL, margin: 0 }}>No weekly rows yet.</p>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div style={{ fontSize: 12, color: CHARCOAL, maxWidth: 540, lineHeight: 1.6 }}>
              {latest.status === "approved"
                ? "This dataset is signed off and locked — the Model tab is unlocked."
                : "Signing off locks this dataset for modelling. Any later re-uploads create a new version — nothing is silently overwritten."}
            </div>
            {latest.status !== "approved" && (
              <SignOffButton datasetId={latest.id} slug={slug} openCount={openCount} />
            )}
          </div>
        </>
      )}
    </>
  );
}
