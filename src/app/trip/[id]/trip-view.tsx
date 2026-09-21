"use client";

import { Suspense, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { ExpensesList } from "@/components/expenses-list";
import { BalancesPanel } from "@/components/balances-panel";
import { SettleTab } from "@/components/settle-tab";
import { useExpenses, useMembers, useRecorded, useSession } from "@/lib/queries";
import { computeBalances, simplifyDebts } from "@/lib/settlements";

type Tab = "expenses" | "balances" | "settle";

function TabFallback() {
  return (
    <div className="animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="list-item bg-white border-b border-[var(--border-color)]">
          <div className="w-9 h-9 rounded-lg bg-[var(--border-color)] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 rounded bg-[var(--border-color)]" />
            <div className="h-2.5 w-1/3 rounded bg-[var(--border-color)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function useReady() {
  const { data: session, isLoading } = useSession();
  return { ready: !isLoading && !!session, loading: isLoading };
}

function ExpensesPane({ groupId, baseCurrency }: { groupId: string; baseCurrency: string }) {
  const { ready, loading } = useReady();
  const { data, isLoading } = useExpenses(groupId, baseCurrency, ready);
  const { data: members } = useMembers(groupId, ready);
  if (loading || isLoading || !data || !members) return <TabFallback />;
  return <ExpensesList expenses={data.expenses} members={members} splitDetails={data.splitDetails} groupId={groupId} />;
}

function BalancesPane({ groupId, baseCurrency }: { groupId: string; baseCurrency: string }) {
  const { ready, loading } = useReady();
  const { data, isLoading } = useExpenses(groupId, baseCurrency, ready);
  const { data: members, isLoading: membersLoading } = useMembers(groupId, ready);
  const balances = useMemo(() => {
    if (!data || !members) return null;
    const memberIds = members.map((m) => m.id);
    const paid = data.expenses.map((e) => ({ paidBy: e.paidBy, baseAmount: e.baseAmount }));
    const splits = Object.values(data.splitDetails).flat().map((x) => ({ memberId: x.memberId, amountOwed: x.amount }));
    return computeBalances(memberIds, paid, splits, baseCurrency);
  }, [data, members, baseCurrency]);
  if (loading || isLoading || membersLoading || !balances || !members) return <TabFallback />;
  return <BalancesPanel balances={balances} members={members} />;
}

function SettlePane({ groupId, baseCurrency, simplify }: { groupId: string; baseCurrency: string; simplify: boolean }) {
  const { ready, loading } = useReady();
  const { data, isLoading } = useExpenses(groupId, baseCurrency, ready);
  const { data: members, isLoading: membersLoading } = useMembers(groupId, ready);
  const { data: recorded, isLoading: recordedLoading } = useRecorded(groupId, ready);
  const { balances, settlements } = useMemo(() => {
    if (!data || !members || !recorded) return { balances: null, settlements: null };
    const memberIds = members.map((m) => m.id);
    const paid = data.expenses.map((e) => ({ paidBy: e.paidBy, baseAmount: e.baseAmount }));
    const splits = Object.values(data.splitDetails).flat().map((x) => ({ memberId: x.memberId, amountOwed: x.amount }));
    const b = computeBalances(memberIds, paid, splits, baseCurrency);
    for (const r of recorded) {
      const from = b.find((x) => x.memberId === r.from);
      const to = b.find((x) => x.memberId === r.to);
      if (from) from.amount = Math.round((from.amount + r.amount) * 100) / 100;
      if (to) to.amount = Math.round((to.amount - r.amount) * 100) / 100;
    }
    return { balances: b, settlements: simplify ? simplifyDebts(b, baseCurrency) : [] };
  }, [data, members, recorded, baseCurrency, simplify]);
  if (loading || isLoading || membersLoading || recordedLoading || !settlements || !recorded || !members) {
    return <TabFallback />;
  }
  return <SettleTab groupId={groupId} settlements={settlements} recorded={recorded} members={members} />;
}

interface TripShellProps {
  tripId: string;
  tripName: string;
  baseCurrency: string;
  simplify: boolean;
}

export function TripShell({ tripId, tripName, baseCurrency, simplify }: TripShellProps) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "expenses";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const panes: Record<Tab, ReactNode> = {
    expenses: <ExpensesPane groupId={tripId} baseCurrency={baseCurrency} />,
    balances: <BalancesPane groupId={tripId} baseCurrency={baseCurrency} />,
    settle: <SettlePane groupId={tripId} baseCurrency={baseCurrency} simplify={simplify} />,
  };

  return (
    <div className="min-h-dvh bg-[var(--background)]">
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

      {/* Content — panes stay mounted (hidden) so tab switches never refetch */}
      <main className="pb-[calc(4rem+var(--safe-bottom))]">
        {(Object.keys(panes) as Tab[]).map((tab) => (
          <div key={tab} hidden={activeTab !== tab}>
            <Suspense fallback={<TabFallback />}>{panes[tab]}</Suspense>
          </div>
        ))}
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
