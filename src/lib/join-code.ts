// No ambiguous chars: 0/O, 1/I/L excluded
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const JOIN_CODE_LENGTH = 6;

export function generateJoinCode(): string {
  const bytes = new Uint32Array(JOIN_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function normalizeJoinCode(input: string): string {
  return input.trim().toUpperCase();
}

export function isValidJoinCode(input: string): boolean {
  const code = normalizeJoinCode(input);
  return code.length === JOIN_CODE_LENGTH && [...code].every((c) => ALPHABET.includes(c));
}
