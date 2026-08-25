"use client"

// Billing details — DSG-74.
// Settings › Payments › Billing details.
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md
//
// The smallest screen in the pack and the one the most documents depend on. It
// holds the merchant's legal identity once so every document Cami stamps is
// stamped correctly.
//
// Three things it has to do that a settings form would not:
//
//   - SAY WHERE THESE VALUES GO (T1-4). They are not preferences; they are
//     printed on tax invoices a client keeps. One line of copy, no help-centre
//     hop.
//   - MAKE A MISSING TRN A STATE (T1-1). Not a blank row. Without it the
//     business issues plain invoices with no tax wording anywhere, which is a
//     real consequence and worth naming — but it is not an error, because plenty
//     of businesses are not VAT-registered.
//   - SAY THAT CHANGES ARE FORWARD-ONLY (T1-5, INV-01, INV-12). A merchant who
//     corrects a typo in their legal name reasonably expects their invoices to
//     be fixed. They will not be, and finding that out later is worse than
//     being told now.

import {
  Building2Icon,
  FileTextIcon,
  InfoIcon,
  MapPinIcon,
  PercentIcon,
  ScrollTextIcon,
} from "lucide-react"
import { useState } from "react"
import { AddressSearchField } from "@/components/blocks/address-search-field"
import { NotionBreadcrumb } from "@/components/blocks/notion-breadcrumb"
import { type BreadcrumbRoot, FullScreenTakeover } from "@/components/blocks/sales-settings"
import { SettingsPanel } from "@/components/blocks/settings-panel"
import { SettingsRow } from "@/components/blocks/settings-row"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addressToLine } from "@/lib/address"
import { formatDateTime } from "@/lib/format"
import {
  type BillingDetails,
  BUSINESS_TYPE_LABEL,
  type BusinessType,
  canIssueTaxInvoice,
  DEMO_BILLING_DETAILS,
  DEMO_BILLING_DETAILS_EMPTY,
  DEMO_BILLING_DETAILS_NO_TRN,
} from "@/lib/money/billing-details"
import { TODAY_ISO } from "@/lib/money/mock"

/** Review states, reachable from /screens by `?bl=`. */
export type BillingDetailsDemoState = "complete" | "no-trn" | "empty"

// Field styling shared with the other settings takeovers (see sales-settings).
const selectTriggerOverride =
  "data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium"

const ACTOR = "Omar Haddad"
const UPDATED_AT = `${TODAY_ISO}T09:00:00.000Z`

function initialFor(state: BillingDetailsDemoState): BillingDetails {
  if (state === "no-trn") return DEMO_BILLING_DETAILS_NO_TRN
  if (state === "empty") return DEMO_BILLING_DETAILS_EMPTY
  return DEMO_BILLING_DETAILS
}

export function BillingDetailsPanel({
  onBack,
  breadcrumbRoot,
  initialState = "complete",
}: {
  onBack: () => void
  breadcrumbRoot: BreadcrumbRoot
  initialState?: BillingDetailsDemoState
}) {
  const [details, setDetails] = useState<BillingDetails>(() => initialFor(initialState))
  const [editing, setEditing] = useState(false)

  const compliant = canIssueTaxInvoice(details)

  return (
    <SettingsPanel
      header={
        <>
          <NotionBreadcrumb
            segments={[
              { label: breadcrumbRoot.label, icon: breadcrumbRoot.icon, onClick: onBack },
              { label: "Billing details" },
            ]}
          />
          <header className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
              Billing details
            </h2>
            {/* T1-4. Said once, plainly, on the screen itself. */}
            <p className="max-w-xl text-sm leading-5 text-muted-foreground">
              Your legal identity, as registered rather than as you trade. These exact values are
              printed on the tax invoices you send clients, and on the invoices Cami sends you.
            </p>
          </header>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {!compliant ? (
          <div className="flex w-full gap-3 rounded-xl bg-cami-yellow-2 p-3 sm:w-fit sm:min-w-146 sm:max-w-146">
            <ScrollTextIcon
              className="mt-0.5 size-4 shrink-0 text-cami-yellow-11"
              strokeWidth={1.5}
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">
                Your invoices cannot be tax invoices yet
              </p>
              {/* Not an error. A business without a TRN is not VAT-registered,
                  which is a fact about them and not a mistake they made. */}
              <p className="text-sm text-muted-foreground">
                {details.trn
                  ? "Add your registered address and your documents become full tax invoices."
                  : "Without a TRN, what you send clients is an ordinary invoice with no tax wording on it. If you are VAT-registered, add your TRN and your documents become tax invoices from then on."}
              </p>
            </div>
          </div>
        ) : null}

        <section className="flex w-full flex-col gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146 sm:max-w-146">
          <header className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
              Company details
            </h3>
            {/* One Edit per card, opening the standard takeover (T1-2). */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              radius="full"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          </header>

          {/* Same two-column footprint as Business details and Gift cards — it
              is the same kind of card, so it is the same card. Every field
              renders; a missing one collapses into "Add …" rather than a blank
              row, so nothing is silently absent (T1-1). */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-[16rem_16rem]">
            <SettingsRow
              icon={Building2Icon}
              label="Business type"
              value={BUSINESS_TYPE_LABEL[details.businessType]}
            />
            <SettingsRow
              icon={FileTextIcon}
              label="Legal name"
              value={details.legalName || null}
              onAdd={() => setEditing(true)}
            />
            <SettingsRow
              icon={PercentIcon}
              label="TRN"
              value={details.trn ?? null}
              addLabel="Add TRN"
              onAdd={() => setEditing(true)}
            />
            <SettingsRow
              icon={MapPinIcon}
              label="Registered address"
              value={addressToLine(details.address) || null}
              onAdd={() => setEditing(true)}
            />
          </div>

          {/* INV-08. A change to a legal identity is attributable. */}
          <p className="text-sm leading-5 text-muted-foreground">
            Last changed by {details.updatedBy} · {formatDateTime(details.updatedAtIso)}
          </p>
        </section>
      </div>

      <BillingDetailsEditDialog
        open={editing}
        onOpenChange={setEditing}
        details={details}
        onSave={(next) => setDetails({ ...next, updatedBy: ACTOR, updatedAtIso: UPDATED_AT })}
      />
    </SettingsPanel>
  )
}

function BillingDetailsEditDialog({
  open,
  onOpenChange,
  details,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  details: BillingDetails
  onSave: (details: BillingDetails) => void
}) {
  const [draft, setDraft] = useState(details)

  // Re-seed each time it opens, so a cancelled edit does not survive.
  const [seededFor, setSeededFor] = useState(open)
  if (open !== seededFor) {
    setSeededFor(open)
    if (open) setDraft(details)
  }

  if (!open) return null

  return (
    <FullScreenTakeover
      title="Company details"
      ariaDescription="Edit your legal name, TRN and registered address"
      subtitle="Enter these exactly as they appear on your trade licence — they are printed on your invoices."
      onClose={() => onOpenChange(false)}
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            size="lg"
            radius="full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            size="lg"
            radius="full"
            onClick={() => {
              onSave(draft)
              onOpenChange(false)
            }}
          >
            Save
          </Button>
        </>
      }
    >
      {/* T1-5. Stated here, at the moment of editing, because this is where the
          wrong expectation forms: a merchant fixing a typo assumes their
          existing invoices get fixed too. They do not (INV-01, INV-12). */}
      <div className="flex w-full max-w-md gap-2 rounded-xl bg-cami-sage-2 p-3">
        <InfoIcon className="mt-px size-4 shrink-0 text-cami-sage-12" strokeWidth={1.5} />
        <p className="text-sm leading-5 text-foreground">
          Changes apply from now on. Invoices you have already sent keep the details they were
          issued with — correcting a name here does not change a document a client is holding.
        </p>
      </div>

      <Field label="Business type">
        <Select
          value={draft.businessType}
          onValueChange={(v) => setDraft((d) => ({ ...d, businessType: v as BusinessType }))}
        >
          <SelectTrigger className={selectTriggerOverride} aria-label="Business type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(BUSINESS_TYPE_LABEL) as BusinessType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {BUSINESS_TYPE_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Legal name">
        <Input
          value={draft.legalName}
          placeholder="As it appears on your trade licence"
          onChange={(e) => setDraft((d) => ({ ...d, legalName: e.target.value }))}
        />
      </Field>

      <Field
        label="Trading name"
        helper="Shown under the legal name on documents, when the two differ."
      >
        <Input
          value={draft.tradingName ?? ""}
          placeholder="The name clients know you by"
          onChange={(e) => setDraft((d) => ({ ...d, tradingName: e.target.value || undefined }))}
        />
      </Field>

      <Field
        label="TRN (VAT number)"
        helper="Leave empty if you are not VAT-registered. Your documents will be ordinary invoices with no tax wording."
      >
        <Input
          value={draft.trn ?? ""}
          placeholder="15 digits"
          inputMode="numeric"
          onChange={(e) => setDraft((d) => ({ ...d, trn: e.target.value || undefined }))}
        />
      </Field>

      {/* Picked from the map rather than typed into five boxes. That is also
          what fixes the drift defect logged against the benchmark in DSG-72
          §0.4 gap 15 — a picked address arrives already formatted, so the same
          location cannot print two different ways across documents.

          Country is not asked for: it lives on Business details already. */}
      <AddressSearchField
        label="Registered address"
        helper="Search for it, or type it in. This is the address printed on your invoices. Your country comes from Business details."
        value={draft.address}
        onChange={(address) => setDraft((d) => ({ ...d, address }))}
      />

      <Field
        label="Postal code (optional)"
        helper="Most UAE addresses do not have one. Leave it empty if yours does not."
      >
        <Input
          value={draft.address.postcode}
          inputMode="numeric"
          onChange={(e) =>
            setDraft((d) => ({ ...d, address: { ...d.address, postcode: e.target.value } }))
          }
        />
      </Field>
    </FullScreenTakeover>
  )
}

/**
 * Label + control + helper, at the width the other settings takeovers use.
 * Same shape as `FieldGroup` in the Payments panel — the label is the element,
 * so the control needs no id wiring.
 */
function Field({
  label,
  helper,
  children,
}: {
  label: string
  helper?: string
  children: React.ReactNode
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the control is the child
    <label className="flex w-full max-w-md flex-col gap-1.5">
      <span className="text-sm font-medium leading-5 text-foreground">{label}</span>
      {children}
      {helper ? <span className="text-sm leading-5 text-muted-foreground">{helper}</span> : null}
    </label>
  )
}
