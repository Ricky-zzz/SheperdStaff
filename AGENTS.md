# Shepherd Staff — Project Instructions

Mobile livestock-management prototype built with **Expo + React Native + TypeScript**.

## Stack

- Expo SDK 54, React Native 0.79, React 19, Expo Router, TypeScript (strict)
- NativeWind v4 + Tailwind v3 for styling (`className` utilities)
- `@expo/vector-icons` (Ionicons)
- Static prototype: no backend, no auth, no DB. Data comes from `src/data/mock.ts` via a service layer.

## Commands

- `npx expo start` — dev server
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — `expo lint`

> `npx expo install` fails here (npm-12 `EALLOWSCRIPTS`); use `npm install` directly.

## Structure

- `src/app/` — Expo Router routes only (thin screens).
- `src/components/ui/` — shared primitives (Card, Button, Badge, Screen, ListItem, etc.).
- `src/features/<x>/` — one folder per domain: `types.ts`, `<x>Meta.ts`, `components/`, `services/`.
- `src/lib/` — `theme/colors.ts` (dynamic hex), `utils/`, `db/` (future SQLite).
- `src/data/mock.ts` — seed data.

## Rules

- **Styling:** use `className`, never `StyleSheet`. Theme tokens in `tailwind.config.js` (`primary`, `earth`, `neutral`, `background`, `card`, `border`, `error`, `success`, `warning`).
- **No dynamic class names** (e.g. `` `bg-${color}-500` `` won't work). Use hex from `src/lib/theme/colors.ts` via inline `style` for dynamic colors (icons, badges).
- **Types:** domain types in the feature's `types.ts`; use string-literal unions, not `enum`.
- **Data:** screens call services (`features/*/services/`), never `data/mock.ts` directly.
- **Components:** one per file, named exports, accept optional `className` for composition.

For the full workflow and a feature checklist, load the `shepherd-staff-dev` skill.
