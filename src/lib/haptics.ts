/** Best-effort haptic tick. iOS Safari ignores vibrate; Android plays it. */
export function tick(): void {
  try {
    navigator.vibrate?.(15);
  } catch {
    // no haptics on this device
  }
}
