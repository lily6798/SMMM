import Link from "next/link";
import { GOLD, CHARCOAL, LINE_GREY } from "./ui";
import { signOut } from "@/app/actions";

export function Header({
  userEmail,
  back,
}: {
  userEmail: string;
  back?: { href: string; label: string };
}) {
  const initials = userEmail.slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderBottom: `1px solid ${LINE_GREY}`,
        padding: "28px 40px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -130,
          right: -70,
          width: 480,
          height: 340,
          background: `linear-gradient(135deg, ${GOLD}2E, transparent 62%)`,
          transform: "rotate(-13deg)",
          borderRadius: "45% 55% 50% 50%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 16,
          position: "relative",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#9E9E9E",
            }}
          >
            Sunny Advertising · Cross-Channel Intelligence
          </div>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 900,
              textTransform: "uppercase",
              margin: "4px 0 2px",
              lineHeight: 1.1,
            }}
          >
            S<span style={{ color: GOLD }}>MMM</span>
          </h1>
          {back && (
            <Link
              href={back.href}
              style={{
                color: CHARCOAL,
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-block",
                marginTop: 2,
              }}
            >
              {back.label}
            </Link>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            paddingBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, color: CHARCOAL }}>{userEmail}</span>
          <form action={signOut}>
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Sign out
            </button>
          </form>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#0A0A0A",
              color: GOLD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {initials}
          </div>
        </div>
      </div>
    </div>
  );
}
