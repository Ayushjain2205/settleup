import { describe, expect, it } from "vitest";
import { avatarColor, avatarInitial } from "./avatar";

describe("avatarColor", () => {
  it("is deterministic per id", () => {
    expect(avatarColor("abc-123")).toEqual(avatarColor("abc-123"));
  });

  it("spreads across the palette", () => {
    const seen = new Set(
      Array.from({ length: 50 }, (_, i) => JSON.stringify(avatarColor(`member-${i}`)))
    );
    expect(seen.size).toBeGreaterThan(3);
  });
});

describe("avatarInitial", () => {
  it("uses two letters", () => {
    expect(avatarInitial("Ayush")).toBe("AY");
    expect(avatarInitial("arkon")).toBe("AR");
    expect(avatarInitial("")).toBe("?");
  });
});
