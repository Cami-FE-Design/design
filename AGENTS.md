<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Pre-commit checklist for feature work

Before committing a new component, route, or noticeable UX change, update the project's two discovery surfaces alongside the code change:

1. **Components**: confirm the component or route is in its final shape and the implementation file is the source of truth.
2. **Playground showcase**: add or update a `<Section>` in the lane file it belongs to under `components/blocks/playground/` (`primitives-lane`, `blocks-lane`, `detail-views-lane`, `business-lane`, `hq-lane`) for any new or visibly changed component, covering each meaningful state (default, variants, alarm/error, collapsed, etc.). The sidebar and search on `/playground` pick the section up on their own. The `/playground` route is how the team browses the design system.
3. **Screens index**: add an entry in `app/screens/page.tsx` for each new route or notable demo page, with a one-line `note` explaining what to look at. The `/screens` route is the team's map of every routed surface in the repo.

Only after the three are aligned should you commit. The playground and screens index are how the team finds new work, missing entries silently strand the feature even though the code ships.

When the user says "ready to commit" (or similar), run this checklist before staging and committing.
