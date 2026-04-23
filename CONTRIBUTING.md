# Contributing

## Before you start

- Node 22+ and pnpm.
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for stack conventions.
- If you are touching styling, read [DESIGN_TOKENS.md](./DESIGN_TOKENS.md).

## Workflow

1. Branch from `main`.
2. Make the change.
3. Run `pnpm check` (Biome), `pnpm typecheck`, `pnpm test`, and `pnpm build` locally.
4. Open a PR. CI runs the same checks.

The pre-commit hook runs `biome check --write` on staged files, so formatting fixes apply automatically. If a type error or test failure blocks a commit, fix the issue rather than bypassing the hook.

## Adding a shadcn component

The component layer in `components/ui/` is project-owned source, not a vendored package. To add a new primitive:

```bash
pnpm dlx shadcn@latest add <component-name>
```

Then review the diff, adjust imports if needed (use `@/components/ui/*` and `radix-ui` namespace imports per the radix-luma preset), and commit.

To update a component, re-run with `--overwrite` and review the diff carefully. Do not blindly accept upstream changes, they may revert intentional Cami customizations.

## Editing tokens

Change the value in Figma first, then update `app/globals.css` and `DESIGN_TOKENS.md`. Do not hardcode colors, radii, or font values in component files, use the token.

## Testing

- Unit tests colocated with the code (`foo.test.ts` next to `foo.ts`).
- Framework is Vitest plus `@testing-library/react` for components.
- No snapshot tests by default, they rot faster than they help.

## Commit style

Short imperative subject, body describes the why when non-obvious. Example:

```
Add Badge outline variant for pending states

Figma spec calls for an outlined badge on unclaimed activity items.
Existing solid variants read as too loud in the feed context.
```

## When in doubt

Small, reviewable PRs beat perfect PRs. If you are unsure about an approach, open a draft PR and ask.
