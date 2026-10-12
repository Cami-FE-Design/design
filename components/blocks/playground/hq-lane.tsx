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
        description="Per-rail CamiPay settings card in HQ: on or off, routing, and append-only rates added with Change."
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
        description="Partner card terminal rows led by serial, with Return to Cami as the destructive action and an access switch."
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
        description="One terminal status vocabulary shared by the HQ fleet table and Partner card: three HQ-only states plus the merchant's."
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
        description="Immutable CM-#### Partner code: the chip variant copies on click, the inline variant suits dense rows."
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
        description="HQ Sender ID approvals, channel grants and rate overrides across four Partners in different states."
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
        description="Impersonation pill on the Partner portal in yellow active, tomato expiring and expired, and collapsed states."
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
