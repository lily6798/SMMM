import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { H2, cardStyle, CHARCOAL, LINE_GREY } from "@/components/ui";
import { getClientBySlug } from "@/lib/clients";

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

  const columns =
    weeklyRows && weeklyRows.length > 0
      ? Object.keys(weeklyRows[0])
          .filter((k) => !EXCLUDED_COLUMNS.has(k))
          .filter((k) => weeklyRows.some((r) => r[k] !== null))
      : [];

  return (
    <>
      <H2 hint="Every parsed row shown here. Editing, overrides with an audit trail, flags and sign-off are still to come — this is read-only for now.">
        QA Review
      </H2>
      <div style={{ ...cardStyle, padding: 22 }}>
        {!latest ? (
          <p style={{ fontSize: 13, color: CHARCOAL, margin: 0, lineHeight: 1.6 }}>
            No data has been parsed for this client yet. Complete intake (Step 1) first — once files
            are uploaded and parsed into a dataset, the weekly rows will show up here.
          </p>
        ) : (
          <>
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
                          <td
                            key={col}
                            style={{ padding: "7px 10px", textAlign: "right", whiteSpace: "nowrap", borderBottom: `1px solid ${LINE_GREY}` }}
                          >
                            {row[col] === null || row[col] === undefined ? "—" : String(row[col])}
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
          </>
        )}
      </div>
    </>
  );
}
