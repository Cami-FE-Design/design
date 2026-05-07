"use client"

import { useState } from "react"
import { SetupCard, SetupLayout } from "@/components/blocks/setup-shell"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SetupInvoicingPage() {
  const [inherited, setInherited] = useState(true)

  const dataDisabled = inherited ? "true" : undefined
  const fieldClass = "disabled:text-muted-foreground"

  return (
    <SetupLayout stepIndex={4} prevHref="/setup/location">
      <SetupCard
        title="Confirm invoicing details"
        description="Appears on the client's sale receipt. You can edit anytime in settings."
        ctaHref="/setup/hours"
      >
        <label htmlFor="inherit-toggle" className="flex cursor-pointer items-start gap-3">
          <Checkbox
            id="inherit-toggle"
            checked={inherited}
            onCheckedChange={(v) => setInherited(v === true)}
            className="mt-0.5"
          />
          <span className="text-sm text-foreground">
            Use the same info as the business location
          </span>
        </label>

        <div className="group flex flex-col gap-1.5" data-disabled={dataDisabled}>
          <Label htmlFor="company-name">Company name</Label>
          <Input
            id="company-name"
            defaultValue="Sunny Paws"
            disabled={inherited}
            className={fieldClass}
          />
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <div className="group flex flex-col gap-1.5" data-disabled={dataDisabled}>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              defaultValue="Sunny Paws, Marina Tower"
              disabled={inherited}
              className={fieldClass}
            />
          </div>
          <div className="group flex flex-col gap-1.5" data-disabled={dataDisabled}>
            <Label htmlFor="apt">Apt./Suite (optional)</Label>
            <Input id="apt" disabled={inherited} className={fieldClass} />
          </div>
        </div>

        <div className="group flex flex-col gap-1.5" data-disabled={dataDisabled}>
          <Label htmlFor="city">City</Label>
          <Input id="city" defaultValue="Dubai" disabled={inherited} className={fieldClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="group flex flex-col gap-1.5" data-disabled={dataDisabled}>
            <Label htmlFor="state">State</Label>
            <Input id="state" defaultValue="Dubai" disabled={inherited} className={fieldClass} />
          </div>
          <div className="group flex flex-col gap-1.5" data-disabled={dataDisabled}>
            <Label htmlFor="postcode">Postcode</Label>
            <Input id="postcode" disabled={inherited} className={fieldClass} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vat">VAT number (optional)</Label>
          <Input id="vat" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invoice-note">Invoice note (optional)</Label>
          <Textarea
            id="invoice-note"
            placeholder="e.g. Thank you! Reschedule up to 24 hours before."
          />
        </div>
      </SetupCard>
    </SetupLayout>
  )
}
