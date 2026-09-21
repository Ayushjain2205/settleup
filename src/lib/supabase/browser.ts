import { createBrowserClient } from "@supabase/ssr";

// Shared browser client for the query layer. Module singleton —
// safe because it only ever runs in the browser (hooks are client-only).
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
