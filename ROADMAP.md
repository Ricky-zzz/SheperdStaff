# Shepherd Staff — Roadmap to Beta (v1)

> Beta = **single-device, offline, no accounts, Android-only**. Scope locked from your answers: no pen/location CRUD (free-text stays), full edit/delete for animals & expenses, reports last, backup/restore is post-beta (local file later, not cloud for now).

This is the build order. Each milestone is shippable and verified before the next starts. Services stay the data boundary — screens never touch SQLite directly.

## Beta Definition (locked)

- **Includes:** create / read / update / delete for livestock and expenses, add health notes & feeding records, status changes, search/filter, dashboard stats, activity log. Data persists locally in SQLite, seeded once from `data/mock.ts`.
- **Excludes for beta:** accounts/auth, caretaker sync, pen CRUD, photo attachments, cloud backup, report export. Location stays free-text.

## Principles for this run

1. **Storage first, then make forms real.** The current Add screens are visual-only. Wiring SQLite early lets every later feature be tested on device with real data.
2. **Keep service signatures stable.** `features/*/services/*` keep the same exported names/screens don't change shape when mock → SQLite.
3. **Reports go last.** They are aggregations — they only become meaningful once the write path is real.

## Milestones

### M1 — SQLite Foundation (foundation, ~1–2 days)

**Goal:** Replace the read-only mock with a real local DB without changing any screen.

- Add `expo-sqlite` (resolve SDK 54 version via `bundledNativeModules.json`; install with `npm install`, not `npx expo install`).
- Create `src/lib/db/{client.ts, schema.ts, seed.ts}`:
  - `client.ts` — open DB, `execAsync` helper, single `getDatabase()` singleton.
  - `schema.ts` — tables `livestock`, `expenses`, `activities`, `pens` (keep `pens` table even though no CRUD UI yet — it costs nothing and future-proofs). Columns mirror `features/*/types.ts`. Foreign keys: `expenses.livestockId → livestock.id`, `activities.livestockId/expenseId`.
  - `seed.ts` — on first launch, if tables empty, insert the 7 + 12 + 12 + 4 seed rows from `data/mock.ts`. Idempotent.
- Add `src/lib/db/migrations.ts` stub (version 1 → just `schema.ts`; pattern ready for v2).
- Rewrite internals of `livestockService`, `expenseService`, `activityService` to query SQLite (keep exported function names: `getAll`, `getById`, `count`, `countGroups`, `countByCategory`, `countByStatus`, `search`, `total`, `totalByCategory`, `thisMonth`, `sorted`, `getRecent`, `groupByDate`). Make them `async` where needed — update callers to `await` or use simple `useEffect` re-fetch for now.
- **Verify:** `npm run typecheck` + `npx expo export --platform android` + manual: Home/Livestock/Expenses/Reports/Activity read the same as before, but from DB. Restart app → data still there.

### M2 — Livestock: Make Writes Real (~2 days)

**Goal:** The Add Animal form actually saves; detail screen can edit/delete and add health/feeding.

- Extend `livestockService` with `create(input)`, `update(id, patch)`, `remove(id)`, `addHealthNote(id, note)`, `addFeeding(id, feeding)`, `updateStatus(id, status)`.
- Add `src/lib/utils/validate.ts` — small helpers: required, `quantity > 0`, `amount >= 0`, date `YYYY-MM-DD` parse.
- Wire `app/livestock/new.tsx`:
  - Validate (name, category, location required; quantity numeric if group). Show inline errors via `className` (e.g. `border-error`).
  - On Save: `await livestockService.create(...)` → `activityService.log({ type: 'livestock_added', ... })` → `router.back()` → list re-reads.
- Add `app/livestock/[id]/edit.tsx` (reuse `new.tsx` form, pre-filled) and delete action (confirm dialog → `remove` → back).
- Add to `app/livestock/[id].tsx`: Edit (header button → edit route), Delete, status picker (`FilterChip` row), inline "Add Health Note" + "Add Feeding" modals (use existing `HealthNoteItem`/`FeedingItem` + a tiny form).
- Add `livestockMeta` validation for `sex`/`status` unions.
- **Verify:** Create → appears in list; edit → detail updates; delete → gone after restart; adding a health note appears immediately; invalid form shows errors, not a crash.

### M3 — Expenses: Make Writes Real (~1.5 days)

**Goal:** Same for expenses — the Add form saves, list can edit/delete.

- Extend `expenseService` with `create`, `update`, `remove`.
- Wire `app/expenses/new.tsx`: validate description + `amount` (>0, numeric), date. Save → `expenseService.create` → activity log → back.
- Add `app/expenses/[id]/edit.tsx` (or reuse `new.tsx` with `id` param) and swipe/long-press delete on `ExpenseItem` (or detail delete).
- Make `getByLivestockId` filter usable from the detail screen (already does) — ensure new expenses linked to a livestock show there.
- **Verify:** Create expense → total card updates and detail's expense list updates; edit amount → totals change; delete → totals adjust; bad amount (empty/NaN) is rejected.

### M4 — Activity & Dashboard Wiring (~0.5 day)

**Goal:** Activity log and dashboard stats reflect real writes.

- Extend `activityService` with `log(entry)` and `clear()` (dev only). Every `create/update/remove` in M2/M3 calls `log`.
- Ensure `app/(tabs)/index.tsx` stats (`count`, `countGroups`, `total`, `thisMonth`) re-derive from services on focus (use `useFocusEffect` from `expo-router` or simple `useEffect` + navigation focus). No new UI.
- **Verify:** Adding an animal/expense creates an activity row; Home recent 5 updates without restart.

### M5 — Hardening & Polish for Beta (~1–1.5 days)

**Goal:** Beta feels like a real app, not a prototype with holes.

- Loading/empty/error states on every list/detail (reuse `EmptyState`).
- Delete confirmations (`Alert.alert` already used — keep consistent).
- Date handling: replace raw `TextInput` date with a simple date picker (`@react-native-community/datetimepicker` if needed, or keep text with `validate.ts` for beta).
- Search debounce (livestock list) and pull-to-refresh where trivial.
- App polish: `app.json` icon/splash already set; run `npm run lint` clean; check Android back-button + modal dismiss.
- Keep `tailwind.config.js` tokens untouched; no new deps unless needed.

### M6 — Reports Last (~0.5 day)

**Goal:** Reports become useful because M1–M4 generate real data.

- No schema change. Just ensure `reports.tsx` aggregates re-derive from services (reuse `countByCategory`, `totalByCategory`, `countByStatus` now backed by DB). Add a simple "last 30 days" toggle if trivial; otherwise leave as-is.
- Defer CSV export/share to post-beta (that's when you add `expo-sharing` + `expo-file-system` for a real export).

### M7 — Ship Beta (Android) (~0.5 day)

- `eas.json` already present via Expo skills — add a `preview` profile for internal APK.
- `eas build --platform android --profile preview` → share APK. No store submission for beta.
- Bump `app.json` version + `android.versionCode`.
- Tag `v0.1.0-beta`.

## What We Are NOT Doing for Beta (explicitly deferred)

- **Pen CRUD** — stay free-text `location`. `Pen` type and `mockPens` stay as seed only.
- **Auth / caretaker sync** — no accounts. Data lives only on device.
- **Cloud backup/restore** — local SQLite file only. Post-beta, add export/import of the DB file via `expo-file-system` + `expo-sharing` (then later an optional cloud bucket). Your "recover after reinstall" need is real — but do it as a local file export first, not a network feature.
- **Photos, advanced reports, notifications.**

## Build Order Summary

```
M1  SQLite foundation   →  M2  Livestock writes  →  M3  Expense writes
        ↓                        ↓                      ↓
M4  Activity/Dashboard wiring  →  M5  Hardening  →  M6  Reports  →  M7  Ship
```

Do not start M2/M3 before M1 is green — everything else depends on the service → SQLite swap being verified.

## How to Start (next command)

1. `npm install expo-sqlite` (check SDK 54 pin) and create `src/lib/db/`.
2. Implement `schema.ts` mirroring `features/livestock/types.ts`, `features/expenses/types.ts`, `features/activity/types.ts`.
3. Rewrite one service (`livestockService`) first, verify Home + Livestock still read, then do the other two.

## Post-Beta (v1.1) Candidates

- Local DB file export/import (covers your reinstall-recovery need without a backend).
- Pen CRUD (when free-text becomes painful).
- Report CSV export + share sheet.
- Optional: simple PIN or device-level auth; then evaluate a sync backend (Supabase/Convex) only if caretaker sharing is validated.
