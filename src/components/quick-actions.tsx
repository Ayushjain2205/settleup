"use client";

import Link from "next/link";

interface QuickActionsProps {
  tripId: string;
}

export function QuickActions({ tripId }: QuickActionsProps) {
  return (
    <div className="flex gap-3 my-6 stagger">
      <Link
        href={`/trip/${tripId}/expenses/new`}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--primary)] text-white rounded-2xl font-semibold hover:opacity-90 transition-all btn-press shadow-md shadow-[var(--primary)]/20"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Expense
      </Link>

      <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-bright)] text-white rounded-2xl font-semibold hover:opacity-90 transition-all btn-press shadow-md shadow-[var(--accent)]/20">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Settle Up
      </button>

      <button className="hidden sm:flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-[var(--border-color)] text-[var(--foreground)] rounded-2xl font-medium hover:bg-[var(--foreground)]/[0.03] transition-all btn-press shadow-sm">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export
      </button>
    </div>
  );
}
