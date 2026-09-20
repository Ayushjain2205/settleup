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

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-[var(--surface)] rounded-xl border border-[var(--border)] mb-6">
          {(["expenses", "balances", "settle"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab === "expenses" && "Expenses"}
              {tab === "balances" && "Balances"}
              {tab === "settle" && "Settle Up"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-fade-in" key={activeTab}>
            {activeTab === "expenses" && (
              <ExpensesList
                expenses={trip.expenses}
                members={trip.members}
                baseCurrency={trip.baseCurrency}
              />
            )}
            {activeTab === "balances" && (
              <BalancesPanel
                balances={trip.balances}
                members={trip.members}
                baseCurrency={trip.baseCurrency}
              />
            )}
            {activeTab === "settle" && (
              <SettleTab
                settlements={trip.settlements}
                members={trip.members}
                baseCurrency={trip.baseCurrency}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 stagger-children">
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Trip Summary</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-[var(--muted)]">Total Spent</dt>
                  <dd className="font-semibold text-[var(--foreground)]">
                    ₹{totalSpent.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-[var(--muted)]">Per Person</dt>
                  <dd className="font-semibold text-[var(--foreground)]">
                    ₹{perPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-[var(--muted)]">Expenses</dt>
                  <dd className="font-semibold text-[var(--foreground)]">{trip.expenses.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-[var(--muted)]">Members</dt>
                  <dd className="font-semibold text-[var(--foreground)]">{trip.members.length}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
              <h3 className="font-semibold text-[var(--foreground)] mb-3">Members</h3>
              <div className="space-y-2">
                {trip.members.map((member) => {
                  const balance = trip.balances.find((b) => b.memberId === member.id);
                  return (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-xs font-semibold text-[var(--primary)]">
                          {member.avatar}
                        </div>
                        <span className="text-sm text-[var(--foreground)]">{member.name}</span>
                      </div>
                      {balance && (
                        <span
                          className={`text-sm font-medium ${
                            balance.amount > 0
                              ? "text-[var(--success)]"
                              : balance.amount < 0
                              ? "text-[var(--error)]"
                              : "text-[var(--muted)]"
                          }`}
                        >
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
