"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MOCK_TRIP, type Trip } from "@/lib/mock-data";
import { ExpensesList } from "@/components/expenses-list";
import { BalancesPanel } from "@/components/balances-panel";
import { SettleTab } from "@/components/settle-tab";

type Tab = "expenses" | "balances" | "settle";

export default function TripPage() {
  const trip: Trip = MOCK_TRIP;
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "expenses";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const totalSpent = trip.expenses.reduce((sum, e) => sum + e.baseAmount, 0);
  const perPerson = totalSpent / trip.members.length;

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
          <div className="flex-1">
            <h1 className="text-base font-semibold text-[var(--foreground)] leading-tight">{trip.name}</h1>
            <p className="text-[11px] text-[var(--muted)]">
              {trip.spendCurrency} → {trip.baseCurrency} · {trip.members.length} members
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-[var(--foreground)]">₹{totalSpent.toLocaleString()}</div>
            <div className="text-[10px] text-[var(--muted)]">₹{perPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}/person</div>
          </div>
        </div>

        {/* Tab bar */}
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
      <main>
        {activeTab === "expenses" && <ExpensesList expenses={trip.expenses} members={trip.members} />}
        {activeTab === "balances" && <BalancesPanel balances={trip.balances} members={trip.members} />}
        {activeTab === "settle" && <SettleTab settlements={trip.settlements} members={trip.members} />}
      </main>

      {/* FAB — Add Expense */}
      <Link href={`/trip/${trip.id}/expenses/new`} className="fab" aria-label="Add expense">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
}
