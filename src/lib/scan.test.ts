import { describe, expect, it } from "vitest";
import { mapScanToLines } from "./scan";

const MEMBERS = ["u1", "u2", "u3"];

describe("mapScanToLines", () => {
  it("maps items to lines shared among all members", () => {
    expect(
      mapScanToLines(
        { merchant: "Nasi Kandar", total: 100, date: null, items: [{ name: "Rice", amount: 60 }], adjustments: [] },
        MEMBERS
      )
    ).toEqual([{ name: "Rice", amount: "60", splitAmong: MEMBERS }]);
  });

  it("appends adjustments as ordinary shared lines", () => {
    expect(
      mapScanToLines(
        {
          merchant: "Cafe",
          total: 115,
          date: "2026-03-15",
          items: [{ name: "Pizza", amount: 100 }],
          adjustments: [
            { label: "Tax 8%", amount: 8 },
            { label: "Tip", amount: 7 },
          ],
        },
        MEMBERS
      ).map((l) => l.name)
    ).toEqual(["Pizza", "Tax 8%", "Tip"]);
  });

  it("keeps discounts as negative lines", () => {
    const lines = mapScanToLines(
      {
        merchant: "Store",
        total: 90,
        date: null,
        items: [{ name: "Shirt", amount: 100 }],
        adjustments: [{ label: "Discount", amount: -10 }],
      },
      MEMBERS
    );
    expect(lines).toHaveLength(2);
    expect(lines[1]).toEqual({ name: "Discount", amount: "-10", splitAmong: MEMBERS });
  });

  it("drops blank names, zero items, and NaN adjustments", () => {
    expect(
      mapScanToLines(
        {
          merchant: "X",
          total: 0,
          date: null,
          items: [{ name: "  ", amount: 10 }, { name: "Free", amount: 0 }],
          adjustments: [{ label: "Weird", amount: NaN }],
        },
        MEMBERS
      )
    ).toEqual([]);
  });
});
