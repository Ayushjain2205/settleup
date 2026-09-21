import { describe, expect, it } from "vitest";
import { generateJoinCode, normalizeJoinCode, isValidJoinCode, JOIN_CODE_LENGTH } from "./join-code";

describe("generateJoinCode", () => {
  it("generates 6-char codes from the unambiguous alphabet", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateJoinCode();
      expect(code).toHaveLength(JOIN_CODE_LENGTH);
      expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
    }
  });

  it("generates unique codes", () => {
    const codes = new Set(Array.from({ length: 1000 }, generateJoinCode));
    expect(codes.size).toBeGreaterThan(990);
  });

  it("never emits ambiguous characters", () => {
    for (let i = 0; i < 100; i++) {
      expect(generateJoinCode()).not.toMatch(/[0O1IL]/);
    }
  });
});

describe("normalizeJoinCode / isValidJoinCode", () => {
  it("trims and uppercases", () => {
    expect(normalizeJoinCode("  ab23cd ")).toBe("AB23CD");
  });

  it("accepts valid codes", () => {
    expect(isValidJoinCode("AB23CD")).toBe(true);
    expect(isValidJoinCode("ab23cd")).toBe(true);
  });

  it("rejects wrong length and bad chars", () => {
    expect(isValidJoinCode("ABC")).toBe(false);
    expect(isValidJoinCode("AB23CDE")).toBe(false);
    expect(isValidJoinCode("AB01CD")).toBe(false);
    expect(isValidJoinCode("ABILCD")).toBe(false);
    expect(isValidJoinCode("")).toBe(false);
  });
});
