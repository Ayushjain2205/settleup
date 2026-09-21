# SettleUp

Group expense tracking PWA — zero paywalls, dual-currency ledgers, AI receipt scanning, and smart debt simplification. Built mobile-first with Next.js + Supabase.

## Features

- **Groups** — create, join via 6-letter code, invite by email with auto-claim
- **Expenses** — Splitwise-style flow: payer picker, equal / exact / percent / itemized splits
- **Receipt scan** — Gemini Flash extracts merchant, total, items, tax → prefilled itemized form
- **Smart settle** — greedy debt simplification, per-row payment recording with history
- **Dual currency** — spend in one, settle in another (fixed rate; live rates not connected)
- **Categories** — 30+ Lucide-icon categories with keyword auto-detection
- **Activity feed** — expenses + payments across all groups
- **PWA** — installable, splash screens, standalone, offline-tolerant shell

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Postgres + Auth) · TanStack Query v5 · Gemini API · Vitest

## Getting started

```bash
npm install
```

Create `.env.local` (gitignored — never commit):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
GEMINI_API_KEY=...            # Google AI Studio, receipt scanning only
GEMINI_MODEL=gemini-3.8-flash # optional override
```

```bash
npm run dev      # desktop dev (http://localhost:3000, or -p 4000)
npm test         # Vitest unit suite
npm run build && npm start -p 4000  # production — use this for phone testing
```

> **Phone testing rule: desktop = `next dev`, phone = `next start` (prod build).** Dev-mode untranspiled bundles break taps on iOS Safari. Serve prod, expose via tunnel, test.

## Supabase setup

Database lives in `supabase/migrations/` (versioned, applied in order):

| Migration | Contents |
|---|---|
| `20260921000000_settleup_schema` | groups, members, expenses, splits, settlements + RLS |
| `20260921000001_member_invites` | email column + invite claim policies |
| `20260921000002_join_codes` | join codes + `join_group` RPC |
| `20260921000003_save_expense_rpc` | atomic `save_expense` RPC |
| `20260921000004_indexes` | FK + lookup indexes |

Apply via the [Supabase MCP server](https://supabase.com/docs/guides/getting-started/mcp) (`supabase_apply_migration`) or `supabase db push`. RLS is membership-based throughout — no public reads; joins go through the `join_group` RPC so groups stay unlistable.

Auth: email + password (disable **Confirm email** in Dashboard → Auth → Providers → Email for frictionless dev).

## Architecture notes

- **Reads**: TanStack Query (`src/lib/queries.ts`) — per-entity keys, 30s stale time, refetch on window focus. Pure mapping lives in `group-map.ts` / `feed.ts` (unit-tested); components stay presentational.
- **Writes**: central mutations (`src/lib/mutations.ts`) with invalidation. Optimistic UI is the rule for deletes/records/adds (instant UI, revert on failure); expense save stays awaited since it navigates.
- **Money math** (`settlements.ts`, `splits.ts`): balances = paid − owed; greedy min-cash-flow simplification; all rounding to 2dp with remainder pinned so books always balance.
- **Errors**: PostgREST failures are plain objects, not `Error`s — `errorMessage()` (`lib/error.ts`) extracts real messages everywhere.
- **Haptics**: `navigator.vibrate()` on Android; iOS web has no API — springy toast + press states instead (top PWAs do the same; true buzz needs a native shell).
- **PWA**: `manifest.ts`, generated icons + iOS splash set, prod-only service worker (dev always hits network), `maximumScale: 1` viewport, `min-h-dvh` layouts.

## Phone testing via tunnel

```bash
cloudflared tunnel --url http://localhost:4000
```

Quick-tunnel URLs are random per run and die with sleep — for stability use a named tunnel or ngrok static domain. iOS startup images bind at install: delete + re-add the Home Screen icon after splash/manifest changes.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm test` | `vitest run` (44 tests) |
| `npm run lint` | ESLint |
