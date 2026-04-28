# Cami

Greenfield engineering repo for Cami. First milestone is the design system component layer.

## Quick start

Requires Node 22+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 for the app and http://localhost:3000/playground for the component showcase.

## Live preview

[![Live](https://img.shields.io/website?label=preview&url=https%3A%2F%2Fprojects-cami.vercel.app)](https://projects-cami.vercel.app)

Production: <https://projects-cami.vercel.app>

Deployed on [Vercel](https://vercel.com/michellehyou-8474s-projects/projects-cami) from the `main` branch. Every other branch and PR gets an auto-generated preview URL — find them in the Vercel dashboard or as an automatic comment on each PR.

## Scripts

| Script             | Does what                                         |
| ------------------ | ------------------------------------------------- |
| `pnpm dev`         | Next dev server with Turbopack                    |
| `pnpm build`       | Production build                                  |
| `pnpm start`       | Serve production build                            |
| `pnpm check`       | Biome lint + format + import sort, writes fixes   |
| `pnpm lint`        | Biome lint only                                   |
| `pnpm format`      | Biome format, writes fixes                        |
| `pnpm typecheck`   | TypeScript check, no emit                         |
| `pnpm test`        | Run Vitest once                                   |
| `pnpm test:watch`  | Vitest in watch mode                              |

## Folder layout

```
app/                # Next.js App Router entries
components/
  ui/               # shadcn primitives (project-owned, edit freely)
  blocks/           # Composed components built from ui primitives
hooks/              # Shared React hooks
lib/                # Framework-agnostic helpers
styles/             # Additional CSS if you need to split globals.css
```

## Next steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for stack choices and why each one is here.
- Read [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) for the Figma to Tailwind token mapping.
- Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a PR.
