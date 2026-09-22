export function mark(name: string): void {
  try {
    if (typeof performance !== "undefined" && performance.mark) performance.mark(name);
  } catch {
    // never break the app for metrics
  }
}
