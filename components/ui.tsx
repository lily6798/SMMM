export const GOLD = "#FDB600";
export const INK = "#0A0A0A";
export const CHARCOAL = "#585858";
export const LINE_GREY = "#E7E7E7";

export const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: `1px solid ${LINE_GREY}`,
  borderRadius: 12,
};

export function Stat({
  label,
  value,
  sub,
  gold,
}: {
  label: string;
  value: string | number;
  sub?: string;
  gold?: boolean;
}) {
  return (
    <div style={{ ...cardStyle, padding: "18px 22px", flex: 1, minWidth: 160 }}>
      <div
        style={{
          fontSize: 10.5,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#9E9E9E",
          marginBottom: 6,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: gold ? GOLD : INK,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: CHARCOAL, marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

export function H2({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div style={{ margin: "34px 0 14px" }}>
      <h2
        style={{
          fontSize: 19,
          fontWeight: 800,
          textTransform: "uppercase",
          color: INK,
          margin: 0,
        }}
      >
        <span style={{ color: GOLD }}>→</span> {children}
      </h2>
      {hint && (
        <p
          style={{
            color: CHARCOAL,
            fontSize: 13,
            margin: "6px 0 0",
            lineHeight: 1.6,
            maxWidth: 740,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export function Pill({
  level,
}: {
  level: "blocker" | "warning" | "resolved" | "info";
}) {
  const map = {
    blocker: { bg: GOLD, c: INK, t: "Blocker" },
    warning: { bg: "#FFF3D6", c: "#8A6400", t: "Warning" },
    resolved: { bg: "#E8F5E9", c: "#2E7D32", t: "Auto-fixed" },
    info: { bg: "#F2F2F2", c: CHARCOAL, t: "Info" },
  }[level];
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        background: map.bg,
        color: map.c,
        borderRadius: 999,
        padding: "4px 10px",
        whiteSpace: "nowrap",
      }}
    >
      {map.t}
    </span>
  );
}
