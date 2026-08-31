# Shepherd Staff — Product Requirements Document (PRD)

> Status: prototype / presentation build. No backend, no auth, no real DB.

## 1. Overview

Shepherd Staff (proposal name AgriTrack) is a mobile livestock-management app for small-scale and family farms. It replaces scattered paper records with a single phone-based system that owners and caretakers can share. Farmers manage cattle individually and chickens/pigs by batch/pen, while tracking age, health, feeding, expenses, and sale status — all offline-capable by design.

**Tagline:** Simple mobile records for the backyard farm.

## 2. Goals

1. Give farmers a convenient digital system for daily livestock management.
2. Support both individual and group/batch records in one app.
3. Track age (auto-calculated), quantity, location/pen, purpose, and notes.
4. Record livestock-related expenses (feed, medicine, supplies, maintenance, labor).
5. Let owners and caretakers coordinate on the same records.
6. Keep a history of important activities.
7. Surface summaries: head counts, expense totals, and breakdowns.

## 3. Non-Goals (for this prototype)

- Authentication / multi-user sync / roles.
- Real persistence (SQLite), backend, API, or cloud backup.
- Push notifications, offline sync, or analytics.
- Complex accounting, invoicing, or marketplace integration.

These are deferred; the architecture is designed to add them without rewriting screens.

## 4. Target Users

Small-scale and backyard farmers, family farms, farm caretakers, agricultural cooperatives and small agri-businesses — users who find Farmbrite / Herdwatch etc. too heavy and paper too fragmented.

## 5. Core Entities

| Entity | Description |
|---|---|
| **Livestock** | Individual (e.g. "Bessie") or group (e.g. "Laying Hens", 25 head). Fields: name, category (cattle/pig/chicken/goat/sheep/duck/other), type (individual/group), quantity, breed, sex (male/female/mixed), start date, location/pen, purpose, status, health notes, feeding records, expense links, free-form notes. |
| **Expense** | Date, category (feed/medicine/supplies/maintenance/labor/other), description, amount, optional livestock link, notes. |
| **Activity** | Timestamped log: livestock added, expense added, health note, status change, feeding, sale. Links to livestock/expense when relevant. |
| **Pen / Location** | Named area (pasture, pen, coop) with capacity and assigned livestock. |

Key invariants:
- Groups carry a `quantity`; individuals are `1`.
- Age is derived from `startDate` (years + months).
- Status values: `growing`, `breeding`, `for_sale`, `sold`, `deceased`, `active`.

## 6. Features (prototype scope)

### 6.1 Dashboard (Home)
- Greeting + stats: total head, group count, month expenses, active count, all-time spend.
- Quick actions: Add Animal, Add Expense, View All, Reports.
- Recent activity (5 most recent) with tap-through to detail.

### 6.2 Livestock
- List with search (name/breed/location) and category filter chips.
- Card per record: icon, name/breed/qty, status + category badges, location/age/purpose.
- Detail: badges, info grid (qty/age/location/purpose/sex/since/notes), health notes, feeding records, linked expenses + total, empty states.
- Add form (visual only): name, type (individual/group), category, breed, quantity, sex, location, purpose, status, notes.

### 6.3 Expenses
- Total card + count.
- Category grid (6 categories) showing totals; tap to filter.
- Sorted list (newest first) via `ExpenseItem`; per-item icon, description, date, notes, amount.
- Add form (visual only): description, amount, date, category, notes.

### 6.4 Reports
- Summary cards: total animals, total spent, record count, transaction count.
- Bar charts (simple width-based bars): livestock by category, expenses by category, livestock by status (with dot + %).

### 6.5 Activity & More
- Activity History grouped by date.
- More: profile placeholder, Farm Management / Data & Reports / Settings sections (mostly placeholders except Activity History link).

## 7. User Flows (happy paths for the demo)

1. **Home → Livestock → Detail → back** — browse and inspect a record.
2. **Add Animal** — open form, fill fields, Save (alert, no persistence).
3. **Expenses → filter → Add Expense → back.**
4. **Reports** — view counts and breakdowns.
5. **Activity** — scroll grouped history, tap to jump to livestock detail.

Every card/button that looks interactive navigates or shows an alert; no dead taps.

## 8. Data (prototype)

Static seed in `src/data/mock.ts`: 7 livestock (2 individual cattle, 2 chicken batches, 1 pig batch, 2 goat records), 12 expenses across categories, 12 activities, 4 pens. Accessed only via `features/*/services/`.

## 9. Success Criteria (prototype)

- Opens in Expo Go (SDK 54), navigates all tabs without crash.
- `npx tsc --noEmit` and `npx expo export --platform android` pass.
- Looks polished on a phone for a class presentation.

## 10. Future (post-prototype)

`expo-sqlite` for local persistence, optional account/sync, caretaker roles, pen management CRUD, photo attachments, and real reports/export.

## 11. Related / Alternatives

Farmbrite, Livestocked, Herdwatch, generic farm-management software, and paper notebooks. Differentiator: simple, mobile-first, individual + group in one app, owner + caretaker on the same records, usable offline.
