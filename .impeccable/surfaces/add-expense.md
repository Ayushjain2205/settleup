# Surface Brief: Add Expense

## Job and Audience

**Job:** Add a new expense to the trip — capture amount, who paid, how it's split, and optionally scan a receipt.
**Audience:** Trip member who just paid for something and wants to log it quickly.
**Visitor mode:** Operate — quick data entry, in and out.

## Outcome and Proof

**Primary task:** Fill form → expense appears in trip dashboard.
**Success:** Expense logged with correct currency, amount, payer, and split in under 30 seconds.
**Proof:** Realistic example — "Lunch at Nasi Kandar, RM 85, paid by Priya, split 4 ways."

## Selected Direction

**Mode:** Operate
**Visual tone:** Bold / Vibrant, Playful (consistent with wizard + dashboard)
**Thesis:** Expense entry should feel like a quick note, not a form. Minimize friction — smart defaults, minimal taps.

**Structural idea:** Single-page form with progressive complexity. Default to equal split (most common). Currency auto-fills from trip settings. Receipt scan is optional, triggered by camera icon.

## Scope and Boundaries

**Fidelity:** Production-ready — all fields, validation, split options.
**Breadth:** Full expense entry form with split allocation.
**Interactivity:** Form fields, currency toggle, split mode switcher, receipt capture placeholder.
**Target:** `/trip/[id]/expenses/new` route.
**Untouched:** Receipt OCR processing (placeholder only), expense editing, receipt image display.
**Anti-goals:** No multi-step wizard for expenses — keep it single-page and fast.

## States and Ranges

**Content ranges:**
- Amount: $0.01-$99,999
- Title: 1-100 chars
- Split: 2-20 members

**States to handle:**
- Empty form with smart defaults
- Filling state (in-progress)
- Validation errors (missing amount, no members selected)
- Success (expense added, redirect to dashboard)

## Interaction and Layout

**Structure:** Single-column form, centered, max-width ~480px.

**Fields (top to bottom):**
1. Amount input (large, prominent, auto-focused)
2. Currency toggle (trip's spend/base currency)
3. Title input
4. Paid by selector (member chips)
5. Split mode toggle (Equal / Exact / Itemized)
6. Split details (based on mode)
7. Receipt scan button (camera icon, optional)
8. Add Expense button

**Affordances:**
- Large amount input with currency symbol
- One-tap member selection
- Smart split defaults (equal, all members)
- Receipt capture as optional action
- Keyboard: Enter to submit

**Feedback:**
- Inline validation on blur
- Success toast + redirect
- Amount preview in both currencies

## Constraints and Open Decisions

**Platform:** Web (PWA)
**Framework:** Next.js
**Data:** Mock data integration, no DB yet
**Components:** Same design system

**Open decisions:**
- Exact receipt scan UX (camera vs file upload)
- Itemized split UI (dishes list vs simple allocation)
