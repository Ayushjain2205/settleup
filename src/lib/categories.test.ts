import { describe, expect, it } from "vitest";
import { guessCategory } from "./categories";

describe("guessCategory", () => {
  it("returns null for empty input", () => {
    expect(guessCategory("")).toBeNull();
    expect(guessCategory("   ")).toBeNull();
  });

  it("detects dining from food words", () => {
    expect(guessCategory("Lunch at Nasi Kandar")?.id).toBe("dining_out");
    expect(guessCategory("morning coffee")?.id).toBe("dining_out");
  });

  it("detects transport from ride words", () => {
    expect(guessCategory("Uber ride downtown")?.id).toBe("taxi");
    expect(guessCategory("taxi to office")?.id).toBe("taxi");
  });

  it("detects entertainment", () => {
    expect(guessCategory("Netflix subscription")?.id).toBe("movies");
    expect(guessCategory("cricket match tickets")?.id).toBe("sports");
  });

  it("detects home and shopping", () => {
    expect(guessCategory("monthly rent")?.id).toBe("rent");
    expect(guessCategory("groceries at mart")?.id).toBe("groceries");
  });

  it("prefers the longest matching keyword", () => {
    // "uber eats delivery" matches both "uber" (taxi) and "uber eats" (dining) —
    // longest keyword wins
    expect(guessCategory("uber eats delivery")?.id).toBe("dining_out");
  });

  it("returns null when nothing matches", () => {
    expect(guessCategory("xyzzy random stuff")).toBeNull();
  });

  it("is case-insensitive", () => {
    expect(guessCategory("LUNCH")?.id).toBe("dining_out");
  });
});
