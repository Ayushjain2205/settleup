/** Supabase/PostgREST failures are plain objects, not Error instances —
 *  `instanceof Error` misses them and swallows the real message. */
export function errorMessage(err: unknown, fallback: string): string {
  if (typeof err === "string" && err) return err;
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return fallback;
}
