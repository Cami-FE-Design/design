# Architecture

This doc captures the stack decisions and why each piece is here. If you are changing a foundational dependency, update the relevant section here first.

## Overview

Cami is a Next.js App Router application with a design system layer built on shadcn/ui primitives. The component layer is project-owned source code, not vendored from npm, so engineers can edit and evolve it without version pinning friction.

## Stack

### Framework

- **Next.js 16 (App Router)**. Server Components by default, route handlers for server logic, `next/font` for font optimization. We are on Next 16 rather than 15 because starting on current stable avoids a migration within the year.
- **React 19**. App Router ships React canary with React 19 stable features baked in. This is automatic and not controlled by the `react` version in package.json.
- **Turbopack**. `--turbopack` flag on `pnpm dev` and `pnpm build` for faster iteration.

### Language and strictness

- **TypeScript strict**. `strict: true` is set and expected to stay on. Do not disable individual strictness flags without a PR-level discussion.
- **`moduleResolution: "bundler"`** and `"isolatedModules": true`, aligning with Next's defaults.

### Styling

- **Tailwind v4** (CSS-first). Theme is defined in `app/globals.css` using `@theme inline`, not a JS config. Prefer adding tokens to `@theme` over inline arbitrary values.
- **@radix-ui/colors**. Sand for neutrals plus amber, blue, green, teal, red, pink. Each scale is imported as raw CSS so utilities like `bg-amber-9` are available in addition to the shadcn semantic tokens (`bg-primary`, `bg-muted`).
- **tw-animate-css**. Ships from the shadcn radix-luma preset for component transitions.

### Component layer

- **shadcn/ui CLI v4, preset `b6Gf5Ll10`**. The preset is the `radix-luma` style. Components are copied into `components/ui/` as source. We own them.
- **`radix-ui` meta package**. The radix-luma preset uses the new single-package namespace imports (`import { Dialog as DialogPrimitive } from "radix-ui"`) rather than per-primitive packages.
- **`sonner`** for toasts, wrapped via `components/ui/sonner.tsx`. The legacy `toast` primitive is deprecated upstream.
- **`next-themes`** for light/dark/system switching via a `class` attribute on `<html>`.
- **`lucide-react`** for icons.

### Forms

- **`react-hook-form`** plus **`zod`** plus **`@hookform/resolvers`**. The shadcn `form.tsx` file wires these together. Prefer this stack for any non-trivial form state.

### Tooling

- **Biome** for lint, format, import sort. One tool, no ESLint or Prettier. Config lives in `biome.json`. CSS files are excluded because Biome does not yet parse Tailwind v4 directives.
- **pnpm** pinned via `packageManager` in package.json. Node pinned to 22+ via `engines` and `.nvmrc`.
- **Lefthook** for pre-commit. Runs `biome check --write` on staged files so the tree stays clean without nagging.
- **Vitest** for unit tests. Tests live next to the code they cover (`foo.test.ts` alongside `foo.ts`).
- **GitHub Actions** CI runs `biome check`, `tsc --noEmit`, and `next build` on every PR.

## Conventions

- **No `src/` directory.** Code lives at the repo root under `app/`, `components/`, `lib/`, `hooks/`, `styles/`.
- **Server Components by default.** Add `"use client"` only when you need state, effects, or browser APIs. The playground and theme toggle are client components because they use hooks.
- **Import alias.** `@/` maps to the repo root. Use it for all intra-repo imports.
- **`components/ui/` is vendor-like but project-owned.** It is copied from shadcn and expected to be edited. Do not try to upgrade these files with `pnpm update` or the shadcn CLI's overwrite flag without reviewing the diff.
- **`components/blocks/` is composed.** Block components consume `ui/` primitives and encode product patterns. Do not import `radix-ui` primitives directly from blocks, go through `ui/`.

## What is not here yet

These are intentional omissions as of the first commit. Revisit when the need is concrete.

- **Storybook.** The playground route covers the component review need for now. Add Storybook once the component set is stable and visual regression testing becomes valuable.
- **E2E tests.** Vitest handles unit logic. Playwright or similar can come when there are real user flows to cover.
- **Internationalization.** No `next-intl` or equivalent. Cami is English-only for now.
- **Analytics and error tracking.** No Sentry, PostHog, or equivalent wired in. These should be added at the integration point, not speculatively.

## Dependency upgrade policy

- **Major upgrades of Next, React, or Tailwind** go in their own PR. Do not bundle with feature work.
- **shadcn components** are manually re-added with `shadcn add <name> --overwrite` and the diff reviewed. Do not accept upstream changes blindly.
- **Biome major** upgrades may require config migration. Run `pnpm exec biome migrate` and review the result.
