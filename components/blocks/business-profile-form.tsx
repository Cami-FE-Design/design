"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Match SelectTrigger to Input's height and shape locally — the global Select
// is used in 40+ places, so we override here rather than changing the primitive.
const selectTriggerOverride =
  "data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium"

/**
 * Pure layout for the Business details settings panel — Business info,
 * External links, and Locations. Form-state wiring is intentionally absent
 * during design iteration; we'll re-add validation and persistence once the
 * field set is settled.
 */
export function BusinessProfileForm() {
  return (
    <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
      <SettingsSection heading="Business info">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field label="Business name">
            <Input defaultValue="Shampooch JVC" />
          </Field>
          <Field label="Country">
            <Select defaultValue="ae">
              <SelectTrigger className={selectTriggerOverride}>
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
              <SelectTrigger className={selectTriggerOverride}>
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
              <SelectTrigger className={selectTriggerOverride}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="included">Retail prices include tax</SelectItem>
                <SelectItem value="excluded">Retail prices exclude tax</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection heading="External links">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field label="Facebook">
            <Input placeholder="facebook.com/your-business" />
          </Field>
          <Field label="X (Twitter)">
            <Input placeholder="x.com/your-business" />
          </Field>
          <Field label="Instagram">
            <Input placeholder="instagram.com/your-business" />
          </Field>
          <Field label="Website">
            <Input defaultValue="www.shampooch.ae" />
          </Field>
        </div>
      </SettingsSection>
    </form>
  )
}

function SettingsSection({
  heading,
  description,
  children,
}: {
  heading: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-6 pb-12 last:pb-0">
      <header className="flex flex-col gap-1 border-border/40 border-b pb-3">
        <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
          {heading}
        </h3>
        {description ? (
          <p className="text-xs leading-4 text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div>{children}</div>
    </section>
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
