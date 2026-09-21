import { WebHaptics } from "web-haptics";

let instance: WebHaptics | null = null;

function haptics(): WebHaptics | null {
  if (typeof window === "undefined") return null;
  if (!instance) instance = new WebHaptics();
  return instance;
}

function fire(preset: "light" | "success" | "error"): void {
  try {
    haptics()?.trigger(preset).catch(() => {});
  } catch {
    // haptics are best-effort; never break the app
  }
}

/** Light tap — selections, toggles. */
export function tick(): void {
  fire("light");
}

/** Confirmed write — save, record, add, delete. */
export function success(): void {
  fire("success");
}

/** Failure — validation and save errors. */
export function failure(): void {
  fire("error");
}
