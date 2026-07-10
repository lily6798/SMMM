"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function UploadButton({ clientId, slot }: { clientId: string; slot: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Not signed in");
      setBusy(false);
      return;
    }

    const path = `${clientId}/${slot}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("uploads").upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
      setBusy(false);
      return;
    }

    const { error: insertError } = await supabase.from("uploads").insert({
      client_id: clientId,
      slot,
      file_path: path,
      original_filename: file.name,
      uploaded_by: userData.user.id,
    });
    if (insertError) {
      setError(insertError.message);
      setBusy(false);
      return;
    }

    setBusy(false);
    router.refresh();
    e.target.value = "";
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {error && (
        <span style={{ fontSize: 11, color: "#C62828", maxWidth: 220 }}>{error}</span>
      )}
      <input
        type="file"
        onChange={handleFile}
        disabled={busy}
        style={{ display: "none" }}
        id={`upload-${slot}`}
      />
      <label
        htmlFor={`upload-${slot}`}
        style={{
          background: busy ? "#F2F2F2" : "#0A0A0A",
          color: busy ? "#AAA" : "#FDB600",
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
        {busy ? "Uploading…" : "Upload"}
      </label>
    </div>
  );
}
