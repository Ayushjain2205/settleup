# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: Travel groups (friends, colleagues) tracking shared expenses during domestic or international trips. Starting with personal use among friend circles, designed to scale to broader audiences.

Job: Split costs transparently, settle debts with minimal transfers, handle dual-currency scenarios (local spend vs home currency settlement).

## Product Purpose

SettleUp eliminates the friction of group expense tracking during travel. It provides zero-paywall AI receipt scanning, dual-currency ledgers, and configurable debt simplification — all in a fast PWA without mandatory signups.

Success means: groups settle expenses in real-time during trips, no one loses track of who owes what, and settlement happens instantly via UPI or cash.

## Positioning

Unlike Splitwise or similar apps, SettleUp offers:
- **Zero paywalls** on AI receipt parsing and debt simplification
- **Dual-currency ledger** as a first-class feature (not an afterthought)
- **Flexible debt modes** — toggle between Min-Cash-Flow simplification and direct pairwise tracking per group
- **PWA-first** — no app store, instant access, works offline

## Operating Context

- Groups of 2-10+ travelers sharing expenses during trips
- Primary use case: Indian travelers spending in foreign currencies (MYR, THB, etc.) settling via INR/UPI
- Receipt scanning via phone camera at restaurants/venues
- Real-time expense entry while on the go
- Settlement via UPI deep links (GPay, PhonePe, Paytm) or cash marking

## Capabilities and Constraints

**Core capabilities (from PRD):**
- Group creation with currency configuration (base + spend currencies)
- Fixed or live exchange rate modes
- Expense entry with dual-currency display
- AI receipt scanning (Gemini Flash) with item-level splitting
- Two debt resolution algorithms: Min-Cash-Flow (simplified) vs Direct Pairwise
- 1-tap UPI payment links
- WhatsApp export summaries
- PWA with offline support

**Technical constraints:**
- Supabase for auth + PostgreSQL database
- Next.js framework (App Router)
- Gemini Flash for OCR/AI extraction
- UPI deep links for Indian payment settlement

**Undecided:**
- Specific exchange rate API provider
- Authentication method (email OTP, phone OTP, magic link?)
- Hosting/deployment target

## Brand Commitments

Name: SettleUp
No visual brand commitments yet — design from scratch.

## Evidence on Hand

- Full PRD at `docs/PRD.md` with detailed feature specs, database schema, and implementation roadmap
- No existing code, components, or design assets

## Product Principles

1. **Zero paywalls** — all core features (receipt scanning, debt simplification) are free
2. **Dual-currency first** — local spend and settlement currencies are distinct, first-class concepts
3. **Minimal transfers** — simplify debts by default to reduce settlement complexity
4. **Instant settlement** — one-tap UPI links, no friction to close debts
5. **PWA-native** — fast, installable, works offline, no app store dependency

## Accessibility & Inclusion

No specific requirements established yet. Standard web accessibility best practices should apply.
