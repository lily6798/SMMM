import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { H2, cardStyle, GOLD, CHARCOAL, LINE_GREY } from "@/components/ui";
import { STATUS_CHIP, STATUS_DETAIL, weeksOfHistory } from "@/lib/clients";

const TEMPLATES = [
  {
    n: "Promo & Pricing Calendar",
    d: "One row per promo, one per price change. The control the model can't live without.",
  },
  {
    n: "MMM Data Input Workbook",
    d: "The full weekly format — for anyone who prefers filling a sheet over uploading raw exports.",
  },
  {
    n: "Manual Media Log",
    d: "For sponsorships, press and handshake deals — dates + cost, we spread it weekly.",
  },
];

export default async function Home() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect("/login");
  }

  const { data: clients, error } = await supabase
    .from("clients")
    .select("slug, name, status, kpi_data_from, media_data_from")
    .order("name");

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Header userEmail={userData.user.email!} />

      <div style={{ padding: "10px 40px 60px", maxWidth: 1150, margin: "0 auto", width: "100%" }}>
        <H2 hint="Every client, one glance. Click through to their intake, QA and model. Access is per-client — you only see edit controls on clients you own or were invited to.">
          Clients
        </H2>

        <Link
          href="/example"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 700,
            color: GOLD,
            textDecoration: "none",
            marginBottom: 18,
          }}
        >
          Not sure what a finished model looks like? See an example →
        </Link>

        {error && (
          <p style={{ color: "#C62828" }}>Failed to load clients: {error.message}</p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 14,
          }}
        >
          {clients?.map((c) => {
            const chip = STATUS_CHIP[c.status] ?? STATUS_CHIP.intake;
            const weeks = weeksOfHistory(c.kpi_data_from, c.media_data_from);
            return (
              <Link
                key={c.slug}
                href={`/clients/${c.slug}`}
                style={{
                  ...cardStyle,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{c.name}</div>
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      background: chip.bg,
                      color: chip.col,
                      borderRadius: 999,
                      padding: "4px 10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {chip.t}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: CHARCOAL }}>
                  {STATUS_DETAIL[c.status] ?? c.status}
                </div>
                <div style={{ marginTop: "auto" }}>
                  <div style={{ height: 6, background: "#F0F0F0", borderRadius: 999 }}>
                    <div
                      style={{
                        height: 6,
                        width: weeks === null ? 0 : Math.min(100, (weeks / 104) * 100) + "%",
                        background: weeks !== null && weeks >= 104 ? GOLD : "#C2C2C2",
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 10.5, color: "#9E9E9E", marginTop: 5 }}>
                    {weeks === null
                      ? "Set data coverage dates to start tracking"
                      : `${weeks} weeks of history ${
                          weeks >= 104
                            ? "· full model"
                            : weeks >= 52
                              ? "· directional"
                              : `· ${52 - weeks} wks to modellable`
                        }`}
                  </div>
                </div>
              </Link>
            );
          })}

          <div
            style={{
              border: `2px dashed ${LINE_GREY}`,
              borderRadius: 12,
              padding: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 130,
            }}
            title="Coming soon"
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>+ New client</span>
          </div>
        </div>

        <H2 hint="Hand these to clients (or fill them yourself) before intake — pre-formatted so the parser maps them perfectly first time.">
          Downloadable Templates
        </H2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {TEMPLATES.map((t) => (
            <div key={t.n} style={{ ...cardStyle, padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{t.n}</div>
              <div style={{ fontSize: 12, color: CHARCOAL, lineHeight: 1.55 }}>{t.d}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 8 }}>
                <span style={{ fontSize: 10, color: "#9E9E9E", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  .xlsx
                </span>
                <button
                  disabled
                  title="Coming soon"
                  style={{
                    background: "#F2F2F2",
                    color: "#AAA",
                    border: "none",
                    borderRadius: 999,
                    padding: "8px 18px",
                    fontWeight: 700,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    cursor: "not-allowed",
                  }}
                >
                  Coming soon
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
