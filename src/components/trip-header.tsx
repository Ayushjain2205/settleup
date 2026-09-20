"use client";

import Link from "next/link";
import type { Trip } from "@/lib/mock-data";

interface TripHeaderProps {
  trip: Trip;
}

export function TripHeader({ trip }: TripHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-10 h-10 rounded-xl bg-white border border-[var(--border-color)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/20 transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[var(--foreground)]">{trip.name}</h1>
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <span>{trip.tripType === "international" ? "✈️" : "🏠"}</span>
                <span>{trip.spendCurrency} → {trip.baseCurrency}</span>
                <span>•</span>
                <span>{trip.members.length} members</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl bg-white border border-[var(--border-color)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/20 transition-all shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            <Link
              href={`/trip/${trip.id}/settings`}
              className="w-10 h-10 rounded-xl bg-white border border-[var(--border-color)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/20 transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
