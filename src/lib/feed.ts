import { CATEGORIES } from "./categories";
import { Banknote } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FeedItem } from "./queries";

interface FeedGroup {
  id: string;
  name: string;
  baseCurrency: string;
}

interface FeedMember {
  id: string;
  group_id: string;
  user_id: string | null;
  name: string;
  avatar: string;
}

interface FeedExpense {
  id: string;
  group_id: string;
  title: string;
  base_amount: string | number;
  paid_by: string;
  category_id: string;
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

interface FeedSplit {
  expense_id: string;
  member_id: string;
  amount_owed: string | number;
}

const symbol = (c: string) => (c === "INR" ? "₹" : c === "MYR" ? "RM" : "$");

export function timeFull(iso: string): string {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days < 7) {
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    return `${weekday} at ${time}`;
  }
  const date = d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  return `${date} at ${time}`;
}

export interface EnrichedFeedItem extends FeedItem {
  /** "You paid ₹X" / "You owe ₹X" — null when it doesn't involve me */
  impact: { text: string; tone: "good" | "bad" } | null;
  /** Category id for the icon (expenses) or "cash" for settlements */
  icon: string;
  /** Avatar initial of the actor, shown as badge */
  actorAvatar: string;
}

const fmt = (currency: string, v: number) =>
  `${symbol(currency)}${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export function buildFeed(
  groups: FeedGroup[],
  members: FeedMember[],
  expenses: FeedExpense[],
  settlements: FeedSettlement[],
  splits: FeedSplit[],
  currentUserId: string | undefined
): EnrichedFeedItem[] {
  const groupById = new Map(groups.map((g) => [g.id, g]));
  const memberById = new Map(members.map((m) => [m.id, m]));
  const myMemberByGroup = new Map<string, string>();
  for (const m of members) {
    if (m.user_id && m.user_id === currentUserId) myMemberByGroup.set(m.group_id, m.id);
  }
  const nameOf = (memberId: string) => {
    const m = memberById.get(memberId);
    if (!m) return "Someone";
    return m.user_id === currentUserId ? "You" : m.name;
  };
  const avatarOf = (memberId: string) => {
    const m = memberById.get(memberId);
    return m ? m.avatar : "?";
  };
  const shareOf = (expenseId: string, myMemberId: string | undefined) => {
    if (!myMemberId) return 0;
    const s = splits.find((x) => x.expense_id === expenseId && x.member_id === myMemberId);
    return s ? Number(s.amount_owed) : 0;
  };

  const feed: EnrichedFeedItem[] = [];
  for (const e of expenses) {
    const g = groupById.get(e.group_id);
    if (!g) continue;
    const myShare = shareOf(e.id, myMemberByGroup.get(e.group_id));
    feed.push({
      key: `e-${e.id}`,
      at: e.created_at,
      subject: nameOf(e.paid_by),
      initial: avatarOf(e.paid_by),
      action: "added",
      detail: `“${e.title}” in “${g.name}”`,
      amount: null,
      trip: g.name,
      impact: myShare > 0 ? { text: `You owe ${fmt(g.baseCurrency, myShare)}`, tone: "bad" } : null,
      icon: e.category_id,
      actorAvatar: avatarOf(e.paid_by),
    });
  }
  for (const s of settlements) {
    const g = groupById.get(s.group_id);
    if (!g) continue;
    const myMemberId = myMemberByGroup.get(s.group_id);
    const amt = Number(s.amount);
    let impact: EnrichedFeedItem["impact"] = null;
    if (myMemberId && s.from_member === myMemberId) {
      impact = { text: `You paid ${fmt(s.currency, amt)}`, tone: "good" };
    } else if (myMemberId && s.to_member === myMemberId) {
      impact = { text: `You received ${fmt(s.currency, amt)}`, tone: "bad" };
    }
    feed.push({
      key: `s-${s.id}`,
      at: s.created_at,
      subject: nameOf(s.from_member),
      initial: avatarOf(s.from_member),
      action: "paid",
      detail: `${memberById.get(s.to_member)?.name || "someone"} in “${g.name}”`,
      amount: null,
      trip: g.name,
      impact,
      icon: "cash",
      actorAvatar: avatarOf(s.from_member),
    });
  }
  return feed.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 30);
}

export function categoryStyle(categoryId: string): string {
  if (categoryId === "cash") return "bg-[var(--success)]/10 text-[var(--success)]";
  return CATEGORIES.find((c) => c.id === categoryId)?.colorClass || "bg-stone-100 text-stone-600";
}

export function categoryIcon(categoryId: string): LucideIcon {
  if (categoryId === "cash") return Banknote;
  return CATEGORIES.find((c) => c.id === categoryId)?.Icon || Banknote;
}
