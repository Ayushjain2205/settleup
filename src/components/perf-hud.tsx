"use client";

import { useEffect, useState } from "react";

interface Row {
  label: string;
  ms: number;
}

/** On-screen perf HUD. Enable once via ?perf=1 (persists in localStorage). */
export function PerfHud() {
  const [enabled, setEnabled] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    // TEMP: forced on for PWA diagnosis (no address bar to pass ?perf=1).
    // Revert to the localStorage gate after.
    setEnabled(true);

    const collect = () => {
      const out: Row[] = [];
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav) {
        out.push({ label: "ttfb", ms: nav.responseStart });
        out.push({ label: "dom", ms: nav.domContentLoadedEventEnd });
      }
      for (const m of performance.getEntriesByType("mark")) {
        out.push({ label: m.name, ms: m.startTime });
      }
      setRows(out);
    };

    collect();
    let lcp = 0;
    let observer: PerformanceObserver | null = null;
    try {
      observer = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) lcp = Math.max(lcp, e.startTime);
        collect();
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // older browsers
    }
    const t = setInterval(collect, 1000);
    return () => {
      clearInterval(t);
      observer?.disconnect();
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 4,
        left: 4,
        zIndex: 99999,
        background: "rgba(0,0,0,0.85)",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: 10,
        padding: "6px 8px",
        borderRadius: 6,
        pointerEvents: "none",
        maxWidth: "70vw",
      }}
    >
      {rows.length === 0 && <div>waiting…</div>}
      {rows.map((r) => (
        <div key={r.label}>
          {r.label}: {Math.round(r.ms)}ms
        </div>
      ))}
    </div>
  );
}
