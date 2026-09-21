"use client";

import { useRef, useState } from "react";

const OPEN_X = -80;
const OPEN_THRESHOLD = -56;

interface SwipeRowProps {
  id: string;
  openId: string | null;
  onOpenChange: (id: string | null) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
  children: React.ReactNode;
}

export function SwipeRow({ id, openId, onOpenChange, onDelete, deletingId, children }: SwipeRowProps) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const locked = useRef(false);
  const open = openId === id;

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
    locked.current = false;
    if (openId !== null && openId !== id) onOpenChange(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!start.current) return;
    const t = e.touches[0];
    const ddx = t.clientX - start.current.x;
    const ddy = t.clientY - start.current.y;
    if (!locked.current) {
      if (Math.abs(ddx) < 12) return;
      if (Math.abs(ddx) < Math.abs(ddy) * 1.5) {
        start.current = null;
        return;
      }
      locked.current = true;
      setDragging(true);
    }
    // Clamp: allow slight overscroll right, full open left
    setDx(Math.min(24, Math.max(OPEN_X - 24, ddx + (open ? OPEN_X : 0))));
  };

  const handleTouchEnd = () => {
    if (!start.current) return;
    start.current = null;
    setDragging(false);
    if (!locked.current) {
      if (open) onOpenChange(null);
      return;
    }
    locked.current = false;
    if (dx < OPEN_THRESHOLD) {
      setDx(OPEN_X);
      onOpenChange(id);
    } else {
      setDx(0);
      if (open) onOpenChange(null);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Delete action behind */}
      <div className="absolute inset-y-0 right-0 w-20 bg-[var(--error)] flex items-center justify-center">
        <button
          onClick={() => onDelete(id)}
          disabled={deletingId !== null}
          className="w-full h-full text-white text-xs font-semibold disabled:opacity-60"
        >
          {deletingId === id ? "..." : "Delete"}
        </button>
      </div>
      {/* Foreground slides */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative bg-white"
        style={{
          transform: `translateX(${open && !dragging ? OPEN_X : dx}px)`,
          transition: dragging ? "none" : "transform 0.2s ease-out",
          touchAction: "pan-y",
        }}
      >
        {children}
      </div>
    </div>
  );
}
