"use client";

import { createClient } from "@/lib/supabase/client";

export function ViewFileLink({ path }: { path: string }) {
  async function open() {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("uploads").createSignedUrl(path, 60);
    if (error || !data) return;
    window.open(data.signedUrl, "_blank");
  }

  return (
    <button
      onClick={open}
      style={{
        background: "transparent",
        border: "none",
        color: "#585858",
        textDecoration: "underline",
        cursor: "pointer",
        fontSize: 12,
        padding: 0,
      }}
    >
      View
    </button>
  );
}
