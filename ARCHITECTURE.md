# Shepherd Staff — Architecture

> Companion to `PRD.md`. Stack and conventions for the current prototype and the path to a real app. For the step-by-step feature workflow, load the `shepherd-staff-dev` skill.

## 1. Principles

- **Routes are thin.** `src/app/` only composes feature + shared UI. No data fetching or business logic in route files.
- **Feature modules own their domain.** Types, display helpers, components, and services colocate under `src/features/<x>/`.
- **Services are the data boundary.** Screens call `features/*/services/*`; those import `src/data/mock.ts` today and `expo-sqlite` tomorrow. No screen imports `data/mock.ts` directly.
- **Styling is utility-first.** `className` (NativeWind) for static styles; inline `style` + hex from `lib/theme/colors.ts` only for dynamic values.

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Expo SDK 54, RN 0.79, React 19 | Managed workflow |
| Routing | Expo Router (file-based, `src/app` is the app dir) | Bottom tabs + Stack |
| Language | TypeScript (strict) | `tsc --noEmit` must pass |
| Styling | NativeWind v4.2 + Tailwind v3.4 | `className` on RN primitives |
| Icons | `@expo/vector-icons` (Ionicons) |  |
| State | Local state (`useState`) | No global store yet |
| Data (now) | `src/data/mock.ts` | Static seed |
| Data (next) | `expo-sqlite` + migrations under `src/lib/db/` | Services swap internals |

Expo skills are installed under `.agents/skills/` (e.g. `expo-router`, `expo-tailwind-setup`, `expo-design-system`). The project skill is `.opencode/skills/shepherd-staff-dev/`.

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
    │   ├── _layout.tsx          # root Stack (header colors via Colors)
    │   ├── (tabs)/_layout.tsx   # bottom Tabs
    │   ├── (tabs)/{index,livestock,expenses,reports,more}.tsx
    │   ├── livestock/{[id],new}.tsx
    │   ├── expenses/new.tsx
    │   └── activity.tsx
    ├── components/ui/           # shared, presentational primitives
    │   │   Card, Button, Badge, Screen, StatCard,
    │   │   ListItem, SectionHeader, EmptyState, SearchBar, FilterChip
    ├── features/
    │   ├── livestock/{types.ts, livestockMeta.ts, components/{LivestockCard,HealthNoteItem,FeedingItem}, services/livestockService.ts}
    │   ├── expenses/{types.ts, expenseMeta.ts, components/ExpenseItem, services/expenseService.ts}
    │   └── activity/{types.ts, activityMeta.ts, components/ActivityItem, services/activityService.ts}
    ├── lib/
    │   ├── theme/colors.ts      # dynamic hex only (icon/badge colors)
    │   ├── utils/{age.ts, format.ts}
    │   └── db/                  # (future) sqlite
    └── data/mock.ts             # seed arrays + pens
```

`src/types/` is reserved for truly shared types; today domain types live in their feature.

## 4. Routing

- Expo Router file convention: `src/app/` is the app dir (`expo` auto-detects `src/app`).
- `(tabs)` is a tab group; `livestock/[id].tsx` is a dynamic detail route; `new.tsx` screens are presented as modals.
- Navigation: `router.push('/livestock/<id>')`, `router.back()`. No `<a>` tags.

## 5. Styling

- Tokens in `tailwind.config.js` extend Tailwind: `primary`/`earth`/`neutral` (50–900) and `background`/`card`/`border`/`error`/`success`/`warning`.
- Use `className` (e.g. `bg-primary-600`, `text-neutral-800`, `rounded-xl`, `p-4`, `gap-3`, `shadow-sm`). Never `StyleSheet` (only one tiny exception in `reports.tsx` for dynamic bar widths — acceptable).
- **No dynamic class names** — `` `bg-${c}-500` `` is purged. For runtime colors (status/category, `Ionicons` `color` prop, badge bg), use hex from `lib/theme/colors.ts` via inline `style`.
- Metro uses `withNativeWind(config, { input: "./global.css" })` + Babel `jsxImportSource: "nativewind"`.

## 6. Types & Display Helpers

- Domain interfaces + string-literal unions in `features/<x>/types.ts` (e.g. `LivestockCategory`, `LivestockStatus`, `ExpenseCategory`, `ActivityType`). No `enum`.
- `*Meta.ts` files hold label/icon/color helpers colocated with the domain (e.g. `getCategoryLabel`, `getStatusLabel`, `EXPENSE_CATEGORY_META`, `getActivityIcon`). Badge color helpers (`getStatusBadgeColor`, `getCategoryBadgeColor`) stay in `components/ui/Badge.tsx`.

## 7. Data Layer

```
Screen  →  features/<x>/services/*  →  data/mock.ts   (today)
                                →  lib/db + expo-sqlite  (next)
```

- Services expose small, named functions: `livestockService.getAll()`, `count()`, `getById()`, `expenseService.total()`, `totalByCategory()`, `activityService.groupByDate()`, etc.
- `data/mock.ts` is the single seed source (7 livestock, 12 expenses, 12 activities, 4 pens) — never imported by screens.
- Future: `lib/db/schema.ts` + migrations; services become thin wrappers over SQL queries; return types stay the same so screens don't change.

## 8. Components

- One component per file, named export, optional `className` for composition.
- `components/ui/` are stateless and reusable; `features/<x>/components/` are domain-aware (e.g. `LivestockCard` knows `Livestock`).
- Extract repeated screen patterns into components rather than copying `StyleSheet` blocks.

## 9. Commands & Verification

- `npx expo start` — dev server (scan QR with Expo Go, SDK 54).
- `npm run typecheck` / `npx tsc --noEmit` — must pass.
- `npx expo export --platform android` — must bundle (verifies Metro + NativeWind).
- `npm run lint` — `expo lint`.

> `npx expo install` fails on this machine (npm-12 `EALLOWSCRIPTS`); use `npm install <pkg>@<ver>` and resolve the SDK-54 version via `node -e "console.log(require('expo/bundledNativeModules.json')['<pkg>'])"`.

## 10. Migration Path

1. Add `expo-sqlite`, create `lib/db/schema.ts` + seed from `data/mock.ts`.
2. Rewrite each `features/*/services/*` to query SQLite (keep the same exported function signatures).
3. Remove `data/mock.ts` or keep it as test fixtures.

## 11. Conventions Checklist (for reviews)

- [ ] New domain type → its feature's `types.ts`, union not enum.
- [ ] New data access → feature service, not direct `data/mock.ts` or `lib/db` in a screen.
- [ ] New UI pattern used twice → `components/ui/` primitive.
- [ ] Styling via `className`; dynamic color via `lib/theme/colors.ts` + `style`.
- [ ] Route added under `src/app/` and wired with `router.push`.
- [ ] `npm run typecheck` + bundle export pass.
