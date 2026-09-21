import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";
import { generateJoinCode } from "@/lib/join-code";
import type { ExpenseWithSplits } from "@/lib/queries";

export interface SaveExpenseArgs {
  title: string;
  amount: number;
  currency: string;
  baseAmount: number;
  categoryId: string;
  paidBy: string;
  splitMode: string;
  expenseDate: string;
  splits: { memberId: string; amountOwed: number }[];
  expenseId?: string | null;
}

export function useSaveExpense(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: SaveExpenseArgs) => {
      const { error } = await supabase.rpc("save_expense", {
        p_group_id: groupId,
        p_title: args.title,
        p_amount: args.amount,
        p_currency: args.currency,
        p_base_amount: Math.round(args.baseAmount * 100) / 100,
        p_category_id: args.categoryId,
        p_paid_by: args.paidBy,
        p_split_mode: args.splitMode,
        p_expense_date: args.expenseDate,
        p_splits: args.splits,
        p_expense_id: args.expenseId || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["expenses", groupId] });
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useDeleteExpense(groupId: string) {
  const qc = useQueryClient();
  const key = ["expenses", groupId] as const;
  return useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
      if (error) throw error;
      return expenseId;
    },
    onMutate: async (expenseId) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<ExpenseWithSplits>(key);
      if (prev) {
        qc.setQueryData<ExpenseWithSplits>(key, {
          ...prev,
          expenses: prev.expenses.filter((e) => e.id !== expenseId),
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export interface RecordSettlementArgs {
  from: string;
  to: string;
  amount: number;
  currency: string;
}

export function useRecordSettlement(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: RecordSettlementArgs) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("settlements").insert({
        group_id: groupId,
        from_member: args.from,
        to_member: args.to,
        amount: args.amount,
        currency: args.currency,
        status: "confirmed",
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settlements", groupId] });
    },
  });
}

export interface AddMemberArgs {
  name: string;
  avatar: string;
  email: string | null;
}

export function useAddMember(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: AddMemberArgs) => {
      const { error } = await supabase.from("group_members").insert({
        group_id: groupId,
        name: args.name,
        avatar: args.avatar,
        email: args.email,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", groupId] });
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export interface CreateGroupArgs {
  name: string;
  type: string;
  baseCurrency: string;
  spendCurrency: string;
  fxMode: string;
  fixedFxRate: number;
  simplifyDebts: boolean;
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: CreateGroupArgs & { userId: string; memberName: string }) => {
      // Fresh code per attempt in case of collision
      let lastError: unknown = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data: group, error: groupError } = await supabase
          .from("groups")
          .insert({
            name: args.name,
            type: args.type,
            base_currency: args.baseCurrency,
            spend_currency: args.spendCurrency,
            fx_mode: args.fxMode,
            fixed_fx_rate: args.fixedFxRate,
            simplify_debts: args.simplifyDebts,
            join_code: generateJoinCode(),
            created_by: args.userId,
          })
          .select("id")
          .single();
        if (!groupError) {
          const { error: memberError } = await supabase.from("group_members").insert({
            group_id: group.id,
            user_id: args.userId,
            name: args.memberName,
            avatar: args.memberName[0]?.toUpperCase() || "Y",
          });
          if (memberError) throw memberError;
          return group.id as string;
        }
        lastError = groupError;
        if ((groupError as { code?: string }).code !== "23505") throw groupError;
      }
      throw lastError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.rpc("join_group", { p_code: code });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useUpdateGroup(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const { error } = await supabase.from("groups").update(patch).eq("id", groupId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trip", groupId] });
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase.from("groups").delete().eq("id", groupId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}
