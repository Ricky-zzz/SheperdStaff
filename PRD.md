# Shepherd Staff — Product Requirements Document (PRD)

> Status: offline-first prototype / presentation build. Real local persistence (SQLite on device) and a local profile lock. No backend, no sync.

## 1. Overview

Shepherd Staff (proposal name AgriTrack) is a mobile livestock-management app for small-scale and family farms. It replaces scattered paper records with a single phone-based system that owners and caretakers can share. Farmers manage cattle individually and chickens/pigs by batch/pen, while tracking unique IDs, age, health, feeding, feed stock, expenses, income, tasks, and sale status — all fully offline.

**Tagline:** Simple mobile records for the backyard farm.

## 2. Goals

1. Give farmers a convenient digital system for daily livestock management.
2. Support both individual and group/batch records in one app, each with a unique Animal/Batch ID.
3. Track age (auto-calculated), quantity, location/pen, purpose, and notes.
4. Record livestock-related expenses (feed, medicine, supplies, maintenance, labor) and income (sales, milk, eggs, other).
5. Track feed stock in an inventory: restocking records a purchase expense; feeding deducts stock and records the consumed cost.
6. Keep a history of important activities.
7. Surface summaries: head counts, expense totals, purchase vs feed-used cost, profit by animal/type, and a shareable PDF report.

## 3. Non-Goals (for this prototype)

- Backend, multi-user sync, roles, or cloud backup.
- Real authentication (the lock is a local convenience gate, not security).
- Push notifications, offline sync, or analytics.
- Complex accounting, invoicing, or marketplace integration.

These are deferred; the architecture is designed to add them without rewriting screens.

## 4. Target Users

Small-scale and backyard farmers, family farms, farm caretakers, agricultural cooperatives and small agri-businesses — users who find Farmbrite / Herdwatch etc. too heavy and paper too fragmented.

## 5. Core Entities

| Entity | Description |
|---|---|
| **Livestock** | Individual ("Bessie") or group ("Laying Hens", 25 head). Fields: unique `code` (Animal ID / Batch ID), name, category (animal-type id), type (individual/group), quantity, breed, sex, start date, location, purpose, status, notes, health notes, feeding records (with optional inventory cost), expense links. |
| **Inventory Item (Feed)** | Feed stock: name, suitable animal types (empty = any), unit (kg/g/piece/bag/liter), quantity on hand, average unit cost. |
| **Stock Transaction** | Signed stock movement: `restock` (positive), `consume` (negative, linked to livestock + feeding), `adjustment`. Records unit cost, date, notes. |
| **Expense** | Date, category (feed/medicine/supplies/maintenance/labor/other), description, amount, optional livestock link, notes. Restock and opening-stock expenses are created automatically from inventory. Legacy records may carry `allocations` (old bulk split) — read-only. |
| **Income** | Date, category (sale/milk/eggs/other), description, amount, optional livestock link, notes. Sale can flip the record to `sold`. |
| **Task** | Title, due date/time, recurrence (none/daily/weekly/monthly), optional livestock link, status, notes. |
| **Activity** | Timestamped log: livestock added, expense added, health note, status change, feeding, sale. Links to livestock/expense when relevant. |
| **Animal Type** | User-managed type: name + color. Drives category chips, filters, and inventory compatibility. |
| **Location** | Named farm area (pasture, pen, coop) with notes. |
| **User Profile** | Single local profile: name, email, avatar, password hash + salt, theme, dark mode, color mode. |

Key invariants:
- Groups carry a `quantity`; individuals are `1`.
- Age is derived from `startDate` (years + months).
- Status values: `growing`, `breeding`, `for_sale`, `sold`, `deceased`, `active`.
- Every livestock record has a unique code (`CAT-A0001` individual, `CHK-B0001` group); generated on create, backfilled on migration.
- Feed stock can never go negative: consumption above remaining stock is rejected.
- Feed cost = consumed quantity × average unit cost at the time of feeding.

## 6. Features (prototype scope)

### 6.1 Onboarding & Lock
- First run: name, email, password (strength meter), theme + dark mode + color mode choice; seeds sample data.
- App unlocks with the password; "Log out" in the profile menu locks (data is kept).

### 6.2 Dashboard (Home)
- Greeting + stats: total head, group count, month expenses, active count, all-time spend.
- Quick actions: Add Animal, Add Expense, View All, Reports.
- Recent activity (5 most recent) with tap-through to detail.

### 6.3 Livestock
- List with search (name/breed/location/code) and type filter chips.
- Card per record: name, code, breed/qty, status + type badges, location/age/purpose.
- Detail: badges, info grid (code, qty, age, location, purpose, sex, since, notes), health notes, feeding records (amount + cost + "from inventory"), linked expenses + total cost (including feed), income, net profit.
- Add/edit form; code is generated on save (read-only afterwards). Status quick-switch chips.

### 6.4 Feed Inventory
- List with search and total stock value; low-stock badges (threshold 5).
- Detail: on-hand, unit cost, stock value, suitable types, notes, stock history (restock/consume).
- Item form: name, suitable animal types, unit, opening stock + cost (create only), notes. Deleting keeps recorded purchase expenses.
- Restock: quantity, total purchase cost (optional), date, notes; updates weighted-average cost and records a feed expense + activity.
- Feeding (from livestock detail): pick compatible feed, amount; validates remaining stock, deducts, appends the feeding to the livestock record with its cost, logs activity.

### 6.5 Expenses & Income
- Expenses: total card + count, category grid filter, newest-first list, add/edit form with optional livestock link; auto-created feed expenses from inventory. Legacy bulk-split expenses display their saved shares read-only.
- Income: list + filters, add/edit form with category, optional livestock link, and "mark as sold" toggle for sales.

### 6.6 Tasks
- Upcoming/completed lists, recurring tasks (completing creates the next), optional livestock link, date + time.

### 6.7 Reports
- Range presets (7 days / 30 days / this month / all time / custom).
- Summary cards: total animals, expenses (purchases), income, net profit. Profit = Income − Expenses − Feed used.
- Profit by animal type and by animal/group (tap through to detail); livestock by type/status; expenses by category.
- Share as PDF (expo-print + share sheet).

### 6.8 Activity & More
- Activity History grouped by date.
- More: profile card (avatar, name, email), Farm Management (animal types, locations, feed inventory, activity), Data & Reports (sample data, reset), Appearance (theme), password change, log out.

## 7. User Flows (happy paths for the demo)

1. **First run** — onboarding → password → theme → sample data seeded → dashboard.
2. **Unlock / Log out** — lock screen on relaunch; profile menu → Log out locks again.
3. **Restock → Feed → Report** — restock feed (expense recorded) → feed a group (stock deducted, cost on record) → reports show purchase vs feed-used and profit.
4. **Add Animal** — form → save → unique code generated → detail shows it.
5. **Expenses / Income** — searchable livestock picker links records to one animal/group.
6. **Reports** — ranges, breakdowns, PDF share.

Every card/button that looks interactive navigates or shows an alert; no dead taps.

## 8. Data (prototype)

- SQLite via `expo-sqlite`; schema + guarded migrations in `src/lib/db/schema.ts`.
- First run seeds sample data from `src/data/mock.ts` (livestock, expenses, activities, income, tasks, types, locations, inventory) through `src/lib/db/seed.ts`; skipped if data exists.
- More → "Load sample data" / "Reset demo" can re-seed or clear everything (including the profile, returning to onboarding).
- Screens never touch the DB directly: they call `features/*/services/`.

## 9. Success Criteria (prototype)

- Opens in Expo Go (SDK 54), navigates all tabs without crash.
- `npm run typecheck` and `npm run lint` pass.
- Looks polished on a phone for a class presentation, in both light and dark mode.

## 10. Future (post-prototype)

Backend + account/sync for owner/caretaker sharing, caretaker roles, push notifications, weighed feed amounts, pen management CRUD, photo attachments for livestock, and richer exports/analytics.
