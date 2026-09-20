# Surface Brief: Group Settings

## Job and Audience

**Job:** Configure group preferences — toggle debt simplification, update FX rates, manage members, and share invite links.
**Audience:** Group admin or member accessing settings via the gear icon on the trip dashboard.
**Visitor mode:** Operate — configuration and management.

## Outcome and Proof

**Primary task:** View and modify group settings, see changes reflected in the trip.
**Success:** User can toggle debt mode, update FX rate, invite members, and understand what each setting does.
**Proof:** Settings page showing all configurable options with clear explanations.

## Selected Direction

**Mode:** Operate
**Visual tone:** Bold / Vibrant, Playful (consistent with wizard + dashboard)
**Thesis:** Settings should be clear and non-intimidating. Each option explains its impact. Changes feel reversible and safe.

**Structural idea:** Card-based sections, each owning one concern. Toggle switches for binary options. Inline editing for rates. Share/invite as a distinct section.

## Scope and Boundaries

**Fidelity:** Production-ready — all settings, toggles, explanations.
**Breadth:** Full settings page with all sections.
**Interactivity:** Toggles, inline editing, copy invite link, share QR.
**Target:** `/trip/[id]/settings` route.
**Untouched:** Member removal (danger zone), delete group, actual Supabase integration.
**Anti-goals:** No advanced admin panel, no role management, no audit logs.

## States and Ranges

**Settings to show:**
- Debt Simplification: ON/OFF toggle
- FX Mode: Fixed/Live toggle
- Fixed FX Rate: editable number
- Invite Link: display + copy + share
- Members: list with avatars

**States:**
- Default view (all settings displayed)
- Editing state (rate input focused)
- Copy success (invite link copied toast)

## Interaction and Layout

**Structure:** Single-column, card-based sections.

**Sections (top to bottom):**
1. **Debt Simplification** — Toggle + explanation
2. **Exchange Rate** — Mode toggle + rate input
3. **Invite Members** — Link display + copy + QR placeholder
4. **Members List** — Avatars + names

**Affordances:**
- Clear toggle switches with labels
- Inline rate editing with save/cancel
- One-tap copy invite link
- Back navigation to trip

**Feedback:**
- Toggle state change is immediate
- Copy shows "Copied!" toast
- Rate edit shows save/cancel

## Constraints and Open Decisions

**Platform:** Web (PWA)
**Framework:** Next.js
**Data:** Mock data integration
**Components:** Same design system

**Open decisions:**
- QR code generation (library choice)
- Member removal flow
- Actual invite link generation
