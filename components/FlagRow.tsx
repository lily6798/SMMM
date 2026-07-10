"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resolveFlag } from "@/app/clients/[slug]/qa/actions";
import { Pill, GOLD, LINE_GREY } from "./ui";

export function FlagRow({
  flagId,
  level,
  area,
  message,
  slug,
  isLast,
}: {
  flagId: string;
  level: "blocker" | "warning" | "info";
  area: string;
  message: string;
  slug: string;
  isLast: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [resolved, setResolved] = useState(false);
  const router = useRouter();

  async function handleResolve() {
    setBusy(true);
    const res = await resolveFlag(flagId, slug);
    if (res.ok) {
      setResolved(true);
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 14,
        padding: "11px 0",
        borderBottom: isLast ? "none" : `1px solid ${LINE_GREY}`,
        opacity: resolved ? 0.45 : 1,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Pill level={resolved ? "resolved" : level} />
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 8 }}>
            {area}
          </span>
          <span style={{ fontSize: 12.5, lineHeight: 1.5, color: "#0A0A0A" }}>{message}</span>
        </div>
      </div>
      {level !== "info" && !resolved && (
        <button
          onClick={handleResolve}
          disabled={busy}
          style={{
            background: "transparent",
            border: "1px solid #0A0A0A",
            color: "#0A0A0A",
            borderRadius: 999,
            padding: "6px 16px",
            fontWeight: 700,
            fontSize: 10.5,
            textTransform: "uppercase",
            cursor: busy ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {busy ? "…" : "Mark resolved"}
        </button>
      )}
    </div>
  );
}
