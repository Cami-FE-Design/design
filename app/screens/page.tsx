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
    title: "Cami HQ, CamiPay settlement config (PRO-737)",
    description:
      "R1 HQ billing spine. Settings tab on the Partner detail modal: CamiPay rail flags, a gateway per rail, and an append-only rate card. A rate is a percentage plus a fixed per-transaction amount, optionally with a ceiling above which the fixed part drops off. Open a Partner below, then the Settings tab. Rate changes are forward-only, they never re-price captured payments.",
    screens: [
      {
        path: "/admin/businesses?business=shampooch-jvc",
        label: "Settings tab, live Partner",
        note: "Both rails on NeoPay, terminal cut from 2% to 1.8% and online to 3% + AED 0.75 under AED 100, both on 01 May. Show rate history to see the append-only rows, then Change to append another; the dialog previews the fee on either side of the bracket before you save.",
      },
      {
        path: "/admin/businesses?business=pawhaus",
        label: "Settings tab, scheduled rate",
        note: "Terminal on TapPay, online on NeoPay (rails are not coupled to one provider). A 1.9% terminal rate is already scheduled for 01 Sep, badged Scheduled until it takes effect. Online carries a 3.25% + AED 1.00 under AED 100 bracket.",
      },
      {
        path: "/admin/businesses?business=velvet-paw",
        label: "Settings tab, no rate card",
        note: "Onboarding Partner: both rails off, empty rate-card state with Set terminal rate.",
      },
      {
        path: "/admin/businesses?business=doggos",
        label: "Settings tab, live rail earning nothing",
        note: "Suspended Partner still holds its commercial terms. The online rail is live with no rate row, so it reads Not set and warns that Cami earns nothing on those payments. A missing rate is zero, not an error, which is why it is called out rather than blocked.",
      },
      {
        path: "/admin/businesses?business=furry-tales",
        label: "Settings tab, archived and read-only",
        note: "Archived Partner: switches disabled, no Change buttons, history still readable.",
      },
    ],
  },
  {
    title: "CamiPay fee visibility, Partner side (PRO-737)",
    description:
      "The other half of the rate card: what the Partner sees. A fee breakdown on every CamiPay sale, and a read-only view of their own rates. Cami's fee only, never the gateway's processing cost, and the rate is the one snapshotted at capture rather than whatever the card says today.",
    screens: [
      {
        path: "/sales/sales-list",
        label: "Sale detail, fee breakdown",
        note: "Open sale 16 (Terminal, 1.8%, no fixed) and sale 15 (Online, 3% + AED 0.75, part-paid so the fee follows what was captured, not the total). Sale amount → Cami fee → Net to you, with the calculation under the fee.",
      },
      {
        path: "/sales/gift-cards-sold?card=gc-5",
        label: "Sale detail, above the bracket",
        note: "View sale on this AED 10,500 gift card. Same 3% + AED 0.75 rate as sale 15, but above the AED 100 ceiling, so the fixed part drops and the fee is the percentage alone.",
      },
      {
        path: "/sales/sales-list?settings=payments&pp=camipay",
        label: "Partner settings, CamiPay rates",
        note: "Settings → Payments → CamiPay rates. Read-only with no disabled controls, no gateway named, no processing fee. Reads the same store HQ writes to, so change a rate in HQ and it appears here.",
      },
    ],
  },
  {
    title: "Merchant money surfaces (DSG-73)",
    description:
      "Hosted on /shell-demo because none of these have a route: the money drawer lives in the topbar and the billing panels inside the settings dialog, so the links open them over the bare app shell rather than over an unrelated page. Where the merchant's money is, when it lands, and what Cami charged. Split custody is the whole design: terminal money is held and paid by NeoPay, online money by Cami — one merchant, two payouts, two senders, two schedules. The benchmark's defect is a headline and its own breakdown disagreeing 9.3x because payouts were missing from the arithmetic; here every figure is derived from one ledger, so the breakdown cannot drift from the headline. Spec: docs/specs/DSG-73-merchant-money-surfaces.md.",
    screens: [
      {
        path: "/shell-demo?money=drawer",
        label: "Topbar money drawer · the entry point",
        note: "The money icon sits in the topbar on every screen, so it has no route of its own — these links open it over the bare shell. It is the only way in, because a routed Money section was an orphan nothing linked to. One card per sender (Cami / NeoPay) with what each holds and when it lands, the last three days of activity, then a way into the full screens. Reads the same derivation as the account summary, so the drawer and the page cannot disagree — which is exactly what they do in the reference product.",
      },
      {
        path: "/shell-demo?money=summary",
        label: "Account summary (DSG-77) · two rails",
        note: "The recommended D6 layout. Cami-held money is the headline (the only timing Cami controls), NeoPay's sits beside it at lower weight. Follow the breakdown down: money in → what Cami charged → adjustments → already paid to your bank → still held. The running totals between blocks are the point — the arithmetic is visible, not asserted.",
      },
      {
        path: "/shell-demo?money=summary&variant=blended",
        label: "Account summary · blended (the other D6 option)",
        note: "One figure for everything held, custodian split stated underneath. Take both to design review — this one is easier to glance at and closer to recreating the two-balance defect from the other direction.",
      },
      {
        path: "/shell-demo?money=summary&state=paused",
        label: "Payouts paused, destination unverified",
        note: "SET-B4. The banner has to say the money will NOT fall back to the old account, because that is every merchant's reasonable assumption.",
      },
      {
        path: "/shell-demo?money=summary&state=pending",
        label: "Verification pending",
        note: "Between unverified and healthy. Payouts are still paused, but the copy carries no fault — nothing is wrong and nothing is being asked of the merchant, so the tone drops from warning to plain information.",
      },
      {
        path: "/shell-demo?money=summary&state=below-minimum",
        label: "Below minimum, rolls forward",
        note: "SET-X9. Skipped is not failed — no alarm colour, no error wording. A merchant who reads this as a problem calls support about money that is fine.",
      },
      {
        path: "/shell-demo?money=summary&state=not-ready",
        label: "Not settle-ready",
        note: "Nothing has ever gone out, so the held figure is large and none of it is moving. Payouts line reads zero and the banner explains why.",
      },
      {
        path: "/shell-demo?money=summary&rails=terminal-only",
        label: "Terminal-only merchant",
        note: "SET-X7. One custodian, so the rail split collapses and there is no Cami-controlled schedule to show. Complete screen, not a degraded one.",
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
        note: "Filter to Payouts and open the 12 Aug row. It keeps its reason permanently, the money came back as its own row, and the retry is a separate payout carrying the same transactions. Contents are summed on screen so the drill-in arrives at the payout figure instead of asserting it.",
      },
      {
        path: "/shell-demo?money=activity&loading=1",
        label: "Activity · loading",
        note: "Skeletons keep the day-group shape, so nothing jumps when the rows land.",
      },
      {
        path: "/shell-demo?money=activity&state=no-activity",
        label: "Activity · empty vs filtered-to-zero",
        note: "Two different empties. This one is a new merchant; filter the healthy feed to a type it has none of and the copy says there IS money here, just none matching your filters.",
      },
      {
        path: "/shell-demo?settings=billing&bp=fees",
        label: "Invoices and fees (DSG-76)",
        note: "Settings › Billing › Invoices and fees — a panel, not a page, so the merchant is never thrown out of the dialog they opened. Period headings newest first, two documents each, and the current month pending with the date it arrives — the reference shape, which works. What differs is the content: no subscription line (their statement is 58% plan charges), the rate stated ON the screen rather than buried in a download, and every fee expandable down to the sale that caused it with the working shown.",
      },
      {
        path: "/shell-demo?settings=billing&bp=fees",
        label: "Cami tax invoice · open any closed period",
        note: "Download PDF on a closed period opens Cami's own tax invoice, rendered through the DSG-72 document rather than a second renderer. Cami is the supplier here and the merchant the customer, so it carries Cami's TRN, the merchant's, and the VAT they can reclaim. The recipient block comes from Billing details — get the legal name wrong there and this document is wrong.",
      },
      {
        path: "/shell-demo?settings=billing&bp=fees&d1=invoice",
        label: "Invoices and fees · the other D1 outcome",
        note: "D1 is open. Here Cami invoices for card machine fees rather than NeoPay deducting them, so the tax invoice is payable and the explanatory card changes. Same derivation, one card's difference — take both to the D1 call.",
      },
      {
        path: "/shell-demo?settings=billing&bp=bank",
        label: "Bank account (DSG-75) · verified",
        note: "Settings → Billing → Bank account. Masked to last 4, a verification state, and the fact the reference product leaves out entirely: two senders pay into this one account on two schedules, and only Cami's is Cami's to change. Change history is permanent and keeps failed attempts.",
      },
      {
        path: "/shell-demo?settings=billing&bp=bank&bd=gateway-failed",
        label: "Bank account · gateway write failed",
        note: "The state the whole screen exists for (SET-B3, QA SET-X1). Hit Change, fill anything in, confirm — the flow reports that NeoPay refused, that NOTHING was changed, and names the account still in force. A half-applied change would send half the merchant's money to a closed account and fail days later where support cannot see it.",
      },
      {
        path: "/shell-demo?settings=billing&bp=bank&bd=unverified",
        label: "Bank account · unverified, payouts paused",
        note: "SET-B4. Payouts pause and — the part every merchant assumes wrongly — they do NOT fall back to the previous account. The copy says so outright.",
      },
      {
        path: "/shell-demo?settings=billing&bp=bank&bd=read-only",
        label: "Bank account · no permission to change",
        note: "SET-B9. Gated by its own permission, separate from rails and rates: reading the rate card does not entitle you to move the money. No disabled Change button — the account is simply read-only, with a line saying who to ask.",
      },
      {
        path: "/shell-demo?settings=billing&bp=bank&bd=online-only",
        label: "Bank account · online-only merchant",
        note: "SET-X8. No NeoPay row in the schedule and no gateway copy to explain — only Cami pays this merchant.",
      },
      {
        path: "/shell-demo?settings=billing&bp=bank&bd=terminal-only",
        label: "Bank account · terminal-only merchant",
        note: "SET-X7. One custodian, so there is one schedule and it is NeoPay's — read-only in the strong sense, no greyed control implying a permission that could be granted.",
      },
      {
        path: "/shell-demo?settings=billing&bp=details",
        label: "Billing details (DSG-74) · complete",
        note: "The legal identity every document Cami stamps is stamped with — today those values are a hardcoded constant in lib/invoice/from-sale.ts. Edit opens the standard takeover, which states the thing merchants get wrong: changes apply forward only, and an invoice already sent keeps what it was issued with.",
      },
      {
        path: "/shell-demo?settings=billing&bp=details&bl=no-trn",
        label: "Billing details · no TRN",
        note: "The state with a real consequence: without a TRN what the client receives is an ordinary invoice with no tax wording anywhere. Worded as a fact rather than an error — plenty of businesses are simply not VAT-registered.",
      },
      {
        path: "/shell-demo?settings=billing&bp=details&bl=empty",
        label: "Billing details · nothing filled in yet",
        note: "T1-1. Every field still renders; missing ones collapse into an Add pill rather than a blank row, so nothing is silently absent.",
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
      "Add card machines, issue their credentials, and manage sign-in sessions — Payments > Terminals. Replaces the merchant-level shared-PIN model (spec: docs/specs/DSG-62-terminal-registration.md, which supersedes DSG-62-terminal-management.md). Each terminal is added with a name and a required location, and comes back with two credentials doing different jobs: a pairing code typed into the hardware once and never changed, and a 6-digit sign-in PIN typed at every sign-in, readable from the row any time, regenerated on demand. Per-device rather than merchant-wide, so regenerating a PIN or a failed-attempt lockout hits that terminal alone. Nothing is capped — as many terminals as there is hardware for, as many concurrent sessions as staff open. Opens empty by default, which is where a real merchant starts. Deep-link states with &tp=typical|full|empty, and the dialogs with &td=add|credentials|sessions (which open on the first terminal in view).",
    screens: [
      {
        path: "/shell-demo?settings=payments&pp=terminal",
        label: "Terminals, empty (default)",
        note: "No terminals yet, with the only Add terminal button in the empty state (the header one is suppressed while the list is empty). Walk the whole arc from here: add → get the code and PIN → 'Demo: pair a device' stands in for typing the code into the hardware → 'Demo: sign in on a terminal' stands in for staff entering the PIN → the row goes Not paired → No sessions → Active.",
      },
      {
        path: "/shell-demo?settings=payments&pp=terminal&td=add",
        label: "Terminals, add a terminal",
        note: "Name and a required location — a card machine physically sits somewhere, and the location is what tells two identical tablets apart. The pairing code is generated on submit rather than shown on the form: it isn't something the merchant provides or reviews, it's half of the credential. Lands straight on the credentials dialog.",
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
        path: "/shell-demo?settings=payments&pp=terminal&tp=typical&td=credentials",
        label: "Terminals, credentials dialog",
        note: "Show code & PIN on any row. Both credentials on one screen because that is how a device gets set up, but labelled apart because their lifecycles differ: the pairing code is typed into the hardware once and never changes, the PIN is typed at every sign-in and can be regenerated. PIN masked with Show/Copy; Regenerate PIN is a link underneath rather than a fourth icon, since Show and Copy read the value while regenerate replaces it. Same dialog after adding ('Set up X'), from the row ('Code & PIN for X'), and after regenerating ('New PIN for X', pre-revealed, and it says the code hasn't changed).",
      },
      {
        path: "/shell-demo?settings=payments&pp=terminal&tp=typical&td=sessions",
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
        label: "Toolbar + sheets",
        note: "Header toolbar (date, Day/Week, filters, New booking) over a demo body. The people grid itself is not mounted on this route yet — it renders in /playground under 'Appointments — toolbar and people grid', which is also the only place the booking blocks and their hover/click popover can be exercised.",
      },
      {
        path: "/appointments",
        label: "New booking sheet · Pet Address + Pet notes",
        note: "'New booking' → scroll to the Pet Address and Pet notes sections. The Pet Address tick is off by default; ticking it reveals the address block, which reuses the selected client's saved address (Karen Dougall and Maaz Test You have one on file; Aaliyah Hazari doesn't, which forces the manual input; with no client picked yet you get a 'pick a client' hint). Pet notes use the same six tappable categories as the public flow, so notes captured by staff and by the parent stay the same shape. NOTE: this route does not render the calendar grid — the booking blocks and their popover live on /playground.",
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
        path: "/sales/appointments-list?ref=b-002",
        label: "Detail sheet · Pet Address + Pet notes",
        note: "Same sheet, showing the two new sections between Services and the sale total: a Pickup card (car chip + collection address, only when the booking needs pickup) and a Pet notes card. The sheet opens from the Ref # link in the table — not the row body — so use this deep link. b-004 also has both; b-001 has neither, which is the empty case.",
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
        note: "Opens the centered dialog over the listing via ?sale=<id>. Status-driven header action (Pay now / Share invoice filled or outline / nothing for voided) and Quick-actions kebab (different items per status). Receipt body shows Subtotal/Total, Payment line, and Balance or Change depending on what was paid; refunded sales add a Refund #N card above the original Sale card. All four Quick actions are matched to the shipped implementation in cami-business, and not one of them navigates away from the sale. Share invoice opens a share modal (copyable /invoice/<id> link, Gmail, WhatsApp, More options); the link is fetched, so it has ready / loading / error states — see the playground. Email opens a one-field modal with validation and a walk-in variant. Print and Download PDF open the document in a new tab, Print with the print dialog raised automatically and Download without it — production reaches a real blob PDF there because a backend renders it; this repo has no PDF generator, so the browser print dialog stands in. Try 7 (completed), 6 (part-paid), 3 (refunded), 1 (voided) — see also 12–16 for the new today-dated rows, and 16 for the only row with a tip, which is where Total (incl. VAT) and Amount due visibly diverge.",
      },
      {
        path: "/invoice/17",
        label: "Invoice link (customer view)",
        note: "DSG-72. The unique invoice link, as the client receives it — no sign-in, no AppShell, just a thin action bar over the same document the PDF and email attachment render. Path shape matches production exactly (live Cami shares business.getcami.io/invoice/<id>), so the link inside the Share invoice modal is real and openable here. Try 17 (package redemption at AED 0.00 with a AED 5.00 tip), 16 (the only sale with a tip, so Total 54.00 and Amount due 64.00 diverge), 13 (Credit Note), 24 (gift card, no VAT row), 999 (not-found state). Reached from /sales/sales-list?sale=<id> → Share invoice → the link. Resize the window narrow, or open it on a phone: this is the ONLY surface that reflows (spec §9 Q14, built as a proposal). Identity stacks over the meta block, totals and tender go full width, and the line table scrolls in place rather than dropping a column — same blocks, same order, same labels, same figures, so the PDF and this view still agree. Ctrl+P here still emits true A4. The PDF and /sales/invoice-document stay fixed A4 at every width.",
      },
      {
        path: "/sales/invoice-document",
        label: "Invoice document (A4 downloadable)",
        note: "DSG-72. The FTA-presentable replacement for today's `Sale 22` output. One component renders all three surfaces — switch with the tabs (PDF download / Invoice link / Email attachment); only the chrome around the page changes, never the document. Two ways in. FROM A REAL SALE — ?sale=<id>, where the Sale detail dialog's actions land: the fixture switcher and the spec blurb are hidden so it reads as a product surface, not a harness. Try 16 (completed, the only row with a tip, so Total 54.00 and Amount due 64.00 diverge), 17 (package redemption at AED 0.00 with a AED 5.00 tip — live Sale 387's shape), 15 (part-paid), 14 (unpaid), 13 (refunded, becomes a Credit Note), 12 (voided), 24 (gift card, so no VAT row at all). FROM A FIXTURE — ?state=<id>, for the cases a sale row cannot express because they are properties of the business or of line items rather than of a sale: no-TRN, tax-full (needs a recipient TRN, which the client model has no field for), logo, long business name, 30-line pagination, promotion vs cart discount, overtender. Those keep the Fresha reference numbers so the screen can be held next to the PDFs in docs/specs/assets/. 16 fixture states: completed, part-paid, unpaid, credit-note, credit-note-tip, voided, tip, tax-full, plain, recipient-minimal, logo, zero-value, zero-value-tip, overtender, overflow, multi-page. What to look at: the VAT row Cami has never rendered (derived from the tax-inclusive gross, 450 → 21.43); `Total (incl. VAT)` and `Amount due` as two rows that both always render, so a tip can't misreport the VAT base (EC-39 — see ?state=tip); no badge chips anywhere, payment state is carried by Balance alone; ?state=credit-note reverses VAT (− AED 0.95), which the Fresha benchmark omits entirely; ?state=voided adds a watermark because the benchmark's grey subtitle alone reads as a legitimate paid invoice; ?state=unpaid states 'No payments received' instead of leaving a bare gap; ?state=plain drops every trace of tax wording; ?state=multi-page repeats the condensed identity block and column headers with page N of M. Identity is top-left and meta top-right, not the centered stack both Cami and Fresha use today. Print to check A4 — the Print action prints the document only.",
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
        note: "Multi-select service cards by category (list-icon opens a Categories dropdown), slot picker (12-staff horizontal rail with prev/next arrows + edge fade, circle day picker, available-times list, 5-min hold). Identity step is phone-first: enter mobile in the shared <PhoneField> (dial-code select + number, matching dev) → auto-verifying 6-digit OTP (code starting '0' fails) → resolve; once verified the same field renders locked. Demo: mobile ending in an EVEN digit is a returning client (pre-filled name/email, phone disabled, saved-pet dropdown Bella/Miso + 'Add a new pet'); ODD digit is new (empty form, phone pre-filled & disabled, inline pet capture). Confirm with summed total, then 'You're booked' with a reference.",
      },
      {
        path: "/shampooch-jvc/book",
        label: "Booking flow · pet address + pet notes",
        note: "New clients now give an optional Address on the registration form itself, next to name and email — it belongs on the profile, not only behind the address tick. On the identity step (both the returning and the new-client branch): a 'Pet Address' checkbox, unchecked by default. Checking it reveals the address block with 'Use my saved address' pre-ticked (billing/shipping idiom — nothing to type in the common case); unticking it, or having no saved address, shows a 'Your Pet Address' input. Wording is deliberately service-agnostic — 'pickup' doesn't apply to mobile grooming, where the groomer always travels to the pet. 'Anything we should know?' is now six tappable categories (Allergies / Behavior / Medical condition / Handling / Grooming sensitivity / Other) rather than one blank box — multi-select, and tapping one opens its own specifics field, which is required before Continue. It sits outside the address checkbox: allergies and handling matter on every booking. Both surface as rows on the Review step. Use an EVEN-ending mobile to get the returning client with a saved address on file.",
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
        path: "/shampooch-jvc/booking/CAMI-4821-pickup",
        label: "Manage booking · pickup variant",
        note: "The '-pickup' ref suffix (same convention as -confirmed / -cancelled) renders the collection variant: Pickup and Notes rows join Service / When / Duration / With / Pet, so the parent can check the collection address without calling the salon.",
      },
      {
        path: "/account",
        label: "Pet-parent account (E3-6)",
        note: "Passwordless: mobile → OTP verify → home (upcoming booking, pets, profile). New numbers auto-create an account. Profile now carries an Address row — the same address the booking form captures and pickup reuses.",
      },
      {
        path: "/emails/booking-confirmation",
        label: "Confirmation email (E3-5)",
        note: "Branded email template; pet business leads the header, Cami signature footer, manage-booking CTA.",
      },
      {
        path: "/emails/booking-confirmation?pickup=1",
        label: "Confirmation email · pickup variant",
        note: "Same template with ?pickup=1. Adds a Notes row, and the 'Where' row becomes 'Pet Address' — when we travel to the pet the salon address isn't where the parent needs to be, so printing it would be the wrong thing.",
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
              {/* Keyed by path AND label: a section deliberately lists the same
                  route more than once when there are different things to look at
                  on it (the activity feed and the detail panel behind a row, say),
                  and a path-only key collides on those. */}
              {section.screens.map((screen) => (
                <li key={`${screen.path}|${screen.label}`}>
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
