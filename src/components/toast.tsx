"use client";

import { useEffect, useState } from "react";

let pushToast: ((msg: string) => void) | null = null;

export function toast(msg: string) {
  pushToast?.(msg);
}

export function Toaster() {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([]);

  useEffect(() => {
    let nextId = 0;
    pushToast = (msg: string) => {
      const id = ++nextId;
      setItems((prev) => [...prev, { id, msg }]);
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 2600);
    };
    return () => {
      pushToast = null;
    };
  }, []);

  return (
    <div className="fixed bottom-24 left-0 right-0 z-[60] flex flex-col items-center gap-2 pointer-events-none px-6">
      {items.map((t) => (
        <div
          key={t.id}
          className="toast-in px-4 py-2.5 rounded-full bg-[var(--foreground)] text-[var(--background)] text-xs font-semibold shadow-lg"
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
