import { describe, expect, it } from "vitest";
import { computeBalances, pairwiseDebts, simplifyDebts } from "./settlements";

describe("computeBalances", () => {
  it("nets paid minus owed per member", () => {
    const balances = computeBalances(
      ["a", "b"],
      [{ paidBy: "a", baseAmount: 100 }],
      [
        { memberId: "a", amountOwed: 50 },
        { memberId: "b", amountOwed: 50 },
      ],
      "INR"
    );
    expect(balances).toEqual([
      { memberId: "a", amount: 50, currency: "INR" },
      { memberId: "b", amount: -50, currency: "INR" },
    ]);
  });

  it("returns zero balances with no expenses", () => {
    const balances = computeBalances(["a", "b"], [], [], "INR");
    expect(balances).toEqual([
      { memberId: "a", amount: 0, currency: "INR" },
      { memberId: "b", amount: 0, currency: "INR" },
    ]);
  });

  it("ignores splits for unknown members", () => {
    const balances = computeBalances(
      ["a"],
      [{ paidBy: "a", baseAmount: 100 }],
      [{ memberId: "ghost", amountOwed: 40 }],
      "INR"
    );
    expect(balances).toEqual([{ memberId: "a", amount: 100, currency: "INR" }]);
  });

  it("rounds to 2 decimals", () => {
    const balances = computeBalances(
      ["a", "b", "c"],
      [{ paidBy: "a", baseAmount: 100 }],
      [
        { memberId: "a", amountOwed: 33.333 },
        { memberId: "b", amountOwed: 33.333 },
        { memberId: "c", amountOwed: 33.333 },
      ],
      "INR"
    );
    expect(balances.find((b) => b.memberId === "a")?.amount).toBe(66.67);
  });
});

describe("simplifyDebts", () => {
  it("settles a simple two-person debt", () => {
    const result = simplifyDebts(
      [
        { memberId: "a", amount: 50, currency: "INR" },
        { memberId: "b", amount: -50, currency: "INR" },
      ],
      "INR"
    );
    expect(result).toEqual([{ from: "b", to: "a", amount: 50, currency: "INR" }]);
  });

  it("collapses a chain into fewer transfers", () => {
    // a paid 90 split 3 ways: a +60, b -30, c -30
    const result = simplifyDebts(
      [
        { memberId: "a", amount: 60, currency: "INR" },
        { memberId: "b", amount: -30, currency: "INR" },
        { memberId: "c", amount: -30, currency: "INR" },
      ],
      "INR"
    );
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ from: "b", to: "a", amount: 30, currency: "INR" });
    expect(result).toContainEqual({ from: "c", to: "a", amount: 30, currency: "INR" });
  });

  it("matches creditors to debtors greedily", () => {
    const result = simplifyDebts(
      [
        { memberId: "a", amount: 100, currency: "INR" },
        { memberId: "b", amount: -60, currency: "INR" },
        { memberId: "c", amount: -40, currency: "INR" },
      ],
      "INR"
    );
    expect(result).toEqual([
      { from: "b", to: "a", amount: 60, currency: "INR" },
      { from: "c", to: "a", amount: 40, currency: "INR" },
    ]);
  });

  it("returns empty when everyone is settled", () => {
    expect(simplifyDebts([], "INR")).toEqual([]);
    expect(
      simplifyDebts(
        [
          { memberId: "a", amount: 0, currency: "INR" },
          { memberId: "b", amount: 0, currency: "INR" },
        ],
        "INR"
      )
    ).toEqual([]);
  });

  it("ignores dust under a paisa", () => {    const result = simplifyDebts(
      [
        { memberId: "a", amount: 0.005, currency: "INR" },
        { memberId: "b", amount: -0.005, currency: "INR" },
      ],
      "INR"
    );
    expect(result).toEqual([]);
  });
});

describe("pairwiseDebts", () => {
  it("nets opposite directions into a single delta per pair", () => {
    expect(
      pairwiseDebts(
        [
          { paidBy: "a", splits: [{ memberId: "a", amountOwed: 30 }, { memberId: "b", amountOwed: 30 }] },
          { paidBy: "b", splits: [{ memberId: "a", amountOwed: 10 }, { memberId: "b", amountOwed: 10 }] },
        ],
        "INR"
      )
    ).toEqual([{ from: "b", to: "a", amount: 20, currency: "INR" }]);
  });

  it("skips self-pairs and dust", () => {
    expect(
      pairwiseDebts([{ paidBy: "a", splits: [{ memberId: "a", amountOwed: 50 }] }], "INR")
    ).toEqual([]);
  });
});
