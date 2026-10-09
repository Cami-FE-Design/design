"use client"
import { useState } from "react"
import { toast } from "sonner"

import { BusinessNotificationsSection } from "@/components/blocks/admin/business-detail-dialog"
import { HqCamiPayPanel } from "@/components/blocks/admin/hq-camipay-panel"
import { TerminalStatus } from "@/components/blocks/admin/hq-terminal-status"
import { HqTerminalsPanel } from "@/components/blocks/admin/hq-terminals-panel"
import { ImpersonationBanner } from "@/components/blocks/admin/impersonation-banner"
import { MerchantCode } from "@/components/blocks/admin/merchant-code"
import { Lane, Row, Section } from "@/components/blocks/playground/kit"
import { adminBusinesses } from "@/lib/admin-businesses"
import { ALL_HQ_PERMISSIONS, AuthProvider, type PermissionKey } from "@/lib/auth-mock"
import { CamiPayProvider } from "@/lib/hq-camipay/store"
import { type HqTerminalStatus, HqTerminalsProvider } from "@/lib/hq-terminals/store"

/**
 * One HQ CamiPay panel, wrapped in its own AuthProvider so each row can show a
 * different permission set. The CamiPay store is provided once by the section
 * above, so edits made in one row are reflected in the others.
 */
function CamiPayPanelDemo({
  slug,
  permissions,
  disabled,
}: {
  slug: string
  permissions: PermissionKey[]
  disabled?: boolean
}) {
  const business = adminBusinesses.find((b) => b.slug === slug)
  if (!business) return null
  return (
    <div className="w-full max-w-xl">
      <AuthProvider initialPermissions={permissions}>
        <HqCamiPayPanel business={business} disabled={disabled} />
      </AuthProvider>
    </div>
  )
}

/**
 * One HQ terminals panel, wrapped in its own AuthProvider so each row can show
 * a different permission set. Both stores are provided once by the section
 * above, so a block made in one row shows up in the others.
 */
function HqTerminalsPanelDemo({
  slug,
  permissions,
  disabled,
}: {
  slug: string
  permissions: PermissionKey[]
  disabled?: boolean
}) {
  const business = adminBusinesses.find((b) => b.slug === slug)
  if (!business) return null
  return (
    <div className="w-full max-w-xl">
      <AuthProvider initialPermissions={permissions}>
        <HqTerminalsPanel business={business} disabled={disabled} />
      </AuthProvider>
    </div>
  )
}

/** Interactive percent/fixed amount input, as used for deposits and no-show fees. */

/**
 * One partner's HQ notification controls, backed by local state so the four
 * rows in the showcase can be edited independently instead of writing through
 * to the shared mock array and fighting each other.
 */
function HqNotificationsDemo({ slug }: { slug: string }) {
  const base = adminBusinesses.find((b) => b.slug === slug)
  const [business, setBusiness] = useState(base)
  if (!business) return null
  return (
    <BusinessNotificationsSection
      business={business}
      onUpdate={(patch) => setBusiness((prev) => (prev ? { ...prev, ...patch } : prev))}
    />
  )
}

/**
 * Playground-only: what `checkGoogleReviewLink` makes of each shape a merchant
 * might paste. Rendered as data rather than as four live fields, because the
 * field writes to one shared setting — four of them would fight over it.
 */

export function HqLane() {
  return (
    <Lane id="hq" label="Cami HQ" blurb="Our own control plane over Partners.">
      <Section
        title="Cami HQ — CamiPay settlement config"
        description="PRO-737. The Settings tab of the HQ Partner detail dialog: one card, one section per rail — whether it is on, where it routes, and what Cami charges. A rate is a percentage plus a fixed per-transaction amount, optionally with a ceiling above which the fixed part drops off. Rates are append-only, so the only write is Change, which adds a row with an effective-from date. A live rail with no rate row earns Cami nothing and says so."
      >
        <CamiPayProvider>
          <Row label="Live Partner, full edit rights">
            <CamiPayPanelDemo slug="shampooch-jvc" permissions={ALL_HQ_PERMISSIONS} />
          </Row>
          <Row label="Scheduled rate, split gateways per rail">
            <CamiPayPanelDemo slug="pawhaus" permissions={ALL_HQ_PERMISSIONS} />
          </Row>
          <Row label="Onboarding, rails off and no rate card">
            <CamiPayPanelDemo slug="velvet-paw" permissions={ALL_HQ_PERMISSIONS} />
          </Row>
          <Row label="View-only, billing.read without CamiPay edit">
            <CamiPayPanelDemo slug="shampooch-jvc" permissions={["billing.read"]} />
          </Row>
          <Row label="Archived Partner, whole tab read-only">
            <CamiPayPanelDemo slug="furry-tales" permissions={ALL_HQ_PERMISSIONS} disabled />
          </Row>
        </CamiPayProvider>
      </Section>
      <Section
        title="Cami HQ — terminal fleet, Partner card"
        description="DSG-82 — Cami owns the machines and leases them, so a terminal is an asset HQ assigns, not a device a merchant registered. Rows lead with the serial, which is what is printed on the box and quoted in a ticket. Return to Cami is the destructive item, not Block, because a block is undone from the same menu. The access switch writes the same rails.terminal.enabled flag as CamiPay Terminal."
      >
        <HqTerminalsProvider>
          <CamiPayProvider>
            <Row label="Three units: active, idle, and shipped but never switched on">
              <HqTerminalsPanelDemo slug="shampooch-jvc" permissions={ALL_HQ_PERMISSIONS} />
            </Row>
            <Row label="One unit blocked by HQ, with who and when on the row">
              <HqTerminalsPanelDemo slug="pawhaus" permissions={ALL_HQ_PERMISSIONS} />
            </Row>
            <Row label="Suspended Partner, device locked itself out on failed PINs">
              <HqTerminalsPanelDemo slug="doggos" permissions={ALL_HQ_PERMISSIONS} />
            </Row>
            <Row label="Nothing assigned yet — empty state carries Assign">
              <HqTerminalsPanelDemo slug="velvet-paw" permissions={ALL_HQ_PERMISSIONS} />
            </Row>
            <Row label="Terminal access off, so the unit in hand cannot transact">
              <HqTerminalsPanelDemo slug="furry-tales" permissions={ALL_HQ_PERMISSIONS} />
            </Row>
            <Row label="View-only, merchants.view without merchants.edit">
              <HqTerminalsPanelDemo slug="shampooch-jvc" permissions={["merchants.view"]} />
            </Row>
            <Row label="Archived Partner, whole tab read-only">
              <HqTerminalsPanelDemo slug="furry-tales" permissions={ALL_HQ_PERMISSIONS} disabled />
            </Row>
          </CamiPayProvider>
        </HqTerminalsProvider>
      </Section>
      <Section
        title="Terminal status — one vocabulary, two surfaces"
        description="DSG-82. The fleet table and the Partner card both read components/blocks/admin/hq-terminal-status.tsx, so they cannot drift. The first three are fleet states only HQ sees; Not set up, Locked, Active and No sessions are the merchant's own words from DSG-62. Order is first-match-wins: where the unit physically is, then whether HQ stopped it, then what the device is doing."
      >
        {(
          [
            "in-stock",
            "returned",
            "faulty",
            "not-paired",
            "active",
            "no-sessions",
            "blocked",
            "locked",
          ] as HqTerminalStatus[]
        ).map((status) => (
          <Row key={status} label={status}>
            <TerminalStatus status={status} suffix={status === "locked" ? "12 min" : null} />
          </Row>
        ))}
      </Section>
      <Section
        title="Partner code — CM-####"
        description="DSG-82. The identifier a human says out loud. `id` is internal and never rendered, the slug is public and changeable, and this one is issued at creation and immutable — which is why there is no edit affordance anywhere. Chip variant on the detail header and the Terminals card, click to copy; inline variant in dense listing rows, where a button per row would be twelve buttons nobody asked for."
      >
        <Row label="Chip — click to copy">
          <MerchantCode code="CM-4821" />
        </Row>
        <Row label="Inline — roster row, paired with the slug">
          <span className="truncate font-mono text-xs text-muted-foreground">
            CM-4821 · cami.app/shampooch-jvc
          </span>
        </Row>
      </Section>
      <Section
        title="Notifications, Cami HQ control plane"
        description="The HQ half of the same store the merchant panel reads: Sender ID registrations to approve or reject, per-Partner channel grants, and rate overrides against the global rate card. Four Partners cover the states — Shampooch approved with a negotiated override, Pawhaus pending, Doggos rejected with SMS off, Furry Tales with no config at all."
      >
        <Row label="Approved Sender ID, global rates (Shampooch)">
          <div className="w-full max-w-2xl">
            <HqNotificationsDemo slug="shampooch-jvc" />
          </div>
        </Row>
        <Row label="Pending Sender ID + SMS rate override (Pawhaus)">
          <div className="w-full max-w-2xl">
            <HqNotificationsDemo slug="pawhaus" />
          </div>
        </Row>
        <Row label="Rejected Sender ID, SMS switched off (Doggos)">
          <div className="w-full max-w-2xl">
            <HqNotificationsDemo slug="doggos" />
          </div>
        </Row>
        <Row label="No config at all — inherits every default (Furry Tales)">
          <div className="w-full max-w-2xl">
            <HqNotificationsDemo slug="furry-tales" />
          </div>
        </Row>
      </Section>
      <Section
        title="Impersonation banner"
        description="Bottom-anchored pill on the Partner portal during a Cami HQ impersonation session. Yellow active state, tomato expiring/expired states, plus a collapsed toggle that doubles as a re-open affordance."
      >
        <Row label="Active">
          <div className="flex w-full max-w-2xl justify-center rounded-md bg-cami-yellow-9 p-3">
            <ImpersonationBanner
              ownerName="Maz Khan"
              businessName="Shampooch JVC"
              onExit={() => toast.success("Impersonation stopped")}
            />
          </div>
        </Row>
        <Row label="Expiring (5 min)">
          <div className="flex w-full max-w-2xl justify-center rounded-md bg-cami-yellow-9 p-3">
            <ImpersonationBanner
              ownerName="Maz Khan"
              businessName="Shampooch JVC"
              durationSeconds={4 * 60}
              expiringThresholdSeconds={5 * 60}
              onExit={() => toast.success("Impersonation stopped")}
            />
          </div>
        </Row>
        <Row label="Expired (terminal)">
          <div className="flex w-full max-w-2xl justify-center rounded-md bg-cami-yellow-9 p-3">
            <ImpersonationBanner
              ownerName="Maz Khan"
              businessName="Shampooch JVC"
              durationSeconds={0}
              onExit={() => toast.success("Window closed")}
            />
          </div>
        </Row>
        <Row label="Collapsed">
          <div className="flex w-full max-w-2xl justify-center rounded-md bg-cami-yellow-9 p-3">
            <ImpersonationBanner
              ownerName="Maz Khan"
              businessName="Shampooch JVC"
              defaultCollapsed
              onExit={() => toast.success("Impersonation stopped")}
            />
          </div>
        </Row>
      </Section>
    </Lane>
  )
}
