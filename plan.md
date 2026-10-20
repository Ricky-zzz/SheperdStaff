# Plan — Next Session

Source: `notes.md` (after semis submission). Presenting on **phone (Expo Go)** — web is being dropped (item 7).

## Current state (baseline)

`main` = `5fa5be4` — full app on main: auth (onboarding/lock), livestock CRUD, expenses (direct + bulk),
tasks, income + profit summary, locations + animal-types CRUD, reports (30d/all-time), themes, peso,
farm-matched seed data (Betty/Barry, broilers, Darag layers, 2 goat herds, piglets + sold fatteners),
activity log, effect-based auth redirects, rounded-lg formal styling.

## 1. Reports: print → PDF + share

- `npm install expo-print@~15.0.8 expo-sharing@~14.0.8` (SDK-pinned; both work in Expo Go).
- New `src/features/reports/services/reportPdf.ts`: build an HTML summary (totals, income/expenses/profit,
  per-type + per-entity breakdown) → `expo-print.printToFileAsync` → `expo-sharing.shareAsync`.
- `src/app/(tabs)/reports.tsx`: top-right share button (`share-outline`).

## 2. Profit per group/individual + per animal type

- Reuse `expenseService.getAllocatedTotal(id)` + `incomeService.totalByLivestockId(id)`.
- **Per entity**: list every livestock record with Income / Expenses / Profit (green/red), sorted by
  profit. New `src/features/reports/components/ProfitList.tsx`.
- **Per type**: group entities by category (cattle/pig/chicken/goat), sum income/expenses/profit per
  type, render bars using `animalTypes` colors (same style as "Livestock by Type" chart).
- Both respect the date filter (§3).

## 3. Reports date filter

- Replace the two chips with presets: **7d / 30d / This month / All** + optional **custom from→to**
  using the existing `DateInput`.
- Compute one `filtered` income/expense slice; every view (cards, per-category, per-entity, per-type,
  status) derives from it.

## 4. Location → native dropdown

- `npm install @react-native-picker/picker@2.11.1`.
- Reusable `src/components/ui/Select.tsx` wrapper; replace the location chip-picker in
  `src/app/livestock/new.tsx` + `src/app/livestock/edit.tsx`.

## 5. Keyboard covering inputs

- Forms are plain `ScrollView` — keyboard hides the focused field on device.
- New reusable `src/components/ui/FormScroll.tsx` = `KeyboardAvoidingView` (`behavior="padding"` on
  iOS) + `ScrollView` (`keyboardShouldPersistTaps="handled"`, `keyboardDismissMode="on-drag"`).
- Apply to: `livestock/new`, `livestock/edit`, `expenses/new`, `expenses/edit`, `income/form`,
  `tasks/form`, `locations/form`, `animal-types/form`, `profile/edit`, `profile/password`, and the
  `livestock/[id]` health/feeding modals.

## 6. Minimalist icons

- Swap filled Ionicons → `-outline` variants across screens, ui primitives, and the tab bar
  (e.g. `home`→`home-outline`, `paw`→`paw-outline`, `wallet`→`wallet-outline`, `bar-chart`→`bar-chart-outline`).
- Verify each glyph exists in the Ionicons glyph map before swapping; skip any without an outline variant.

## 7. Clean up web support (phone-only)

- Remove `react-native-web` + `react-dom` from `package.json`.
- `metro.config.js`: drop `wasm` from `assetExts`.
- `src/components/ui/DateInput.tsx`: remove the `Platform.OS === 'web'` branch (native datetimepicker only).
- Delete `assets/favicon.png` (web-only); keep the native icon assets.
- Verify with `npx expo export --platform android` only.

## Verification (after each item)

- `npm run typecheck`
- `npm run lint`
- `npx expo export --platform android` (no web)
- Device test in Expo Go before committing.

## Deferred / parked

- Profit per entity is added in §2 — no longer deferred.
- Multi-user / sync: out of scope (offline-first single user).
- Real password recovery: current reset is destructive by design.
