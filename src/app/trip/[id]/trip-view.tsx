"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useClaimInvite, useSession, useTripMeta } from "@/lib/queries";
import { BottomNav } from "@/components/bottom-nav";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { ExpensesList } from "@/components/expenses-list";
import { BalancesPanel } from "@/components/balances-panel";
import { SettleTab } from "@/components/settle-tab";
import { useExpenses, useMembers, useRecorded } from "@/lib/queries";
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

const round2 = (v: number) => Math.round(v * 100) / 100;

interface DisplayCtx {
  code: string;
  baseCurrency: string;
  spendCurrency: string;
  fxRate: number;
  /** Convert a base-currency value to the display currency. */
  show: (base: number) => number;
}

function ExpensesPane({ groupId, display }: { groupId: string; display: DisplayCtx }) {
  const { ready, loading } = useReady();
  const { data, isLoading } = useExpenses(groupId, display.baseCurrency, ready);
  const { data: members } = useMembers(groupId, ready);
  const shown = useMemo(() => {
    if (!data) return null;
    if (display.code === display.baseCurrency) return data;
    return {
      ...data,
      expenses: data.expenses.map((e) => ({ ...e, baseAmount: e.amount, baseCurrency: display.code })),
    };
  }, [data, display]);
  if (loading || isLoading || !shown || !members) return <TabFallback />;
  return <ExpensesList expenses={shown.expenses} members={members} splitDetails={shown.splitDetails} groupId={groupId} displayCurrency={display.code} baseCurrency={display.baseCurrency} fxRate={display.fxRate} />;
}

function BalancesPane({ groupId, display }: { groupId: string; display: DisplayCtx }) {
  const { ready, loading } = useReady();
  const { data, isLoading } = useExpenses(groupId, display.baseCurrency, ready);
  const { data: members, isLoading: membersLoading } = useMembers(groupId, ready);
  const balances = useMemo(() => {
    if (!data || !members) return null;
    const memberIds = members.map((m) => m.id);
    const paid = data.expenses.map((e) => ({ paidBy: e.paidBy, baseAmount: e.baseAmount }));
    const splits = Object.values(data.splitDetails).flat().map((x) => ({ memberId: x.memberId, amountOwed: x.amount }));
    return computeBalances(memberIds, paid, splits, display.baseCurrency).map((b) => ({
      ...b,
      amount: display.show(b.amount),
      currency: display.code,
    }));
  }, [data, members, display]);
  if (loading || isLoading || membersLoading || !balances || !members) return <TabFallback />;
  return <BalancesPanel balances={balances} members={members} />;
}

function SettlePane({ groupId, display, simplify }: { groupId: string; display: DisplayCtx; simplify: boolean }) {
  const { ready, loading } = useReady();
  const { data, isLoading } = useExpenses(groupId, display.baseCurrency, ready);
  const { data: members, isLoading: membersLoading } = useMembers(groupId, ready);
  const { data: recorded, isLoading: recordedLoading } = useRecorded(groupId, ready);
  const { settlements, shownRecorded } = useMemo(() => {
    if (!data || !members || !recorded) return { balances: null, settlements: null, shownRecorded: null };
    const memberIds = members.map((m) => m.id);
    const paid = data.expenses.map((e) => ({ paidBy: e.paidBy, baseAmount: e.baseAmount }));
    const splits = Object.values(data.splitDetails).flat().map((x) => ({ memberId: x.memberId, amountOwed: x.amount }));
    const b = computeBalances(memberIds, paid, splits, display.baseCurrency);
    // Recorded payments settle in their own currency — normalize to base
    // before adjusting, or foreign amounts barely dent the plan.
    const toBase = (amount: number, currency: string) =>
      currency === display.baseCurrency ? amount : round2(amount * (display.fxRate || 1));
    const baseRecorded = recorded.map((r) => ({ ...r, amount: toBase(r.amount, r.currency), currency: display.baseCurrency }));
    for (const r of baseRecorded) {
      const from = b.find((x) => x.memberId === r.from);
      const to = b.find((x) => x.memberId === r.to);
      if (from) from.amount = Math.round((from.amount + r.amount) * 100) / 100;
      if (to) to.amount = Math.round((to.amount - r.amount) * 100) / 100;
    }
    const plan = simplify ? simplifyDebts(b, display.baseCurrency) : [];
    const show = (v: number) => display.show(v);
    return {
      balances: b,
      settlements: plan.map((s) => ({ ...s, amount: show(s.amount), currency: display.code })),
      shownRecorded: baseRecorded.map((r) => ({ ...r, amount: show(r.amount), currency: display.code })),
    };
  }, [data, members, recorded, display, simplify]);
  if (loading || isLoading || membersLoading || recordedLoading || !settlements || !shownRecorded || !members) {
    return <TabFallback />;
  }
  return <SettleTab groupId={groupId} settlements={settlements} recorded={shownRecorded} members={members} />;
}

interface TripShellProps {
  tripId?: string;
}

export function TripShell({ tripId: propId }: TripShellProps) {
  const params = useParams();
  const tripId = propId || (params.id as string);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("expenses");
  const { data: session, isLoading: sessionLoading } = useSession();
  const ready = !sessionLoading && !!session;
  const { data: meta, isLoading: metaLoading, error: metaError } = useTripMeta(tripId, ready);
  useClaimInvite(tripId);

  const storageKey = `settleup-display-currency-${tripId}`;
  const [displayCode, setDisplayCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(storageKey) || "";
  });
  useEffect(() => {
    if (displayCode) window.localStorage.setItem(storageKey, displayCode);
  }, [storageKey, displayCode]);

  const baseCurrency = meta?.baseCurrency || "";
  const spendCurrency = meta?.spendCurrency || "";
  const fxRate = meta?.fxRate || 1;
  const simplify = meta?.simplifyDebts ?? true;
  const tripName = meta?.name || "";
  const code = displayCode || spendCurrency;

  const display: DisplayCtx = useMemo(
    () => ({
      code,
      baseCurrency,
      spendCurrency,
      fxRate,
      show: (base: number) => (code === baseCurrency || !baseCurrency ? base : round2(base / (fxRate || 1))),
    }),
    [code, baseCurrency, spendCurrency, fxRate]
  );

  const multiCurrency = !!baseCurrency && !!spendCurrency && baseCurrency !== spendCurrency;

  if (!ready) {
    return (
      <div className="min-h-dvh bg-[var(--background)]">
        <header className="sticky top-0 z-40 bg-white/80 border-b border-[var(--border-color)]">
          <div className="flex items-center h-14 px-4">
            <div className="h-5 w-32 rounded bg-[var(--border-color)] animate-pulse" />
          </div>
        </header>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-dvh bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <p className="text-sm font-medium text-[var(--foreground)]">Sign in to view this group</p>
        <Link href="/login" className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
          Sign in
        </Link>
      </div>
    );
  }

  if (!metaLoading && (metaError || !meta)) {
    return (
      <div className="min-h-dvh bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <p className="text-sm font-medium text-[var(--foreground)]">Group not found</p>
        <p className="text-xs text-[var(--muted)] mt-1">It may have been deleted or you don&apos;t have access</p>
        <Link href="/" className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
          Back to groups
        </Link>
      </div>
    );
  }

  const panes: Record<Tab, ReactNode> = {
    expenses: <ExpensesPane groupId={tripId} display={display} />,
    balances: <BalancesPane groupId={tripId} display={display} />,
    settle: <SettlePane groupId={tripId} display={display} simplify={simplify} />,
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

        {/* Display currency — spend vs settle */}
        {multiCurrency && (
          <div className="flex items-center justify-center gap-1 px-4 py-2 bg-white border-b border-[var(--border-color)]">
            <span className="text-[10px] text-[var(--muted)] mr-1">Showing in</span>
            {[spendCurrency, baseCurrency].map((c) => (
              <button
                key={c}
                onClick={() => setDisplayCode(c)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  code === c ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Content — panes stay mounted (hidden) so tab switches never refetch */}
      <main className="pb-[calc(4rem+var(--safe-bottom))]">
        <PullToRefresh onRefresh={() => queryClient.refetchQueries()}>
          {(Object.keys(panes) as Tab[]).map((tab) => (
            <div key={tab} hidden={activeTab !== tab}>
              <Suspense fallback={<TabFallback />}>{panes[tab]}</Suspense>
            </div>
          ))}
        </PullToRefresh>
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
