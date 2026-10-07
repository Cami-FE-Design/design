"use client"

import {
  BanknoteIcon,
  Building2Icon,
  ClockIcon,
  FlagIcon,
  GlobeIcon,
  PercentIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { GoogleReviewLinkField } from "@/components/blocks/google-review-link-field"
import { SettingsPanel } from "@/components/blocks/settings-panel"
import { SettingsRow } from "@/components/blocks/settings-row"
import {
  FacebookGlyphIcon,
  GoogleGlyphIcon,
  InstagramGlyphIcon,
  XGlyphIcon,
} from "@/components/blocks/social-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { displayGoogleReviewLink } from "@/lib/business-links/links"
import { useBusinessLinks } from "@/lib/business-links/store"
import { useDemoBusiness } from "@/lib/demo-business"
import { useLocations } from "@/lib/locations/store"
import { overriddenCount, TIMEZONE_OPTIONS, timezoneLabel } from "@/lib/locations/timezone"

const triggerOverride = "data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium"

type IconComponent = React.ComponentType<{ className?: string }>
type FocusField =
  | "businessName"
  | "country"
  | "currency"
  | "tax"
  | "timezone"
  | "facebook"
  | "twitter"
  | "instagram"
  | "website"
  | "googleReview"
type SummaryItem = {
  icon: IconComponent
  label: string
  value: string | null
  field: FocusField
}

const BUSINESS_INFO_SUMMARY: SummaryItem[] = [
  { icon: Building2Icon, label: "Business name", value: "Shampooch JVC", field: "businessName" },
  { icon: FlagIcon, label: "Country", value: "United Arab Emirates", field: "country" },
  { icon: BanknoteIcon, label: "Currency", value: "AED", field: "currency" },
  {
    icon: PercentIcon,
    label: "Tax calculation",
    value: "Retail prices include tax",
    field: "tax",
  },
  // Value comes from the locations store: it is the default every branch
  // without a zone of its own follows (R19), so it has real state.
  { icon: ClockIcon, label: "Time zone", value: null, field: "timezone" },
]

const EXTERNAL_LINKS_SUMMARY: SummaryItem[] = [
  { icon: FacebookGlyphIcon, label: "Facebook", value: null, field: "facebook" },
  { icon: XGlyphIcon, label: "X (Twitter)", value: null, field: "twitter" },
  { icon: InstagramGlyphIcon, label: "Instagram", value: null, field: "instagram" },
  { icon: GlobeIcon, label: "Website", value: "www.shampooch.ae", field: "website" },
  // Value comes from the store, not this list — it is the one external link the
  // product reads at send time, so it has real state. See lib/business-links.
  { icon: GoogleGlyphIcon, label: "Google review link", value: null, field: "googleReview" },
]

/**
 * Business details panel — combined Business info + External links in one
 * read-mode card with a single Edit button. Edit opens a separate full-screen
 * dialog on top of the settings panel. Form-state wiring is intentionally
 * absent during design iteration.
 */
export function BusinessProfileForm() {
  const { name: businessName } = useDemoBusiness()
  const { googleReviewLink } = useBusinessLinks()
  const { businessTimezone } = useLocations()
  const [editing, setEditing] = useState(false)
  const [focusField, setFocusField] = useState<FocusField | null>(null)

  const openEdit = (field: FocusField | null = null) => {
    setFocusField(field)
    setEditing(true)
  }

  return (
    <>
      <SettingsPanel
        header={
          <header className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
              Business details
            </h2>
            <p className="text-sm leading-5 text-muted-foreground">
              Identity, branding, and contact details shown on your public booking page.
            </p>
          </header>
        }
      >
        <section className="flex w-full flex-col gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit">
          <header className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
              Business info
            </h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              radius="full"
              onClick={() => openEdit()}
            >
              Edit
            </Button>
          </header>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-[16rem_16rem]">
            {BUSINESS_INFO_SUMMARY.map((row) => (
              <SettingsRow
                key={row.label}
                icon={row.icon}
                label={row.label}
                value={
                  row.field === "businessName"
                    ? businessName
                    : row.field === "timezone"
                      ? timezoneLabel(businessTimezone)
                      : row.value
                }
                onAdd={() => openEdit(row.field)}
              />
            ))}
          </div>

          <hr className="border-border/40" />

          <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
            External links
          </h3>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-[16rem_16rem]">
            {EXTERNAL_LINKS_SUMMARY.map((row) => (
              <SettingsRow
                key={row.label}
                icon={row.icon}
                label={row.label}
                value={
                  row.field === "googleReview"
                    ? displayGoogleReviewLink(googleReviewLink)
                    : row.value
                }
                onAdd={() => openEdit(row.field)}
              />
            ))}
          </div>
        </section>
      </SettingsPanel>

      <BusinessDetailsEditDialog
        open={editing}
        onOpenChange={(o) => {
          setEditing(o)
          if (!o) setFocusField(null)
        }}
        focusField={focusField}
      />
    </>
  )
}

function BusinessDetailsEditDialog({
  open,
  onOpenChange,
  focusField,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  focusField: FocusField | null
}) {
  const { name: businessName } = useDemoBusiness()
  const { businessTimezone, setBusinessTimezone, locations, isMultiLocation } = useLocations()
  const [zone, setZone] = useState(businessTimezone)
  // Branches that hold a zone of their own stay where they are when this
  // changes — the count is what a business-wide move would not reach.
  const ownZone = overriddenCount(
    locations.map((l) => l.timezone),
    zone,
  )
  const fieldRefs = useRef<Partial<Record<FocusField, HTMLInputElement | null>>>({})

  useEffect(() => {
    if (open) setZone(businessTimezone)
  }, [open, businessTimezone])

  function save() {
    setBusinessTimezone(zone)
    onOpenChange(false)
  }

  // Focus the requested field once the dialog has mounted + animated in.
  useEffect(() => {
    if (!open || !focusField) return
    const id = window.setTimeout(() => {
      const el = fieldRefs.current[focusField]
      if (el) {
        el.focus()
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 120)
    return () => window.clearTimeout(id)
  }, [open, focusField])

  const setFieldRef = (field: FocusField) => (el: HTMLInputElement | null) => {
    fieldRefs.current[field] = el
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit business details"
      ariaDescription="Edit your business identity, currency, tax settings, and external links."
      contentClassName="max-w-2xl"
      onSave={save}
    >
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
            Business info
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            Choose the name displayed on your online booking profile, sales receipts, and messages
            to clients.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <Field label="Business name">
            <Input
              ref={setFieldRef("businessName")}
              key={businessName}
              defaultValue={businessName}
            />
          </Field>
          <Field label="Country">
            <Select defaultValue="ae">
              <SelectTrigger className={triggerOverride}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ae">United Arab Emirates</SelectItem>
                <SelectItem value="sa">Saudi Arabia</SelectItem>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="gb">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Currency">
            <Select defaultValue="aed">
              <SelectTrigger className={triggerOverride}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aed">AED</SelectItem>
                <SelectItem value="sar">SAR</SelectItem>
                <SelectItem value="usd">USD</SelectItem>
                <SelectItem value="gbp">GBP</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tax calculation">
            <Select defaultValue="included">
              <SelectTrigger className={triggerOverride}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="included">Retail prices include tax</SelectItem>
                <SelectItem value="excluded">Retail prices exclude tax</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="flex flex-col gap-1.5">
            <Field label="Time zone">
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger className={triggerOverride}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem key={tz.id} value={tz.id}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {/* R19's first half. Said only to a chain: a single-site
                      business has nothing that inherits it. */}
            {isMultiLocation ? (
              <p className="text-muted-foreground text-xs leading-5">
                Every location follows this unless it sets its own.{" "}
                {ownZone === 0
                  ? "None do yet."
                  : ownZone === 1
                    ? "1 location keeps its own and won’t change."
                    : `${ownZone} locations keep their own and won’t change.`}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
            External links
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            Add your company website and social media links for sharing with clients.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <Field label="Facebook">
            <Input ref={setFieldRef("facebook")} placeholder="facebook.com/your-business" />
          </Field>
          <Field label="X (Twitter)">
            <Input ref={setFieldRef("twitter")} placeholder="x.com/your-business" />
          </Field>
          <Field label="Instagram">
            <Input ref={setFieldRef("instagram")} placeholder="instagram.com/your-business" />
          </Field>
          <Field label="Website">
            <Input ref={setFieldRef("website")} defaultValue="www.shampooch.ae" />
          </Field>
          <GoogleReviewLinkField
            id="business-google-review-link"
            inputRef={setFieldRef("googleReview")}
          />
        </div>
      </section>
    </FullScreenEditDialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: control is passed via children; static analysis can't see through
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium leading-5 text-foreground">{label}</span>
      {children}
    </label>
  )
}
