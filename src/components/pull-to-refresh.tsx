"use client";

import { useEffect, useRef, useState } from "react";

const THRESHOLD = 72;
const MAX_PULL = 120;

interface PullToRefreshProps {
  onRefresh: () => Promise<unknown>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [animating, setAnimating] = useState(false);
  const start = useRef<{ y: number } | null>(null);
  const pulling = useRef(false);
  const lockScroll = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Non-passive: block the browser's own rubber-band while OUR pull owns
  // the gesture, so sticky headers stay pinned. React listeners are
  // passive and can't preventDefault — this one can.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: TouchEvent) => {
      if (lockScroll.current) e.preventDefault();
    };
    el.addEventListener("touchmove", onMove, { passive: false });
    return () => el.removeEventListener("touchmove", onMove);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY > 0 || refreshing) return;
    start.current = { y: e.touches[0].clientY };
    pulling.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!start.current || refreshing) return;
    const dy = e.touches[0].clientY - start.current.y;
    if (!pulling.current) {
      if (dy < 8 || window.scrollY > 0) {
        if (window.scrollY > 0) start.current = null;
        return;
      }
      pulling.current = true;
    }
    lockScroll.current = pulling.current;
    setPull(Math.min(MAX_PULL, dy * 0.45));
  };

  const handleTouchEnd = async () => {
    if (!start.current) return;
    start.current = null;
    lockScroll.current = false;
    if (!pulling.current) return;
    pulling.current = false;
    if (pull >= THRESHOLD) {
      setRefreshing(true);
      setPull(0);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    } else {
      setAnimating(true);
      setPull(0);
      setTimeout(() => setAnimating(false), 250);
    }
  };

  const indicatorHeight = refreshing ? 44 : pull;

  return (
    <div
      ref={wrapRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex items-center justify-center overflow-hidden text-[var(--muted)]"
        style={{ height: indicatorHeight, transition: animating || refreshing ? "height 0.25s ease-out" : "none" }}
      >
        {refreshing ? (
          <svg className="w-5 h-5 animate-spin text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        ) : (
          pull > 8 && <span className="text-[11px] font-medium">{pull >= THRESHOLD ? "Release to refresh" : "Pull to refresh"}</span>
        )}
      </div>
      {children}
    </div>
  );
}
