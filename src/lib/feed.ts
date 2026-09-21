import type { FeedItem } from "./queries";

interface FeedGroup {
  id: string;
  name: string;
  baseCurrency: string;
}

interface FeedMember {
  id: string;
  user_id: string | null;
  name: string;
}

interface FeedExpense {
  id: string;
  group_id: string;
  title: string;
  base_amount: string | number;
  paid_by: string;
  created_at: string;
}

interface FeedSettlement {
  id: string;
  group_id: string;
  from_member: string;
  to_member: string;
  amount: string | number;
  currency: string;
  created_at: string;
}

const symbol = (c: string) => (c === "INR" ? "₹" : c === "MYR" ? "RM" : "$");

export function buildFeed(
  groups: FeedGroup[],
  members: FeedMember[],
  expenses: FeedExpense[],
  settlements: FeedSettlement[],
  currentUserId: string | undefined
): FeedItem[] {
  const groupById = new Map(groups.map((g) => [g.id, g]));
  const memberById = new Map(members.map((m) => [m.id, m]));
  const nameOf = (memberId: string) => {
    const m = memberById.get(memberId);
    if (!m) return "Someone";
    return m.user_id === currentUserId ? "You" : m.name;
  };
  const initialOf = (memberId: string) => nameOf(memberId)[0]?.toUpperCase() || "?";

  const feed: FeedItem[] = [];
  for (const e of expenses) {
    const g = groupById.get(e.group_id);
    if (!g) continue;
    feed.push({
      key: `e-${e.id}`,
      at: e.created_at,
      subject: nameOf(e.paid_by),
      initial: initialOf(e.paid_by),
      action: "added expense",
      detail: e.title,
      amount: `${symbol(g.baseCurrency)}${Number(e.base_amount).toLocaleString()}`,
      trip: g.name,
    });
  }
  for (const s of settlements) {
    const g = groupById.get(s.group_id);
    if (!g) continue;
    feed.push({
      key: `s-${s.id}`,
      at: s.created_at,
      subject: nameOf(s.from_member),
      initial: initialOf(s.from_member),
      action: "paid",
      detail: memberById.get(s.to_member)?.name || "someone",
      amount: `${symbol(s.currency)}${Number(s.amount).toLocaleString()}`,
      trip: g.name,
    });
  }
  return feed.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 30);
}
