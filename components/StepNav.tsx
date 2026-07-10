"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GOLD, CHARCOAL } from "./ui";

const STEPS = [
  { label: "1 · Intake", href: "" },
  { label: "2 · QA Review", href: "/qa" },
  { label: "3 · Model", href: "/model" },
];

export function StepNav({
  slug,
  modelUnlocked,
}: {
  slug: string;
  modelUnlocked: boolean;
}) {
  const pathname = usePathname();
  const base = `/clients/${slug}`;

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {STEPS.map((s, i) => {
        const href = base + s.href;
        const active = pathname === href;
        const locked = i === 2 && !modelUnlocked;
        const style: React.CSSProperties = {
          background: "transparent",
          border: "none",
          borderBottom: active ? `3px solid ${GOLD}` : "3px solid transparent",
          padding: "12px 22px",
          fontWeight: 700,
          fontSize: 13,
          color: locked ? "#C2C2C2" : active ? "#0A0A0A" : CHARCOAL,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          textDecoration: "none",
          display: "inline-block",
        };
        if (locked) {
          return (
            <span key={s.label} style={{ ...style, cursor: "not-allowed" }} title="Locked until data is approved">
              {s.label} 🔒
            </span>
          );
        }
        return (
          <Link key={s.label} href={href} style={{ ...style, cursor: "pointer" }}>
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}
