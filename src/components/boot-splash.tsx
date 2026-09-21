"use client";

import { useEffect, useState } from "react";

export function BootSplash() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fade"), 350);
    const t2 = setTimeout(() => setPhase("gone"), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#7c3aed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        opacity: phase === "fade" ? 0 : 1,
        transition: "opacity 0.5s ease",
        pointerEvents: "none",
      }}
    >
      <span style={{ color: "#fff", fontSize: 72, fontWeight: 800, lineHeight: 1, fontFamily: "system-ui, sans-serif" }}>
        S
      </span>
      <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 17, fontWeight: 600, fontFamily: "system-ui, sans-serif", letterSpacing: 0.5 }}>
        SettleUp
      </span>
    </div>
  );
}
