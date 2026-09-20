import { describe, expect, it } from "vitest";
import { computeSplitOwes } from "./splits";

const identity = (v: number) => v;
const double = (v: number) => v * 2;

describe("computeSplitOwes", () => {
  it("splits equally among selected members", () => {
    expect(
      computeSplitOwes({
        mode: "equal",
        baseAmount: 100,
        selected: ["a", "b", "c", "d"],
        exactAmounts: {},
        percentages: {},
        items: [],
        toBase: identity,
      })
    ).toEqual([
      { memberId: "a", amountOwed: 25 },
      { memberId: "b", amountOwed: 25 },
      { memberId: "c", amountOwed: 25 },
      { memberId: "d", amountOwed: 25 },
    ]);
  });

  it("rounds equal shares to 2 decimals", () => {
    const result = computeSplitOwes({
      mode: "equal",
      baseAmount: 100,
      selected: ["a", "b", "c"],
      exactAmounts: {},
      percentages: {},
      items: [],
      toBase: identity,
    });
    expect(result).toEqual([
      { memberId: "a", amountOwed: 33.33 },
      { memberId: "b", amountOwed: 33.33 },
      { memberId: "c", amountOwed: 33.33 },
    ]);
  });

  it("uses exact amounts converted to base", () => {
    expect(
      computeSplitOwes({
        mode: "exact",
        baseAmount: 200,
        selected: [],
        exactAmounts: { a: "60", b: "40", c: "0", d: "" },
        percentages: {},
        items: [],
        toBase: double,
      })
    ).toEqual([
      { memberId: "a", amountOwed: 120 },
      { memberId: "b", amountOwed: 80 },
    ]);
  });

  it("uses percentages of the base total", () => {
    expect(
      computeSplitOwes({
        mode: "percent",
        baseAmount: 200,
        selected: [],
        exactAmounts: {},
        percentages: { a: "50", b: "25", c: "25", d: "0" },
        items: [],
        toBase: identity,
      })
    ).toEqual([
      { memberId: "a", amountOwed: 100 },
      { memberId: "b", amountOwed: 50 },
      { memberId: "c", amountOwed: 50 },
    ]);
  });

  it("collapses itemized items into per-member totals", () => {
    expect(
      computeSplitOwes({
        mode: "itemized",
        baseAmount: 90,
        selected: [],
        exactAmounts: {},
        percentages: {},
        items: [
          { name: "Pizza", amount: "60", splitAmong: ["a", "b"] },
          { name: "Beer", amount: "30", splitAmong: ["b"] },
        ],
        toBase: identity,
      })
    ).toEqual([
      { memberId: "a", amountOwed: 30 },
      { memberId: "b", amountOwed: 60 },
    ]);
  });

  it("converts itemized amounts to base and skips empty splits", () => {
    expect(
      computeSplitOwes({
        mode: "itemized",
        baseAmount: 100,
        selected: [],
        exactAmounts: {},
        percentages: {},
        items: [
          { name: "Nasi", amount: "50", splitAmong: ["a", "b"] },
          { name: "Mystery", amount: "20", splitAmong: [] },
        ],
        toBase: double,
      })
    ).toEqual([
      { memberId: "a", amountOwed: 50 },
      { memberId: "b", amountOwed: 50 },
    ]);
  });
});
