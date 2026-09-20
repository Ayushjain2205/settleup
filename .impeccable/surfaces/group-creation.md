# Surface Brief: Group Creation

## Job and Audience

**Job:** Create a new expense-sharing group with currency configuration, debt mode, and settings.
**Audience:** Trip organizer (primary user) setting up a group for 2-10+ travelers. They're in planning mode, before or at the start of a trip. They want to configure once and start adding expenses immediately.
**Visitor mode:** Operate — completing a task, not browsing or deciding.

## Outcome and Proof

**Primary task:** Complete 3-step wizard → land on trip dashboard with group ready.
**Success:** Group created with correct currencies, FX mode, and debt simplification setting. User sees the new trip and can add their first expense.
**Proof:** Realistic Malaysian trip example — "Malaysia Trip 2026", International, INR base, MYR spend, Fixed Rate 19.20, Simplify Debts ON.

## Selected Direction

**Mode:** Operate
**Visual tone:** Bold / Vibrant, Playful
**Thesis:** A financial tool that doesn't feel like a financial tool. Travel energy meets transactional clarity. The wizard should feel like planning a trip, not filling out a bank form.

**Structural idea:** Progressively disclose complexity. Each step reveals only what's needed next. Currencies and FX feel like travel choices, not accounting inputs. The debt simplification toggle should feel empowering — "we'll handle the math" — not technical.

## Scope and Boundaries

**Fidelity:** Production-ready — all states, all interactions, real content.
**Breadth:** Full wizard flow (3 steps) + success state landing on dashboard.
**Interactivity:** Complete — step transitions, form validation, toggle states, loading/success.
**Target:** `/groups/new` route.
**Untouched:** Dashboard layout, expense entry, settlement views — those are separate surfaces.
**Anti-goals:** No dense data tables, no spreadsheets, no banking UI patterns.

## States and Ranges

**Content ranges:**
- Group name: 4-40 chars ("MY Trip" to "Malaysia & Thailand Adventure 2026")
- Currencies: Major world currencies (INR, MYR, THB, USD, EUR, etc.)
- FX rate: 0.01-999.99 (realistic: 0.5-50 range)
- Members: invited after creation, not during

**States to handle:**
- Empty state (all fields blank, defaults shown)
- Filling state (in-progress, step indicators)
- Validation errors (empty name, invalid rate)
- Loading (group being created)
- Success (transition to dashboard)

## Interaction and Layout

**Structure:** 3-step wizard with progress indicator.
- Step 1: Name + Trip Type (Domestic / International)
- Step 2: Currency Setup (base + spend + FX mode + rate) — only if International
- Step 3: Debt Mode (Simplify ON/OFF) + Review + Create

**Hierarchy:** Wizard dominates the page. Minimal chrome. Step indicator at top, content in center, primary action at bottom.

**Affordances:**
- Clear step indicator (1/2/3 with labels)
- Back/Next buttons with keyboard support
- Currency selector as searchable dropdown
- FX rate as inline editable field with live preview
- Debt toggle with clear ON/OFF visual state + helper text
- Create button as final CTA

**Feedback:**
- Inline validation on blur
- Success animation → redirect to dashboard
- Error state with retry

**Transitions:**
- Step transitions: slide or fade (not jarring)
- Success: celebratory micro-animation

## Constraints and Open Decisions

**Platform:** Web (PWA)
**Framework:** Next.js + Supabase (App Router)
**Accessibility:** Standard web a11y — keyboard nav, screen reader labels, focus management between steps
**Localization:** English only for now
**Components:** Build custom — no component library specified yet

**Open decisions:**
- Exact animation style (to be resolved in implementation)
- Currency list source (static vs API)
- Auth flow (user creates group as guest or must sign in first?)
