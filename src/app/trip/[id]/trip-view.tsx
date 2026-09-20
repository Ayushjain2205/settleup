"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Balance, Expense, Member, Settlement } from "@/lib/mock-data";
import { BottomNav } from "@/components/bottom-nav";
import { ExpensesList } from "@/components/expenses-list";
import { BalancesPanel } from "@/components/balances-panel";
import { SettleTab } from "@/components/settle-tab";

type Tab = "expenses" | "balances" | "settle";

interface TripViewProps {
  tripId: string;
  tripName: string;
  members: Member[];
  expenses: Expense[];
  balances: Balance[];
  settlements: Settlement[];
}

export function TripView({ tripId, tripName, members, expenses, balances, settlements }: TripViewProps) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "expenses";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <Link href="/" className="p-1 -ml-1 mr-3">
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">{tripName}</h1>
          <div className="flex-1" />
          <Link href={`/trip/${tripId}/settings`} className="p-1 -mr-1" aria-label="Group settings">
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>

        {/* Tab bar — group-level */}
        <div className="flex px-4 gap-0">
          {(["expenses", "balances", "settle"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted)]"
              }`}
            >
              {tab === "expenses" && "Expenses"}
              {tab === "balances" && "Balances"}
              {tab === "settle" && "Settle"}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="pb-20">
        {activeTab === "expenses" && <ExpensesList expenses={expenses} members={members} />}
        {activeTab === "balances" && <BalancesPanel balances={balances} members={members} />}
        {activeTab === "settle" && <SettleTab settlements={settlements} members={members} />}
      </main>

      {/* FAB — Add Expense */}
      <Link href={`/trip/${tripId}/expenses/new`} className="fab" aria-label="Add expense" style={{ bottom: "calc(64px + var(--safe-bottom) + 16px)" }}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </Link>

      {/* App-level bottom nav */}
      <BottomNav />
    </div>
  );
}
