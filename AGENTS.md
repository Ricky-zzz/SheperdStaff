# Shepherd Staff — Project Instructions

Mobile livestock-management app built with **Expo + React Native + TypeScript**. Offline-first: local SQLite persistence + local profile lock, no backend.

## Docs

- `PRD.md` — what the app is and what it must do (entities, flows, scope).
- `ARCHITECTURE.md` — how it's built (stack, structure, data/style/type conventions, future work).
- `.opencode/skills/shepherd-staff-dev/SKILL.md` — full dev workflow and "add a feature" checklist (load with the `shepherd-staff-dev` skill).
- `apple-design` skill — Apple HIG design reviewer for UI/UX audits and accessibility checks (installed via `npx skills add dickwu/apple-design-skill`).

Expo skills (router, NativeWind/tailwind, design-system, etc.) are in `.agents/skills/` via `npx skills add expo/skills`; the project skill is in `.opencode/skills/`.

## Stack

- Expo SDK 54, React Native 0.81.5, React 19, Expo Router, TypeScript (strict)
- NativeWind v4 + Tailwind v3 for styling (`className` utilities); theme CSS variables from `lib/theme/themes.ts` via `ThemeProvider` (3 themes × light/dark × color mode)
- `@expo/vector-icons` (Ionicons)
- `expo-sqlite` for persistence (`lib/db/{client,schema,seed}.ts`); `expo-crypto` for the local password hash; `expo-print` + `expo-sharing` for the PDF report; `expo-image-picker` + `expo-file-system` for the avatar
- `src/data/mock.ts` is seed data only (used by `lib/db/seed.ts`), never imported by screens

## Commands

- `npx expo start` — dev server
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — `expo lint`

> `npx expo install` fails here (npm-12 `EALLOWSCRIPTS`); use `npm install` directly.

## Structure

- `src/app/` — Expo Router routes only (thin screens); custom header/modal options go in `_layout.tsx`.
- `src/components/ui/` — shared primitives (Card, Badge, Screen, FormScroll, DateInput, Select, LivestockPicker, etc.).
- `src/features/<x>/` — one folder per domain: `types.ts`, `<x>Meta.ts`, `components/`, `services/` (livestock, inventory, expenses, income, tasks, activity, animalTypes, locations, profile, reports).
- `src/lib/` — `db/` (SQLite schema + migrations + seed), `auth/AuthContext` (lock gate), `theme/` (palettes + `useTheme`), `utils/`.
- `src/data/mock.ts` — seed data.

## Rules

- **Styling:** use `className`, never `StyleSheet`. Theme tokens in `tailwind.config.js` (`primary`, `earth`, `neutral`, `background`, `card`, `border`, `error`, `success`, `warning`) resolve from theme CSS variables.
- **No dynamic class names** (e.g. `` `bg-${color}-500` `` won't work). For dynamic colors use `useTheme().colors` hex via inline `style` (icons, badges, chart bars).
- **Types:** domain types in the feature's `types.ts`; use string-literal unions, not `enum`.
- **Data:** screens call services (`features/*/services/`), never `lib/db` or `data/mock.ts` directly. New columns: add to `schema.ts` DDL + guarded migration.
- **Components:** one per file, named exports, accept optional `className` for composition. Form screens use `FormScroll` + shared inputs.
- **Verification:** `npm run typecheck` and `npm run lint` must pass.

For the full workflow and a feature checklist, load the `shepherd-staff-dev` skill.
