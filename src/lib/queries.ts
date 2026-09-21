"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";
import { CATEGORIES } from "@/lib/categories";
import type { Expense, Member } from "@/lib/mock-data";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    // Local cookie read — cheap, always re-check on mount.
    staleTime: 0,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export interface GroupListItem {
  id: string;
  name: string;
  baseCurrency: string;
  members: { id: string; avatar: string }[];
  totalSpent: number;
  lastDate: string | null;
}

export interface TripMeta {
  id: string;
  name: string;
  baseCurrency: string;
  spendCurrency: string;
  fxRate: number;
  simplifyDebts: boolean;
}

export interface ExpenseWithSplits {
  expenses: Expense[];
  splitDetails: Record<string, { memberId: string; amount: number }[]>;
}

export interface RecordedPayment {
  from: string;
  to: string;
  amount: number;
  currency: string;
  date: string;
}

const symbol = (c: string) => (c === "INR" ? "₹" : c === "MYR" ? "RM" : "$");
export { symbol };

export function useGroups() {
  const { data: session, isLoading: sessionLoading } = useSession();
  return useQuery({
    queryKey: ["groups"],
    queryFn: async (): Promise<GroupListItem[]> => {
      const { data: groups, error } = await supabase
        .from("groups")
        .select("id, name, base_currency, group_members(id, avatar), expenses(base_amount, expense_date)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (groups || []).map((g) => {
        const expenses = g.expenses || [];
        const totalSpent = expenses.reduce((sum, e) => sum + Number(e.base_amount), 0);
        const lastDate =
          expenses
            .map((e) => e.expense_date)
            .filter(Boolean)
            .sort()
            .reverse()[0] || null;
        return {
          id: g.id,
          name: g.name,
          baseCurrency: g.base_currency,
          members: g.group_members || [],
          totalSpent,
          lastDate,
        };
      });
    },
    enabled: !!session,
  });
}

const broadOf = (categoryId: string): Expense["category"] =>
  CATEGORIES.find((c) => c.id === categoryId)?.broad || "other";

export function useTripMeta(groupId: string, sessionReady: boolean) {
  return useQuery({
    queryKey: ["trip", groupId],
    queryFn: async (): Promise<TripMeta> => {
      const { data, error } = await supabase
        .from("groups")
        .select("id, name, base_currency, spend_currency, fixed_fx_rate, simplify_debts")
        .eq("id", groupId)
        .single();
      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        baseCurrency: data.base_currency,
        spendCurrency: data.spend_currency,
        fxRate: Number(data.fixed_fx_rate),
        simplifyDebts: data.simplify_debts,
      };
    },
    enabled: sessionReady,
  });
}

export function useMembers(groupId: string, sessionReady: boolean) {
  return useQuery({
    queryKey: ["members", groupId],
    queryFn: async (): Promise<Member[]> => {
      const { data, error } = await supabase
        .from("group_members")
        .select("id, name, avatar, upi_id")
        .eq("group_id", groupId);
      if (error) throw error;
      return (data || []).map((m) => ({ id: m.id, name: m.name, avatar: m.avatar, upiId: m.upi_id || undefined }));
    },
    enabled: sessionReady,
  });
}

export function useExpenses(groupId: string, baseCurrency: string, sessionReady: boolean) {
  return useQuery({
    queryKey: ["expenses", groupId],
    queryFn: async (): Promise<ExpenseWithSplits> => {
      const [{ data: expenseRows, error: e1 }, { data: splitRows, error: e2 }] = await Promise.all([
        supabase
          .from("expenses")
          .select("id, title, amount, currency, base_amount, category_id, paid_by, split_mode, expense_date")
          .eq("group_id", groupId)
          .order("expense_date", { ascending: false }),
        supabase
          .from("expense_splits")
          .select("expense_id, member_id, amount_owed, expenses!inner(group_id)")
          .eq("expenses.group_id", groupId),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      const expenses: Expense[] = (expenseRows || []).map((e) => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        currency: e.currency,
        baseAmount: Number(e.base_amount),
        baseCurrency,
        paidBy: e.paid_by,
        splitAmong: (splitRows || []).filter((s) => s.expense_id === e.id).map((s) => s.member_id),
        splitType: e.split_mode === "percent" ? "exact" : (e.split_mode as Expense["splitType"]),
        date: e.expense_date,
        category: broadOf(e.category_id),
      }));
      const splitDetails: Record<string, { memberId: string; amount: number }[]> = {};
      for (const s of splitRows || []) {
        (splitDetails[s.expense_id] ||= []).push({ memberId: s.member_id, amount: Number(s.amount_owed) });
      }
      return { expenses, splitDetails };
    },
    enabled: sessionReady,
  });
}

export function useRecorded(groupId: string, sessionReady: boolean) {
  return useQuery({
    queryKey: ["settlements", groupId],
    queryFn: async (): Promise<RecordedPayment[]> => {
      const { data, error } = await supabase
        .from("settlements")
        .select("from_member, to_member, amount, currency, created_at")
        .eq("group_id", groupId)
        .eq("status", "confirmed")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((r) => ({
        from: r.from_member,
        to: r.to_member,
        amount: Number(r.amount),
        currency: r.currency,
        date: r.created_at,
      }));
    },
    enabled: sessionReady,
  });
}
