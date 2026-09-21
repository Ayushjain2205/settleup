import { describe, expect, it } from "vitest";
import { mapGroupRows } from "./group-map";

describe("mapGroupRows", () => {
  it("computes totals and last activity date", () => {
    expect(
      mapGroupRows([
        {
          id: "g1",
          name: "Trip",
          base_currency: "INR",
          group_members: [{ id: "m1", avatar: "Y" }],
          expenses: [
            { base_amount: 100, expense_date: "2026-03-15" },
            { base_amount: 50.5, expense_date: "2026-03-18" },
          ],
        },
      ])
    ).toEqual([
      {
        id: "g1",
        name: "Trip",
        baseCurrency: "INR",
        members: [{ id: "m1", avatar: "Y" }],
        totalSpent: 150.5,
        lastDate: "2026-03-18",
      },
    ]);
  });

  it("handles empty groups and null joins", () => {
    expect(
      mapGroupRows([{ id: "g2", name: "Empty", base_currency: "MYR", group_members: null, expenses: null }])
    ).toEqual([
      { id: "g2", name: "Empty", baseCurrency: "MYR", members: [], totalSpent: 0, lastDate: null },
    ]);
  });

  it("handles string numerics from PostgREST", () => {
    const [g] = mapGroupRows([
      { id: "g3", name: "S", base_currency: "INR", group_members: [], expenses: [{ base_amount: "99.99", expense_date: null }] },
    ]);
    expect(g.totalSpent).toBe(99.99);
    expect(g.lastDate).toBeNull();
  });
});
