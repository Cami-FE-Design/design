---
name: prototyping
description: 'Build a clickable prototype from any idea — vague concept, user story, screenshot, or full PRD. Use when: prototype, mockup, make this clickable, show me what this looks like, mock this up.'
disable-model-invocation: true
---

# Prototyping

Build a clickable, interactive prototype from any level of input — a vague idea, a customer quote, a screenshot, a user story, or a full PRD. No designer or engineer required.

## Output
- **Operator Mode:** A working prototype in your codebase, ready for your team to review
- **Advisor Mode:** A standalone file you can open in your browser and share with anyone

## When to Use This Skill
- You have a feature idea and want to see it before writing a spec
- You need to show a stakeholder "here's what I'm proposing"
- You want to test whether an idea makes sense before involving engineering
- A customer described a problem and you want to explore a solution visually
- You have a PRD and want a clickable version to validate with users

## The Problem

The feedback loop from idea to something you can click through is measured in days or weeks. PM writes a spec, waits for design, waits for engineering, stakeholder finally sees it and says "that's not what I meant." The cost isn't just time — it's the translation loss at every handoff.

This skill gets you from "what if we had X?" to something clickable you can put in front of someone today.

## What You'll Get

- A clickable, interactive frontend prototype with mock data
- Multi-view navigation (pages, tabs, states)
- Interactive elements (forms, buttons, toggles, filters)
- Styled to match your product (when design system is available)
- Shareable via link or as a file you can attach to Slack, email, etc.

## What You'll Need

**Required:**
- An idea (at any level of detail)

**Helpful:**
- `context/design-system.md` — your colors, fonts, component patterns (makes prototypes look like your product)
- A screenshot of your current app or a competitor
- A PRD or user stories (if you have them — not required)

## Process

### Step 1: Detect Mode

I'll automatically detect whether you have a codebase and tell you which mode I'm using:

> "I see a Next.js app with shadcn/ui components — I'll build on your existing stack."

or

> "No codebase detected — I'll generate a standalone prototype you can open in your browser."

**You don't need to choose.** If I'm in a codebase, I build on it (Operator Mode). If not, I generate a self-contained file (Advisor Mode).

### Step 2: Read Available Context

**Operator Mode — I'll scan your codebase for:**
- Existing components and design system (what can I reuse?)
- Data models and TypeScript types (what entities exist?)
- Current pages and layouts (what patterns does the app follow?)
- Tailwind config or CSS tokens (what does the app look like?)

**Advisor Mode — I'll check for:**
- `context/design-system.md` — your visual identity (colors, fonts, components)
- `context/product.md` — what your product does, who it serves
- `context/personas.md` — who will use this feature
- `context/competitors.md` — if you say "build something like how Notion does it"
- Screenshots or brand assets you provide

**If I don't have a design system (Advisor Mode), I'll ask:**
> "I don't have your design system yet. Two options:
> 1. Paste a screenshot of your app — I'll match the style automatically
> 2. I'll use clean defaults and we can adjust later
>
> Want me to save whatever style we land on so future prototypes match automatically?"

### Step 3: Smart Clarification (2-3 Questions Max)

Before building anything, I'll ask 2-3 targeted questions to fill in gaps. These are informed by what I've already read — not a generic questionnaire.

**Operator Mode examples:**
> "I see you have `sessions`, `projects`, and `team_members` in your data model. Which entities should this dashboard track?"
>
> "I found an existing `/analytics` page with Recharts. Build on that or create a new page?"
>
> "Your app uses a sidebar layout with shadcn/ui. Same pattern here?"

**Advisor Mode examples:**
> "Based on your product description, this seems like a B2B dashboard. Data-dense (Datadog) or clean and minimal (Linear)?"
>
> "Who's the primary user — the end user or an admin?"
>
> "Should this be a single page or multiple views (e.g., list view + detail view)?"

**What makes these questions smart:**
- They reference specific things I found in your codebase or context
- I never ask things I could infer
- 2-3 questions max — this isn't a requirements gathering session
- It should feel like working with someone who already knows your product

### Step 4: Present the Plan

Before writing any code, I'll share my plan:

> **Prototype Plan: Usage Dashboard**
>
> **Phase 1:** Core layout + main dashboard view
> - Navigation sidebar (reusing your existing `AppLayout`)
> - Metric cards showing sessions, active users, revenue
> - Usage chart (daily trend, last 30 days)
> - Mock data based on your `Session` and `User` types
>
> **Phase 2:** Detail views + interactions
> - Click a metric card → drill-down view
> - Date range filter
> - Export button (non-functional, shows the intent)
>
> **Mocking:** All data is hardcoded. No API calls, no database, no auth.
>
> **Does this match what you're thinking?**

I won't write code until you approve the plan.

### Step 5: Build Phase 1

I build the core layout and primary view. This is the foundation — the main thing the user sees.

**Operator Mode:** New files on a feature branch (`prototype/[name]`), using your existing components and imports.

**Advisor Mode:** A single HTML file with React (CDN), Tailwind (CDN), and Chart.js (CDN if charts are needed). All components defined inline, mock data as constants at the top.

**IMPORTANT — Progress narration:** Building a prototype takes time. Keep the user informed as you work by narrating what you're doing in short, plain-language messages between code blocks. This is critical for UX — the user should never be left staring at file writes wondering what's happening.

Example narration during a build:

> "Creating the page layout — reusing your sidebar and top nav..."

> "Building the metric cards — sessions, active users, and revenue..."

> "Adding the usage chart with 30 days of mock data..."

> "Wiring up the tab navigation between Overview and Detail views..."

> "Phase 1 done — opening in your browser now."

Rules for narration:
- One short message (1 sentence) before each meaningful chunk of work
- Use plain language, not technical jargon — "building the header" not "instantiating the NavBar component"
- Reference what the user will see, not what you're writing — "adding the filter dropdown" not "writing a useState hook"
- Name the specific things being built — "metric cards for sessions and revenue" not "some components"
- Announce when each phase is complete

After Phase 1, I'll show you the result:
- **Operator Mode:** Tell you which files were created and how to view them (`npm run dev` → navigate to the new page)
- **Advisor Mode:** Open the HTML file in your browser automatically

### Step 6: Review + Iterate

You click through the prototype and tell me what to change:
- "Add a filter for date range"
- "Change the table to cards"
- "The sidebar should collapse on mobile"
- "Add a second tab for team activity"

I'll make changes incrementally. Each round updates the existing prototype — we're refining, not rebuilding. Narrate each change the same way — tell the user what you're doing before you do it.

If the prototype gets complex and you want a fresh start, just say "rebuild this cleaner" and I'll consolidate what we have.

**A note on when to stop:** A prototype is a communication tool, not a product. If you're past 3-4 rounds of refinement and still iterating on details, that's usually a sign the requirements need clarifying — consider writing a brief spec before continuing. Prototypes should be disposable, not precious.

### Step 7: Build Phase 2+

Secondary views, interactions, and polish. We continue iterating until the prototype communicates what you need. Keep narrating throughout — the user should always know what's happening.

### Step 8: Share It

**Operator Mode:**
- I'll open a PR with a description of what was built and what's mocked
- If you have preview deploys (Vercel/Netlify), the PR generates a shareable URL automatically
- I'll note what engineering needs to finish: *"Mock data at lines X-Y needs API wiring. Auth checks needed on these routes."*

**Advisor Mode:**
- The HTML file is already open in your browser
- When you're ready to share, I'll ask: *"Want me to create a shareable link?"*
- If yes, I'll deploy the file and give you a URL like `https://usage-dashboard.surge.sh`
- Anyone with the link can open and interact with the prototype in their browser
- You can also share the HTML file directly as an attachment in Slack or email

**How sharing works behind the scenes (you don't need to do anything):**
1. I check if you have a deployment tool set up (`surge` or `vercel`)
2. If yes — I deploy automatically and give you the link
3. If neither is set up — I'll walk you through a one-time, 2-minute setup (enter your email, verify). After that, every future share is instant.
4. If you'd rather skip the setup, you can always share the HTML file directly as an attachment

## Prototype vs. Production

This is a prototype, not production code. Here's the boundary:

**What the prototype includes:**
- Frontend layout, navigation, interactive elements
- Real components and styling (Operator) or clean approximation (Advisor)
- Hardcoded mock data that looks realistic
- Clickable, navigable — it looks and feels like the real thing

**What engineering finishes:**
- Real API calls and database queries
- Error handling, loading states, empty states
- Authentication and permissions
- Performance, security, and tests
- Accessibility audit

I'll make this boundary explicit in the PR description or HTML file, so engineering knows exactly what's mocked and what needs wiring.

**Example — what engineering sees in the PR description (Operator Mode):**

> ### Prototype: Usage Dashboard
>
> **What's built:** Dashboard page with metric cards, usage chart, date range filter, and detail drill-down view. Uses existing `AppLayout`, `Card`, and `MetricDisplay` components.
>
> **What's mocked:**
> - All data is hardcoded in `lib/mock/dashboard-data.ts` — needs API wiring to `/api/analytics`
> - Date range filter updates local state only — needs query param integration
> - Export button is non-functional — placeholder for future implementation
>
> **What engineering needs to finish:**
> - Wire up `GET /api/analytics` for real metric data
> - Add auth check (this page should require login)
> - Loading and error states
> - Empty state for new accounts with no data

**Example — header comment in the HTML file (Advisor Mode):**

> This is a prototype built by mySecond. All data is mocked.
> Mocked: user list, activity feed, metric values, chart data.
> Not included: authentication, real API calls, error handling.

## Input Spectrum

You can start at any level of detail:

| What you give me | What I do |
|-----------------|-----------|
| **Vague idea** — "What if we had a usage dashboard?" | Read your data models, infer metrics, build a reasonable first draft |
| **Customer quote** — "Users can't find their invoices" | Build an invoice page that addresses the pain point |
| **Screenshot** — competitor or napkin sketch | Extract layout and patterns, rebuild using your design system |
| **User story** — "As an admin, I want to invite team members" | Build the invite flow using appropriate components |
| **Full PRD** — detailed spec with acceptance criteria | Build exactly what's specified, phase by phase |

No PRD required. Your context files and codebase fill in the gaps.

## Technical Notes

### Operator Mode
- Creates feature branch `prototype/[name]` from current HEAD
- Uses the project's framework (Next.js, Vite, etc.)
- Imports existing components — doesn't recreate what exists
- Mock data matches real TypeScript types/interfaces
- Uses the team's charting library if one exists

### Advisor Mode
- Single self-contained HTML file
- React + ReactDOM via CDN
- Tailwind CSS via CDN
- Built-in code compiler (so the file works in any browser without setup)
- Chart.js via CDN (when charts are needed)
- All state via React.useState — no external state library
- Design tokens from `context/design-system.md` if available

### Sharing (Advisor Mode)
When the user wants a shareable link, use this fallback chain:
1. Run `npx surge whoami` — if authenticated, deploy with `npx surge prototypes/[name].html --domain [name]-prototype.surge.sh`
2. If surge not authed, run `npx vercel whoami` — if authenticated, deploy with `npx vercel prototypes/ --yes`
3. If neither is set up, walk the user through one-time surge setup: `npx surge login` (they enter email, verify). Then deploy.
4. If user declines setup, suggest sharing the HTML file directly as an attachment

Always use a descriptive subdomain: `usage-dashboard-prototype.surge.sh`, not random strings.

## Tips for Best Results

1. **Create `context/design-system.md`** — Even just your brand colors and font makes prototypes look 80% right. If your team has a style guide, paste the key details in.
2. **Start vague, refine iteratively** — "Dashboard for usage data" is a fine starting point. You'll refine it as you see it.
3. **Share early** — The point of a prototype is feedback. Share it before it's perfect.
4. **Use screenshots as input** — A screenshot of a competitor or a napkin sketch gives me more to work with than a paragraph of description.
5. **Ask your team about preview deploys** — If your team uses Vercel or Netlify, every prototype PR automatically gets a shareable link. Ask your engineering lead — most teams already have this set up.
