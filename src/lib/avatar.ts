// Deliberately no green/red/pink: those encode owed/owing elsewhere,
// and an identity color must never contradict the balance signal.
const PALETTE: { bg: string; fg: string }[] = [
  { bg: "#ede9fe", fg: "#7c3aed" },
  { bg: "#dbeafe", fg: "#1d4ed8" },
  { bg: "#cffafe", fg: "#0e7490" },
  { bg: "#ffedd5", fg: "#ea580c" },
  { bg: "#fef3c7", fg: "#b45309" },
  { bg: "#fae8ff", fg: "#a21caf" },
  { bg: "#e0e7ff", fg: "#4338ca" },
  { bg: "#e2e8f0", fg: "#475569" },
];

/** Deterministic identity color per member id. Same id → same color, forever. */
export function avatarColor(id: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function avatarInitial(name: string): string {
  return name.trim().slice(0, 2).toUpperCase() || "?";
}
