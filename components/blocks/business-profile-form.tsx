"use client"

import { BanknoteIcon, Building2Icon, FlagIcon, GlobeIcon, PercentIcon, XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useEffect, useRef, useState } from "react"
import { SettingsPanel } from "@/components/blocks/settings-panel"
import { SettingsRow } from "@/components/blocks/settings-row"
import { FacebookGlyphIcon, InstagramGlyphIcon, XGlyphIcon } from "@/components/blocks/social-icons"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDemoBusiness } from "@/lib/demo-business"
import { cn } from "@/lib/utils"

const triggerOverride = "data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium"

// Full-window dialog overrides. Important suffix beats the base sm:max-w-md
// from the Dialog primitive.
const fullScreenDialogClass =
  "fixed! inset-0! top-0! left-0! h-dvh! w-screen! max-h-none! max-w-none! sm:max-w-none! translate-x-0! translate-y-0! rounded-none! flex-col p-0"

type IconComponent = React.ComponentType<{ className?: string }>
type FocusField =
  | "businessName"
  | "country"
  | "currency"
  | "tax"
  | "facebook"
  | "twitter"
  | "instagram"
  | "website"
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
]

const EXTERNAL_LINKS_SUMMARY: SummaryItem[] = [
  { icon: FacebookGlyphIcon, label: "Facebook", value: null, field: "facebook" },
  { icon: XGlyphIcon, label: "X (Twitter)", value: null, field: "twitter" },
  { icon: InstagramGlyphIcon, label: "Instagram", value: null, field: "instagram" },
  { icon: GlobeIcon, label: "Website", value: "www.shampooch.ae", field: "website" },
]

/**
 * Business details panel — combined Business info + External links in one
 * read-mode card with a single Edit button. Edit opens a separate full-screen
 * dialog on top of the settings panel. Form-state wiring is intentionally
 * absent during design iteration.
 */
export function BusinessProfileForm() {
  const { name: businessName } = useDemoBusiness()
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
                value={row.field === "businessName" ? businessName : row.value}
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
                value={row.field === "businessName" ? businessName : row.value}
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [showHeaderTitle, setShowHeaderTitle] = useState(false)
  const fieldRefs = useRef<Partial<Record<FocusField, HTMLInputElement | null>>>({})

  useEffect(() => {
    if (!open) return
    setShowHeaderTitle(false)

    let cleanup: (() => void) | undefined
    const setup = () => {
      const el = scrollRef.current
      const title = titleRef.current
      if (!el || !title) {
        const id = window.requestAnimationFrame(setup)
        cleanup = () => window.cancelAnimationFrame(id)
        return
      }
      const update = () => {
        const titleRect = title.getBoundingClientRect()
        const containerRect = el.getBoundingClientRect()
        setShowHeaderTitle(titleRect.bottom < containerRect.top)
      }
      update()
      el.addEventListener("scroll", update, { passive: true })
      cleanup = () => el.removeEventListener("scroll", update)
    }
    setup()

    return () => cleanup?.()
  }, [open])

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
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogContent className={fullScreenDialogClass}>
        <DialogTitle className="sr-only">Edit business details</DialogTitle>
        <DialogDescription className="sr-only">
          Edit your business identity, currency, tax settings, and external links.
        </DialogDescription>

        <header className="sticky top-0 z-10 border-border/40 border-b bg-background">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <span
              className={cn(
                "min-w-0 truncate font-heading text-base font-semibold leading-6 text-foreground transition-opacity duration-200",
                showHeaderTitle ? "opacity-100" : "opacity-0",
              )}
              aria-hidden={!showHeaderTitle}
            >
              Edit business details
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                radius="full"
                aria-label="Close"
                onClick={() => onOpenChange(false)}
                className="lg:hidden"
              >
                <XIcon className="size-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                radius="full"
                onClick={() => onOpenChange(false)}
                className="hidden lg:inline-flex"
              >
                Close
              </Button>
              <Button
                type="button"
                size="lg"
                radius="full"
                onClick={() => onOpenChange(false)}
                className="hidden lg:inline-flex"
              >
                Save
              </Button>
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-12 lg:px-10">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
            <h2
              ref={titleRef}
              className="font-heading text-2xl font-semibold leading-tight text-foreground lg:text-4xl"
            >
              Edit business details
            </h2>

            <section className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
                  Business info
                </h3>
                <p className="text-sm leading-5 text-muted-foreground">
                  Choose the name displayed on your online booking profile, sales receipts, and
                  messages to clients.
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
              </div>
            </section>
          </div>
        </div>

        <footer className="border-border/40 border-t bg-background px-4 py-3 lg:hidden">
          <Button
            type="button"
            size="lg"
            radius="full"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Save
          </Button>
        </footer>
      </DialogContent>
    </DialogPrimitive.Root>
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
