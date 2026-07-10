"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOffDataset } from "@/app/clients/[slug]/qa/actions";
import { GOLD } from "./ui";

export function SignOffButton({
  datasetId,
  slug,
  openCount,
}: {
  datasetId: string;
  slug: string;
  openCount: number;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const disabled = busy || openCount > 0;

  async function handleClick() {
    setBusy(true);
    const res = await signOffDataset(datasetId, slug);
    setMessage(res.message);
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      {message && <span style={{ fontSize: 12, color: "#585858" }}>{message}</span>}
      <button
        onClick={handleClick}
        disabled={disabled}
        style={{
          background: disabled ? "#EDEDED" : GOLD,
          color: disabled ? "#AAA" : "#0A0A0A",
          border: "none",
          borderRadius: 999,
          padding: "14px 30px",
          fontWeight: 800,
          fontSize: 13,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {openCount > 0
          ? `Resolve ${openCount} flag${openCount > 1 ? "s" : ""} to continue`
          : busy
            ? "Signing off…"
            : "Approve Data & Run Model →"}
      </button>
    </div>
  );
}
