"use client";

import { useState } from "react";

interface PayerPickerProps {
  members: { id: string; name: string; avatar: string }[];
  selected: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function PayerPicker({ members, selected, onSelect, onClose }: PayerPickerProps) {
  const [selection, setSelection] = useState(selected);

  const handleConfirm = () => {
    onSelect(selection);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full bg-white rounded-t-2xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--border-color)]">
          <button onClick={onClose} className="text-sm font-semibold text-[var(--primary)]">
            Cancel
          </button>
          <span className="text-base font-semibold text-[var(--foreground)]">Choose payer</span>
          <button onClick={handleConfirm} className="text-sm font-semibold text-[var(--primary)]">
            Done
          </button>
        </div>

        {/* Member list */}
        <div className="overflow-y-auto flex-1">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelection(member.id)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)]/50 active:bg-[var(--background)] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-sm font-bold text-[var(--primary)]">
                {member.avatar}
              </div>
              <span className="flex-1 text-left text-[15px] font-medium text-[var(--foreground)]">{member.name}</span>
              {selection === member.id && (
                <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
          <button className="w-full flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)]/50 active:bg-[var(--background)] transition-colors">
            <div className="w-10 h-10 rounded-full bg-[var(--border-color)]/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <span className="flex-1 text-left text-[15px] font-medium text-[var(--muted)]">Multiple people</span>
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
