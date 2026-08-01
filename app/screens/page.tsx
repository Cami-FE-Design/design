import type { Metadata } from "next"
import Link from "next/link"
import { ThemeToggle } from "@/components/blocks/theme-toggle"
import { REPORTS } from "@/lib/reports/registry"

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

// The reporting module is config-driven — one dynamic route renders all 23
// reports from lib/reports/registry.ts. So the screen list is GENERATED from
// the registry rather than hand-maintained: every report is listed and the map
// can never go stale when a report is added. A few reports carry an extra hint
// about what's distinct to look at.
const REPORT_VIEW_OVERRIDE: Record<string, string> = {
  "performance-summary": "Matrix View",
  "performance-over-time": "Over-time Matrix",
}
function reportViewLabel(report: (typeof REPORTS)[number]): string {
  return (
    REPORT_VIEW_OVERRIDE[report.id] ??
    (report.template === "detailed-table"
      ? "Detailed Table View"
      : report.template === "dashboard"
        ? "Dashboard View"
        : "Table View")
  )
}
const REPORT_HINTS: Record<string, string> = {
  "sales-summary":
    "Group-by 'Type' pill → Product = Aziz's 'sales by item' (DSG-43); bold Total row.",
  "payments-summary": "Payment methods adapted to Cami (CamiPay / NeoPay / Cash / Gift card).",
  "finance-summary":
    "The Detailed Table template — section-grouped metric × period matrix with bold subtotals, flat rows.",
  "payment-transactions":
    "Maaz's sheet labels this 'Detailed', but the view is a flat per-transaction table.",
  "stock-on-hand": "Single-date stepper toolbar (not a range picker).",
  "appointments-list": "19-column wide table — horizontal scroll + status badges.",
  "client-summary":
    "Client insights is merged into Client list (a filtered view), not a separate report.",
  "client-list": "Carries the richer per-client columns + a Pet Name column (PRO-703 §4).",
  "performance-dashboard":
    "Cami's Dashboard WIP spec — 6 KPI cards + a recharts comparison chart + drill-downs. Feature-flagged.",
  "performance-summary":
    "Metric × team-member matrix — section subtotals + Total column, header row + first column sticky on both axes, metric labels drill to source reports.",
  "performance-over-time":
    "Entity × time-period matrix — live pills (dimension / metric / granularity / range) recompute a recharts bar chart + a sticky-first-column table; % metrics roll up as weighted averages. Feature-flagged.",
}
const REPORT_SCREENS: Screen[] = [
  {
    path: "/reports",
    label: "Reporting index",
    note: "Category tabs (All + Dashboards/Sales/Finance/Appointments/Team/Clients/Inventory), search by name/description, report cards with category icon + Premium badge + favourite star. Every report below opens from here.",
  },
  ...REPORTS.map((report) => ({
    path: `/reports/${report.id}`,
    label: `${report.name} · ${reportViewLabel(report)}`,
    note: REPORT_HINTS[report.id]
      ? `${report.description} ${REPORT_HINTS[report.id]}`
      : report.description,
  })),
]

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
    title: "CamiPay, payment link landing (PRO-594)",
    description:
      "Customer-facing pay page at cami.app/[slug]/pay/[token]. Opens from a WhatsApp/email payment link or counter QR, no login. De-compartmentalized single column (Luma) with qlub tip + payment-method patterns: flat money ledger, hero total, fixed tip presets, method radio list + one contextual CTA.",
    screens: [
      {
        path: "/shampooch-jvc/pay/demo-token",
        label: "Unpaid · full flow",
        note: "Bill (pet-aware lines) → fixed tip presets (No tip / 5 / 10 / 15, 'Most common' on 10, live readout) → flat ledger + hero total → payment method radio (Apple Pay / saved card) → single contextual CTA. Membership upsell as inline ledger link.",
      },
      {
        path: "/shampooch-jvc/pay/demo-paid",
        label: "Paid · terminal",
        note: "Link re-opened after payment: green confirmation, no payment UI",
      },
      {
        path: "/shampooch-jvc/pay/demo-expired",
        label: "Expired · terminal",
        note: "Token dead / sale voided: neutral message, no payment UI. Token suffix (-paid / -expired) drives the mock state.",
      },
    ],
  },
  {
    title: "Consent form signing (public)",
    description:
      "Recipient-facing consent-form signing at cami.app/sign/[token] (e.g. a pet grooming consent + liability waiver). Opens from an emailed link, no login. OTP verify → a full-height split matching the operator's 'View form' screen (the only scroll surface is the PDF itself; no close/dismiss control): the document as a real in-app PDF on the left with a floating zoom + page-nav toolbar, and the signing form on the right as a card (Full Legal Name, Email, Type/Draw signature, an agree-to-terms toggle, Sign Agreement) — no modal. Each token suffix (-signed / -completed) seeds one state so every screen is reachable from a URL.",
    screens: [
      {
        path: "/sign/consent",
        label: "Awaiting · full flow",
        note: "OTP verify (any 6 digits not starting with 0 pass; a leading 0 fails + shakes) → signing screen: PDF left (zoom −/+ and Prev/Next page toolbar, the only scroll surface), signing card right. Fill name + email, Type (scripted preview) or Draw (canvas + Clear) a signature, flip the agree toggle → Sign Agreement enables → completed thank-you. No close/dismiss control — the recipient just fills and signs.",
      },
      {
        path: "/sign/consent-signed",
        label: "Already signed",
        note: "Skips OTP, lands on the signing screen with the right card in a read-only Signed state showing the captured signature.",
      },
      {
        path: "/sign/consent-completed",
        label: "Completed · terminal",
        note: "Post-signing thank-you: success message confirming the signed form was sent back to the business. No document or signing UI.",
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
        note: "Personal info for the signed-in user, scoped exactly to DSG-63 'view and edit contact details': one Contact card (Business-details pattern) with Legal name + masked mobile/email and a single Edit → full-screen takeover (name, email, mobile). Name saves directly; a new mobile number needs a 6-digit OTP (any 6 digits work in the demo, shared OtpInput boxes); a new email waits for its confirmation link (dialog offers only Resend/Cancel; the link click is simulated by the subtle bottom-right 'Demo: open confirmation link' control, Gift-cards-toggle convention). A pending change shows as a neutral 'Pending' badge inline on its row — clicking it opens the matching dialog with Verify / Resend (30s cooldown) / Cancel. Values used by a team member are blocked inline; pending changes survive reload (localStorage). Saving the name updates the topbar live. Also reachable from the topbar avatar menu → My profile.",
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
      {
        path: "/shell-demo?settings=sales",
        label: "Sales, landing",
        note: "Sales category. Gift cards card (Payment methods moved to the Payments section); click to drill into the sub-screen (Back + breadcrumb returns). Takeovers deep-linked below via ?sub / ?gc.",
      },
      {
        path: "/shell-demo?settings=sales&sub=gift-cards",
        label: "Gift cards, populated",
        note: "Active program — Availability and values summary card with Edit. Options → Gift cards sold. A bottom-right demo toggle previews the empty state.",
      },
      {
        path: "/shell-demo?settings=sales&sub=gift-cards&gc=empty",
        label: "Gift cards · inactive empty state",
        note: "Inactive empty state with a Set up CTA (no program configured yet).",
      },
      {
        path: "/shell-demo?settings=sales&sub=gift-cards&gc=setup",
        label: "Gift cards · settings takeover",
        note: "Full-screen Gift card settings: enable toggle, preset AED values (add/delete), default expiration select. No delete — a program can only be edited or toggled off.",
      },
      {
        path: "/shell-demo?settings=forms",
        label: "Form templates library",
        note: "Forms category. Business-level library of reusable form templates — the only documents the consent-form send picker offers. Profile uploads stay personal and no longer sync here. Follows the Sales settings pattern: rows in one bordered card that scrolls internally, neutral bordered icon boxes, an 'Action ▾' dropdown per row (Preview / Rename / Download / Delete), and a secondary 'Upload file' pill below. Empty state + PDF-only upload.",
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
    title: "Pet Business, payment policy (DSG-51)",
    description:
      "Deposit / no-show policy inside the Settings dialog (Payments). Business level only — Location scope pending Malen/Maaz. Persists to localStorage; the configured policy drives the Payment policy card in the appointment sheet. 'Capture card details' policy type is v1 out-of-scope; client-groups scope limiter is disabled pending the client-groups model. Deep-link takeovers with ?pp=edit|services|terms.",
    screens: [
      {
        path: "/shell-demo?settings=payments",
        label: "Payments, landing",
        note: "Payments category (own top-level section). Two cards: Payment policy and Payment methods (moved here from Sales); click to drill into each sub-screen (Back + breadcrumb returns).",
      },
      {
        path: "/shell-demo?settings=payments&pp=policy",
        label: "Payment policy, summary",
        note: "Summary card (applies-to, deposit %, custom-service count, refund status) with green checks, auto-generated example policy, terms preview, and the prepay-in-full toggle.",
      },
      {
        path: "/shell-demo?settings=payments&pp=methods",
        label: "Payment methods, list",
        note: "Locked Cash row + custom methods. Header has Add and Options (Change order, hidden when only Cash); non-Cash rows have an Actions menu (Edit / Delete / Move up / Move down). Add/Edit/Order takeovers deep-link via &pm=add|edit|order.",
      },
      {
        path: "/shell-demo?settings=payments&pp=edit",
        label: "Payment policy editor takeover",
        note: "Full-screen Close/Save takeover: policy type (No policy / Require deposit), percent-or-AED deposit amount, Refundable until, reschedule window (30min–72h or 'cannot reschedule'), late-cancellation fee + auto-cancel checkboxes, and Advanced options (customize per service, client groups [coming soon], min appointment value).",
      },
      {
        path: "/shell-demo?settings=payments&pp=services",
        label: "Customize by service takeover",
        note: "Search + category pill tabs over the service catalog; per-row Default vs Custom deposit and no-show fee with inline percent/AED inputs; row + category checkboxes with a bulk 'Set custom deposit' bar. Save returns to the policy editor.",
      },
      {
        path: "/shell-demo?settings=payments&pp=terms",
        label: "Policy displayed to clients takeover",
        note: "Auto-generated example policy line + free-text additional terms with a 600-char live counter.",
      },
    ],
  },
  {
    title: "Pet Business, terminals (DSG-62)",
    description:
      "Add card machines, issue their credentials, and manage sign-in sessions — Payments > Terminals. Replaces the merchant-level shared-PIN model (spec: docs/specs/DSG-62-terminal-registration.md, which supersedes DSG-62-terminal-management.md). Each terminal is added with a name and a required location, and comes back with two credentials doing different jobs: a pairing code typed into the hardware once and never changed, and a 6-digit sign-in PIN typed at every sign-in, readable from the row any time, regenerated on demand. Per-device rather than merchant-wide, so regenerating a PIN or a failed-attempt lockout hits that terminal alone. Nothing is capped — as many terminals as there is hardware for, as many concurrent sessions as staff open. Opens empty by default, which is where a real merchant starts. Deep-link states with &tp=typical|full|empty.",
    screens: [
      {
        path: "/shell-demo?settings=payments&pp=terminal",
        label: "Terminals, empty (default)",
        note: "No terminals yet, with the only Add terminal button in the empty state (the header one is suppressed while the list is empty). Walk the whole arc from here: add → get the code and PIN → 'Demo: pair a device' stands in for typing the code into the hardware → 'Demo: sign in on a terminal' stands in for staff entering the PIN → the row goes Not paired → No sessions → Active.",
      },
      {
        path: "/shell-demo?settings=payments&pp=terminal&tp=typical",
        label: "Terminals, typical (2 devices)",
        note: "What a real merchant has. List rows rather than a data table: name at full weight, then code · location · last seen on one muted line, so status is the only thing competing with the name. The device tile carries the status tint. Row ⋯ gives Show code & PIN, Rename terminal, Change location (split apart because 'Edit' didn't say what it edits), N devices signed in, Regenerate PIN, and Remove terminal.",
      },
      {
        path: "/shell-demo?settings=payments&pp=terminal&tp=full",
        label: "Terminals, all statuses",
        note: "Four rows covering the status precedence, first match wins: Locked · 12 min (failed PIN entries, scoped to that device — under the old shared-PIN model this blocked every terminal at every location), Not paired (code issued, device never connected), Active (live sessions), No sessions (paired, nobody signed in). The middle two are states the source mockup had no room for.",
      },
      {
        path: "/shell-demo?settings=payments&pp=terminal&tp=typical",
        label: "Terminals, credentials dialog",
        note: "Show code & PIN on any row. Both credentials on one screen because that is how a device gets set up, but labelled apart because their lifecycles differ: the pairing code is typed into the hardware once and never changes, the PIN is typed at every sign-in and can be regenerated. PIN masked with Show/Copy; Regenerate PIN is a link underneath rather than a fourth icon, since Show and Copy read the value while regenerate replaces it. Same dialog after adding ('Set up X'), from the row ('Code & PIN for X'), and after regenerating ('New PIN for X', pre-revealed, and it says the code hasn't changed).",
      },
      {
        path: "/shell-demo?settings=payments&pp=terminal&tp=typical",
        label: "Terminals, sessions dialog",
        note: "'N devices signed in' on a row. A modal per terminal rather than a second listing — at typical volumes a sessions table was mostly dead rows. Each card shows device model, app build, IP, signed in and expires, with Revoke per session; live ones first. A session belongs to hardware, not a person: the PIN is shared by whoever works that counter, so there is no name to show and IP plus device model is how an unexpected sign-in gets recognised. Footer names the blunt instrument — regenerating the PIN revokes everything at once, for a lost device.",
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
    title: "Business app, clients directory (PRO-85)",
    description:
      "E2-7 Pet Parent & Pet Directory. Operator-facing clients list with search, sort, and a detail dialog. Mode toggle switches between with-pets (Pets column visible) and without-pets businesses.",
    screens: [
      { path: "/clients", label: "Clients directory (with pets)" },
      { path: "/clients?mode=without-pets", label: "Clients directory (without pets)" },
      {
        path: "/clients?client=millie-cassidy",
        label: "Client detail · multi-pet owner",
        note: "Opens the detail dialog over the directory. Pets tab shows Bobo, Mochi, Kiwi.",
      },
      {
        path: "/clients?client=charmaine-hayes",
        label: "Client detail · no pets",
        note: "Client with zero pets in pet mode — Pets tab still renders, empty state visible.",
      },
      {
        path: "/clients?add=1",
        label: "Add client takeover",
        note: "Full-screen sectioned takeover. Quick-create: only First name required, everything else optional. Pets section appears only in with-pets mode.",
      },
      {
        path: "/clients?client=millie-cassidy",
        label: "Add pet takeover (stacked)",
        note: "Open the Pets tab on the client detail and click Add pet. The pet takeover stacks over the client dialog with the current client pre-populated as an owner.",
      },
      {
        path: "/clients?client=millie-cassidy",
        label: "Edit pet takeover (stacked)",
        note: "Open a pet from the client's Pets tab, then Actions → Edit pet. Same takeover, pre-populated with that pet's data.",
      },
      {
        path: "/clients?client=kirsty-dingomal&tab=documents",
        label: "Client detail · Documents tab",
        note: "Deep-links straight into the Documents tab: the consent forms + files list. Each signed/pending form has a 'View form' action.",
      },
      {
        path: "/clients?client=kirsty-dingomal&form=seed-form-1",
        label: "View form · full-screen (signed)",
        note: "Opens the full-screen consent viewer directly (Documents tab, signed 'Client consent'): PDF left, signature panel right, single Close pill — the operator mirror of the public /sign/consent-signed screen.",
      },
      {
        path: "/clients?client=kirsty-dingomal&file=profile-file-1",
        label: "File preview · full-screen (PDF)",
        note: "Opens a Files-row 'Preview file' directly on the profile's personal file: the same full-screen shell as View form (sticky header, Download + Close) but single-column — just the in-app PDF, no signature panel. A demo PDF is generated so the seeded file renders.",
      },
      {
        path: "/pets",
        label: "Pets directory",
        note: "Operator-facing pet list, parallel to /clients but for pets. Multi-owner aware: owners render as family-colored chips. Only relevant in with-pets businesses.",
      },
      {
        path: "/pets?pet=bobo",
        label: "Pet detail · multi-owner",
        note: "Bobo is shared between Millie and Tom Cassidy, owners render as a family chip row in the header.",
      },
      {
        path: "/pets?add=1",
        label: "Add pet takeover (from directory)",
        note: "Pet takeover opened directly from the directory level. No client pre-populated; user adds owners via the Family section.",
      },
    ],
  },
  {
    title: "Business app, appointments (PRO-68)",
    description:
      "E4 Appointment management. Slice 2 of 5 (foundations spec → people grid → today agenda + popover → create-sheet → daycare/boarding). Front-desk scheduling on the People grid: 11 staff columns × time rows, booking blocks color-coded by service category, current-time line, header date controls.",
    screens: [
      {
        path: "/appointments",
        label: "People grid · Day view",
        note: "11 staff, ~25 fixture bookings, mid-day now-line. Click a block logs to console; popover ships in slice 3.",
      },
      {
        path: "/appointments",
        label: "New / edit sheet · Quick message",
        note: "Open the create sheet via 'New booking' (or 'Edit existing appointment (demo)'). Select a client to reveal the Quick message dropdown in the client action row — lists the business's WhatsApp templates with a resolved-text preview, plus a Message center link to the inbox. Picking a template opens the send dialog: edit the resolved body → Send → sending → 'Message sent' confirmation.",
      },
    ],
  },
  {
    title: "Business app, Boarding & Daycare",
    description:
      "Pet-boarding (overnight, priced per night) and daycare (same-day, priced per session) calendars for with-pets partners, modeled on the Cuddles reference but built on the cami design system and the appointment-sheet drawer conventions. Boarding = rooms × days timeline with night-spanning bars; daycare = staff columns × hourly time (Day) plus per-day counts (Month). Both share a Booking Detail drawer (status lifecycle, add-ons, late-checkout fee, notes, Check Out).",
    screens: [
      {
        path: "/appointments/boarding",
        label: "Boarding calendar · Week",
        note: "Rooms grouped by facility (Main House, Cattery) + an Unassigned row; stay bars span their nights (pet avatar · name · 🌙 N Nights), tinted by room, dimmed when checked-out. Today column highlighted. Toolbar: Boarding service pill, status filter, facility filter, Day/Week/Month, + Add. Click a bar → Booking Detail drawer.",
      },
      {
        path: "/appointments/boarding",
        label: "Boarding · Booking Detail + create",
        note: "Click any stay for the drawer: customer card (collapsible contacts + message), pet card (breed/size), stay block (rate/night, facility–room, editable status pill, check-in/out, nights, add-on chips, Add menu = Primary Service/Add-on/Product/Custom Item), Late check out fee toggle, notes, sticky Subtotal + Check Out. '+ Add' opens the New boarding stay sheet (mirrors the add-appointment shell: pet parent → pet & stay dates/room → add-ons → notes → Book stay).",
      },
      {
        path: "/appointments/daycare",
        label: "Daycare calendar · Day",
        note: "Staff columns (Unassigned + staff) × hourly axis; session blocks positioned by time (pet · client · service · time range), status-tinted with colored rail. Toolbar: Daycare pill, status filter, staff multi-select, view dropdown, + Add (opens the standard add-appointment sheet, since daycare is time-based). Click a block → duration-based Booking Detail drawer (plan label 'Full Day · Up to 8 hours', Subtotal '(N min)').",
      },
      {
        path: "/appointments/daycare",
        label: "Daycare calendar · Month",
        note: "Switch the view dropdown to Month: Sunday-first grid, today highlighted, in-month days show a big 'N Appointments' count. Week currently reuses the Day grid.",
      },
    ],
  },
  {
    title: "Business app, Messages — Inbox",
    description:
      "WhatsApp conversations inbox (WhatsApp-only in v0). Three panes: conversation list (funnel / SLA-window / routing pills, unread dots, search), thread (date separators, inbound/outbound bubbles, AI-parsed booking-request card, system lines, composer), and a client panel (funnel status, lifetime activity, pets with care notes, tags, internal notes). AI / automation surfaces (AI draft reply, Auto-confirm, Escalate, SLA timers) are visual stubs.",
    screens: [
      {
        path: "/messages/inbox",
        label: "Inbox · conversation selected",
        note: "Sarah Mansour's thread is selected by default — shows date groups (Fri Jun 19 → Today), a pending booking-request card (Confirm opens the new-appointment sheet; Reject marks rejected), and a reminder system line. Type + Send appends an outbound bubble. Templates fills the composer from the WhatsApp template set; AI draft reply fills a canned suggestion. Toggle the right client panel with Details. Funnel status (client panel) updates the list + header pills; remove tags inline.",
      },
    ],
  },
  {
    title: "Pet Business, products (PRO-product)",
    description:
      "Product catalog prototype. Listing page with empty/populated toggle, full-screen add-product takeover with brand, category, and supplier pickers.",
    screens: [
      {
        path: "/products",
        label: "Products listing, populated",
        note: "Table with 5 mock products, tabs (All/Active/Archived), search. Click the small toggle at the bottom-right to switch to empty state.",
      },
      {
        path: "/products",
        label: "Products listing, empty state",
        note: "Click 'Show empty state' toggle at the bottom-right of the populated listing.",
      },
      {
        path: "/products?product=p1",
        label: "Product detail dialog",
        note: "Opens the detail dialog over the listing via ?product=<id>. Tabs: Product details, Stock orders, Sales, Stock history. More-actions menu has Add stock, Remove stock, Edit, Delete. Try p1–p5.",
      },
      {
        path: "/products/new",
        label: "Add product, full-screen takeover",
        note: "Basic info (brand/category pickers), Pricing (retail sales + commission toggles), Inventory (SKU list, supplier picker, stock tracking). X closes back to /products.",
      },
      {
        path: "/products/p1/edit",
        label: "Edit product, full-screen takeover",
        note: "Same layout as /products/new, pre-populated from a MOCK_PRODUCTS row. Try p1–p5 for different products; unknown ids render a 'Product not found' fallback.",
      },
    ],
  },
  {
    title: "Reporting and analytics (DSG-43 / PRO-703)",
    description:
      "Config-driven reporting module — all 23 reports render from lib/reports/registry.ts through shared view templates (Table / Detailed Table / Dashboard + Performance-summary matrix). Every report is listed below (generated from the registry, so nothing goes stale). Adapted to Cami (AED, CamiPay/NeoPay/Cash, Pet Name in Client reports). Commission reports are out of scope (PRO-703 §7); Client insights is merged into Client list; Performance over time is the one remaining placeholder.",
    screens: REPORT_SCREENS,
  },
  {
    title: "Pet Business, sales (PRO-sales)",
    description:
      "Sales reporting hub. Daily Summary is the first page; sibling pages (Appointments, Invoices, Payments) are reached from the Sales group in the app sidebar.",
    screens: [
      {
        path: "/sales/new-sale",
        label: "New sale · Add to cart (PRO-395)",
        note: "Right-side POS drawer (wide, like the appointment sheet) with two panes: left item picker (global search + Appointments / Services / Products / Gift cards drilldowns, Memberships disabled), right cart pane in the appointment-sheet aesthetic — Add client card, Services section, pinned dark Continue-to-payment CTA with expandable VAT breakdown. Client attach: search 2+ chars, Add new client, Walk-In, selected card with Actions. Add services (staff dropdown, stack duplicates), products (qty +/-), or snapshot an appointment (auto-attaches client, replace-confirm if another client is attached). Gift cards: preset-value + custom-amount grid opens an Add gift card dialog (value, price, disabled discounts, expiration, custom code, This-is-a-gift, confirmation email, team member); the cart line shows 'AED value · valid for … · team member' and re-opens the dialog to edit. Payment step shows a 'Gift cards can't be used to purchase another gift card' notice + a disabled Gift card method when a gift card is in the cart; finishing without full payment opens an 'Unpaid sale' confirm (gift cards stay inactive until fully paid). Redeem at checkout: on a non-gift-card sale, the Gift card payment method opens a 'Redeem gift card' dialog — find by code (try YYOSNPHO = not active, QM4KTRZA / ZTP3RG84 = active with balance, anything else = typo error), then apply the balance as a Gift card payment line (capped at the lesser of card balance and amount owed; surplus stays on the card). Footer back-calculates tax-inclusive Subtotal/Tax from Total. Closing with items prompts Save as draft / Discard.",
      },
      {
        path: "/sales/new-sale?dialog=gift-card",
        label: "New sale · Add gift card dialog",
        note: "Deep-links straight into the Add gift card dialog over an empty cart (value, price, disabled discounts, expiration, custom code, This-is-a-gift, confirmation email, team member). Apply drops the line into the cart.",
      },
      {
        path: "/sales/new-sale?step=tip",
        label: "New sale · Tip step",
        note: "Seeds a demo cart (one service + a client) and opens on the Tip step — tip presets + custom-tip dialog. Back through the breadcrumb returns to Cart.",
      },
      {
        path: "/sales/new-sale?step=payment",
        label: "New sale · Payment step",
        note: "Seeds a demo cart and opens on the Payment step — method grid, Split, and the cash/card amount dialogs. Footer back-calculates tax-inclusive Subtotal/Tax.",
      },
      {
        path: "/sales/new-sale?dialog=payment-link",
        label: "New sale · Payment link (self checkout, PRO-909)",
        note: "Seeds a demo cart on the Payment step with the Send-payment-link dialog open. Operator confirms client name + mobile (prefilled from the attached client), reads the 3-step 'How it works', sends. Sending creates a draft sale and locks the cart: the drawer body is replaced by the Payment-link-sent screen showing recipient, amount and a 12-hour expiry. No progress beats — the operator can't act on them. Cancel payment link invalidates the link (never edits it), closes the cart, and hands off to the draft sale it created — Checkout there resumes at the Tip step; Mark as paid settles to the Payment complete screen. The client's half of this is /[slug]/pay/[token].",
      },
      {
        path: "/sales/new-sale?dialog=redeem",
        label: "New sale · Redeem gift card at checkout",
        note: "Seeds a demo (non-gift-card) cart on the Payment step with the Redeem gift card dialog open: find by code (QM4KTRZA / ZTP3RG84 = active with balance, YYOSNPHO = not active, anything else = typo error), then apply the balance as a Gift card payment line.",
      },
      {
        path: "/sales/daily-summary",
        label: "Daily Summary",
        note: "Date stepper at the top (prev/Today/next + calendar popover), then side-by-side Transaction summary and Cash movement summary tables matching the figma values. Negative amounts render in tomato-11.",
      },
      {
        path: "/sales/appointments-list",
        label: "Appointments list",
        note: "Tabular view of a curated 10-row booking subset covering all seven statuses (anchored on 18 May 2026 to match the figma). Toolbar: search by ref/client, Month-to-date pill, Filters pill, sort dropdown (Created/Scheduled/Duration · asc/desc). Status badges: Booked (blue), Confirmed (violet), No-show (tomato), Completed (green), etc. Footer count.",
      },
      {
        path: "/sales/appointments-list?ref=b-002",
        label: "Appointment detail sheet",
        note: "Opens the right-side sheet over the listing via ?ref=<id>. Try b-001…b-024 for different states (b-002 is ready-for-pickup, b-003 confirmed, etc.). Status-colored header band (blue=booked, gray=completed, tomato=no-show), Services list, sale total with inline-expand breakdown, Quick actions popover. Status pill behavior: terminal statuses (completed/cancelled) are static, no-show only offers Undo, others get the full dropdown — pill + band update live.",
      },
      {
        path: "/sales/sales-list",
        label: "Sales list (invoices)",
        note: "Tabbed (Sales / Drafts) listing of invoices, header layout matches /products (title, Options + Add sale, tabs with counts, search + date-range + filter + sort in one row). Status badges: Completed (green), Part Paid (gold), Unpaid (gray), Refunded (gray), Voided (tomato). Demo today is 2026-05-25 — five 'today' rows guarantee one of every status is visible by default; switch the range to Last 7 days to see the full 10-row fixture.",
      },
      {
        path: "/sales/sales-list?tab=drafts",
        label: "Sales list · Drafts tab",
        note: "Switch to the Drafts tab (or click the count) for the unsubmitted-sales listing: Draft # (hex ref), Client, Draft badge (gray), Created, Tips, Gross total. Drafts ignore the date-range pill — they always show in full — and search matches the draft ID or client. Search placeholder switches to 'Search by Draft ID'.",
      },
      {
        path: "/sales/sales-list?draft=31A06EA3",
        label: "Draft detail dialog",
        note: "Same centered dialog shell as the sale detail, opened via ?draft=<ref>. Always-Unpaid header (cami-yellow pill, matching the listing) with a Checkout primary action that resumes the sale — it closes the dialog and reopens the cart on the Tip step with the draft's line and client already loaded; the kebab has a single destructive 'Cancel draft' that opens a 'Cancel draft sale?' confirm dialog (Go back / Confirm). Walk-In drafts show a violet walk-in card instead of the clickable client row; receipt body is Subtotal / Total / Balance (full total owed). Try 31A06EA3 (Walk-In) or 7F2B19C4 (named client).",
      },
      {
        path: "/sales/sales-list?sale=7",
        label: "Sale detail dialog",
        note: "Opens the centered dialog over the listing via ?sale=<id>. Status-driven header action (Pay now / Share invoice filled or outline / nothing for voided) and Quick-actions kebab (different items per status). Receipt body shows Subtotal/Total, Payment line, and Balance or Change depending on what was paid; refunded sales add a Refund #N card above the original Sale card. Try 7 (completed), 6 (part-paid), 3 (refunded), 1 (voided) — see also 12–16 for the new today-dated rows.",
      },
      {
        path: "/sales/gift-cards-sold",
        label: "Gift cards sold",
        note: "Listing of gift cards purchased by clients (Sales sidebar group). Columns: Gift card code (sticky, clickable), Issue date, Expiry date, Status, Sale #, Purchaser, Owner, Total, Redeemed, Remaining. Status badges: Unpaid (cami-yellow), Active (lime), Redeemed (olive), Expired (gray). Toolbar: search by code/purchaser/owner + Filters. Header Options dropdown: Gift cards settings + Export (PDF/CSV/Excel). Amounts in AED.",
      },
      {
        path: "/sales/gift-cards-sold?card=gc-1",
        label: "Gift card detail",
        note: "Centered modal (same shell as the sale detail dialog) opened via ?card=<id> (gc-1…gc-5): muted header with status pill + close, 'Gift card' title + issue date/code, underline Details / Activity tabs. Details: Original amount, Redeemed, Remaining, Code (copy), Sale #, Purchaser, Owner, Expires, Issue date. Activity: the gradient gift-card visual (current balance) above a month-grouped event timeline (purchased / redeemed / fully redeemed / claimed) with icons + status indicators. Sale # (table + Details) and 'View sale' (Activity) open the real SaleDetailDialog in place, stacked over this screen.",
      },
    ],
  },
  {
    title: "Pet Business, catalogs — Service menu & Categories (PRO-catalog)",
    description:
      "Service catalog prototype ported from the developer app, backed by local mock state (no API, no permissions). Adding a category/service on one screen is reflected on the other — both share one in-memory store via the catalogs layout. Prices render in AED.",
    screens: [
      {
        path: "/catalogs/service-menu",
        label: "Service menu",
        note: "Category sidebar + grouped service list. Drag service rows to reorder within a category or move them between categories. 'Add' menu creates a single service (full-screen takeover) or a category (dialog); 'Order' / Options → 'Set menu order' opens the reorder sheet. Search filters by service name. Per-card and per-category kebabs offer Edit / Archive / Delete. All mutations update local state live.",
      },
      {
        path: "/catalogs/service-menu?new=1",
        label: "New service takeover",
        note: "Deep-links straight into the add-service full-screen takeover (?new=1). Team members, pricing (Fixed/From/Free in AED), duration, variants (Add variant dialog), and extra-time settings. Save adds the service to the list. (Editing an existing service opens the same takeover from a service card's kebab → Edit.)",
      },
      {
        path: "/catalogs/categories",
        label: "Categories",
        note: "Sortable table of merchant categories (Name / Color / Description / Total services). Add category dialog, row kebab with Edit (detail dialog) / Archive / Delete (with confirm). Service counts stay in sync with the Service menu screen. Load-more pagination at 10 rows.",
      },
      {
        path: "/catalogs/categories?add=1",
        label: "Add category dialog",
        note: "Deep-links straight into the add-category dialog (?add=1). Name, color swatch, and description; Save adds the category to the table and the Service menu sidebar.",
      },
    ],
  },
  {
    title: "Pet parent, booking flow (E3-4 / E3-6)",
    description:
      "Public pet-parent booking on cami.app/[slug]/book, opened from the business page 'Book now'. Categorized multi-select services (scales past 30 via tabs + a Categories dropdown on the list-icon), staff/day/time picker, phone-first identify (mobile → OTP → resolve caller: returning client pre-fills details + surfaces a saved-pet picker, new client gets an empty form with phone locked; pet-module feature-flagged, no separate step), confirm, and a 'You're booked' terminal. Responsive: mobile single column with a Price breakdown sheet; desktop two-pane with a sticky summary cart. See docs/specs/PRO-80.",
    screens: [
      {
        path: "/shampooch-jvc/book",
        label: "Booking flow · services → time → identity → confirm",
        note: "Multi-select service cards by category (list-icon opens a Categories dropdown), slot picker (12-staff horizontal rail with prev/next arrows + edge fade, circle day picker, available-times list, 5-min hold). Identity step is phone-first: enter mobile → auto-verifying 6-digit OTP (code starting '0' fails) → resolve. Demo: mobile ending in an EVEN digit is a returning client (pre-filled name/email, phone disabled, saved-pet dropdown Bella/Miso + 'Add a new pet'); ODD digit is new (empty form, phone pre-filled & disabled, inline pet capture). Confirm with summed total, then 'You're booked' with a reference.",
      },
      {
        path: "/purr-palace/book",
        label: "Booking flow · second business",
        note: "Confirms the flow is data-driven off the public business",
      },
      {
        path: "/shampooch-jvc/booking/CAMI-4821",
        label: "Manage booking (E3-5)",
        note: "View detail (status starts as 'Booked', violet; ref suffix -confirmed → green, -cancelled → sand) → Add to calendar dropdown (Google Calendar / Apple · Outlook .ics) → reschedule (re-enters the slot picker) or cancel (guarded destructive) → updated / cancelled terminals.",
      },
      {
        path: "/account",
        label: "Pet-parent account (E3-6)",
        note: "Passwordless: mobile → OTP verify → home (upcoming booking, pets, profile). New numbers auto-create an account.",
      },
      {
        path: "/emails/booking-confirmation",
        label: "Confirmation email (E3-5)",
        note: "Branded email template; pet business leads the header, Cami signature footer, manage-booking CTA.",
      },
    ],
  },
  {
    title: "Demos & playground",
    description: "Internal references for design foundations, shell layout, and component states.",
    screens: [
      { path: "/shell-demo", label: "Business app shell" },
      { path: "/playground", label: "Component states" },
      {
        path: "/appointments",
        label: "Global search takeover",
        note: "Click the topbar magnifier (or Cmd/Ctrl+K) on any shell page. Full-screen search over clients + bookings; try 'B-77342' for a booking ref. Rows open the client dialog / appointment sheet on top. Also demoed in the playground.",
      },
      {
        path: "/style-guide",
        label: "Design foundations",
        note: "Color (semantic slots, Radix / Cami / neutral-gray scales), type, radius, elevation, pattern utilities, spacing. Values are read from the live CSS custom properties at runtime rather than copied, so the page cannot drift from globals.css. Click a swatch to copy its utility.",
      },
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
