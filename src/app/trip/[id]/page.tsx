"use client";

import { useState } from "react";
import { MOCK_TRIP, type Trip } from "@/lib/mock-data";
import { TripHeader } from "@/components/trip-header";
import { QuickActions } from "@/components/quick-actions";
import { ExpensesList } from "@/components/expenses-list";
import { BalancesPanel } from "@/components/balances-panel";
import { SettleTab } from "@/components/settle-tab";

type Tab = "expenses" | "balances" | "settle";

export default function TripPage() {
  const trip: Trip = MOCK_TRIP;
  const [activeTab, setActiveTab] = useState<Tab>("expenses");

  const totalSpent = trip.expenses.reduce((sum, e) => sum + e.baseAmount, 0);
  const perPerson = totalSpent / trip.members.length;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TripHeader trip={trip} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <QuickActions tripId={trip.id} />

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[var(--foreground)]/[0.03] rounded-2xl border border-[var(--border-color)] mb-8">
          {(["expenses", "balances", "settle"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-white text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab === "expenses" && "Expenses"}
              {tab === "balances" && "Balances"}
              {tab === "settle" && "Settle Up"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 animate-fade-up" key={activeTab}>
            {activeTab === "expenses" && <ExpensesList expenses={trip.expenses} members={trip.members} />}
            {activeTab === "balances" && <BalancesPanel balances={trip.balances} members={trip.members} />}
            {activeTab === "settle" && <SettleTab settlements={trip.settlements} members={trip.members} />}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 stagger">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[var(--primary)]/[0.06] to-[var(--accent)]/[0.04] border border-[var(--border-color)]">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Trip Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-4xl font-bold text-[var(--foreground)]">₹{totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-[var(--muted)]">total spent</div>
                </div>
                <div className="w-full h-px bg-[var(--border-color)]" />
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Per person</span>
                  <span className="font-bold text-[var(--foreground)]">₹{perPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Expenses</span>
                  <span className="font-bold text-[var(--foreground)]">{trip.expenses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Members</span>
                  <span className="font-bold text-[var(--foreground)]">{trip.members.length}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[var(--border-color)]">
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Members</h3>
              <div className="space-y-3">
                {trip.members.map((member) => {
                  const balance = trip.balances.find((b) => b.memberId === member.id);
                  return (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-xs font-bold text-white">
                          {member.avatar}
                        </div>
                        <span className="font-semibold text-[var(--foreground)]">{member.name}</span>
                      </div>
                      {balance && (
                        <span className={`text-sm font-bold ${
                          balance.amount > 0 ? "text-[var(--success)]" : balance.amount < 0 ? "text-[var(--error)]" : "text-[var(--muted)]"
                        }`}>
                          {balance.amount > 0 ? "+" : ""}₹{balance.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
