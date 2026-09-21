"use client"

import { useState } from "react"
import { CitySelect } from "@/components/blocks/city-select"
import { SetupCard, SetupLayout } from "@/components/blocks/setup-shell"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SetupInvoicingPage() {
  const [inherited, setInherited] = useState(true)
  const [city, setCity] = useState("Dubai")

  const dataDisabled = inherited ? "true" : undefined
  // Not `disabled:text-muted-foreground`. The base Input already dims a
  // disabled control; painting the *value* in the placeholder's colour on top
  // makes a field carrying real text read as an empty one, which is exactly how
  // the same line behaved on the location form's invoicing tab.
  const fieldClass = ""

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

        {/* The same closed list as the branch editor's. Free text here and a
            dropdown there is one address typed two ways, and the surfaces that
            group branches by city then show Dubai twice. */}
        <div className="group flex flex-col gap-1.5" data-disabled={dataDisabled}>
          <Label htmlFor="city">City</Label>
          <CitySelect id="city" value={city} onChange={setCity} disabled={inherited} />
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
