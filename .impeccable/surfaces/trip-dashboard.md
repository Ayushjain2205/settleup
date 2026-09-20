# Surface Brief: Trip Dashboard

## Job and Audience

**Job:** View and manage an active trip — see expenses, track balances, settle up, and configure group settings.
**Audience:** Trip member (primary) checking in during/after the trip to see who paid what, who owes whom, and to settle debts.
**Visitor mode:** Operate — monitoring and acting on group expense state.

## Outcome and Proof

**Primary task:** See all expenses at a glance, understand net balances, and settle debts.
**Success:** User can quickly answer "Who owes what?" and take action (settle, add expense, invite).
**Proof:** Realistic Malaysian trip — 4 members, 8-12 expenses in MYR/INR, showing actual balances and settlement options.

## Selected Direction

**Mode:** Operate
**Visual tone:** Bold / Vibrant, Playful (consistent with wizard)
**Thesis:** Financial clarity without financial anxiety. The dashboard should feel like checking in on a shared adventure, not reviewing a bank statement.

**Structural idea:** Card-based layout with clear hierarchy: trip header → quick actions → expenses feed → balances sidebar. The "Settle Up" action should be prominent and feel rewarding.

## Scope and Boundaries

**Fidelity:** Production-ready — all sections, real content, responsive.
**Breadth:** Full dashboard page with all sub-sections.
**Interactivity:** Tab switching (Expenses/Balances/Settle), expense list with filters, balance cards, settle up modal.
**Target:** `/trip/[id]` route.
**Untouched:** Individual expense detail view, receipt scanning, member management (separate flows).
**Anti-goals:** No dense tables, no spreadsheet feel, no banking UI patterns.

## States and Ranges

**Content ranges:**
- Trip duration: 3-14 days
- Members: 2-10
- Expenses: 5-50+ per trip
- Amounts: $5-$500 per expense

**States to handle:**
- Loading (fetching trip data)
- Empty state (new trip, no expenses yet)
- Populated state (multiple expenses, active balances)
- Settled state (all debts cleared)

## Interaction and Layout

**Structure:** Full-width layout with sidebar on desktop, stacked on mobile.

**Sections:**
1. **Trip Header:** Name, dates, member avatars, settings gear, invite button
2. **Quick Actions:** Add Expense (primary), Settle Up (secondary), Export
3. **Tab Navigation:** Expenses | Balances | Settle
4. **Expenses Feed:** Scrollable list with date grouping, amount, paid by, split info
5. **Balances Sidebar:** Member cards showing net balance (owes/owed), settle button
6. **Settle Tab:** Minimized transfer graph showing who pays whom

**Affordances:**
- Sticky header with trip name
- Floating "Add Expense" button
- Tap expense to see details
- Swipe or tap to mark as settled
- Pull to refresh

**Transitions:**
- Tab switch: content fade
- Expense add: slide in from bottom
- Settle: confirmation animation

## Constraints and Open Decisions

**Platform:** Web (PWA)
**Framework:** Next.js + Supabase
**Data:** Mock data for now (no DB yet) — realistic Malaysian trip content
**Components:** Same design system as wizard (purple/teal palette, rounded corners)

**Open decisions:**
- Exact settle up flow (UPI integration later)
- Receipt image display in expenses
- Real-time updates via Supabase subscriptions
