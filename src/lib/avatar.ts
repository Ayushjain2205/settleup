const PALETTE: { bg: string; fg: string }[] = [
  { bg: "#ede9fe", fg: "#7c3aed" },
  { bg: "#ffedd5", fg: "#ea580c" },
  { bg: "#dcfce7", fg: "#15803d" },
  { bg: "#dbeafe", fg: "#1d4ed8" },
  { bg: "#fce7f3", fg: "#be185d" },
  { bg: "#ccfbf1", fg: "#0f766e" },
  { bg: "#fef3c7", fg: "#b45309" },
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
