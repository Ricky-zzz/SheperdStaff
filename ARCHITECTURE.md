# Shepherd Staff — Architecture

> Companion to `PRD.md`. Stack and conventions for the current offline-first app. For the step-by-step feature workflow, load the `shepherd-staff-dev` skill.

## 1. Principles

- **Routes are thin.** `src/app/` only composes feature + shared UI. No SQL or business logic in route files.
- **Feature modules own their domain.** Types, display helpers, components, and services colocate under `src/features/<x>/`.
- **Services are the data boundary.** Screens call `features/*/services/*`; only services import `lib/db` (and only the seed path imports `data/mock.ts`). No screen imports the DB or mock data directly.
- **Styling is utility-first.** `className` (NativeWind) for static styles; dynamic palette values come from `useTheme()` + inline `style`.
- **Offline by default.** All persistence is local SQLite; no network anywhere.

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Expo SDK 54, RN 0.81.5, React 19 | Managed workflow |
| Routing | Expo Router (file-based, `src/app` is the app dir) | Bottom tabs + Stack |
| Language | TypeScript (strict) | `tsc --noEmit` must pass |
| Styling | NativeWind v4.2 + Tailwind v3.4 | `className` on RN primitives |
| Theming | CSS variables via `vars()` (`ThemeContext`) + palettes in `lib/theme/themes.ts` | 3 themes × light/dark × color mode |
| Icons | `@expo/vector-icons` (Ionicons) |  |
| Data | `expo-sqlite` (~16) + guarded migrations | `lib/db/{client,schema,seed}.ts` |
| Media | `expo-image-picker` + `expo-file-system` (legacy API) | Profile avatar copied into app storage |
| Reports | `expo-print` + `expo-sharing` | PDF farm report |
| Crypto | `expo-crypto` | Salted SHA-256 password hash (local gate only) |
| Inputs | `@react-native-community/datetimepicker`, `@react-native-picker/picker` | Wrapped by `DateInput`/`TimeInput`/`Select` |
| State | React context (`AuthContext`, `ThemeContext`) + local `useState` | No global store |

Expo skills are installed under `.agents/skills/`; the project skill is `.opencode/skills/shepherd-staff-dev/`.

## 3. Project Structure

```
SheperdStaff/
├── app.json, package.json, tsconfig.json, tailwind.config.js
├── global.css, metro.config.js, babel.config.js, nativewind-env.d.ts
├── PRD.md, ARCHITECTURE.md, AGENTS.md
├── .opencode/skills/shepherd-staff-dev/SKILL.md
├── assets/
└── src/
    ├── app/                     # Expo Router — routes only
    │   ├── _layout.tsx          # root Stack: Auth/Theme providers, lock gate, routes
    │   ├── (tabs)/              # index, livestock, expenses, reports, more
    │   ├── lock.tsx, reset-password.tsx, onboarding/{index,password,theme}.tsx
    │   ├── livestock/{[id],new,edit}.tsx
    │   ├── inventory.tsx, inventory/{[id],form,restock,adjust}.tsx
    │   ├── expenses/{new,edit,all}.tsx, income/{form,all}.tsx
    │   ├── tasks.tsx, tasks/form.tsx
    │   ├── animal-types.tsx, animal-types/form.tsx
    │   ├── locations.tsx, locations/form.tsx
    │   ├── reports/type.tsx, activity.tsx, backup.tsx
    │   └── profile/{edit,password,recovery,theme}.tsx
    ├── components/ui/           # shared presentational primitives
    │   # Card, Button, Badge, Screen, StatCard, ListItem, SectionHeader,
    │   # EmptyState, SearchBar, FilterChip, FormScroll, DateInput, TimeInput,
    │   # Select, LivestockPicker, RangeSelector, MiniBarChart, ThemePicker
    ├── features/                # one folder per domain
    │   ├── livestock/           # types, livestockMeta, components (Card/HealthNote/Feeding), service
    │   ├── inventory/           # types, inventoryMeta, components (Card/StockTransaction), service
    │   ├── expenses/            # types, expenseMeta, components/ExpenseItem, service
    │   ├── income/              # types, incomeMeta, components/IncomeItem, service
    │   ├── tasks/               # types, taskMeta, components/TaskItem, service
    │   ├── activity/            # types, activityMeta, components/ActivityItem, service
    │   ├── animalTypes/         # types, service
    │   ├── locations/           # types, service
    │   ├── profile/             # types, components (ProfileAvatar/ProfileMenuButton), service
    │   ├── backup/              # types, services/backupService.ts (backup/restore/export)
    │   └── reports/             # services/reportPdf.ts (HTML → PDF)
    ├── lib/
    │   ├── auth/AuthContext.tsx # onboarding/locked/unlocked state machine + recovery/reset/restore
    │   ├── theme/               # themes.ts (palettes), ThemeContext.tsx, colors.ts (active hex)
    │   ├── db/                  # client.ts (initDb), schema.ts (DDL + migrations), seed.ts
    │   └── utils/               # age, format, validate, dateRange, password, livestockCode, errors
    └── data/mock.ts             # seed data only (used by lib/db/seed.ts)
```

`src/types/` is reserved for truly shared types; today domain types live in their feature.

## 4. Routing

- `src/app/` is the app dir (`expo` auto-detects `src/app`).
- `(tabs)` is the tab group; dynamic detail routes are `livestock/[id]`, `inventory/[id]`; form screens are presented as modals (`modalOptions` in `app/_layout.tsx`).
- `_layout.tsx` gates on `AuthContext.state`: `loading` → spinner, `onboarding` → `/onboarding`, `locked` → `/lock`, `unlocked` → app. `/reset-password` is the single extra route allowed while `locked`; completing it (or a restore) flips the state and the guard redirects.
- Navigation via `router.push('/route', params)` / `router.back()`. No `<a>` tags.

## 5. Styling & Theming

- Tokens in `tailwind.config.js` (`primary`/`earth`/`neutral` 50–900, `background`, `card`, `border`, `error`, `success`, `warning`).
- Class names resolve through CSS variables set by `ThemeProvider` (`paletteToVariables` + NativeWind `vars()`), so `bg-primary-600` follows the active theme + light/dark automatically.
- **No dynamic class names** — `` `bg-${c}-500` `` is purged. For runtime colors (icons, badges, charts), read the palette from `useTheme().colors` and pass hex via `style`/props.
- `colorMode: 'colorful' | 'uniform'` — uniform renders charts/badges with neutral colors (used for print-friendly/report views).
- Themes: `earth` (Earth Green), `ocean` (Ocean Blue), `sunset` (Sunset Amber), each with light + dark palettes in `lib/theme/themes.ts`. Selection lives on the profile (`themeKey`, `darkMode`, `colorMode`).
- Never `StyleSheet`; use `className` (inline `style` only for dynamic values).

## 6. Types & Display Helpers

- Domain interfaces + string-literal unions in `features/<x>/types.ts`. No `enum`.
- `*Meta.ts` files hold label/icon/color helpers (`getCategoryLabel`, `getStatusLabel`, `getExpenseCategoryMeta`, `getIncomeCategoryMeta`, `getTransactionMeta`, `getRecurrenceLabel`, …). Badge color helpers stay in `components/ui/Badge.tsx`.
- Shared utils in `lib/utils/`: `age.ts` (`formatAge`), `format.ts` (`formatQuantity`, `formatBytes`, `formatDateTime`), `validate.ts`, `dateRange.ts` (`DatePreset`/`resolveRange`), `password.ts` (hashing, recovery codes), `livestockCode.ts` (code generation/labels), `errors.ts` (`toUserMessage` — translate SQLite errors before showing them; raw driver strings never reach the user).

## 7. Data Layer

```
Screen  →  features/<x>/services/*  →  lib/db/client (expo-sqlite)
seed path: lib/db/seed.ts → data/mock.ts
```

- Tables (`lib/db/schema.ts`): `livestock` (JSON columns for `healthNotes`/`feedings`), `expenses`, `income`, `activities`, `tasks`, `animal_types`, `locations`, `inventory_items`, `inventory_transactions`, `user_profile` (single row, `id = 1`; carries the password hash and recovery-code hash), plus legacy `pens`.
- `initDb()` opens SQLite (foreign keys on); `ensureSchema()` runs `CREATE TABLE IF NOT EXISTS` plus guarded `ALTER TABLE` migrations (PRAGMA checks) — add new columns the same way, then backfill inside the guard.
- Inventory writes are transactional (`db.withTransactionAsync`): restock → update quantity/average cost + transaction + feed expense; consume → validate stock, deduct, append feeding JSON to the livestock row, insert negative transaction; adjust → signed `adjustment` transaction only; undoFeeding → remove the feeding and return stock as an `adjustment` row.
- **Destructive actions and activity logs:** never log with a foreign key after deleting its target. Services delete first; screens then call `activityService.safeLog()` (never throws) without the deleted id, and surface errors via `toUserMessage`.
- **Livestock delete guard:** `livestockService.getDeletionBlockers(id)` counts feedings, health notes, expenses (direct + legacy allocations + the animal's own `expenseIds`, de-duplicated), income, tasks, `inventory_transactions` and activities — excluding the automatic `livestock_added` row. `remove()` throws `deletionBlockedMessage()` when the total is non-zero, and both delete screens pre-flight it to show a "Cannot delete" alert instead of a confirm dialog. A permitted `remove()` runs in one transaction: drop the `livestock_added` row, then the animal, leaving zero parentless references.
- Services by feature: `livestockService` (CRUD, counts, search, status, health notes, codes), `inventoryService` (`getAll/getCompatible/restock/consume/adjust/undoFeeding/getTransactions/totalStockValue`), `expenseService`, `incomeService`, `taskService` (recurrence), `activityService` (`log`/`safeLog`), `animalTypeService` (usage-guarded delete), `locationService` (rename cascades to livestock), `profileService` (password + recovery hash), `backupService` (backup/share/email/restore/export).
- Restore path: `features/backup/services/backupService.ts` serializes the database with `serializeAsync`, writes `.sqlite` files under `documentDirectory/backups` (newest five kept), validates header/tables/integrity, saves a safety backup, then copies into the open database with `deserializeDatabaseAsync` + `backupDatabaseAsync` and re-runs `ensureSchema`. Row counts are verified afterwards because the native backup call does not always report failure.
- `data/mock.ts` is seed content only; screens never import it.

## 8. Components

- One component per file, named export, optional `className` for composition.
- `components/ui/` are stateless and reusable; `features/<x>/components/` are domain-aware (e.g. `LivestockCard` knows `Livestock`).
- Form screens use `FormScroll` plus shared inputs (`DateInput`, `TimeInput`, `Select`, `LivestockPicker`).
- `LivestockPicker`: chips when ≤ 8 records; above that, search-by-name-or-code with max 5 results and a collapsible list.

## 9. Commands & Verification

- `npx expo start` — dev server (scan QR with Expo Go, SDK 54).
- `npm run typecheck` (`tsc --noEmit`) — must pass.
- `npm run lint` (`expo lint`) — must pass.
- `npx expo export --platform android` — must bundle (verifies Metro + NativeWind).

> `npx expo install` fails on this machine (npm-12 `EALLOWSCRIPTS`); use `npm install <pkg>@<ver>` and resolve the SDK-54 version via `node -e "console.log(require('expo/bundledNativeModules.json')['<pkg>'])"`.

## 10. Future Work

1. Cloud sync/accounts layered behind the existing services (screens unchanged).
2. Roles (owner/caretaker), notification reminders (tasks exist locally).
3. Weighed feed amounts, pen CRUD (legacy `pens` table), livestock photo attachments.
4. Richer exports/analytics on top of `reports` (JSON export exists in `backupService`; CSV per table would be next).
5. Encrypted backup files (current backups are plain SQLite and include the password hash).

## 11. Conventions Checklist (for reviews)

- [ ] New domain type → its feature's `types.ts`, union not enum.
- [ ] New data access → feature service over `lib/db` (add the column to `schema.ts` with a guarded migration; seed via `lib/db/seed.ts`), never direct DB/mock access in a screen.
- [ ] New UI pattern used twice → `components/ui/` primitive.
- [ ] Styling via `className`; dynamic color via `useTheme().colors` + `style`.
- [ ] Route added under `src/app/`, registered in `_layout.tsx` when it needs custom header/modal options, wired with `router.push`.
- [ ] `npm run typecheck` + `npm run lint` pass.
