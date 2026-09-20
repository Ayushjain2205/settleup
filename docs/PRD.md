# Product Requirements Document (PRD): SettleUp

---

## 1. Executive Summary & Problem Statement

### 1.1 Overview

**SettleUp** is a fast, zero-bloat Progressive Web App (PWA) designed for group expense tracking on domestic and international trips. It eliminates paywalls on receipt scanning and debt simplification, provides dual-currency tracking, and offers a frictionless onboarding experience without mandatory password setups.

### 1.2 Target Audience

* Groups traveling internationally or domestically who want transparent expense sharing.
* Primary launch use-case: Travel groups spending in local foreign currencies (e.g., `MYR`) while settling via home currency (e.g., `INR` via UPI).

### 1.3 Core Value Propositions

1. **Zero Paywalls:** Built-in AI receipt parsing and debt minimization with zero feature gating.
2. **Dual-Currency Ledger:** Distinct separation between local transaction currencies and the final settlement currency.
3. **Flexible Settlement Modes:** Configurable debt simplification (Min-Cash-Flow vs. Direct Pairwise) customizable per group.

---

## 2. Group Configuration & Settings

### 2.1 Group Creation Modal (`/groups/new`)

When creating a group, the creator configures the foundational ledger rules:

1. **Basic Info:**
* Group Name (e.g., *Malaysia Trip 2026*).
* Group Type: `[ Domestic 🏠 | International ✈️ ]`.


2. **Currency & FX Engine (if International):**
* **Base Settlement Currency:** The currency debts resolve in (e.g., `INR`).
* **Default Spend Currency:** Pre-selected currency for logging expenses (e.g., `MYR`).
* **Exchange Rate Mode:**
* **Fixed Rate (Default):** Set locked rate (`1 MYR = 19.20 INR`). Pre-filled from mid-market exchange rate API with manual adjustment.
* **Daily Live Rate:** Fetches mid-market rate on the transaction date.




3. **Settlement & Debt Mode (New):**
* **Simplify Debts Toggle (Default: ON):**
* **ON (Simplified):** Uses the greedy Min-Cash-Flow algorithm. Minimizes the total number of transactions across the group (e.g., resolves circular debts so $N$ members settle in $\le N-1$ transfers).
* **OFF (Direct / Pairwise):** Preserves strict 1:1 debts between the exact person who paid and the person who owes. No debt restructuring between third parties.


* Helper text: *"Simplifying debts reduces the number of payments needed to zero out balances without changing anyone's net total."*



---

### 2.2 Group Settings & Preferences (`/trip/[id]/settings`)

Accessible anytime by group admins/members via the gear icon:

* **Debt Simplification Control:**
* Toggle **"Simplify Group Debts"** ON or OFF at any point.
* Switching modes recalculates the "Settle Up" tab instantly:
* Switching to **OFF** reveals the full unsimplified pairwise ledger.
* Switching to **ON** consolidates balances into the minimum transfer graph.




* **FX Rate Management:**
* Toggle between Fixed Rate and Daily Live Rate.
* Update the fixed exchange multiplier.
* Update scope modal: `[ Apply to future expenses only ]` vs `[ Recalculate all past expenses ]`.


* **Member Controls:** Invite links, QR codes, and default UPI handle configuration.

---

## 3. Expense Entry & Splitting Engine

### 3.1 Adding an Expense

* **Currency Selector:** Defaults to group's Default Spend Currency (`MYR`), with quick toggle to Base Currency (`INR`).
* **Conversion Display:** Live inline preview (`RM 150 ≈ ₹2,880.00 @ 19.20`).
* **Bank Debit Override:** Optional field allowing users to input the exact amount debited on their forex/credit card.
* **Split Allocation:** Equal split (default), exact amounts, or itemized dish allocation.

### 3.2 Multimodal AI Receipt Scanning

* **Capture Interface:** Direct camera launch via `<input type="file" capture="environment">`.
* **OCR Output:** Automatically identifies merchant, line items, VAT/service charge, and grand total.
* **Interactive Dish Claiming:** Tap items to assign to specific members; shared fees (taxes, tips) distribute proportionally based on individual subtotals.

---

## 4. Debt Resolution & Settle Up Architecture

### 4.1 Debt Calculation Models

$$\text{Net Balance}_i = \sum \text{Amount Paid}_i - \sum \text{Share Owed}_i$$

* **When Simplify Debts is ON:**
1. Calculate net balances for all group members.
2. Partition into Creditors ($\text{Balance} > 0$) and Debtors ($\text{Balance} < 0$).
3. Execute Min-Cash-Flow matching: greedily match the largest debtor with the largest creditor until all accounts reach zero.


* **When Simplify Debts is OFF (Direct):**
1. Compute pairwise debt matrix $D[A][B]$ (amount $A$ owes $B$ directly).
2. Net out direct mutual debts ($A \rightarrow B$ vs $B \rightarrow A$).
3. Display direct bilateral debts without routing funds through third parties.




### 4.2 Settlement Execution

* **1-Tap UPI Intent:** Generates pre-filled UPI links (`upi://pay?pa={upi_id}&am={amount}&cu=INR`) launching GPay, PhonePe, or Paytm.
* **Cash / External Settlement:** Single-tap "Mark as Settled" to log balancing records.
* **Export Summary:** Formatted export button generating an instant WhatsApp markdown report.

---

## 5. Technical Architecture & Data Model Updates

```sql
-- Updated groups table schema
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trip_type text default 'international' check (trip_type in ('domestic', 'international')),
  base_currency text not null default 'INR',
  spend_currency text not null default 'MYR',
  fx_mode text not null default 'fixed' check (fx_mode in ('fixed', 'live')),
  fixed_fx_rate numeric(10, 4) default 19.20,
  simplify_debts boolean not null default true, -- controls Min-Cash-Flow vs Direct
  invite_code text unique default substring(md5(random()::text), 1, 8),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

```

---

## 6. Implementation Roadmap

* **Phase 1 (Core Schema & Ledger):** Implement group creation with currency toggles, the `simplify_debts` flag, and the dual settlement calculation engines.
* **Phase 2 (Settings & Live Recalculation):** Build group settings to dynamically switch simplification modes and update FX rates.
* **Phase 3 (AI Scanner & Splitting):** Connect camera capture to Gemini Flash structured extraction and implement proportional dish claiming.
* **Phase 4 (PWA & Offline):** Configure Service Worker caching, web app manifest, and UPI deep link generation.

---

For a walkthrough on how groups toggle debt minimization in standard expense trackers, refer to this guide on [Splitwise Simplify Group Debts](https://www.youtube.com/watch?v=B5RLX0jGoOU&utm_source=gemini). This demonstrates how users access and toggle debt simplification within group settings.
