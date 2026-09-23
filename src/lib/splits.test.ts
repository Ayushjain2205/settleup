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
        adjustments: [],
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
      adjustments: [],
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
        adjustments: [],
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
        adjustments: [],
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
        adjustments: [],
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
        adjustments: [],
        toBase: double,
      })
    ).toEqual([
      { memberId: "a", amountOwed: 50 },
      { memberId: "b", amountOwed: 50 },
    ]);
  });

  it("distributes auto adjustments proportionally to item shares", () => {
    // a: 30, b: 60 of 90 → tax 9 splits 3/6
    expect(
      computeSplitOwes({
        mode: "itemized",
        baseAmount: 99,
        selected: [],
        exactAmounts: {},
        percentages: {},
        items: [
          { name: "Pizza", amount: "60", splitAmong: ["a", "b"] },
          { name: "Beer", amount: "30", splitAmong: ["b"] },
        ],
        adjustments: [{ name: "Tax", amount: "9", auto: true, splitAmong: ["a", "b"] }],
        toBase: identity,
      })
    ).toEqual([
      { memberId: "a", amountOwed: 33 },
      { memberId: "b", amountOwed: 66 },
    ]);
  });

  it("gives zero tax share to members with no items", () => {
    expect(
      computeSplitOwes({
        mode: "itemized",
        baseAmount: 110,
        selected: [],
        exactAmounts: {},
        percentages: {},
        items: [{ name: "Steak", amount: "100", splitAmong: ["a"] }],
        adjustments: [{ name: "Tax", amount: "10", auto: true, splitAmong: ["a", "b"] }],
        toBase: identity,
      })
    ).toEqual([
      { memberId: "a", amountOwed: 110 },
    ]);
  });

  it("splits custom adjustments equally among selected", () => {
    expect(
      computeSplitOwes({
        mode: "itemized",
        baseAmount: 110,
        selected: [],
        exactAmounts: {},
        percentages: {},
        items: [{ name: "Steak", amount: "100", splitAmong: ["a"] }],
        adjustments: [{ name: "Tip", amount: "10", auto: false, splitAmong: ["a", "b"] }],
        toBase: identity,
      })
    ).toEqual([
      { memberId: "a", amountOwed: 105 },
      { memberId: "b", amountOwed: 5 },
    ]);
  });

  it("handles negative discount adjustments proportionally", () => {
    expect(
      computeSplitOwes({
        mode: "itemized",
        baseAmount: 90,
        selected: [],
        exactAmounts: {},
        percentages: {},
        items: [{ name: "Shirt", amount: "100", splitAmong: ["a", "b"] }],
        adjustments: [{ name: "Discount", amount: "-10", auto: true, splitAmong: ["a", "b"] }],
        toBase: identity,
      })
    ).toEqual([
      { memberId: "a", amountOwed: 45 },
      { memberId: "b", amountOwed: 45 },
    ]);
  });

  it("does not compound multiple auto adjustments", () => {
    // tax 10 + tip 5 on 100/0 split → a: 110+5.5, b: 0
    const result = computeSplitOwes({
      mode: "itemized",
      baseAmount: 115,
      selected: [],
      exactAmounts: {},
      percentages: {},
      items: [{ name: "Steak", amount: "100", splitAmong: ["a"] }],
      adjustments: [
        { name: "Tax", amount: "10", auto: true, splitAmong: ["a"] },
        { name: "Tip", amount: "5", auto: true, splitAmong: ["a"] },
      ],
      toBase: identity,
    });
    expect(result).toEqual([{ memberId: "a", amountOwed: 115 }]);
  });
});
