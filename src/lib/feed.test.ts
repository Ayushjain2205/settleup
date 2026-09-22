import { describe, expect, it } from "vitest";
import { Banknote } from "lucide-react";
import { buildFeed, categoryIcon, categoryStyle, timeFull } from "./feed";

const GROUPS = [{ id: "g1", name: "Trip", baseCurrency: "INR" }];
const MEMBERS = [
  { id: "m1", group_id: "g1", user_id: "u1", name: "Ayush", avatar: "A" },
  { id: "m2", group_id: "g1", user_id: null, name: "Priya", avatar: "P" },
];
const EXPENSES = [
  { id: "e1", group_id: "g1", title: "Lunch", base_amount: 500, paid_by: "m1", category_id: "dining_out", created_at: "2026-03-15T10:00:00Z" },
];
const SPLITS = [
  { expense_id: "e1", member_id: "m1", amount_owed: 250 },
  { expense_id: "e1", member_id: "m2", amount_owed: 250 },
];

describe("buildFeed", () => {
  it("shows my share as impact on expenses I split", () => {
    const [item] = buildFeed(GROUPS, MEMBERS, EXPENSES, [], SPLITS, "u1");
    expect(item.subject).toBe("You");
    expect(item.detail).toBe("“Lunch” in “Trip”");
    expect(item.impact).toEqual({ text: "You owe ₹250", tone: "bad" });
    expect(item.icon).toBe("dining_out");
    expect(item.actorAvatar).toBe("T");
  });

  it("shows no impact when I'm not in the split", () => {
    const [item] = buildFeed(GROUPS, MEMBERS, EXPENSES, [], [], "u1");
    expect(item.impact).toBeNull();
  });

  it("shows paid/received impact on settlements", () => {
    const settlements = [
      { id: "s1", group_id: "g1", from_member: "m1", to_member: "m2", amount: 100, currency: "INR", created_at: "2026-03-16T10:00:00Z" },
      { id: "s2", group_id: "g1", from_member: "m2", to_member: "m1", amount: 50, currency: "INR", created_at: "2026-03-17T10:00:00Z" },
    ];
    const feed = buildFeed(GROUPS, MEMBERS, [], settlements, [], "u1");
    expect(feed[0].impact).toEqual({ text: "You received ₹50", tone: "bad" });
    expect(feed[1].impact).toEqual({ text: "You paid ₹100", tone: "good" });
    expect(feed[0].icon).toBe("cash");
  });

  it("sorts newest first and caps at 30", () => {
    const expenses = Array.from({ length: 40 }, (_, i) => ({
      id: `e${i}`,
      group_id: "g1",
      title: `E${i}`,
      base_amount: 1,
      paid_by: "m1",
      category_id: "other",
      created_at: `2026-03-${String((i % 28) + 1).padStart(2, "0")}T10:00:00Z`,
    }));
    const feed = buildFeed(GROUPS, MEMBERS, expenses, [], [], "u1");
    expect(feed).toHaveLength(30);
    expect(feed[0].at >= feed[1].at).toBe(true);
  });

  it("drops unknown groups and unknowns members gracefully", () => {
    const feed = buildFeed(
      GROUPS,
      [],
      [{ id: "e9", group_id: "nope", title: "X", base_amount: 10, paid_by: "m1", category_id: "other", created_at: "2026-03-15T10:00:00Z" }],
      [],
      [],
      "u1"
    );
    expect(feed).toEqual([]);
  });
});

describe("timeFull", () => {
  it("says weekday for recent, full date for older", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
    expect(timeFull(twoHoursAgo)).toMatch(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) at /);
    expect(timeFull("2026-01-05T09:07:00Z")).toMatch(/Jan 5, 2026 at /);
  });
});

describe("categoryStyle / categoryIcon", () => {
  it("resolves known categories and falls back", () => {
    expect(categoryStyle("dining_out")).toContain("orange");
    expect(categoryStyle("cash")).toContain("success");
    expect(categoryStyle("nope")).toContain("stone");
    expect(categoryIcon("cash")).toBe(Banknote);
    expect(categoryIcon("nope")).toBe(Banknote);
  });
});
