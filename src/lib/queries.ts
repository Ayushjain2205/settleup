"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";

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
