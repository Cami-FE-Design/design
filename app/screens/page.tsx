import type { Metadata } from "next"
import Link from "next/link"
import { ThemeToggle } from "@/components/blocks/theme-toggle"

export const metadata: Metadata = {
  title: "Screens",
  description: "Map of every Cami screen currently in the repo",
}

type Screen = {
  path: string
  label: string
  note?: string
}

type Section = {
  title: string
  description?: string
  screens: Screen[]
}

const SECTIONS: Section[] = [
  {
    title: "Public",
    description: "Anything an unauthenticated visitor can land on.",
    screens: [{ path: "/", label: "Root", note: "Next.js boilerplate, not yet replaced" }],
  },
  {
    title: "Pet parent, public business page (PRO-96)",
    description:
      "E2-3 Cami-hosted public booking landing at cami.app/[slug]. Two-column on desktop with sticky booking card, single column on mobile. 404 returned for unknown slugs and not-yet-live businesses.",
    screens: [
      {
        path: "/shampooch-jvc",
        label: "Live business · grooming",
        note: "Cover photo, open status, location with directions, full hours, services list, Google Maps embed",
      },
      {
        path: "/purr-palace",
        label: "Live business · cats only",
        note: "Second mock to confirm the page is data-driven, not hardcoded",
      },
      {
        path: "/no-such-business",
        label: "404, slug not found",
      },
      {
        path: "/draft-business",
        label: "404, business not yet live",
        note: "Slug exists but isLive is false, hidden behind the same not-found page",
      },
    ],
  },
  {
    title: "Auth, business",
    description: "Business owner and team member sign-in flow.",
    screens: [
      { path: "/sign-in", label: "Sign in, email entry" },
      { path: "/sign-in/password", label: "Password step" },
      { path: "/sign-in/verify", label: "Verify code" },
      { path: "/sign-in/forgot-password", label: "Forgot password" },
    ],
  },
  {
    title: "Cami HQ, auth (PRO-121)",
    description:
      "HQ admin auth flow added in this PR. Single-pane layout on the cami-aurora gradient.",
    screens: [
      { path: "/admin/sign-in", label: "HQ sign-in, email step" },
      {
        path: "/admin/sign-in?email=you%40getcami.com",
        label: "HQ sign-in, password step",
        note: "Pre-filled email jumps straight to the password step",
      },
      {
        path: "/admin/sign-in/forgot-password?email=you%40getcami.com",
        label: "Forgot password",
      },
      {
        path: "/admin/sign-in/reset-password?token=demo",
        label: "Reset password, valid",
        note: "Any token except 'expired' or 'used' simulates a valid token",
      },
      {
        path: "/admin/sign-in/reset-password?token=expired",
        label: "Reset password, expired",
        note: "Redirects to the error page",
      },
      {
        path: "/admin/sign-in/reset-password-error?reason=expired",
        label: "Reset-password error, expired",
      },
      {
        path: "/admin/sign-in/reset-password-error?reason=used",
        label: "Reset-password error, already used",
      },
      {
        path: "/admin/sign-in/reset-password-error?reason=invalid",
        label: "Reset-password error, invalid",
      },
      {
        path: "/admin/sign-in-error?reason=not_allowlisted",
        label: "Sign-in error, not allowlisted",
      },
      { path: "/admin/sign-in-error?reason=locked", label: "Sign-in error, locked" },
      { path: "/admin/sign-in-error?reason=generic", label: "Sign-in error, generic" },
    ],
  },
  {
    title: "Cami HQ, partner roster (PRO-101)",
    description:
      "E6-2 Partner roster + detail modal. Click a row in the roster to open the modal at ?business=<slug>.",
    screens: [
      { path: "/admin/businesses", label: "Partners roster" },
      {
        path: "/admin/businesses?tab=onboarding",
        label: "Roster, Onboarding tab",
        note: "Filter tab + URL persistence",
      },
      {
        path: "/admin/businesses?sort=weekly&dir=desc",
        label: "Roster, sort by weekly AED",
      },
      {
        path: "/admin/businesses?business=shampooch-jvc",
        label: "Detail modal, Live state",
        note: "Dark green Access row, Manage tab with Sign in / Suspend / Archive",
      },
      {
        path: "/admin/businesses?business=velvet-paw",
        label: "Detail modal, Onboarding state",
      },
      {
        path: "/admin/businesses?business=doggos",
        label: "Detail modal, Suspended state",
        note: "Tomato reason banner with white-circle InfoIcon",
      },
      {
        path: "/admin/businesses?business=furry-tales",
        label: "Detail modal, Archived state",
      },
      { path: "/admin/audit", label: "Cross-business audit log" },
      {
        path: "/admin/audit?kind=impersonation",
        label: "Audit log, Impersonation only",
      },
    ],
  },
  {
    title: "Cami HQ, Impersonation (PRO-155)",
    description:
      "E6-2.1 single pane of glass for ops impersonation: standalone events log, scoped session banner, PII reveal flow on the Partner portal.",
    screens: [
      {
        path: "/admin/impersonation",
        label: "Impersonation log",
        note: "Filterable table with detail sheet, CSV export, and per-Partner owner-summary clipboard copy. Complements the audit-log filter at /admin/audit?kind=impersonation.",
      },
      {
        path: "/admin/portal-impersonation-demo",
        label: "Partner portal under impersonation",
        note: "4px yellow viewport frame, bottom-anchored banner pill, mock invoice with reason-gated PII reveal. Click the minimize chip to collapse the banner.",
      },
      {
        path: "/playground",
        label: "Banner states (playground)",
        note: "Active, expiring (5 min), expired terminal, and collapsed states side-by-side near the bottom of the playground.",
      },
    ],
  },
  {
    title: "Pet Business, settings (PRO-95)",
    description:
      "E2-2 Pet Business profile lives inside the AppShell settings dialog. Trigger via Settings in the sidebar, or jump straight to a category with `?settings=<id>`.",
    screens: [
      {
        path: "/shell-demo?settings=profile",
        label: "Settings dialog, My profile",
        note: "Account category, placeholder until Auth0 wires up",
      },
      {
        path: "/shell-demo?settings=business-details",
        label: "Business details, summary",
        note: "Combined Business info + External links card with one Edit button. Click Edit for the full-screen takeover.",
      },
      {
        path: "/shell-demo?settings=locations",
        label: "Locations, list",
        note: "Options dropdown on each row (Change photo / Suspend / See public booking page). Click the card body to drill into the per-location detail (inner-page nav, not a modal) with five tabs: General (Basic info, Business type) / Hours / Location (Map, Business location) / Invoicing (Details with sameAsLocation toggle, Tax defaults, Receipt sequencing, Tipping) / Manage (Suspend, Delete). Each card opens its own full-screen edit takeover.",
      },
      {
        path: "/shell-demo?settings=language",
        label: "Language & region",
        note: "Workspace category, placeholder until i18n pass",
      },
    ],
  },
  {
    title: "Pet Business, team",
    description:
      "Team-member roster lives at /settings/team. Add opens a full-screen takeover with a sidebar nav (Personal: Profile, Addresses, Emergency contacts; Workspace: Services, Locations, Settings). First name, last name, and email are required to add.",
    screens: [
      {
        path: "/settings/team",
        label: "Team members, list",
        note: "Active and Pending tabs, Action dropdown per row (Edit Roles & Permissions, Edit Services, Edit Schedule, Resend invitation for pending, Remove). Click Add to open the takeover.",
      },
      {
        path: "/settings/team",
        label: "Add team member takeover",
        note: "Click Add. Sidebar nav with 6 sections; Profile is the default and includes name, email, phone, country, birthday, calendar color (Cami palette), and job title. Settings has the permission role select (High/Medium/Low).",
      },
    ],
  },
  {
    title: "Cami HQ, roles & permissions (PRO-138)",
    description:
      "E1-6.2 HQ-side role catalog. Lives inside the Settings dialog at ?settings=roles, no standalone routes. Edit and Add open as full-screen dialogs on top.",
    screens: [
      {
        path: "/admin/businesses?settings=roles",
        label: "Roles & Permissions list",
        note: "Add a new role (WIP) at the bottom of the list. HQ Admin is system-protected.",
      },
      {
        path: "/admin/businesses?settings=roles",
        label: "Edit role takeover",
        note: "Open list, click Options → Edit permissions on any role to launch the takeover.",
      },
      {
        path: "/admin/businesses?settings=roles",
        label: "Rename role dialog",
        note: "Open list, click Options → Rename on a non-system role.",
      },
    ],
  },
  {
    title: "Pet Business, first-time setup wizard (PRO-97)",
    description:
      "E2-4 Owner first-time setup. 5-step flow with a separate Go-live page. Welcome step removed, `/setup` lands the Owner directly on About. Services, Staff, and Preview steps are deferred until those features ship.",
    screens: [
      { path: "/setup", label: "Wizard entry (redirects to About)" },
      { path: "/setup/about", label: "Step 1 · About your business" },
      { path: "/setup/type", label: "Step 2 · Business type" },
      {
        path: "/setup/location",
        label: "Step 3 · Location",
        note: "Map slot is a placeholder; engineers wire the picker when the map dependency lands.",
      },
      { path: "/setup/invoicing", label: "Step 4 · Invoicing" },
      { path: "/setup/hours", label: "Step 5 · Business hours" },
      {
        path: "/setup/done",
        label: "Go-live · Your business is set up",
        note: "Minimal terminal beat (violet check + heading). Booking URL handoff + calendar CTA come back in once the calendar home + public page hooks are in.",
      },
    ],
  },
  {
    title: "Demos & playground",
    description: "Internal references for shell layout and component states.",
    screens: [
      { path: "/shell-demo", label: "Business app shell" },
      { path: "/playground", label: "Component states" },
    ],
  },
]

const TOTAL = SECTIONS.reduce((sum, section) => sum + section.screens.length, 0)

export default function ScreensPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <header className="mb-12 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Screens</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Every screen currently routed on this branch, grouped by flow. {TOTAL} total. Click a
            row to open the live page in a new tab.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-col gap-12">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-foreground/10 pb-3">
              <div>
                <h2 className="font-heading text-base font-medium text-foreground">
                  {section.title}
                </h2>
                {section.description ? (
                  <p className="mt-1 text-xs text-muted-foreground">{section.description}</p>
                ) : null}
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {section.screens.length}
              </span>
            </div>

            <ul className="flex flex-col">
              {section.screens.map((screen) => (
                <li key={screen.path}>
                  <Link
                    href={screen.path}
                    target="_blank"
                    rel="noreferrer"
                    className="group -mx-2 grid grid-cols-[minmax(0,16rem)_1fr] items-baseline gap-6 rounded-md px-2 py-2.5 transition-colors hover:bg-foreground/[0.04]"
                  >
                    <code className="truncate font-mono text-xs text-muted-foreground group-hover:text-foreground">
                      {screen.path}
                    </code>
                    <div className="min-w-0">
                      <span className="text-sm text-foreground underline-offset-4 group-hover:underline">
                        {screen.label}
                      </span>
                      {screen.note ? (
                        <span className="ml-2 text-xs text-muted-foreground">{screen.note}</span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
