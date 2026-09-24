"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";
import { CATEGORIES } from "@/lib/categories";
import { mapGroupRows } from "@/lib/group-map";
import { buildFeed, type EnrichedFeedItem } from "@/lib/feed";
import { computePosition, type Position } from "@/lib/position";
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
  position: Position | null;
}

export interface TripMeta {
  id: string;
  name: string;
  baseCurrency: string;
  spendCurrency: string;
  fxRate: number;
  simplifyDebts: boolean;
  createdBy: string | null;
  joinCode: string;
  fxMode: string;
}

export interface MemberRow {
  id: string;
  name: string;
  avatar: string;
  userId: string | null;
  email: string | null;
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
  const userId = session?.user.id;
  return useQuery({
    queryKey: ["groups"],
    queryFn: async (): Promise<GroupListItem[]> => {
      const { data: groups, error } = await supabase
        .from("groups")
        .select("id, name, base_currency, fixed_fx_rate, simplify_debts, group_members(id, name, avatar, user_id), expenses(id, base_amount, expense_date, paid_by)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const ids = (groups || []).map((g) => g.id);
      let splitRows: { expense_id: string; member_id: string; amount_owed: string | number }[] = [];
      let recordedRows: { group_id: string; from_member: string; to_member: string; amount: string | number; currency: string }[] = [];
      if (ids.length > 0) {
        const [{ data: splits, error: splitError }, { data: settled, error: settledError }] = await Promise.all([
          supabase
            .from("expense_splits")
            .select("expense_id, member_id, amount_owed, expenses!inner(group_id)")
            .in("expenses.group_id", ids),
          supabase
            .from("settlements")
            .select("group_id, from_member, to_member, amount, currency")
            .in("group_id", ids)
            .eq("status", "confirmed"),
        ]);
        if (splitError) throw splitError;
        if (settledError) throw settledError;
        splitRows = splits || [];
        recordedRows = settled || [];
      }
      const splitsByExpense = new Map<string, { memberId: string; amountOwed: number }[]>();
      for (const s of splitRows) {
        const arr = splitsByExpense.get(s.expense_id) || [];
        arr.push({ memberId: s.member_id, amountOwed: Number(s.amount_owed) });
        splitsByExpense.set(s.expense_id, arr);
      }
      return mapGroupRows(groups || []).map((g, i) => {
        const raw = (groups || [])[i];
        const expenses = raw.expenses || [];
        return {
          ...g,
          position: computePosition(
            {
              members: (raw.group_members || []).map((m) => ({ id: m.id, userId: m.user_id, name: m.name })),
              expenses: expenses.map((e) => ({ paidBy: e.paid_by, baseAmount: Number(e.base_amount) })),
              splits: expenses.flatMap((e) => splitsByExpense.get(e.id) || []),
              recorded: (recordedRows || [])
                .filter((r) => r.group_id === g.id)
                .map((r) => ({ from: r.from_member, to: r.to_member, amount: Number(r.amount), currency: r.currency })),
              simplify: raw.simplify_debts,
              currency: g.baseCurrency,
              fxRate: Number(raw.fixed_fx_rate) || 1,
              currentUserId: userId || "",
            }
          ),
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
        .select("id, name, base_currency, spend_currency, fixed_fx_rate, simplify_debts, created_by, join_code, fx_mode")
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
        createdBy: data.created_by,
        joinCode: data.join_code,
        fxMode: data.fx_mode,
      };
    },
    enabled: sessionReady,
  });
}

export function useMembers(groupId: string, sessionReady: boolean) {
  const { data, ...rest } = useMemberRows(groupId, sessionReady);
  return {
    ...rest,
    data: data?.map((m) => ({ id: m.id, name: m.name, avatar: m.avatar, upiId: undefined })),
  };
}

export function useMemberRows(groupId: string, sessionReady: boolean) {
  return useQuery({
    queryKey: ["members", groupId],
    queryFn: async (): Promise<MemberRow[]> => {
      const { data, error } = await supabase
        .from("group_members")
        .select("id, name, avatar, user_id, email")
        .eq("group_id", groupId);
      if (error) throw error;
      return (data || []).map((m) => ({ id: m.id, name: m.name, avatar: m.avatar, userId: m.user_id, email: m.email }));
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
        categoryId: e.category_id,
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

export interface FeedItem {
  key: string;
  at: string;
  subject: string;
  initial: string;
  action: string;
  detail: string | null;
  amount: string | null;
  trip: string;
}

export function useActivityFeed() {
  const { data: session, isLoading: sessionLoading } = useSession();
  const { data: groups } = useGroups();
  const groupIds = (groups || []).map((g) => g.id);
  const userId = session?.user.id;

  return {
    session,
    sessionLoading,
    ...useQuery({
      queryKey: ["activity", groupIds.join(",")],
      queryFn: async (): Promise<EnrichedFeedItem[]> => {
        const groupList = (groups || []).map((g) => ({ id: g.id, name: g.name, baseCurrency: g.baseCurrency }));
        const [{ data: members }, { data: expenses }, { data: settlements }] = await Promise.all([
          supabase.from("group_members").select("id, group_id, name, user_id, avatar").in("group_id", groupIds),
          supabase
            .from("expenses")
            .select("id, group_id, title, base_amount, paid_by, category_id, created_at")
            .in("group_id", groupIds)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("settlements")
            .select("id, group_id, from_member, to_member, amount, currency, created_at")
            .in("group_id", groupIds)
            .eq("status", "confirmed")
            .order("created_at", { ascending: false })
            .limit(20),
        ]);
        const expenseIds = (expenses || []).map((e) => e.id);
        let splits: { expense_id: string; member_id: string; amount_owed: string | number }[] = [];
        if (expenseIds.length > 0) {
          const { data } = await supabase.from("expense_splits").select("expense_id, member_id, amount_owed").in("expense_id", expenseIds);
          splits = data || [];
        }
        return buildFeed(groupList, members || [], expenses || [], settlements || [], splits, userId);
      },
      enabled: !sessionLoading && !!session && groupIds.length > 0,
    }),
  };
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

/** Claim an email invite once per visit, then refresh members. */
export function useClaimInvite(groupId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const claimed = useRef<string | null>(null);
  const email = session?.user.email;

  useEffect(() => {
    if (!email || claimed.current === `${groupId}:${email}`) return;
    claimed.current = `${groupId}:${email}`;
    supabase
      .from("group_members")
      .update({ user_id: session?.user.id })
      .is("user_id", null)
      .eq("group_id", groupId)
      .eq("email", email)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["members", groupId] });
      });
  }, [email, groupId, queryClient, session]);
}

export interface ExpenseDetailData {
  id: string;
  title: string;
  amount: number;
  currency: string;
  paidBy: string;
  splitMode: string;
  categoryId: string;
  expenseDate: string;
  splits: { memberId: string; owed: number }[];
}

export function useExpenseDetail(groupId: string, expenseId: string, sessionReady: boolean) {
  return useQuery({
    queryKey: ["expense", groupId, expenseId],
    queryFn: async (): Promise<ExpenseDetailData | null> => {
      const [{ data: expense }, { data: splits }] = await Promise.all([
        supabase.from("expenses").select("*").eq("id", expenseId).eq("group_id", groupId).single(),
        supabase.from("expense_splits").select("member_id, amount_owed").eq("expense_id", expenseId),
      ]);
      if (!expense) return null;
      return {
        id: expense.id,
        title: expense.title,
        amount: Number(expense.amount),
        currency: expense.currency,
        paidBy: expense.paid_by,
        splitMode: expense.split_mode,
        categoryId: expense.category_id,
        expenseDate: expense.expense_date,
        splits: (splits || []).map((s) => ({ memberId: s.member_id, owed: Number(s.amount_owed) })),
      };
    },
    enabled: sessionReady,
  });
}
