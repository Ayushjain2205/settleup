"use client";

import { useState, useMemo } from "react";
import { CATEGORIES, CATEGORY_GROUPS, type Category } from "@/lib/categories";

interface CategoryPickerProps {
  selected: Category | null;
  onSelect: (category: Category) => void;
  onClose: () => void;
}

export function CategoryPicker({ selected, onSelect, onClose }: CategoryPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return CATEGORIES;
    const q = search.toLowerCase();
    return CATEGORIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q) || c.keywords.some((k) => k.includes(q))
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Category[]>();
    for (const cat of filtered) {
      if (!map.has(cat.group)) map.set(cat.group, []);
      map.get(cat.group)!.push(cat);
    }
    return map;
  }, [filtered]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full bg-white rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--border-color)]">
          <button onClick={onClose} className="text-sm font-semibold text-[var(--primary)]">
            Cancel
          </button>
          <span className="text-base font-semibold text-[var(--foreground)]">Category</span>
          <div className="w-12" />
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories"
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--background)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 transition-shadow"
              autoFocus
            />
          </div>
        </div>

        {/* Category list */}
        <div className="overflow-y-auto flex-1 pb-safe">
          {Array.from(grouped.entries()).map(([group, cats]) => (
            <div key={group}>
              <div className="px-4 py-2">
                <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">{group}</span>
              </div>
              {cats.map((cat) => {
                const IconComp = cat.Icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { onSelect(cat); onClose(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 active:bg-[var(--background)] transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.colorClass}`}>
                      <IconComp className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <span className="flex-1 text-left text-[15px] font-medium text-[var(--foreground)]">{cat.name}</span>
                    {selected?.id === cat.id && (
                      <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
