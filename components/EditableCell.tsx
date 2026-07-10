"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { overrideWeeklyField } from "@/app/clients/[slug]/qa/actions";
import { GOLD } from "./ui";

export function EditableCell({
  weeklyDataId,
  fieldName,
  initialValue,
  slug,
}: {
  weeklyDataId: string;
  fieldName: string;
  initialValue: string;
  slug: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [edited, setEdited] = useState(false);
  const router = useRouter();

  async function handleBlur() {
    if (value === initialValue) return;
    setEdited(true);
    const res = await overrideWeeklyField(weeklyDataId, fieldName, value, slug);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      style={{
        width: 90,
        textAlign: "right",
        fontSize: 11.5,
        background: "transparent",
        color: "#0A0A0A",
        border: edited || value !== initialValue ? `1px solid ${GOLD}` : "1px solid transparent",
        borderRadius: 4,
        padding: "4px 6px",
        fontWeight: edited || value !== initialValue ? 700 : 400,
      }}
    />
  );
}
