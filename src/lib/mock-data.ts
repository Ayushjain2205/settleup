export interface Member {
  id: string;
  name: string;
  avatar: string;
  upiId?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  baseAmount: number;
  baseCurrency: string;
  paidBy: string;
  splitAmong: string[];
  splitType: "equal" | "exact" | "itemized";
  date: string;
  category: "food" | "transport" | "activity" | "accommodation" | "other";
}

export interface Balance {
  memberId: string;
  amount: number;
  currency: string;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
  currency: string;
}

export interface Trip {
  id: string;
  name: string;
  tripType: "domestic" | "international";
  baseCurrency: string;
  spendCurrency: string;
  fxMode: "fixed" | "live";
  fixedFxRate: number;
  simplifyDebts: boolean;
  members: Member[];
  expenses: Expense[];
  balances: Balance[];
  settlements: Settlement[];
}

export const MOCK_TRIP: Trip = {
  id: "malaysia-2026",
  name: "Malaysia Trip 2026",
  tripType: "international",
  baseCurrency: "INR",
  spendCurrency: "MYR",
  fxMode: "fixed",
  fixedFxRate: 19.2,
  simplifyDebts: true,
  members: [
    { id: "u1", name: "You", avatar: "Y", upiId: "you@upi" },
    { id: "u2", name: "Priya", avatar: "P", upiId: "priya@upi" },
    { id: "u3", name: "Rahul", avatar: "R", upiId: "rahul@upi" },
    { id: "u4", name: "Anita", avatar: "A", upiId: "anita@upi" },
  ],
  expenses: [
    { id: "e1", title: "Airport taxi to hotel", amount: 180, currency: "MYR", baseAmount: 3456, baseCurrency: "INR", paidBy: "u1", splitAmong: ["u1", "u2", "u3", "u4"], splitType: "equal", date: "2026-03-15", category: "transport" },
    { id: "e2", title: "Lunch at Nasi Kandar", amount: 85, currency: "MYR", baseAmount: 1632, baseCurrency: "INR", paidBy: "u2", splitAmong: ["u1", "u2", "u3", "u4"], splitType: "equal", date: "2026-03-15", category: "food" },
    { id: "e3", title: "Petronas Towers tickets", amount: 320, currency: "MYR", baseAmount: 6144, baseCurrency: "INR", paidBy: "u3", splitAmong: ["u1", "u2", "u3", "u4"], splitType: "equal", date: "2026-03-16", category: "activity" },
    { id: "e4", title: "Dinner at Jalan Alor", amount: 240, currency: "MYR", baseAmount: 4608, baseCurrency: "INR", paidBy: "u1", splitAmong: ["u1", "u2", "u3", "u4"], splitType: "equal", date: "2026-03-16", category: "food" },
    { id: "e5", title: "Grab to Batu Caves", amount: 95, currency: "MYR", baseAmount: 1824, baseCurrency: "INR", paidBy: "u4", splitAmong: ["u1", "u2", "u3", "u4"], splitType: "equal", date: "2026-03-17", category: "transport" },
    { id: "e6", title: "Hotel (2 nights)", amount: 580, currency: "MYR", baseAmount: 11136, baseCurrency: "INR", paidBy: "u2", splitAmong: ["u1", "u2", "u3", "u4"], splitType: "equal", date: "2026-03-15", category: "accommodation" },
    { id: "e7", title: "Shopping at Bukit Bintang", amount: 450, currency: "MYR", baseAmount: 8640, baseCurrency: "INR", paidBy: "u1", splitAmong: ["u1"], splitType: "exact", date: "2026-03-17", category: "other" },
    { id: "e8", title: "Street food tour", amount: 160, currency: "MYR", baseAmount: 3072, baseCurrency: "INR", paidBy: "u3", splitAmong: ["u1", "u2", "u3", "u4"], splitType: "equal", date: "2026-03-18", category: "food" },
  ],
  balances: [
    { memberId: "u1", amount: 1250, currency: "INR" },
    { memberId: "u2", amount: -890, currency: "INR" },
    { memberId: "u3", amount: -560, currency: "INR" },
    { memberId: "u4", amount: 200, currency: "INR" },
  ],
  settlements: [
    { from: "u2", to: "u1", amount: 890, currency: "INR" },
    { from: "u3", to: "u1", amount: 360, currency: "INR" },
  ],
};
