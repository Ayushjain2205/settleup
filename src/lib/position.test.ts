import { describe, expect, it } from "vitest";
import { computePosition } from "./position";

const MEMBERS = [
  { id: "m1", userId: "u1", name: "Ayush" },
  { id: "m2", userId: "u2", name: "Priya" },
  { id: "m3", userId: "u3", name: "Rahul" },
];

describe("computePosition", () => {
  it("finds my net and who I owe", () => {
    // m1 paid 90 split 3 ways → m1 +60, m2 -30, m3 -30
    const pos = computePosition(
      {
        members: MEMBERS,
        expenses: [{ paidBy: "m1", baseAmount: 90 }],
        splits: [
          { memberId: "m1", amountOwed: 30 },
          { memberId: "m2", amountOwed: 30 },
          { memberId: "m3", amountOwed: 30 },
        ],
        recorded: [],
        simplify: true,
        currency: "INR",
        fxRate: 1,
        currentUserId: "u2",
      },
      // names resolved separately; use ids as names via members without names
    );
    expect(pos.memberId).toBe("m2");
    expect(pos.net).toBe(-30);
    expect(pos.iOwe).toHaveLength(1);
    expect(pos.iOwe[0].amount).toBe(30);
    expect(pos.owesMe).toEqual([]);
  });

  it("finds who owes me", () => {
    const pos = computePosition({
      members: MEMBERS,
      expenses: [{ paidBy: "m1", baseAmount: 90 }],
      splits: [
        { memberId: "m1", amountOwed: 30 },
        { memberId: "m2", amountOwed: 30 },
        { memberId: "m3", amountOwed: 30 },
      ],
      recorded: [],
      fxRate: 1,
      simplify: true,
      currency: "INR",
      currentUserId: "u1",
    });
    expect(pos.net).toBe(60);
    expect(pos.owesMe).toHaveLength(2);
    expect(pos.iOwe).toEqual([]);
  });

  it("returns settled when balanced", () => {
    const pos = computePosition({
      members: MEMBERS,
      expenses: [],
      splits: [],
      recorded: [],
      fxRate: 1,
      simplify: true,
      currency: "INR",
      currentUserId: "u1",
    });
    expect(pos.net).toBe(0);
    expect(pos.iOwe).toEqual([]);
    expect(pos.owesMe).toEqual([]);
  });

  it("returns null member when I'm not in the group", () => {
    const pos = computePosition({
      members: MEMBERS,
      expenses: [{ paidBy: "m1", baseAmount: 100 }],
      splits: [{ memberId: "m1", amountOwed: 100 }],
      recorded: [],
      fxRate: 1,
      simplify: true,
      currency: "INR",
      currentUserId: "stranger",
    });
    expect(pos.memberId).toBeNull();
    expect(pos.net).toBe(0);
  });

  it("resolves counterparty names", () => {
    const pos = computePosition({
      members: [
        { id: "m1", userId: "u1", name: "Ayush" },
        { id: "m2", userId: "u2", name: "Priya" },
      ],
      expenses: [{ paidBy: "m2", baseAmount: 100 }],
      splits: [
        { memberId: "m1", amountOwed: 50 },
        { memberId: "m2", amountOwed: 50 },
      ],
      recorded: [],
      fxRate: 1,
      simplify: true,
      currency: "INR",
      currentUserId: "u1",
    });
    expect(pos.net).toBe(-50);
    expect(pos.iOwe[0].amount).toBe(50);
  });

  it("normalizes foreign recorded payments to base before adjusting", () => {
    // m1 owes 50; pays 2 USD @25 → settled
    const pos = computePosition({
      members: [
        { id: "m1", userId: "u1", name: "Ayush" },
        { id: "m2", userId: "u2", name: "Priya" },
      ],
      expenses: [{ paidBy: "m2", baseAmount: 100 }],
      splits: [
        { memberId: "m1", amountOwed: 50 },
        { memberId: "m2", amountOwed: 50 },
      ],
      recorded: [{ from: "m1", to: "m2", amount: 2, currency: "USD" }],
      fxRate: 25,
      simplify: true,
      currency: "INR",
      currentUserId: "u1",
    });
    expect(pos.net).toBe(0);
    expect(pos.iOwe).toEqual([]);
    expect(pos.owesMe).toEqual([]);
  });
});
