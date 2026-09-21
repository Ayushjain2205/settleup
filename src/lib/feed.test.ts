import { describe, expect, it } from "vitest";
import { buildFeed } from "./feed";

const GROUPS = [{ id: "g1", name: "Trip", baseCurrency: "INR" }];
const MEMBERS = [
  { id: "m1", user_id: "u1", name: "Ayush" },
  { id: "m2", user_id: null, name: "Priya" },
];

describe("buildFeed", () => {
  it("merges expenses and settlements newest-first", () => {
    const feed = buildFeed(
      GROUPS,
      MEMBERS,
      [{ id: "e1", group_id: "g1", title: "Lunch", base_amount: 500, paid_by: "m1", created_at: "2026-03-15T10:00:00Z" }],
      [{ id: "s1", group_id: "g1", from_member: "m2", to_member: "m1", amount: 250, currency: "INR", created_at: "2026-03-16T10:00:00Z" }],
      "u1"
    );
    expect(feed.map((f) => f.key)).toEqual(["s-s1", "e-e1"]);
    expect(feed[0]).toMatchObject({ subject: "Priya", action: "paid", detail: "Ayush", trip: "Trip" });
    expect(feed[1]).toMatchObject({ subject: "You", action: "added expense", detail: "Lunch", amount: "₹500" });
  });

  it("labels current user as You with initial", () => {
    const [item] = buildFeed(GROUPS, MEMBERS, [], [], "u9");
    expect(item).toBeUndefined();
    const feed = buildFeed(
      GROUPS,
      MEMBERS,
      [{ id: "e1", group_id: "g1", title: "X", base_amount: 10, paid_by: "m2", created_at: "2026-03-15T10:00:00Z" }],
      [],
      "u9"
    );
    expect(feed[0].subject).toBe("Priya");
    expect(feed[0].initial).toBe("P");
  });

  it("drops rows for unknown groups and unknowns members gracefully", () => {
    const feed = buildFeed(
      GROUPS,
      [],
      [
        { id: "e1", group_id: "nope", title: "X", base_amount: 10, paid_by: "m1", created_at: "2026-03-15T10:00:00Z" },
        { id: "e2", group_id: "g1", title: "Y", base_amount: 10, paid_by: "ghost", created_at: "2026-03-16T10:00:00Z" },
      ],
      [],
      "u1"
    );
    expect(feed.map((f) => f.key)).toEqual(["e-e2"]);
    expect(feed[0].subject).toBe("Someone");
  });

  it("caps at 30 items", () => {
    const expenses = Array.from({ length: 40 }, (_, i) => ({
      id: `e${i}`,
      group_id: "g1",
      title: `E${i}`,
      base_amount: 1,
      paid_by: "m1",
      created_at: `2026-03-${String((i % 28) + 1).padStart(2, "0")}T10:00:00Z`,
    }));
    expect(buildFeed(GROUPS, MEMBERS, expenses, [], "u1")).toHaveLength(30);
  });
});
