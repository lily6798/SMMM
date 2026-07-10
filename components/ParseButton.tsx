"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseUpload } from "@/app/clients/[slug]/parse-actions";

export function ParseButton({ uploadId, slug }: { uploadId: string; slug: string }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setBusy(true);
    setResult(null);
    try {
      const res = await parseUpload(uploadId, slug);
      setResult(res.message);
      if (res.ok) router.refresh();
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {result && (
        <span style={{ fontSize: 11, color: "#585858", maxWidth: 260 }}>{result}</span>
      )}
      <button
        onClick={handleClick}
        disabled={busy}
        style={{
          background: busy ? "#F2F2F2" : "#FDB600",
          color: busy ? "#AAA" : "#0A0A0A",
          border: "none",
          borderRadius: 999,
          padding: "6px 14px",
          fontWeight: 700,
          fontSize: 10.5,
          textTransform: "uppercase",
          cursor: busy ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {busy ? "Parsing…" : "Parse"}
      </button>
    </div>
  );
}
