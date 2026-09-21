/**
 * Haptics, honestly:
 * - Android: navigator.vibrate() — real buzz.
 * - iOS web: no API exists. Top PWAs ship visual-only feedback there
 *   (our springy toast + press states). Real iOS haptics need a
 *   native shell (Capacitor), not a web fix.
 */
function buzz(pattern: number | number[]): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // never break the app for a buzz
  }
}

/** Light tap — selections, toggles. */
export function tick(): void {
  buzz(15);
}

/** Confirmed write — save, record, add, delete. */
export function success(): void {
  buzz([25, 40, 25]);
}

/** Failure — validation and save errors. */
export function failure(): void {
  buzz([60, 60, 60]);
}
