"use client"

import { ImageIcon, UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const triggerOverride = "data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const BUSINESS_TYPES = [
  { id: "grooming", label: "Pet grooming" },
  { id: "boarding", label: "Boarding" },
  { id: "daycare", label: "Day care" },
  { id: "vet", label: "Veterinary" },
  { id: "training", label: "Training" },
]

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
]

const TIP_PRESETS = [10, 18, 25, 35, 45]

/**
 * Editable form for a single location. Fields mirror what the first-time
 * setup wizard collects plus the operational settings (billing, tax, receipt,
 * tipping) shown on Fresha-style location detail pages. Form-state wiring is
 * intentionally absent during design iteration.
 */
export function LocationForm() {
  return (
    <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
      <SettingsSection heading="Photo">
        <PhotoField />
      </SettingsSection>

      <SettingsSection heading="Contact details">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field label="Location email address">
            <Input type="email" defaultValue="hello@shampooch.ae" />
          </Field>
          <Field label="Location contact number">
            <Input type="tel" defaultValue="+971 50 123 4567" />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection heading="Business types">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field label="Main">
            <Select defaultValue="grooming">
              <SelectTrigger className={triggerOverride}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Additional">
            <ChipMultiSelect options={BUSINESS_TYPES} defaultSelected={["daycare"]} />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection heading="Address">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field label="Street">
            <Input defaultValue="Al Ghozlan 4, Jumeirah Village Circle" />
          </Field>
          <Field label="City">
            <Input defaultValue="Dubai" />
          </Field>
          <Field label="Emirate">
            <Select defaultValue="Dubai">
              <SelectTrigger className={triggerOverride}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMIRATES.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection heading="Opening hours">
        <div className="flex flex-col gap-3">
          {DAYS.map((day) => (
            <DayHoursRow key={day} day={day} defaultOpen="09:00" defaultClose="21:00" />
          ))}
        </div>
      </SettingsSection>

      <SettingsSection heading="Billing details">
        <div className="grid grid-cols-1 gap-y-6">
          <Field label="Company name">
            <Input defaultValue="Shampooch JVC" />
          </Field>
          <Field label="Company address">
            <Textarea defaultValue="Al Ghozlan 4, Jumeirah Village Circle, Dubai" rows={3} />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection heading="Tax defaults">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field label="Services VAT (%)">
            <Input type="number" defaultValue="5" />
          </Field>
          <Field label="Products VAT (%)">
            <Input type="number" defaultValue="5" />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection heading="Receipt sequencing">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field label="Receipt No. prefix">
            <Input placeholder="e.g. INV" />
          </Field>
          <Field label="Next receipt number">
            <Input type="number" defaultValue="21857" />
          </Field>
        </div>
      </SettingsSection>

      <SettingsSection heading="Tipping">
        <div className="flex flex-col gap-6">
          <Field label="Tipping options">
            <Select defaultValue="all">
              <SelectTrigger className={triggerOverride}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All options enabled</SelectItem>
                <SelectItem value="card">Card only</SelectItem>
                <SelectItem value="cash">Cash only</SelectItem>
                <SelectItem value="disabled">Tipping disabled</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default values (%)">
            <div className="flex flex-wrap gap-2">
              {TIP_PRESETS.map((v) => (
                <Input key={v} type="number" defaultValue={v} className="h-12 w-20 text-center" />
              ))}
            </div>
          </Field>
          <Field label="Tip calculation">
            <Select defaultValue="all">
              <SelectTrigger className={triggerOverride}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All items included</SelectItem>
                <SelectItem value="services">Services only</SelectItem>
                <SelectItem value="products">Products only</SelectItem>
              </SelectContent>
            </Select>
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

function DayHoursRow({
  day,
  defaultOpen,
  defaultClose,
}: {
  day: string
  defaultOpen: string
  defaultClose: string
}) {
  return (
    <div className="grid grid-cols-[100px_1fr_auto_1fr] items-center gap-3">
      <span className="text-sm font-medium text-foreground">{day}</span>
      <Input type="time" defaultValue={defaultOpen} className="h-11" />
      <span className="text-sm text-muted-foreground">to</span>
      <Input type="time" defaultValue={defaultClose} className="h-11" />
    </div>
  )
}

function PhotoField() {
  return (
    <div className="flex items-center gap-5">
      <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted text-muted-foreground">
        <ImageIcon className="size-6" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm">
            <UploadIcon className="size-4" />
            Upload photo
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Used as the location's avatar across the portal. PNG or JPG, up to 5 MB.
        </p>
      </div>
    </div>
  )
}

function ChipMultiSelect({
  options,
  defaultSelected,
}: {
  options: { id: string; label: string }[]
  defaultSelected: string[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((o) => {
        const selected = defaultSelected.includes(o.id)
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={selected}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:bg-accent",
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
