import type { Metadata } from "next"
import Link from "next/link"
import { Fragment } from "react"
import { DirectoryLayout } from "@/components/blocks/shared/directory-layout"
import { BackToTop } from "@/components/blocks/shell/back-to-top"
import { ThemeToggle } from "@/components/blocks/shell/theme-toggle"
import { REPORTS } from "@/lib/reports/registry"

export const metadata: Metadata = {
  title: "Screens",
  description: "Map of every Cami screen currently in the repo",
}

type Screen = {
  path: string
  label: string
  note?: string
  /**
   * A sub-heading inside the group. Multi-location uses it for the delivery
   * epic, so a phase reads epic by epic. Groups that leave it out render as
   * they always have.
   */
  epic?: string
}

/**
 * Which audience a group belongs to. 31 groups in one flat scroll gave no way
 * to find anything — the lanes are the map's legend, and the index at the top
 * is built from them.
 */
type Lane = "public" | "onboarding" | "business" | "settings" | "hq" | "reference"

const LANES: Array<{ id: Lane; label: string; blurb: string }> = [
  {
    id: "public",
    label: "Public & pet parent",
    blurb: "Everything a pet parent can reach without an account.",
  },
  {
    id: "onboarding",
    label: "Getting in",
    blurb: "Sign-in, invites, and the first-run wizard.",
  },
  {
    id: "business",
    label: "Business app",
    blurb: "The operator's day: booking, selling, catalog, reporting.",
  },
  {
    id: "settings",
    label: "Business settings",
    blurb: "Everything behind the settings dialog.",
  },
  { id: "hq", label: "Cami HQ", blurb: "Our own control plane over Partners." },
  {
    id: "reference",
    label: "Reference",
    blurb: "Component states and demo surfaces, not product screens.",
  },
]

type Section = {
  lane: Lane
  title: string
  description?: string
  /** An older anchor this group still answers to, so links already shared keep landing. */
  alias?: string
  screens: Screen[]
}

/**
 * Collapse a group's rows onto one entry per route, in the order the routes
 * first appear. A route that carries several things to look at gets one path
 * cell and a list of them, rather than the same path printed five times.
 */
/** Consecutive runs of the same epic, in written order. No epic is one run. */
function groupByEpic(screens: Screen[]): Array<{ epic?: string; screens: Screen[] }> {
  const runs: Array<{ epic?: string; screens: Screen[] }> = []
  for (const screen of screens) {
    const last = runs[runs.length - 1]
    if (last && last.epic === screen.epic) last.screens.push(screen)
    else runs.push({ epic: screen.epic, screens: [screen] })
  }
  return runs
}

function groupByPath(screens: Screen[]): Array<{ path: string; screens: Screen[] }> {
  const groups: Array<{ path: string; screens: Screen[] }> = []
  for (const screen of screens) {
    const existing = groups.find((g) => g.path === screen.path)
    if (existing) existing.screens.push(screen)
    else groups.push({ path: screen.path, screens: [screen] })
  }
  return groups
}

/** Stable anchor for a group, so a single group can be linked into a thread. */
function sectionSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
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
    "21 widget cards with a hero KPI strip, sticky controls and Customise by role, add ?state=loading, empty or sparse.",
  "performance-summary":
    "Metric by team-member matrix with subtotals, Total column, sticky header and first column, and drill-through labels.",
  "performance-over-time":
    "Entity by time-period matrix: pills recompute a bar chart and a sticky-first-column table.",
}
const REPORT_SCREENS: Screen[] = [
  {
    path: "/reports",
    label: "Reporting index",
    note: "Report cards by category tab with search, Premium badge and favourite star, the entry point to every report.",
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
    lane: "public",
    title: "Public",
    description: "Anything an unauthenticated visitor can land on.",
    screens: [{ path: "/", label: "Root", note: "Redirects to this screens index" }],
  },
  {
    lane: "public",
    title: "Pet parent, public business page (PRO-96)",
    description:
      "Public booking page at cami.app/[slug]: sticky booking card on desktop, single column on mobile, 404 for unknown slugs.",
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
        path: "/sota",
        label: "Live business · hair salon, no pets",
        note: "Sota, the only non-pet venue: check nothing assumes a pet, and switch to it from the workspace menu top-left.",
      },
      {
        path: "/no-such-business",
        label: "404, slug not found",
        note: "Unknown slugs and businesses not live yet both land here, so the public site never confirms a name is taken.",
      },
      {
        path: "/draft-business",
        label: "404, business not yet live",
        note: "Slug exists but isLive is false, hidden behind the same not-found page",
      },
    ],
  },
  {
    lane: "public",
    title: "Customer card, the record a customer opens (Client Card brief)",
    description:
      "Customer-facing client record: wallet, loyalty balance, next appointment and staff preferences, in one of five palettes.",
    screens: [
      {
        path: "/sota/card",
        label: "Sota, the customer face of the same record",
        note: "Customer face of the client record, matching the brief's layout and data but set in Cami's Manrope, not a serif.",
      },
      {
        path: "/sota/card?theme=ink",
        label: "Same card, different palette",
        note: "Walk the five palettes in the strip under the card to see how far colour alone carries a venue's brand.",
      },
      {
        path: "/shampooch-jvc/card",
        label: "Grooming venue, pets in preferences",
        note: "Confirms the card is data-driven: same component, a pet business's wallet and a groomer instead of a stylist.",
      },
      {
        path: "/purr-palace/card",
        label: "Empty wallet, nothing booked",
        note: "A first-visit client with nothing: Wallet and Upcoming as outlines, Loyalty absent since Purr Palace runs no programme.",
      },
      {
        path: "/sota/card/demo",
        label: "The door in from a message",
        note: "Where the {{cardLink}} in every message lands: one tap confirms who is opening, and the screen says the link is personal.",
      },
      {
        path: "/playground#client-card-the-two-faces",
        label: "The two faces, side by side",
        note: "Reception's and the customer's views of one client row side by side, with preferences the only shared row.",
      },
      {
        path: "/playground#client-card-message-to-card",
        label: "The flow, trigger to card",
        note: "Trigger, WhatsApp message, branded page and card in one row, read left to right to check the palette carries through.",
      },
      {
        path: "/playground#customer-card-per-venue-theming",
        label: "The same card in all five palettes",
        note: "All five palettes side by side in one typeface, to judge whether colour alone carries a venue.",
      },
      {
        path: "/sota/card/demo-expired",
        label: "The same door, link expired",
        note: "Expired or made-up links land on this branded screen, which shows no balance, appointment or preference.",
      },
    ],
  },
  {
    lane: "public",
    title: "Pet parent, booking flow (E3-4 / E3-6)",
    description:
      "Public booking from 'Book now': categorized services, staff and time, phone-first OTP, confirm and 'You're booked'.",
    screens: [
      {
        path: "/shampooch-jvc/book",
        label: "Booking flow · services → time → identity → confirm",
        note: "Book services, pick a slot, verify by phone OTP and confirm, with even-digit mobiles as returning clients and odd as new.",
      },
      {
        path: "/shampooch-jvc/book",
        label: "Booking flow · pet address + pet notes",
        note: "Optional address with a Pet Address tick using map search, plus six pet-note categories that each need specifics.",
      },
      {
        path: "/purr-palace/book",
        label: "Booking flow · second business",
        note: "Confirms the flow is data-driven off the public business",
      },
      {
        path: "/shampooch-jvc/book",
        label: "Booking flow · one person, two branches (R05, DW2.3, DW2.4)",
        note: "Pick Lena or Tala on the slot step to see slots disappear when they are due at the other branch, which is never named.",
      },
      {
        path: "/shampooch-jvc/book",
        label: "Booking flow · Combo services",
        note: "Pick 'Full groom & nails' or 'Spa pamper duo' to see Combo rows in the summary and Review, with the combo's duration and total.",
      },
      {
        path: "/shampooch-jvc/book",
        label: "Booking flow · promo code (DZ-352)",
        note: "On Review, 'Have a promo code?' takes WELCOME15, SPA20, GROOM50 or NAILFREE, one code per booking; the other seeded codes show each refusal.",
      },
      {
        path: "/shell-demo?settings=deals&deal=welcome-online",
        label: "Deal · redeemable on your booking page (DZ-352)",
        note: "Details shows the Online booking row; Edit opens the wizard's switch, which makes the code required.",
      },
      {
        path: "/shampooch-jvc/booking/CAMI-4821",
        label: "Manage booking (E3-5)",
        note: "Booking detail with Add to calendar, then reschedule or cancel, ending on the updated or cancelled screens.",
      },
      {
        path: "/shampooch-jvc/booking/CAMI-4821-pickup",
        label: "Manage booking · pickup variant",
        note: "Pickup variant of manage booking, adding Pickup and Notes rows so the parent can check the collection address.",
      },
      {
        path: "/shampooch-jvc/booking/CAMI-3208-promo",
        label: "Manage booking · promo code (DZ-352)",
        note: "A booking made with WELCOME15: a Promo code row above Total, and the quoted AED 221 with AED 260 struck through.",
      },
      {
        path: "/account",
        label: "Pet-parent account (E3-6)",
        note: "Passwordless mobile and OTP sign-in to a home with upcoming booking, pets and a profile that now has an Address row.",
      },
      {
        path: "/emails/booking-confirmation",
        label: "Confirmation email (E3-5)",
        note: "Branded email template; pet business leads the header, Cami signature footer, manage-booking CTA.",
      },
      {
        path: "/emails/booking-confirmation?pickup=1",
        label: "Confirmation email · pickup variant",
        note: "Pickup variant of the confirmation email: adds a Notes row and swaps 'Where' for 'Pet Address'.",
      },
    ],
  },
  {
    lane: "public",
    title: "CamiPay, payment link landing (PRO-594)",
    description:
      "Customer pay page opened from a payment link or QR with no login: ledger, hero total, tip presets and payment methods.",
    screens: [
      {
        path: "/shampooch-jvc/pay/demo-token",
        label: "Unpaid · full flow",
        note: "Full pay flow: pet-aware bill, tip presets, ledger and total, Apple Pay or saved card, and combo lines struck through.",
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
    lane: "public",
    title: "Consent form signing (public)",
    description:
      "Public consent-form signing from an emailed link: OTP verify, then the PDF beside a sign form, with signed and completed states.",
    screens: [
      {
        path: "/sign/consent",
        label: "Awaiting · full flow",
        note: "OTP verify, then sign beside the PDF: fill name and email, type or draw a signature, agree, and Sign Agreement.",
      },
      {
        path: "/sign/consent-signed",
        label: "Already signed",
        note: "Skips OTP, lands on the signing screen with the right card in a read-only Signed state showing the captured signature.",
      },
      {
        path: "/sign/consent-completed",
        label: "Completed · terminal",
        note: "Thank-you screen after signing, confirming the signed form went back to the business.",
      },
    ],
  },
  {
    lane: "onboarding",
    title: "Auth, business",
    description: "Business owner and team member sign-in flow.",
    screens: [
      { path: "/sign-in", label: "Sign in, email entry" },
      { path: "/sign-in/password", label: "Password step" },
      { path: "/sign-in/verify", label: "Verify code" },
      { path: "/sign-in/forgot-password", label: "Forgot password" },
      {
        path: "/sign-in/reset-password?token=demo",
        label: "Set a new password",
        note: "Reset-password form from the email link, and ?token=expired shows the dead-link message instead.",
      },
      {
        path: "/sign-in/accept-invite?token=demo",
        label: "Accept a team invite",
        note: "A team member's first sign-in: they set their own password against the invite token rather than being handed one.",
      },
      {
        path: "/sign-in/welcome",
        label: "Welcome, account ready",
        note: "Terminal screen after sign-up or an accepted invite, before the first-time setup wizard picks up.",
      },
    ],
  },
  {
    lane: "onboarding",
    title: "Pet Business, first-time setup wizard (PRO-97)",
    description:
      "Owner first-time setup: /setup opens on About, runs five steps, then a separate Go-live page.",
    screens: [
      { path: "/setup", label: "Wizard entry (redirects to About)" },
      {
        path: "/setup/about",
        label: "Step 1 · About your business",
        note: "Step 1 now asks for an optional Google review link that never blocks Continue.",
      },
      { path: "/setup/type", label: "Step 2 · Business type" },
      {
        path: "/setup/location",
        label: "Step 3 · Location",
        note: "Shared address search field: type 'jum', 'bay' or 'quoz', pick a place, and the editable location grid fills in.",
      },
      { path: "/setup/invoicing", label: "Step 4 · Invoicing" },
      { path: "/setup/hours", label: "Step 5 · Business hours" },
      {
        path: "/setup/done",
        label: "Go-live · Your business is set up",
        note: "Minimal go-live screen with a violet check and heading once setup is done.",
      },
    ],
  },
  {
    lane: "business",
    title: "Business app, appointments (PRO-68)",
    description:
      "Front-desk People grid: 11 staff columns by time, bookings coloured by service category, current-time line, date controls.",
    screens: [
      {
        path: "/appointments/resources",
        label: "Resource calendar · Day",
        note: "Day grid with bays, rooms and vans as columns instead of staff, each block tinted per resource.",
      },
      {
        path: "/appointments",
        label: "Toolbar + sheets",
        note: "Header toolbar with date, Day/Week, filters and New booking over a demo body, without the calendar grid.",
      },
      {
        path: "/appointments",
        label: "New booking sheet · Pet Address + Pet notes",
        note: "Open New booking to try Pet Address with saved or map-picked addresses, Client notes, and the six Pet notes categories.",
      },
      {
        path: "/playground#client-notes-staff-alert",
        label: "Client notes / Staff Alert (playground)",
        note: "Client notes Staff Alert in four states: attributed preview, single unattributed note, compact popover and no notes.",
      },
      {
        path: "/playground#navigate-to-address",
        label: "Navigate to address (playground)",
        note: "Pickup field flips between Pinned and typed, with pinned (Navigate) and typed (Search in Maps) bookings side by side.",
      },
      {
        path: "/appointments",
        label: "New booking sheet · Combo services",
        note: "Add service in New booking: pick a combo and it expands into back-to-back services with the price split across them.",
      },
      {
        path: "/appointments",
        label: "New / edit sheet · the branch it books at",
        note: "New booking asks for the branch after the client and before services, with paused branches listed and badged.",
      },
      {
        path: "/appointments",
        label: "New booking sheet · Walk-in and new client",
        note: "Add an appointment: the client starts as Walk-in, and 'New client' in the picker opens Add client seeded with the name.",
      },
      {
        path: "/appointments",
        label: "New / edit sheet · Quick message",
        note: "Open New booking, select a client and use Quick message to pick a WhatsApp template, edit it and send.",
      },
    ],
  },
  {
    lane: "business",
    title: "Business app, Boarding & Daycare",
    description:
      "Boarding rooms-by-days timeline and daycare staff-by-hour calendars, sharing one Booking Detail drawer.",
    screens: [
      {
        path: "/appointments/boarding",
        label: "Boarding calendar · Week",
        note: "Week of rooms by facility with stay bars across their nights. Click a bar to open the Booking Detail drawer.",
      },
      {
        path: "/appointments/boarding",
        label: "Boarding · Booking Detail + create",
        note: "Click a stay for the booking detail drawer, or + Add for the New boarding stay sheet.",
      },
      {
        path: "/appointments/daycare",
        label: "Daycare calendar · Day",
        note: "Daycare day view with staff columns and time-placed session blocks, click one for the duration-based Booking Detail drawer.",
      },
      {
        path: "/appointments/daycare",
        label: "Daycare calendar · Month",
        note: "Switch the view to Month for a Sunday-first grid with today highlighted and an appointment count per day.",
      },
    ],
  },
  {
    lane: "business",
    title: "Business app, clients directory (PRO-85)",
    description:
      "Operator clients list with search, sort and a detail dialog, plus a with-pets / without-pets mode toggle.",
    screens: [
      { path: "/clients", label: "Clients directory (with pets)" },
      {
        path: "/clients?tags=client-vip",
        label: "Clients directory · filtered by tag",
        note: 'The brief\'s last complaint about the profile is that tags are "supported, but no reason for staff to fill them in today". This is the reason: the Tags control — named for the only thing it filters by, rather than a generic Filters icon — lists only tags somebody has actually applied, with how many clients carry each, and selecting two narrows rather than widens — "VIP who also tips well" is the query worth tagging for. A tag that filters is worth applying; one that only decorates a profile is not.',
      },
      { path: "/clients?mode=without-pets", label: "Clients directory (without pets)" },
      {
        path: "/clients?client=maaz-shaffi",
        label: "Client detail · the brief's own record",
        note: 'Both halves are on one screen in /playground under "Client card — the two faces"; this is the operator half on its own. Open it beside /sota/card. Both faces are drawn from this one client row and nothing about the layout, type or colour survives the crossing — which is what the brief\'s side-by-side is a test for. Reception sees no-shows, lifetime sales, source and tags; the customer sees none of those, and the split is enforced in the type rather than by remembering. Preferences appear on both, because they are the one field staff maintain and the customer reads.',
      },
      {
        path: "/clients?client=millie-cassidy",
        label: "Client detail · Overview, the full record",
        note: "Millie Cassidy's full Overview: identity chips, lifetime strip, notes, Visits with Rebook, packages and pets.",
      },
      {
        path: "/clients?client=karen-dougall",
        label: "Client detail · four client notes",
        note: "Karen's four notes: the Overview card shows two and sends the rest to Documents so Rebook stays in view.",
      },
      {
        path: "/clients?client=karen-dougall&tab=documents",
        label: "Client notes · edit and delete (PRD-196)",
        note: "Hover a note for Edit and Delete; Delete asks first, from the row and from inside the editor.",
      },
      {
        path: "/clients?client=millie-cassidy&tab=pets",
        label: "Pet notes · edit and delete (PRD-196)",
        note: "Open Bobo: Pet notes on Overview and Documents carry the same Edit, Delete and confirmation.",
      },
      {
        path: "/clients?client=kirsty-dingomal",
        label: "Client detail · booked, never yet seen",
        note: "A client booked but never seen: Visits leads with the booking, and address, tags, spend and packages show empty states.",
      },
      {
        path: "/clients?client=grace-kent",
        label: "Client detail · lapsed, nothing booked",
        note: "Lapsed client with history and an empty Next, so Rebook is the one action on the card worth pressing.",
      },
      {
        path: "/clients?client=tom-cassidy&tab=documents",
        label: "Client detail · allergies and patch tests",
        note: "Forms and files first, then patch tests and allergies: Tom's test lapsed, Maaz's valid, Kirsty's pending, Millie has an allergy.",
      },
      {
        path: "/clients?client=amy",
        label: "Client detail · repeat no-shows",
        note: "Two no-shows and a refund: the header count and the No-shows cell open the same list.",
      },
      {
        path: "/clients?client=luke",
        label: "Client detail · four pets",
        note: "Pet chips wrap instead of pushing the rest of Overview below the fold — the reason they stopped being stacked rows.",
      },
      {
        path: "/clients?client=charmaine-hayes",
        label: "Client detail · no pets, no activity",
        note: "Zero pets in pet mode: the Pets tab still renders its empty state, and Overview holds with nothing in any card.",
      },
      {
        path: "/clients?add=1",
        label: "Add client takeover",
        note: "Full-screen add client takeover where only First name is required, with a Pets section in with-pets mode.",
      },
      {
        path: "/clients?client=millie-cassidy",
        label: "Add pet takeover (stacked)",
        note: "Click Add pet on the Pets tab to stack the pet takeover over the client dialog with this client as owner.",
      },
      {
        path: "/clients?client=millie-cassidy",
        label: "Edit pet takeover (stacked)",
        note: "Open a pet from the client's Pets tab, then Actions → Edit pet. Same takeover, pre-populated with that pet's data.",
      },
      {
        path: "/clients?client=kirsty-dingomal&tab=documents",
        label: "Client detail · Documents tab",
        note: "Client detail opened on the Documents tab: consent forms and files, each form with a View form action.",
      },
      {
        path: "/clients?client=kirsty-dingomal&form=seed-form-1",
        label: "View form · full-screen (signed)",
        note: "Full-screen signed consent viewer for Kirsty: PDF left, signature panel right, single Close pill.",
      },
      {
        path: "/clients?client=kirsty-dingomal&file=profile-file-1",
        label: "File preview · full-screen (PDF)",
        note: "Full-screen preview of a profile's personal PDF file, with Download and Close and no signature panel.",
      },
      {
        path: "/pets",
        label: "Pets directory",
        note: "Operator pet list parallel to /clients, with owners as family-colored chips for multi-owner pets.",
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
    lane: "business",
    title: "Pet Business, catalogs — Service menu, Categories & Packages (PRO-catalog)",
    description:
      "Service menu, categories and packages on one shared mock store, so changes on one screen show on the others.",
    screens: [
      {
        path: "/catalogs/service-menu",
        label: "Service menu",
        note: "Service menu with category sidebar: drag to reorder, Add a service, category or combo, and Combo badges on combo rows.",
      },
      {
        path: "/catalogs/service-menu/combos/groom-and-nails-combo/edit",
        label: "Edit combo",
        note: "A combo's kebab Edit opens the builder on 'Colour & Cut Combo' with services, schedule type and price type filled in.",
      },
      {
        path: "/catalogs/service-menu/combos/new",
        label: "New combo",
        note: "Combo builder: pick services, sequence or parallel, four price types, and Save adds a Combo-badged row to the menu.",
      },
      {
        path: "/catalogs/service-menu?new=1",
        label: "New service takeover",
        note: "Deep link into the add-service takeover: team members, AED pricing, duration, variants and extra time.",
      },
      {
        path: "/catalogs/categories",
        label: "Categories",
        note: "Sortable categories table with add, edit, archive and delete, service counts in sync with the Service menu.",
      },
      {
        path: "/catalogs/packages",
        label: "Packages",
        note: "Packages showing what each covers, how it is paid and where it sells, with search by service and working Add and Edit.",
      },
      {
        path: "/catalogs/packages",
        label: "A package's sales, bounded by the grant",
        note: "Open Bath & Brush 5+1 then Sales: buyer, branch, sessions left, expiry and Active, Exhausted or Cancelled status.",
      },
      {
        path: "/catalogs/packages/new",
        label: "Create package",
        note: "Four-section package takeover: services only (no combos), Recurring swaps expiry for frequency, Save names what is missing.",
      },
      {
        path: "/catalogs/packages/grooming-club/edit",
        label: "Edit package",
        note: "Edit Grooming Club with every field loaded from the saved package, landing on frequency and length since it recurs.",
      },
      {
        path: "/catalogs/packages/nail-trim-10/edit?s=online",
        label: "Online sales, and the branch axis packages do not have",
        note: "Package online sales section is just two switches, with no per-branch list because the package belongs to the business.",
      },
      {
        path: "/catalogs/categories?add=1",
        label: "Add category dialog",
        note: "Add category dialog opened directly: name, color swatch and description, saved to the table and Service menu sidebar.",
      },
    ],
  },
  {
    lane: "business",
    title: "Pet Business, products (PRO-product)",
    description:
      "Product listing with empty/populated toggle and the full-screen add-product takeover with brand, category, supplier pickers.",
    screens: [
      {
        path: "/products",
        label: "Products listing, populated",
        note: "Products table with All, Active and Archived tabs and search. The bottom-right toggle switches to the empty state.",
      },
      {
        path: "/products",
        label: "Products listing, empty state",
        note: "Click 'Show empty state' toggle at the bottom-right of the populated listing.",
      },
      {
        path: "/products?product=p1",
        label: "Product detail dialog",
        note: "Product detail dialog with four tabs and Add stock, Remove stock, Edit and Delete actions (try p1 to p5).",
      },
      {
        path: "/products/new",
        label: "Add product, full-screen takeover",
        note: "Full-screen Add product takeover with Basic info, Pricing and Inventory sections, X closes back to products.",
      },
      {
        path: "/products/p1/edit",
        label: "Edit product, full-screen takeover",
        note: "Edit product takeover pre-filled from mock data: try p1 to p5, and an unknown id shows 'Product not found'.",
      },
    ],
  },
  {
    lane: "business",
    title: "Pet Business, sales (PRO-sales)",
    description:
      "Sales reporting hub: Daily Summary first, with Appointments, Invoices and Payments reached from the sidebar Sales group.",
    screens: [
      {
        path: "/sales/new-sale",
        label: "New sale · Combo in the cart",
        note: "Add a combo from the picker and its services land as separate struck-through cart lines with a Bundle discount row.",
      },
      {
        path: "/sales/new-sale",
        label: "New sale · Add to cart (PRO-395)",
        note: "POS drawer with item picker and cart, client attach, staff per line and gift card redeem (try QM4KTRZA).",
      },
      {
        path: "/sales/new-sale?dialog=gift-card",
        label: "New sale · Add gift card dialog",
        note: "Deep link to the Add gift card dialog over an empty cart, Apply drops the gift card line into the cart.",
      },
      {
        path: "/sales/new-sale?step=tip",
        label: "New sale · Tip step",
        note: "New sale opened on the Tip step with a demo cart: tip presets and a custom-tip dialog.",
      },
      {
        path: "/sales/new-sale?step=payment",
        label: "New sale · Payment step",
        note: "Opens a demo cart on the Payment step: method grid, Split, cash and card amount dialogs, tax-inclusive footer.",
      },
      {
        path: "/sales/new-sale?dialog=payment-link",
        label: "New sale · Payment link (self checkout, PRO-909)",
        note: "Send a payment link from the cart, see the locked Payment-link-sent screen, then cancel the link or mark it paid.",
      },
      {
        path: "/sales/new-sale?terminals=one",
        label: "New sale · CamiPay Terminal — one machine",
        note: "Payment step with one card machine shown by name: tapping it sends the sale there and locks the drawer.",
      },
      {
        path: "/sales/new-sale?terminals=two",
        label: "New sale · CamiPay Terminal — two machines",
        note: "Two registered card terminals show as named tiles under a Card terminals heading in the payment grid.",
      },
      {
        path: "/sales/new-sale?terminals=idle",
        label: "New sale · CamiPay Terminal — registered, nobody signed in",
        note: "Both machines read Signed out on greyed tiles, with the fix under them: enter the PIN on the device (BUG-65).",
      },
      {
        path: "/sales/new-sale?terminals=mixed",
        label: "New sale · CamiPay Terminal — Ready, Signed out, Locked (BUG-65)",
        note: "Three machines in three states: each blocked tile names its status, and one fix line per state sits under the grid.",
      },
      {
        path: "/sales/new-sale?terminals=many",
        label: "New sale · CamiPay Terminal — past the tile cap",
        note: "Six terminals collapse into one CamiPay Terminal tile that opens the Send-to-terminal picker, usable machines on top.",
      },
      {
        path: "/sales/new-sale?dialog=terminal",
        label: "New sale · CamiPay Terminal (card present)",
        note: "The locked cart while a sale waits on the card machine: Mark as paid or Collect another way are the only exits.",
      },
      {
        path: "/sales/new-sale?dialog=redeem",
        label: "New sale · Redeem gift card at checkout",
        note: "Payment step with the Redeem gift card dialog open: try QM4KTRZA, YYOSNPHO or a typo, then apply the balance.",
      },
      {
        path: "/sales/daily-summary",
        label: "Daily Summary",
        note: "Date stepper over side-by-side Transaction and Cash movement summary tables, negative amounts in tomato-11.",
      },
      {
        path: "/sales/appointments-list",
        label: "Appointments list",
        note: "Appointments table covering all seven statuses, with search, date and filter pills, sort options and coloured status badges.",
      },
      {
        path: "/sales/appointments-list?ref=b-002&view=activity",
        label: "Appointment detail sheet",
        note: "Appointment sheet via ?ref=b-001 to b-024: status-coloured header band with branch, services, total and live status pill.",
      },
      {
        path: "/sales/appointments-list?ref=b-002",
        label: "Detail sheet · Pet Address + Pet notes",
        note: "Open from the Ref # link to see the Pickup card and Pet notes. Try b-004 for the full sheet and b-001 for empty.",
      },
      {
        path: "/sales/sales-list",
        label: "Sales list (invoices)",
        note: "Sales and Drafts invoice tabs with one of every status today, and all 10 rows under Last 7 days.",
      },
      {
        path: "/sales/sales-list?tab=drafts",
        label: "Sales list · Drafts tab",
        note: "Drafts tab lists unsubmitted sales by Draft ID and client, always in full regardless of the date range.",
      },
      {
        path: "/sales/sales-list?draft=31A06EA3",
        label: "Draft detail dialog",
        note: "Draft sale dialog with Checkout to resume on the Tip step and Cancel draft in the kebab, try 31A06EA3 or 7F2B19C4.",
      },
      {
        path: "/sales/sales-list?sale=7",
        label: "Sale detail dialog",
        note: "Sale dialog via ?sale=: try 7 completed, 6 part-paid, 3 refunded, 1 voided and 16 with a tip, plus Share and Email.",
      },
      {
        path: "/invoice/17",
        label: "Invoice link (customer view)",
        note: "The invoice as the client gets it, no sign-in. Try 17, 16, 13, 24 and 999, and resize narrow to see it reflow.",
      },
      {
        path: "/sales/invoice-document",
        label: "Invoice document (A4 downloadable)",
        note: "One A4 invoice across PDF, link and email tabs, with ?sale= and ?state= to load each case.",
      },
      {
        path: "/sales/gift-cards-sold",
        label: "Gift cards sold",
        note: "Gift cards sold table with code, dates, status badges, purchaser, owner and AED amounts, plus search, filters and export.",
      },
      {
        path: "/sales/gift-cards-sold?card=gc-1",
        label: "Gift card detail",
        note: "Gift card modal with Details and Activity tabs, balance visual, event timeline and Sale # links that open the sale.",
      },
    ],
  },
  {
    lane: "business",
    title: "Business app, Messages — Inbox",
    description:
      "Three-pane WhatsApp inbox (list, thread, client panel) with AI and automation surfaces as visual stubs.",
    screens: [
      {
        path: "/messages/inbox",
        label: "Inbox · conversation selected",
        note: "Sarah Mansour's thread: confirm or reject a booking request, send a message, try Templates or AI draft, toggle Details.",
      },
    ],
  },
  {
    lane: "business",
    title: "Inbox CRM, Phase 0 — T1 prototype (ENG3-33)",
    description:
      "Phase 0 WhatsApp inbox in three panes, with a Design repo chip for state, language, pets and width switches.",
    screens: [
      {
        path: "/messages/inbox/phase-0",
        label: "Live inbox · matched chat",
        note: "Layla's matched chat with staff-signed messages, the ClientSummary pane, pane toggle, and Ctrl/⌘+Enter to send.",
      },
      {
        path: "/messages/inbox/phase-0?c=omar",
        label: "Six months of history",
        note: "Scroll up through six months of history: older pages load 40 at a time and the day header stays pinned.",
      },
      {
        path: "/messages/inbox/phase-0?c=unmatched-saturday",
        label: "Unmatched number",
        note: "An unmatched number: dashed avatar, free text before linking, and Link client, Match and Add opening as dialogs.",
      },
      {
        path: "/messages/inbox/phase-0?c=maryam",
        label: "Window closes while typing",
        note: "The composer countdown turns amber then red and closes about 2 minutes in. Type first to see the text kept.",
      },
      {
        path: "/messages/inbox/phase-0?c=sara",
        label: "Window closed · templates",
        note: "Closed window: free typing off, templates fill from the record, and a missing booking blocks the send in red.",
      },
      {
        path: "/messages/inbox/phase-0?c=unmatched-closed",
        label: "Window closed · unmatched",
        note: "Unmatched closed-window chat where templates with blanks stay blocked and only blank-free templates can go.",
      },
      {
        path: "/messages/inbox/phase-0?c=noura",
        label: "Send failed · retry",
        note: "A failed send explains why and offers Retry, and 'Next send' lets you force another failure, a late failure or a closed window.",
      },
      {
        path: "/messages/inbox/phase-0?c=unmatched-closed",
        label: "Match · same number on two records",
        note: "Match a number shared by two records, see the confirm step for a different number, then the 'Matched to … by Queenie' line.",
      },
      {
        path: "/messages/inbox/phase-0?c=unmatched-fatima",
        label: "Add client",
        note: "Add new client from an unmatched chat: phone locked, first name only, and Save binds the chat.",
      },
      {
        path: "/messages/inbox/phase-0?c=unmatched-saturday",
        label: "Unmatched · free text",
        note: "Reply to an unmatched chat before linking, and see Save in Add stay off until a first name is typed.",
      },
      {
        path: "/messages/inbox/phase-0?c=omar",
        label: "Media · photo, video, phone only",
        note: "Client photo and video open full size, old media shows as phone only, and blocked attachment types say why (try .zip).",
      },
      {
        path: "/messages/inbox/phase-0?state=visits-error",
        label: "Client pane · partial and slow",
        note: "Client pane where the second read fails: name stays, visits show an error with retry, ?state=visits-slow shows skeletons.",
      },
      {
        path: "/messages/inbox/phase-0?state=read-only",
        label: "Permission · read only",
        note: "Read-only hides Match, Add and Retry and replaces the composer with the reason (also ?state=no-access and ?state=feature-off).",
      },
      {
        path: "/messages/inbox/phase-0?lang=ar&width=1280",
        label: "Arabic, RTL, at 1280",
        note: "The whole inbox mirrored in Arabic at 1280, with phone numbers kept left-to-right.",
      },
      {
        path: "/messages/inbox/phase-0?c=huda",
        label: "Tablet and small laptop",
        note: "Narrow the window to see the client pane become a sheet below 1280 and one pane at a time below 1024.",
      },
      {
        path: "/messages/inbox/phase-0?state=list-loading",
        label: "Page states",
        note: "Loading, empty and error for the list and the thread — pick them under the Design repo chip.",
      },
    ],
  },
  {
    lane: "business",
    title: "Bulk import — products, clients and pets (DSG-80 / DSG-84)",
    description:
      "One shared import wizard for products, clients and pets, each shown step by step: upload, review, outcome.",
    screens: [
      {
        path: "/products/import",
        label: "Products — upload step",
        note: "Reached from Options → Import products. File picker beside the options, asked as questions instead of named as settings.",
      },
      {
        path: "/products/import?at=review",
        label: "Products — review step (the ticket)",
        note: "Aya's import opens on the 17 blocked rows grouped under one named cause with the fix, all 100 rows one click away.",
      },
      {
        path: "/products/import?at=done",
        label: "Products — outcome step (last step)",
        note: "83 added, 17 left behind with the cause restated and the failed-row download.",
      },
      {
        path: "/products/import?scenario=placeholder-skus&at=review",
        label: "Products — review step, after PRD-63",
        note: "All 100 rows import, 17 with a SKU Cami invented — named here, invisible in the as-built view.",
      },
      {
        path: "/products/import?scenario=placeholder-skus&at=done",
        label: "Products — outcome step, after PRD-63",
        note: "'17 products need a real SKU' with a link to review them — the follow-up PRD-63 needs and today's screen does not have.",
      },
      {
        path: "/products/import?view=as-built&at=review",
        label: "Products — as it ships today (the baseline)",
        note: "The same review screen in production: 'Skipped by mode', 'New dictionary entries', reasons hidden behind 'View changes'.",
      },
      {
        path: "/clients/import",
        label: "Clients — upload step",
        note: "Reached from Options → Import clients. 30 MB / 7,000 rows, three modes, no price threshold.",
      },
      {
        path: "/clients/import?at=review",
        label: "Clients — review step",
        note: "Aya's 100-row client file opens on the 21 rows that need her: missing last names, a duplicate phone, name matches.",
      },
      {
        path: "/clients/import?at=done",
        label: "Clients — outcome step (last step)",
        note: "Clients import outcome: the ledger adds up to the file, 79 added, 2 left to answer, 19 left behind.",
      },
      {
        path: "/clients/import?case=many-name-matches&at=review",
        label: "Clients — name matching at volume",
        note: "16 of 24 rows matched on first name alone, with your file against Cami and a disabled third answer.",
      },
      {
        path: "/clients/import?case=client-no-pets&at=review",
        label: "Clients — review step, pet feature off",
        note: "The same file on an account without pets. Nothing pet-related may appear anywhere on this screen.",
      },
      {
        path: "/clients/import?entity=pets",
        label: "Pets — upload step",
        note: "Reached from Options → Import pets on the Pets list. Only exists on an account with the pet feature on.",
      },
      {
        path: "/clients/import?case=maaz-pets&at=review",
        label: "Pets — review step",
        note: "Maaz's 873-row pet file at review: 45 rows blocked and 60 pets with no owner details.",
      },
      {
        path: "/clients/import?case=pets-no-owner&at=review",
        label: "Pets — no contact details in the file",
        note: "Pets with only an owner's name import as pets alone: check the 'Pet only' badge and the commit button counting pets.",
      },
      {
        path: "/clients/import?case=pets-no-owner&at=done",
        label: "Pets — outcome, none with an owner",
        note: "'120 pets added' with zero owners, the standalone pets keeping their own ledger line.",
      },
      {
        path: "/clients/import?case=maaz-pets&at=done",
        label: "Pets — outcome step (last step)",
        note: "Pets lead the count; their owners are reported on their own lines so the two cannot be confused.",
      },
    ],
  },
  {
    lane: "business",
    title: "Reporting and analytics (DSG-43 / PRO-703)",
    description:
      "All 23 reports from one registry through shared view templates. Start with the Performance dashboard.",
    screens: REPORT_SCREENS,
  },
  {
    lane: "business",
    title: "Merchant money surfaces (DSG-73)",
    description:
      "Money drawer and billing panels over the bare shell, splitting NeoPay terminal payouts from Cami online payouts.",
    screens: [
      {
        path: "/shell-demo?money=drawer",
        label: "Topbar money drawer · the entry point",
        note: "Topbar money drawer over the bare shell: one card per sender, last three days of activity, and links to the full screens.",
      },
      {
        path: "/shell-demo?money=summary",
        label: "Account summary (DSG-77) · two rails",
        note: "Per-branch account summary, with running totals from money in through Cami charges and adjustments to paid out and held.",
      },
      {
        path: "/shell-demo?money=summary&variant=blended",
        label: "Account summary · blended (the other D6 option)",
        note: "The blended D6 option: one figure for everything held, custodian split underneath, to compare at design review.",
      },
      {
        path: "/shell-demo?money=summary&state=paused",
        label: "Payouts paused, destination unverified",
        note: "Paused payouts banner that says the money will not fall back to the old account.",
      },
      {
        path: "/shell-demo?money=summary&state=pending",
        label: "Verification pending",
        note: "Verification pending: payouts still paused, with plain informational copy instead of a warning.",
      },
      {
        path: "/shell-demo?money=summary&state=below-minimum",
        label: "Below minimum, rolls forward",
        note: "A payout below minimum that rolls forward, shown as skipped with no alarm colour or error wording.",
      },
      {
        path: "/shell-demo?money=summary&state=not-ready",
        label: "Not settle-ready",
        note: "Not settle-ready: a large held figure, zero payouts and a banner explaining why.",
      },
      {
        path: "/shell-demo?money=summary&rails=terminal-only",
        label: "Terminal-only merchant",
        note: "Terminal-only merchant with one custodian, so no rail split and no Cami schedule, shown as a complete screen.",
      },
      {
        path: "/shell-demo?money=summary&rails=online-only",
        label: "Online-only merchant",
        note: "SET-X8. The mirror case.",
      },
      {
        path: "/shell-demo?money=summary&state=no-activity",
        label: "Zero activity",
        note: "New merchant. Empty state says what will appear here rather than showing a row of AED 0.00 tiles.",
      },
      {
        path: "/shell-demo?money=activity",
        label: "Activity feed (DSG-78)",
        note: 'Day-grouped feed with a daily NET subtotal, not takings — a heavy fee day should not read as a good one. Rows carry direction in the icon and colour before the sign. Filter by type, sender (the rail axis the reference product has no equivalent of), and location. "Show earlier days" pages by whole days so a subtotal never describes rows you cannot see.',
      },
      {
        path: "/shell-demo?money=activity",
        label: "Transaction detail · open any row",
        note: 'The reference field set adopted (date, linked reference, channel, location, method, billing period, From/To) plus a Custody block — with two custodians, "To: Cami" and "To: NeoPay" are different facts. A fee and the payment that caused it show as one event.',
      },
      {
        path: "/shell-demo?money=activity&rails=terminal-only",
        label: "Payout detail · the one that did not arrive",
        note: "Filter to Payouts and open 12 Aug: the payout keeps its reason, the money returns, and the retry is a new payout.",
      },
      {
        path: "/shell-demo?money=activity&loading=1",
        label: "Activity · loading",
        note: "Skeletons keep the day-group shape, so nothing jumps when the rows land.",
      },
      {
        path: "/shell-demo?money=activity&state=no-activity",
        label: "Activity · empty vs filtered-to-zero",
        note: "New-merchant empty activity feed, compared with a healthy feed filtered down to zero.",
      },
      {
        path: "/shell-demo?settings=billing&bp=fees",
        label: "Invoices and fees (DSG-76)",
        note: "Invoices and fees panel in Billing settings: period headings, pending current month, and fees that expand to the sale.",
      },
      {
        path: "/shell-demo?settings=billing&bp=fees",
        label: "Cami tax invoice · open any closed period",
        note: "Download PDF on a closed period to see Cami's tax invoice with both TRNs and the VAT the merchant can reclaim.",
      },
      {
        path: "/shell-demo?settings=billing&bp=fees&d1=invoice",
        label: "Invoices and fees · the other D1 outcome",
        note: "The other D1 outcome: Cami invoices card machine fees instead of NeoPay deducting them, so the tax invoice is payable.",
      },
      {
        path: "/shell-demo?settings=billing&bp=bank",
        label: "Bank account (DSG-75) · verified",
        note: "Bank account in Billing: masked to last 4, verification state, two senders on two schedules, permanent change history.",
      },
      {
        path: "/shell-demo?settings=billing&bp=bank&bd=gateway-failed",
        label: "Bank account · gateway write failed",
        note: "Change the bank account and confirm to see NeoPay refuse, nothing change, and the current account named.",
      },
      {
        path: "/shell-demo?settings=billing&bp=bank&bd=unverified",
        label: "Bank account · unverified, payouts paused",
        note: "Unverified bank account pauses payouts, and the copy says outright they do not fall back to the previous account.",
      },
      {
        path: "/shell-demo?settings=billing&bp=bank&bd=read-only",
        label: "Bank account · no permission to change",
        note: "Bank account as read-only for someone without permission, with no disabled Change button and a line saying who to ask.",
      },
      {
        path: "/shell-demo?settings=billing&bp=bank&bd=online-only",
        label: "Bank account · online-only merchant",
        note: "SET-X8. No NeoPay row in the schedule and no gateway copy to explain — only Cami pays this merchant.",
      },
      {
        path: "/shell-demo?settings=billing&bp=bank&bd=terminal-only",
        label: "Bank account · terminal-only merchant",
        note: "Terminal-only merchant's bank account: one read-only NeoPay schedule, with no greyed control.",
      },
      {
        path: "/shell-demo?settings=billing&bp=details",
        label: "Billing details (DSG-74) · complete",
        note: "Billing details that stamp every document. Edit says changes apply forward and sent invoices keep their values.",
      },
      {
        path: "/shell-demo?settings=billing&bp=details&bl=no-trn",
        label: "Billing details · no TRN",
        note: "Billing details with no TRN, stating as a fact that clients get an ordinary invoice with no tax wording.",
      },
      {
        path: "/shell-demo?settings=billing&bp=details&bl=empty",
        label: "Billing details · nothing filled in yet",
        note: "Empty billing details where every field still renders and missing ones collapse into an Add pill.",
      },
    ],
  },
  {
    lane: "business",
    title: "CamiPay fee visibility, Partner side (PRO-737)",
    description:
      "The Partner's side of CamiPay fees: a fee breakdown on every sale and a read-only view of their own rates.",
    screens: [
      {
        path: "/sales/sales-list",
        label: "Sale detail, fee breakdown",
        note: "Open sale 16 (Terminal) and sale 15 (Online, part-paid) for Sale amount, Cami fee and Net to you with the calculation.",
      },
      {
        path: "/sales/gift-cards-sold?card=gc-5",
        label: "Sale detail, above the bracket",
        note: "AED 10,500 gift card sale above the AED 100 ceiling, so the fee is the 3% alone with no fixed part.",
      },
      {
        path: "/sales/sales-list?settings=payments&pp=camipay",
        label: "Partner settings, CamiPay rates",
        note: "Read-only CamiPay rates in Partner settings, reading the same store HQ writes to.",
      },
    ],
  },
  {
    lane: "business",
    title: "Multi-location · Phase 1 — Daily branch operations",
    description:
      "Phase 1 of multi-location: running daily branch operations while every existing merchant workflow keeps working.",
    alias: "multi-location-prd-43-pro-71",
    screens: [
      {
        epic: "Epic 2 · Create branches and control access",
        path: "/playground#multi-location-branch-switcher",
        label: "Branch switcher · SCR-04 (playground)",
        note: "Branch switcher in five scopes: all, one, a subset, single-branch (renders nothing) and none granted (locked).",
      },
      {
        epic: "Epic 2 · Create branches and control access",
        path: "/shell-demo?settings=locations",
        label: "Locations, the estate (settings)",
        note: "Three branches, JVC and Jumeirah live and Al Quoz suspended, each with info, address, invoicing, Hours and Manage.",
      },
      {
        epic: "Epic 2 · Create branches and control access",
        path: "/shell-demo?settings=locations",
        label: "Signed in as, and what it hides",
        note: "Sign in as Aziz, ahmed@getcami.io or Maz Khan in the Locations panel strip to see how access changes the screen.",
      },
      {
        epic: "Epic 2 · Create branches and control access",
        path: "/playground#multi-location-per-branch-hours",
        label: "Per-branch hours · SCR-01 (playground)",
        note: "Three branches' weekly hours side by side, including Al Quoz's split day, following any edit in settings.",
      },
      {
        epic: "Epic 2 · Create branches and control access",
        path: "/shell-demo?settings=business-details",
        label: "Business time zone · SCR-01, R19",
        note: "Edit the business time zone in Business details and watch inheriting branches follow while Riyadh keeps its own.",
      },
      {
        epic: "Epic 2 · Create branches and control access",
        path: "/settings/team?access=aziz-rahman",
        label: "Branch access grants · SCR-03",
        note: "Grants dialog opened on Aziz: role is read-only, location grants are editable, and the roster shows both columns.",
      },
      {
        epic: "Epic 2 · Create branches and control access",
        path: "/playground#multi-location-branch-access-grants",
        label: "Branch access grants · SCR-03 (playground)",
        note: "Branch access dialog against three roster rows, with four of five location permission codes marked Proposed.",
      },
      {
        epic: "Epic 2 · Create branches and control access",
        path: "/playground#multi-location-who-may-change-what-about-a-branch",
        label: "Who may change what (playground)",
        note: "Roles across, actions down: the rule table for who may change what about a branch.",
      },
      {
        epic: "Epic 2 · Create branches and control access",
        path: "/playground#multi-location-loading-and-error",
        label: "Loading and error · PRD-169 Done-means (playground)",
        note: "Loading and error states for five multi-location lists from one toggle, with Try again to restore them.",
      },
      {
        epic: "Epic 2 · Create branches and control access",
        path: "/clients",
        label: "No location access, full page · P1.4.6",
        note: "Sign in as ahmed@getcami.io from the Settings › Locations strip to see the no-access state on every operational page.",
      },
      {
        epic: "Epic 2 · Create branches and control access",
        path: "/playground#multi-location-no-location-access",
        label: "No location access · P1.4.6 (playground)",
        note: "Both cases side by side: no location at all, and a location they do not hold.",
      },
      {
        epic: "Epic 2 · Create branches and control access",
        path: "/appointments",
        label: "Location switcher on a phone · P1.5.1",
        note: "At phone width the switcher sits on its own row under the topbar and opens the same dropdown. Desktop is unchanged.",
      },
      {
        epic: "Epic 2 · Create branches and control access",
        path: "/settings/team",
        label: "A team member needs a location · P1.4.7",
        note: "Untick the location in Add member to get 'Pick at least one location.' and a toast, the same rule as the access dialog.",
      },
      {
        epic: "Epic 2 · Create branches and control access",
        path: "/shell-demo?settings=locations&loc=shampooch-jvc&lt=invoicing",
        label: "Branch tax identity · SCR-12",
        note: "JVC's Invoicing tab: each inheritable row names its source, JVC overrides its receipt prefix, Jumeirah has its own TRN.",
      },
      {
        epic: "Epic 2 · Create branches and control access",
        path: "/playground#multi-location-branch-lifecycle",
        label: "Branch state badge · SCR-01 (playground)",
        note: "The four branch lifecycle states in one row. Live shows no badge on purpose.",
      },
      {
        epic: "Epic 3 · Schedule staff and book the right branch",
        path: "/appointments",
        label: "Booking names a branch · G1 (route)",
        note: "New appointment puts Location first, and shows nothing for a single-branch business.",
      },
      {
        epic: "Epic 3 · Schedule staff and book the right branch",
        path: "/playground#multi-location-a-write-names-one-branch",
        label: "A write names one branch · G1, R11 (playground)",
        note: "How a write states its branch for one, several or no branches in scope, with paused branches left out.",
      },
      {
        epic: "Epic 3 · Schedule staff and book the right branch",
        path: "/appointments",
        label: "Somebody working at another branch · SCR-10 (route)",
        note: "With Shampooch JVC selected, set a start between 2pm and 6pm and Lena Petrov shows as busy at another location and is blocked.",
      },
      {
        epic: "Epic 3 · Schedule staff and book the right branch",
        path: "/playground#multi-location-somebody-working-at-another-location",
        label: "Somebody working at another location · SCR-10 (playground)",
        note: "Edit service at JVC in three frames: Lena busy at Jumeirah, Marco not working at JVC, and Lena inside her JVC shift.",
      },
      {
        epic: "Epic 3 · Schedule staff and book the right branch",
        path: "/team/scheduled-shifts",
        label: "Scheduled shifts · SCR-10 (route)",
        note: "One shift grid per branch picked from a strip. A suspended branch keeps its week but refuses every write.",
      },
      {
        epic: "Epic 3 · Schedule staff and book the right branch",
        path: "/playground#multi-location-scheduled-shifts",
        label: "Scheduled shifts · SCR-10 (playground)",
        note: "Shift grid where Lena works two branches in a day and Tala's same-hours clash at both is flagged as a pair.",
      },
      {
        epic: "Epic 3 · Schedule staff and book the right branch",
        path: "/playground#multi-location-per-branch-availability",
        label: "Per-branch availability · SCR-08 (playground)",
        note: "Day chips and slots built from each branch's own hours, so closed days read Closed and staff filter by branch.",
      },
      {
        epic: "Epic 3 · Schedule staff and book the right branch",
        path: "/shampooch",
        label: "Public branch picker · SCR-08",
        note: "Chain public page that asks for a branch first, compare /shampooch-jvc, /shampooch-jumeirah and single-site /purr-palace.",
      },
      {
        epic: "Epic 3 · Schedule staff and book the right branch",
        path: "/playground#multi-location-public-branch-picker",
        label: "Public branch picker · SCR-08 (playground)",
        note: "Public branch picker in isolation, location first, with 'Open now' pinned to a Tuesday 11am.",
      },
      {
        epic: "Epic 3 · Schedule staff and book the right branch",
        path: "/settings/team?services=beth-carter",
        label: "Services per branch · DW2.1 (route)",
        note: "Beth's Services editor: turn off 'Same services at every location' to see per-branch lists and counts.",
      },
      {
        epic: "Epic 4 · Complete branch checkout",
        path: "/sales/new-sale",
        label: "Packages at the till · SCR-13 (route)",
        note: "Pick a client and add Blow dry to see package sessions apply, expired-package notices and branch price warnings.",
      },
      {
        epic: "Epic 4 · Complete branch checkout",
        path: "/playground#multi-location-packages-at-the-till",
        label: "Packages at the till · SCR-13 (playground)",
        note: "Packages applied automatically at the till across six cases, with covered lines at 0 and the session chip counting down.",
      },
      {
        epic: "Epic 4 · Complete branch checkout",
        path: "/sales/new-sale?terminals=moved",
        label: "A charge that would land at the wrong branch",
        note: "Add a service and tap Front Desk Register to see a charge refused when the machine is linked to another branch.",
      },
      {
        epic: "Epic 4 · Complete branch checkout",
        path: "/playground#multi-location-per-branch-stock",
        label: "Per-branch stock · SCR-11 (playground)",
        note: "Per-branch quantity and reorder points with a derived total, where 18 and -2 sum to a healthy-looking 16.",
      },
      {
        epic: "Epic 4 · Complete branch checkout",
        path: "/sales/sales-list?sale=18",
        label: "Sale detail, where each payment was taken · P1.8.2",
        note: "Sale 18 names its location in the header and the AED 20 card deposit taken at Jumeirah.",
      },
      {
        epic: "Epic 4 · Complete branch checkout",
        path: "/sales/invoice-document?sale=18",
        label: "Invoice, location per payment · P1.8.11",
        note: "A payment taken at another location names it on the invoice.",
      },
      {
        epic: "Epic 4 · Complete branch checkout",
        path: "/sales/gift-cards-sold?card=gc-2",
        label: "Gift card history by location · P1.11.7",
        note: "Activity: each redemption names the location it was used at.",
      },
      {
        epic: "Epic 4 · Complete branch checkout",
        path: "/products?product=p2",
        label: "Stock at the chosen location",
        note: "⋯ → Remove stock or Add stock → pick a location: the count shown is that location's. Stock can still go below zero.",
      },
      {
        epic: "Epic 4 · Complete branch checkout",
        path: "/shell-demo?settings=payments&pp=terminal&tp=full",
        label: "Card machines by location · P1.8.3.1",
        note: "Card machines by location, with Set location for unplaced machines and Change location for placed ones.",
      },
      {
        epic: "Epic 5 · Preserve existing workflows for the pilot",
        path: "/playground#multi-location-branch-whatsapp-numbers",
        label: "Branch WhatsApp numbers · SCR-14 (playground)",
        note: "Branch WhatsApp numbers connected, stuck on the OTP, or missing, with no rerouting to a sister branch.",
      },
      {
        epic: "Epic 5 · Preserve existing workflows for the pilot",
        path: "/shell-demo?settings=comms-templates&ct=whatsapp",
        label: "Which number a reminder leaves from · KC3.1",
        note: "WhatsApp templates name which branch number a reminder leaves from and which branches get none until one is connected.",
      },
      {
        epic: "Epic 6 · Migrate and activate the pilot",
        path: "/admin/businesses?business=shampooch&section=locations",
        label: "CamiHQ chain view and multi-location switch · SCR-16",
        note: "Shampooch Locations: the multi-location switch, off until the data check passes and listing failures, then estate and money.",
      },
    ],
  },
  {
    lane: "business",
    title: "Multi-location · Phase 2 — Branch customization",
    description:
      "Adapt local services, prices, fiscal settings and lifecycle. No Phase 2 tickets yet, so this follows the phase plan.",
    screens: [
      {
        epic: "Epic 7 · Customize branch services and fiscal settings",
        path: "/catalogs/service-menu?service=bath-small&ss=locations",
        label: "Per-branch service pricing · SCR-09",
        note: "Small bath's Locations section: Jumeirah prices it at 145 against 120. Type to override, Reset to inherit.",
      },
      {
        epic: "Epic 7 · Customize branch services and fiscal settings",
        path: "/playground#multi-location-per-branch-service-pricing",
        label: "Per-branch service pricing · SCR-09 (playground)",
        note: "Raise the business default price and see inheriting branches follow while Jumeirah's AED 75 override holds.",
      },
      {
        epic: "Epic 7 · Customize branch services and fiscal settings",
        path: "/catalogs/service-menu",
        label: "A category a branch has emptied",
        note: "Switch the location to Shampooch Mirdif to see 'Spa add-ons' emptied but kept with a 'Not offered' note.",
      },
      {
        epic: "Epic 7 · Customize branch services and fiscal settings",
        path: "/playground#multi-location-a-category-a-branch-has-emptied",
        label: "A category a branch has emptied (playground)",
        note: "A category with no services at a branch: hidden from online booking, shown empty to staff.",
      },
      {
        epic: "Epic 7 · Customize branch services and fiscal settings",
        path: "/shell-demo?settings=payments&pp=policy",
        label: "Deposit per branch · DW3.5",
        note: "Per-branch deposit policy that inherits the default unless overridden, with Al Quoz as the seeded exception.",
      },
      {
        epic: "Epic 7 · Customize branch services and fiscal settings",
        path: "/playground#multi-location-package-mismatch-at-checkout",
        label: "Package mismatch · SCR-13 (playground)",
        note: "Package mismatch warning in four cases. It warns and never blocks, showing both figures for reception.",
      },
      {
        epic: "Epic 8 · Branch lifecycle and booking refinements",
        path: "/playground#multi-location-the-duplicate-caught-before-booking",
        label: "Duplicate caught before booking · CL-A1 / RC-B1 (playground)",
        note: "An estate-wide visit appears under the client picker to catch a duplicate before booking, without blocking.",
      },
      {
        epic: "Epic 8 · Branch lifecycle and booking refinements",
        path: "/playground#multi-location-client-visits-at-another-branch",
        label: "Client visits at another branch · SCR-07 (playground)",
        note: "A client's visits at other branches, open as owner then as JVC reception to see rows stay and only buttons go.",
      },
    ],
  },
  {
    lane: "business",
    title: "Multi-location · Phase 3 — Cross-branch coordination",
    description:
      "Move bookings and stock between branches. Stock transfer (Epic 10) has no design yet.",
    screens: [
      {
        epic: "Epic 9 · Coordinate calendars and move appointments",
        path: "/playground#multi-location-all-branches-calendar",
        label: "All-branches calendar · SCR-05 (playground)",
        note: "All-branches calendar as a branch filter strip with counts: click to narrow, click again for all.",
      },
      {
        epic: "Epic 9 · Coordinate calendars and move appointments",
        path: "/playground#multi-location-cross-branch-move",
        label: "Cross-branch move · SCR-06 (playground)",
        note: "Cross-branch move frames: destinations bounded by grants, deposit kept where taken, unresolvable payment rejected whole.",
      },
    ],
  },
  {
    lane: "business",
    title: "Multi-location · Phase 4 — Business-wide insights",
    description: "Compare branches and reconcile the money.",
    screens: [
      {
        epic: "Epic 11 · Understand and reconcile chain performance",
        path: "/sales/daily-summary",
        label: "End of day, per branch · RP-A1 (route)",
        note: "End-of-day view per branch plus a business total. A branch that took nothing is named, not dropped.",
      },
      {
        epic: "Epic 11 · Understand and reconcile chain performance",
        path: "/playground#multi-location-money-by-branch",
        label: "Money by branch · SCR-15 (playground)",
        note: "Branch money side by side with the total after the rows, plus a frame for a Jumeirah-only manager.",
      },
    ],
  },
  {
    lane: "business",
    title: "Multi-location · Phase 5 — Larger-chain rollout",
    description: "Onboard branches in bulk.",
    screens: [
      {
        epic: "Epic 12 · Onboard larger chains",
        path: "/playground#multi-location-chain-setup",
        label: "Chain setup · SCR-02 (playground)",
        note: "Create N branches in one all-or-none pass, where one bad row creates nothing and duplicate names collide.",
      },
      {
        epic: "Epic 12 · Onboard larger chains",
        path: "/playground#multi-location-nine-branches-d5",
        label: "Nine branches · D5 (playground)",
        note: "Nine branches, collapsed by default with Show all for the full cards, and nothing collapses under four quiet branches.",
      },
    ],
  },
  {
    lane: "business",
    title: "Multi-location · Not in a phase yet",
    description: "Designed and reviewed, but no phase in the delivery plan carries it yet.",
    screens: [
      {
        path: "/shell-demo?settings=deals",
        label: "Deals, and where each one runs · DW3.4",
        note: "Deals list with where each runs: 'All locations', '3 locations', and 'Spring refresh' Inactive because it has no scope.",
      },
      {
        path: "/shell-demo?settings=deals&deal=abu-dhabi-launch",
        label: "One deal, in full · DW3.4",
        note: "One deal's drill-down with Overview, Details and Availability. Edit on Locations opens the picker.",
      },
      {
        path: "/shell-demo?settings=deals",
        label: "Creating a deal · DW3.4",
        note: "Add deal opens the wizard with a Locations step, and an empty location list disables Create.",
      },
    ],
  },
  {
    lane: "settings",
    title: "Pet Business, settings (PRO-95)",
    description:
      "Pet Business profile settings inside the AppShell dialog, opened from the sidebar or with ?settings=<id>.",
    screens: [
      {
        path: "/shell-demo?settings=profile",
        label: "Settings dialog, My profile",
        note: "My profile with one Contact card: edit name, mobile with OTP or email with a confirmation link, and see pending badges.",
      },
      {
        path: "/shell-demo?settings=business-details",
        label: "Business details, summary",
        note: "Combined Business info + External links card with one Edit button. Click Edit for the full-screen takeover.",
      },
      {
        path: "/shell-demo?settings=locations",
        label: "Locations, list",
        note: "Locations list with a row Options menu and card drill-in to five tabs: General, Hours, Location, Invoicing, Manage.",
      },
      {
        path: "/shell-demo?settings=language",
        label: "Language & region",
        note: "Workspace category, placeholder until i18n pass",
      },
      {
        path: "/shell-demo?settings=sales",
        label: "Sales, landing",
        note: "Sales settings landing with the Gift cards card. Click to drill in, Back or breadcrumb returns.",
      },
      {
        path: "/shell-demo?settings=sales&sub=gift-cards",
        label: "Gift cards, populated",
        note: "Active gift card program with its summary card and Edit, plus a demo toggle for the empty state.",
      },
      {
        path: "/shell-demo?settings=sales&sub=gift-cards&gc=empty",
        label: "Gift cards · inactive empty state",
        note: "Inactive empty state with a Set up CTA (no program configured yet).",
      },
      {
        path: "/shell-demo?settings=sales&sub=gift-cards&gc=setup",
        label: "Gift cards · settings takeover",
        note: "Full-screen Gift card settings with an enable toggle, preset AED values and default expiration, but no delete.",
      },
      {
        path: "/shell-demo?settings=forms",
        label: "Form templates library",
        note: "Form templates library: rows with an Action menu, an Upload file pill, empty state and PDF-only upload.",
      },
    ],
  },
  {
    lane: "settings",
    title: "Pet Business, team",
    description:
      "Team roster where Add opens a full-screen takeover: profile, addresses, emergency contacts, services, locations, settings.",
    screens: [
      {
        path: "/settings/team",
        label: "Team members, list",
        note: "Active and Pending tabs with a per-row Action dropdown. Click Add to open the takeover.",
      },
      {
        path: "/settings/team",
        label: "Add team member takeover",
        note: "Click Add for the team member takeover: six sections, Profile details and the permission role select.",
      },
    ],
  },
  {
    lane: "settings",
    title: "Pet Business, payment policy (DSG-51)",
    description:
      "Business-level deposit and no-show policy in Settings › Payments, which drives the appointment sheet's Payment policy card.",
    screens: [
      {
        path: "/shell-demo?settings=payments",
        label: "Payments, landing",
        note: "Payments landing with Payment policy and Payment methods cards, click either to drill in.",
      },
      {
        path: "/shell-demo?settings=payments&pp=policy",
        label: "Payment policy, summary",
        note: "Payment policy summary card with green checks, example policy, terms preview and the prepay-in-full toggle.",
      },
      {
        path: "/shell-demo?settings=payments&pp=methods",
        label: "Payment methods, list",
        note: "Locked Cash row plus custom methods, with Add, Change order and a per-row Actions menu.",
      },
      {
        path: "/shell-demo?settings=payments&pp=edit",
        label: "Payment policy editor takeover",
        note: "Full-screen payment policy editor: deposit, refund and reschedule windows, cancellation fee and advanced options.",
      },
      {
        path: "/shell-demo?settings=payments&pp=services",
        label: "Customize by service takeover",
        note: "Per-service deposit and no-show fees with default or custom values, search, category tabs and a bulk set bar.",
      },
      {
        path: "/shell-demo?settings=payments&pp=terms",
        label: "Policy displayed to clients takeover",
        note: "Auto-generated example policy line + free-text additional terms with a 600-char live counter.",
      },
    ],
  },
  {
    lane: "settings",
    title: "Pet Business, terminals (DSG-62)",
    description:
      "Payments > Terminals: add card machines with a location, get a pairing code and sign-in PIN, and manage sessions per device.",
    screens: [
      {
        path: "/shell-demo?settings=payments&pp=terminal",
        label: "Terminals, empty (default)",
        note: "Empty terminals list: walk add, code and PIN, demo pair and demo sign-in as the row goes Not paired, Signed out, Ready.",
      },
      {
        path: "/shell-demo?settings=payments&pp=terminal&td=add",
        label: "Terminals, add a terminal",
        note: "Add a terminal with a name, hardware serial and required location. Submit generates the pairing code and opens the credentials dialog.",
      },
      {
        path: "/shell-demo?settings=payments&pp=terminal&tp=typical",
        label: "Terminals, typical (2 devices)",
        note: "Two terminals as list rows with status tint on the device tile and a row menu of terminal actions.",
      },
      {
        path: "/shell-demo?settings=payments&pp=terminal&tp=full",
        label: "Terminals, all statuses",
        note: "Terminal rows showing status precedence: Disabled, Locked, Not paired, Ready and Signed out. Disable and Enable sit in the row menu.",
      },
      {
        path: "/shell-demo?settings=payments&pp=terminal&tp=typical&td=credentials",
        label: "Terminals, credentials dialog",
        note: "Code & PIN dialog: pairing code and sign-in PIN labelled apart, PIN masked with Show/Copy and a Regenerate PIN link.",
      },
      {
        path: "/shell-demo?settings=payments&pp=terminal&tp=typical&td=sessions",
        label: "Terminals, sessions dialog",
        note: "Per-terminal sessions dialog: device model, app build, IP, sign-in and expiry with Revoke, live sessions first.",
      },
    ],
  },
  {
    lane: "settings",
    title: "Pet Business, notifications and templates",
    description:
      "Notifications decide if a message sends, templates decide what it says. Walk Sender ID states with the bottom-right controls.",
    screens: [
      {
        path: "/shell-demo?settings=notifications",
        label: "Notifications, settings",
        note: "Three cards: Sender ID, a 6-event by 3-channel Reminders matrix and Usage this month, with demo state controls.",
      },
      {
        path: "/shell-demo?settings=notifications&nt=sender",
        label: "Notifications, Sender ID dialog",
        note: "Compact Sender ID dialog that validates on submit, reserves CAMI, and saves to 'submitted', never 'approved'.",
      },
      {
        path: "/shell-demo?settings=notifications&nr=hidden",
        label: "Notifications, prices withheld",
        note: "Notifications with rates hidden: counts, failures and the period total stay, per-message and per-channel costs go.",
      },
      {
        path: "/shell-demo?settings=notifications&nt=log",
        label: "Notifications, log",
        note: "Business-wide send log grouped by day, with channel and status filters and two failure reasons inline.",
      },
      {
        path: "/sales/appointments-list?ref=b-002&view=activity",
        label: "Notification events in appointment activity",
        note: "Tom Cassidy / Luna's activity panel with sends as timeline events. Swap ref to b-003, b-004 or b-005 for other statuses.",
      },
      {
        path: "/shell-demo?settings=comms-templates",
        label: "Communication templates, list",
        note: "Per-channel template list for six events, with previews carrying the venue's own brand.",
      },
      {
        path: "/shell-demo?settings=branding",
        label: "Branding",
        note: "Branding panel where a merchant picks one of five palettes with a live card preview, set once for every branch.",
      },
      {
        path: "/shell-demo?settings=comms-templates&ce=booking-confirmed:email",
        label: "Communication templates, email editor",
        note: "Email template editor with live preview and {{placeholder}} chips, try {{discount}} to see an unknown token sent as written.",
      },
      {
        path: "/shell-demo?settings=comms-templates&ce=reminder-24h:whatsapp",
        label: "Communication templates, WhatsApp editor",
        note: "WhatsApp template editor with no subject field, a light incoming-bubble preview and the Meta-approval notice.",
      },
      {
        path: "/shell-demo?settings=business-details",
        label: "Google review link, the setting",
        note: "Google review link field: paste the four example URLs to see the clean, warning, near-miss and refused states.",
      },
      {
        path: "/shell-demo?settings=comms-templates&ce=thank-you:email",
        label: "Thank You template — the missing-link state",
        note: "Thank You email with no review link set: the editor warns and the preview drops the review line.",
      },
      {
        path: "/shell-demo?settings=notifications",
        label: "Reminders matrix → template links",
        note: "Reminder event labels link to their email template editor, and partly-off WhatsApp events show 'Off' badges there.",
      },
    ],
  },
  {
    lane: "hq",
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
        note: "Forgot password with the email carried over, and it always reports 'sent' whether or not it is an HQ account.",
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
        note: "Link older than its window. Offers a fresh request rather than a dead end.",
      },
      {
        path: "/admin/sign-in/reset-password-error?reason=used",
        label: "Reset-password error, already used",
        note: "The link was already spent — a second click on the same email says so instead of failing silently.",
      },
      {
        path: "/admin/sign-in/reset-password-error?reason=invalid",
        label: "Reset-password error, invalid",
        note: "Malformed or unknown token. Same shell as the other two — only the reason line changes.",
      },
      {
        path: "/admin/sign-in-error?reason=not_allowlisted",
        label: "Sign-in error, not allowlisted",
        note: "A valid Google account that is not on the HQ allowlist. Named as a permissions outcome, not a password failure.",
      },
      { path: "/admin/sign-in-error?reason=locked", label: "Sign-in error, locked" },
      { path: "/admin/sign-in-error?reason=generic", label: "Sign-in error, generic" },
    ],
  },
  {
    lane: "hq",
    title: "Cami HQ, partner roster (PRO-101)",
    description:
      "E6-2 Partner roster + detail modal. Click a row in the roster to open the modal at ?business=<slug>.",
    screens: [
      {
        path: "/admin",
        label: "HQ shell (placeholder)",
        note: "HQ shell with sidebar and topbar around a placeholder body, the real landing being the Partners roster.",
      },
      { path: "/admin/businesses", label: "Partners roster" },
      {
        path: "/admin/businesses?tab=onboarding",
        label: "Roster, Onboarding tab",
        note: "Filter tab + URL persistence",
      },
      {
        path: "/admin/businesses?sort=weekly&dir=desc",
        label: "Roster, sort by weekly AED",
        note: "Sort state lives in the URL, so a roster ordered by weekly volume can be pasted into a thread.",
      },
      {
        path: "/admin/businesses?business=shampooch",
        label: "Detail modal, Live state",
        note: "Shampooch in Live state with Manage actions, plus the Google review link on General › Profile with Edit validation.",
      },
      {
        path: "/admin/businesses?business=velvet-paw",
        label: "Detail modal, Onboarding state",
        note: "A Partner mid-onboarding: rails off, no rate card, and the actions that need a live account withheld.",
      },
      {
        path: "/admin/businesses?business=doggos",
        label: "Detail modal, Suspended state",
        note: "Tomato reason banner with white-circle InfoIcon",
      },
      {
        path: "/admin/businesses?business=furry-tales",
        label: "Detail modal, Archived state",
        note: "Archived Partner — every tab reads as history: nothing editable, nothing destructive offered.",
      },
      { path: "/admin/audit", label: "Cross-business audit log" },
      {
        path: "/admin/audit?kind=impersonation",
        label: "Audit log, Impersonation only",
        note: "The log filtered to impersonation events — who entered which Partner, when, and on what stated reason.",
      },
    ],
  },
  {
    lane: "hq",
    title: "Cami HQ, CamiPay settlement config (PRO-737)",
    description:
      "HQ Settings tab on a Partner: CamiPay rail flags, a gateway per rail and a forward-only rate card.",
    screens: [
      {
        path: "/admin/businesses?business=shampooch",
        label: "Settings tab, live Partner",
        note: "Shampooch's settlement settings: view rate history, then Change to append a rate with a fee preview before saving.",
      },
      {
        path: "/admin/businesses?business=pawhaus",
        label: "Settings tab, scheduled rate",
        note: "Terminal on TapPay and online on NeoPay, a 1.9% terminal rate badged Scheduled for 01 Sep and an under AED 100 bracket.",
      },
      {
        path: "/admin/businesses?business=velvet-paw",
        label: "Settings tab, no rate card",
        note: "Onboarding Partner: both rails off, empty rate-card state with Set terminal rate.",
      },
      {
        path: "/admin/businesses?business=doggos",
        label: "Settings tab, live rail earning nothing",
        note: "Suspended Partner whose live online rail has no rate, so it reads Not set and warns Cami earns nothing.",
      },
      {
        path: "/admin/businesses?business=furry-tales",
        label: "Settings tab, archived and read-only",
        note: "Archived Partner: switches disabled, no Change buttons, history still readable.",
      },
    ],
  },
  {
    lane: "hq",
    title: "Cami HQ, terminal fleet (DSG-82)",
    description:
      "HQ's view of leased card machines: a fleet listing by serial and a card on the Partner detail modal.",
    screens: [
      {
        path: "/admin/terminals",
        label: "Fleet listing",
        note: "Every terminal unit Cami owns, by serial, with Partner details opening in a dialog over the fleet.",
      },
      {
        path: "/admin/terminals?q=NP5-2419-8830",
        label: "Reverse lookup, the reason this screen exists",
        note: "Terminal fleet search landing on a serial resolved to Shampooch, also matches pairing code and Partner code (try CM-5107).",
      },
      {
        path: "/admin/terminals?tab=in-stock",
        label: "Stock, assignable to any Partner",
        note: "Two units in stock, each assignable to a Partner from here, the reverse of picking a unit from the Partner card.",
      },
      {
        path: "/admin/terminals?tab=returned",
        label: "Returned, with Put back in stock",
        note: 'A unit that came back when a Partner closed. The row keeps the date it returned, which is the useful half of "nobody has it".',
      },
      {
        path: "/admin/terminals?tab=faulty",
        label: "Faulty, kept as a record",
        note: "Faulty tab: written-off units kept as a record, never offered for assignment and never deleted.",
      },
      {
        path: "/admin/businesses?business=shampooch&section=settings",
        label: "Partner card, three units assigned",
        note: "Partner card with three units: Ready, Signed out and Not set up. Assign picks a unit from stock.",
      },
      {
        path: "/admin/businesses?business=pawhaus&section=settings",
        label: "Partner card, one blocked by HQ",
        note: "A terminal blocked by HQ, showing who blocked it and when, with Allow terminal and Return to Cami.",
      },
      {
        path: "/admin/businesses?business=velvet-paw&section=settings",
        label: "Partner card, nothing assigned yet",
        note: "Onboarding Partner Cami has not shipped to. Empty state carries Assign terminal.",
      },
      {
        path: "/admin/businesses?business=furry-tales&section=settings",
        label: "Partner card, access off and archived",
        note: "Partner card with terminal access off and archived, so every control is disabled.",
      },
      {
        path: "/admin/businesses?q=CM-4821",
        label: "Roster, searched by Partner code",
        note: "Roster search for CM-4821 resolves to the Shampooch partner, with the code shown under each business name.",
      },
    ],
  },
  {
    lane: "hq",
    title: "Cami HQ, notification control plane",
    description:
      "HQ notification controls: channel grants, Sender ID approval, rate overrides and consumption, across five demo partners.",
    screens: [
      {
        path: "/admin/billing",
        label: "Billing, notification consumption",
        note: "Per-partner notification sends times rate, per-channel totals and the amount due this period. Messaging only.",
      },
      {
        path: "/admin/businesses?business=shampooch&section=notifications",
        label: "Partner record → Notifications tab",
        note: "Partner Notifications tab: channel switches, Sender ID approval and per-partner rate overrides, logged to Activity.",
      },
      {
        path: "/admin/businesses?business=pawhaus&section=notifications",
        label: "Partner record → pending Sender ID + rate override",
        note: "PAWHAUS with a pending Sender ID to Approve or Reject with a reason, plus an SMS rate override at AED 0.14.",
      },
      {
        path: "/admin/businesses?business=doggos&section=notifications",
        label: "Partner record → rejected Sender ID, SMS off",
        note: "Rejected Sender ID with SMS turned off by HQ, the reason in a tinted block beside the suspension banner.",
      },
      {
        path: "/admin/businesses?settings=notification-rates",
        label: "HQ settings → Notification rates",
        note: "Platform default notification rates per channel: typeable decimals, a non-blocking warning above AED 1.00, SMS per segment.",
      },
      {
        path: "/admin/businesses?new=1",
        label: "New Partner → Sender ID at onboarding",
        note: "New Partner sheet with a required SMS Sender ID that defaults to CAMI.",
      },
    ],
  },
  {
    lane: "hq",
    title: "Cami HQ, roles & permissions (PRO-138)",
    description:
      "HQ role catalog inside the Settings dialog, with Edit and Add as full-screen dialogs.",
    screens: [
      {
        path: "/admin/access-denied",
        label: "Access denied",
        note: "The access-denied wall HQ routes to when a role lacks the scope, instead of a half-empty page.",
      },
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
    lane: "hq",
    title: "Cami HQ, Impersonation (PRO-155)",
    description:
      "Ops impersonation: events log, scoped session banner and the PII reveal flow on the Partner portal.",
    screens: [
      {
        path: "/admin/impersonation",
        label: "Impersonation log",
        note: "Filterable impersonation log with detail sheet, CSV export and per-Partner owner-summary copy.",
      },
      {
        path: "/admin/portal-impersonation-demo",
        label: "Partner portal under impersonation",
        note: "Partner portal with the yellow impersonation frame, banner pill and reason-gated PII reveal. Minimize collapses the banner.",
      },
      {
        path: "/playground#impersonation-banner",
        label: "Banner states (playground)",
        note: "Active, expiring (5 min), expired terminal, and collapsed states side-by-side near the bottom of the playground.",
      },
    ],
  },
  {
    lane: "reference",
    title: "Demos & playground",
    description: "Internal references for design foundations, shell layout, and component states.",
    screens: [
      {
        path: "/shell-demo",
        label: "Business app shell",
        note: "Switch venue from the workspace menu to rebrand the demo and swap its branches in the LocationSwitcher.",
      },
      { path: "/playground", label: "Component states" },
      {
        path: "/appointments",
        label: "Global search takeover",
        note: "Open global search from the topbar magnifier or Cmd/Ctrl+K and try 'B-77342' to find a booking.",
      },
    ],
  },
]

const TOTAL = SECTIONS.reduce((sum, section) => sum + section.screens.length, 0)

/**
 * A route with break opportunities at `?` and `&`.
 *
 * `break-all` wrapped these anywhere it ran out of room, so a case link read
 * "…case=maaz-pets&at=revie / w". A query string has natural seams; wrap on
 * those instead.
 */
/** What search matches a run of screens on: its epic, routes, labels and notes. */
function searchText(epic: string | undefined, screens: Screen[]): string {
  return [epic, ...screens.flatMap((s) => [s.path, s.label, s.note])].filter(Boolean).join(" ")
}

function RoutePath({ path }: { path: string }) {
  // Keyed by the path up to and including each segment, which is unique even
  // when a query repeats a fragment.
  const segments = path
    .split(/(?=[?&])/)
    .map((part, i, all) => ({ part, prefix: all.slice(0, i + 1).join("") }))

  return (
    <code className="font-mono text-xs break-words text-muted-foreground group-hover:text-foreground">
      {segments.map(({ part, prefix }) => (
        <Fragment key={prefix}>
          {prefix !== part && <wbr />}
          {part}
        </Fragment>
      ))}
    </code>
  )
}

export default function ScreensPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-10 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Screens</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Every screen currently routed on this branch, grouped by who uses it. {TOTAL} total.
            Click a row to open the live page in a new tab. The full walkthrough behind each note is
            in docs/screens-detail.md.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <DirectoryLayout searchPlaceholder="Search screens">
        <div className="flex flex-col gap-12">
          {LANES.map((lane) => {
            const sections = SECTIONS.filter((section) => section.lane === lane.id)
            if (sections.length === 0) return null
            return (
              <div
                key={lane.id}
                id={`lane-${lane.id}`}
                data-nav-lane={lane.id}
                data-nav-label={lane.label}
                className="scroll-mt-6 flex flex-col gap-12"
              >
                <div className="flex flex-col gap-1 border-b-2 border-foreground/15 pb-2">
                  <h2 className="font-heading text-xl font-semibold text-foreground">
                    {lane.label}
                  </h2>
                  <p className="text-xs text-muted-foreground">{lane.blurb}</p>
                </div>

                {sections.map((section) => (
                  <section
                    key={section.title}
                    id={sectionSlug(section.title)}
                    data-nav-section
                    data-nav-title={section.title}
                    className="scroll-mt-6"
                  >
                    {section.alias ? (
                      <span id={section.alias} className="block scroll-mt-6" aria-hidden />
                    ) : null}
                    <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-foreground/10 pb-3">
                      <div>
                        <h3 className="font-heading text-base font-medium text-foreground">
                          <a href={`#${sectionSlug(section.title)}`} className="hover:underline">
                            {section.title}
                          </a>
                        </h3>
                        {section.description ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {section.description}
                          </p>
                        ) : null}
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {section.screens.length}
                      </span>
                    </div>

                    {/* Grouped by route, not listed in write order: one route
                      often has several things worth looking at, and printing
                      its path against every one of them read as duplication —
                      worse when the rows for one route were split apart by
                      another. Each route appears once, with its variants under
                      it. */}
                    {groupByEpic(section.screens).map((run, runIndex) => (
                      <div
                        key={run.epic ?? `run-${runIndex}`}
                        data-search={searchText(run.epic, run.screens)}
                        className={runIndex > 0 ? "mt-6" : undefined}
                      >
                        {run.epic ? (
                          <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {run.epic}
                          </h4>
                        ) : null}
                        <ul className="flex flex-col gap-1">
                          {groupByPath(run.screens).map((group) => (
                            <li
                              key={group.path}
                              data-search={searchText(undefined, group.screens)}
                              className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-6"
                            >
                              <RoutePath path={group.path} />
                              <ul className="flex min-w-0 flex-col">
                                {group.screens.map((screen) => (
                                  <li key={screen.label}>
                                    <Link
                                      href={screen.path}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="group -mx-2 block rounded-md px-2 py-2 transition-colors hover:bg-foreground/[0.04]"
                                    >
                                      <span className="text-sm text-foreground underline-offset-4 group-hover:underline">
                                        {screen.label}
                                      </span>
                                      {screen.note ? (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                          {screen.note}
                                        </span>
                                      ) : null}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </section>
                ))}
              </div>
            )
          })}
        </div>
      </DirectoryLayout>

      <BackToTop />
    </main>
  )
}
