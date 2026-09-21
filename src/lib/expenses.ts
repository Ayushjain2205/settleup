import type { SupabaseClient } from "@supabase/supabase-js";

/** Delete an expense; splits cascade. Returns error message or null. */
export async function deleteExpense(supabase: SupabaseClient, expenseId: string): Promise<string | null> {
  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
  return error ? error.message : null;
}
