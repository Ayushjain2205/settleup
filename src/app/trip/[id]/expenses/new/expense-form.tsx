"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useExpenseDetail, useMembers, useSession, useTripMeta } from "@/lib/queries";
import { errorMessage } from "@/lib/error";
import { success, failure } from "@/lib/haptics";
import { toast } from "@/components/toast";
import { useSaveExpense } from "@/lib/mutations";
import { computeSplitOwes } from "@/lib/splits";
import { compressImage, mapScanToLines, type ScanResult } from "@/lib/scan";
import { PayerPicker } from "@/components/payer-picker";
import { SplitOptions, type SplitItem } from "@/components/split-options";
import { CategoryPicker } from "@/components/category-picker";
import { CATEGORIES, guessCategory, type Category } from "@/lib/categories";

type SplitMode = "equal" | "exact" | "percent" | "itemized";

const getSymbol = (currency: string) => currency === "INR" ? "₹" : currency === "MYR" ? "RM" : "$";

interface GroupInfo {
  id: string;
  name: string;
  baseCurrency: string;
  spendCurrency: string;
  fxRate: number;
}

interface MemberInfo {
  id: string;
  name: string;
  avatar: string;
}

export function ExpenseForm() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const expenseId = params.expenseId as string | undefined;
  const dateRef = useRef<HTMLInputElement>(null);
  const isEdit = !!expenseId;

  const { data: session, isLoading: sessionLoading } = useSession();
  const ready = !sessionLoading && !!session;
  const { data: meta, isLoading: metaLoading, error: metaError } = useTripMeta(groupId, ready);
  const { data: memberRows, isLoading: membersLoading } = useMembers(groupId, ready);
  const { data: detail, isLoading: detailLoading } = useExpenseDetail(groupId, expenseId || "", ready && isEdit);

  const members: MemberInfo[] = memberRows || [];
  const group: GroupInfo = {
    id: groupId,
    name: meta?.name || "",
    baseCurrency: meta?.baseCurrency || "",
    spendCurrency: meta?.spendCurrency || "",
    fxRate: meta?.fxRate || 1,
  };

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [items, setItems] = useState<SplitItem[]>([]);
  const [showPayerPicker, setShowPayerPicker] = useState(false);
  const [showSplitOptions, setShowSplitOptions] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [useBaseCurrency, setUseBaseCurrency] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [hydratedId, setHydratedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scanTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveExpense = useSaveExpense(group.id);

  // Create mode: default payer/selection once members arrive
  useEffect(() => {
    if (isEdit || members.length === 0) return;
    if (!paidBy) setPaidBy(members[0].id);
    if (selectedMembers.length === 0) setSelectedMembers(members.map((m) => m.id));
  }, [members, isEdit, paidBy, selectedMembers.length]);

  // Edit mode: hydrate once from fetched detail (balances pinned to balance)
  useEffect(() => {
    if (!isEdit || !detail || !meta || hydratedId === detail.id) return;
    const round2 = (v: number) => Math.round(v * 100) / 100;
    const useBase = detail.currency === meta.baseCurrency;
    const toEntered = (base: number) => (useBase ? base : base / (meta.fxRate || 1));
    const amountNum = detail.amount;
    const baseTotal = detail.splits.reduce((s, x) => s + x.owed, 0);
    const exact: Record<string, string> = {};
    if (detail.splitMode !== "equal") {
      let running = 0;
      detail.splits.forEach((s, i) => {
        const v = round2(toEntered(s.owed));
        if (i < detail.splits.length - 1) {
          exact[s.memberId] = String(v);
          running += v;
        } else {
          exact[s.memberId] = String(round2(amountNum - running));
        }
      });
    }
    const pcts: Record<string, string> = {};
    if (baseTotal > 0) {
      let running = 0;
      detail.splits.forEach((s, i) => {
        const v = round2((s.owed / baseTotal) * 100);
        if (i < detail.splits.length - 1) {
          pcts[s.memberId] = String(v);
          running += v;
        } else {
          pcts[s.memberId] = String(round2(100 - running));
        }
      });
    }
    setTitle(detail.title);
    setAmount(String(amountNum));
    setPaidBy(detail.paidBy);
    setSplitMode(detail.splitMode === "itemized" ? "exact" : (detail.splitMode as SplitMode));
    setSelectedMembers(detail.splits.map((s) => s.memberId));
    setExactAmounts(exact);
    setPercentages(pcts);
    setExpenseDate(detail.expenseDate);
    setUseBaseCurrency(useBase);
    setCategory(detail.categoryId ? CATEGORIES.find((c) => c.id === detail.categoryId) || null : null);
    setHydratedId(detail.id);
  }, [detail, isEdit, meta, hydratedId]);

  const SCAN_STAGES = ["Uploading receipt…", "Reading receipt…", "Extracting items…"];

  // Smart auto-categorization: guess category from description (create only)
  useEffect(() => {
    if (isEdit) return;
    if (title.trim()) {
      const guessed = guessCategory(title);
      if (guessed && guessed.id !== category?.id) {
        setCategory(guessed);
      }
    }
  }, [title]);

  const amountNum = parseFloat(amount) || 0;
  const currency = useBaseCurrency ? group.baseCurrency : group.spendCurrency;
  const symbol = getSymbol(currency);
  // Convert entered amount to base currency
  const toBase = (v: number) => (useBaseCurrency ? v : v * group.fxRate);
  const baseAmount = toBase(amountNum);

  const isToday = expenseDate === new Date().toISOString().split("T")[0];
  const dateLabel = isToday ? "Today" : new Date(expenseDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const paidByName = members.find((m) => m.id === paidBy)?.name || "you";
  const splitLabel = splitMode === "equal" ? "equally" : splitMode === "exact" ? "by amount" : splitMode === "percent" ? "by %" : "by items";

  // Per-mode balance validation
  const totalExact = Object.values(exactAmounts).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const totalPercent = Object.values(percentages).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  const totalItemized = items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  const canSubmit =
    amountNum > 0 &&
    title.trim().length > 0 &&
    paidBy !== "" &&
    (splitMode === "equal"
      ? selectedMembers.length > 0
      : splitMode === "exact"
        ? Math.abs(totalExact - amountNum) < 0.01
        : splitMode === "percent"
          ? Math.abs(totalPercent - 100) < 0.01
          : Math.abs(totalItemized - amountNum) < 0.01 && items.every((i) => i.name.trim().length > 0));

  // Per-member owed amounts in base currency
  const computeSplits = () =>
    computeSplitOwes({
      mode: splitMode,
      baseAmount,
      selected: selectedMembers,
      exactAmounts,
      percentages,
      items,
      toBase,
    });

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      await saveExpense.mutateAsync({
        title: title.trim(),
        amount: amountNum,
        currency,
        baseAmount,
        categoryId: category?.id || "other",
        paidBy,
        splitMode,
        expenseDate,
        splits: computeSplits(),
        expenseId: isEdit ? expenseId || null : null,
      });

      router.push(`/trip/${group.id}`);
      success();
      toast(isEdit ? "Expense updated" : "Expense added");
    } catch (err) {
      setError(errorMessage(err, "Could not save expense"));
      failure();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayerSelect = (id: string) => {
    setPaidBy(id);
  };

  const handleScanPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || isScanning) return;
    setIsScanning(true);
    setScanStage(0);
    setError(null);
    scanTimer.current = setInterval(() => {
      setScanStage((s) => (s < SCAN_STAGES.length - 1 ? s + 1 : s));
    }, 2400);
    try {
      const blob = await compressImage(file);
      const form = new FormData();
      form.append("image", blob, "receipt.jpg");
      const res = await fetch("/api/scan-receipt", { method: "POST", body: form });
      const scan: ScanResult & { error?: string } = await res.json();
      if (!res.ok) throw new Error(scan.error || "Could not read receipt");

      const memberIds = members.map((m) => m.id);
      const lines = mapScanToLines(scan, memberIds);
      if (scan.merchant) setTitle(scan.merchant);
      if (scan.total > 0) setAmount(String(scan.total));
      if (scan.date && /^\d{4}-\d{2}-\d{2}$/.test(scan.date)) setExpenseDate(scan.date);
      if (lines.length > 0) {
        setItems(lines);
        setSplitMode("itemized");
        setShowSplitOptions(true);
      }
      success();
    } catch (err) {
      setError(errorMessage(err, "Could not read receipt"));
      failure();
    } finally {
      if (scanTimer.current) clearInterval(scanTimer.current);
      setIsScanning(false);
    }
  };

  const handleSplitConfirm = (mode: SplitMode, selected: string[], exact: Record<string, string>, pcts: Record<string, string>, confirmedItems: SplitItem[]) => {
    setSplitMode(mode);
    setSelectedMembers(selected);
    setExactAmounts(exact);
    setPercentages(pcts);
    setItems(confirmedItems);
  };

  const dataLoading = sessionLoading || metaLoading || membersLoading || (isEdit && detailLoading);

  if (!sessionLoading && !session) {
    return (
      <div className="min-h-dvh bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <p className="text-sm font-medium text-[var(--foreground)]">Sign in to add an expense</p>
        <button onClick={() => router.push("/login")} className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
          Sign in
        </button>
      </div>
    );
  }

  if (session && !metaLoading && (metaError || !meta)) {
    return (
      <div className="min-h-dvh bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <p className="text-sm font-medium text-[var(--foreground)]">Group not found</p>
        <button onClick={() => router.push("/")} className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
          Back to groups
        </button>
      </div>
    );
  }

  if (isEdit && session && !detailLoading && !detail) {
    return (
      <div className="min-h-dvh bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <p className="text-sm font-medium text-[var(--foreground)]">Expense not found</p>
        <button onClick={() => router.push(`/trip/${groupId}`)} className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold">
          Back to group
        </button>
      </div>
    );
  }

  if (dataLoading || !meta || members.length === 0) {
    return (
      <div className="min-h-dvh bg-[var(--background)] flex flex-col animate-pulse">
        <header className="sticky top-0 z-40 bg-white/80 border-b border-[var(--border-color)]">
          <div className="flex items-center h-14 px-4">
            <div className="w-5 h-5 rounded bg-[var(--border-color)] mr-3" />
            <div className="flex-1 flex justify-center">
              <div className="h-4 w-28 rounded bg-[var(--border-color)]" />
            </div>
            <div className="h-4 w-10 rounded bg-[var(--border-color)]" />
          </div>
        </header>
        <div className="flex-1 flex flex-col px-4 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--border-color)] flex-shrink-0" />
            <div className="flex-1 h-8 rounded bg-[var(--border-color)]" />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--border-color)] flex-shrink-0" />
            <div className="flex-1 h-10 rounded bg-[var(--border-color)]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => router.back()} className="p-1 -ml-1 mr-3">
            <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="flex-1 text-center text-[15px] font-semibold text-[var(--foreground)]">{isEdit ? "Edit expense" : "Add an expense"}</span>
          <button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="text-sm font-bold text-[var(--primary)] disabled:opacity-40">
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      {/* Who */}
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 text-[15px]">
          <span className="text-[var(--muted)]">With you and:</span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--border-color)]/30 rounded-full">
            <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[8px] font-bold text-[var(--primary)]">
              {members.length}
            </div>
            <span className="text-sm font-medium text-[var(--foreground)]">{group.name}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <main className="flex-1 flex flex-col px-4 pt-6 pb-28">
        {/* Description */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setShowCategoryPicker(true)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 active:bg-[var(--background)] transition-colors ${category ? category.colorClass : "border border-[var(--border-color)]"}`}
          >
            {category ? (
              <category.Icon className="w-5 h-5" strokeWidth={1.5} />
            ) : (
              <svg className="w-5 h-5 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            )}
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a description"
            className="flex-1 text-[15px] text-[var(--foreground)] bg-transparent border-0 border-b-2 border-[var(--primary)] focus:outline-none pb-2 placeholder:text-[var(--muted)]/40 transition-colors"
            autoFocus
          />
        </div>

        {/* Amount */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setUseBaseCurrency((p) => !p)}
            className="w-10 h-10 rounded-xl border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 active:bg-[var(--background)] transition-colors"
          >
            <span className="text-lg font-semibold text-[var(--muted)]">{symbol}</span>
          </button>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="flex-1 text-xl font-bold text-[var(--foreground)] bg-transparent border-0 border-b-2 border-[var(--primary)] focus:outline-none pb-2 placeholder:text-[var(--border-color)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Paid by + Split */}
        <div className="flex items-center justify-center gap-2 text-[15px]">
          <span className="text-[var(--muted)]">Paid by</span>
          <button
            onClick={() => setShowPayerPicker(true)}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-sm font-semibold text-[var(--foreground)] active:bg-[var(--background)] transition-colors"
          >
            {paidByName}
          </button>
          <span className="text-[var(--muted)]">and split</span>
          <button
            onClick={() => setShowSplitOptions(true)}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-sm font-semibold text-[var(--foreground)] active:bg-[var(--background)] transition-colors"
          >
            {splitLabel}
          </button>
        </div>

        {error && (
          <p className="text-xs font-medium text-[var(--error)] bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-xl px-4 py-2.5 mt-4">{error}</p>
        )}

        {isScanning && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <svg className="w-4 h-4 animate-spin text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span className="text-xs font-medium text-[var(--muted)]">{SCAN_STAGES[scanStage]}</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom toolbar */}
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--background)] border-t border-[var(--border-color)] px-4 pt-3" style={{ paddingBottom: "calc(12px + var(--safe-bottom))" }}>
          <div className="flex items-center justify-between">
          <div className="relative flex items-center gap-2 text-sm text-[var(--muted)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span className="font-medium">{dateLabel}</span>
            <input
              ref={dateRef}
              type="date"
              value={expenseDate}
              onChange={(e) => e.target.value && setExpenseDate(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <span className="font-medium">{group.name}</span>
          </button>
          <button className="p-2 text-[var(--primary)]" title="Scan receipt" onClick={() => fileRef.current?.click()} disabled={isScanning}>
            {isScanning ? (
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleScanPick}
            className="sr-only"
          />
          <button className="p-2 text-[var(--primary)]" title="Add note">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
          </div>
        </div>
      </main>

      {/* Bottom sheets */}
      {showPayerPicker && (
        <PayerPicker
          members={members}
          selected={paidBy}
          onSelect={handlePayerSelect}
          onClose={() => setShowPayerPicker(false)}
        />
      )}
      {showSplitOptions && (
        <SplitOptions
          amount={amountNum}
          symbol={symbol}
          members={members}
          initialMode={splitMode}
          initialSelected={selectedMembers}
          initialExactAmounts={exactAmounts}
          initialPercentages={percentages}
          initialItems={items}
          onClose={() => setShowSplitOptions(false)}
          onConfirm={handleSplitConfirm}
        />
      )}
      {showCategoryPicker && (
        <CategoryPicker
          selected={category}
          onSelect={setCategory}
          onClose={() => setShowCategoryPicker(false)}
        />
      )}
    </div>
  );
}
