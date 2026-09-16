"use client"

import { useState } from "react"
import { AddressSearchField, type PlaceSuggestion } from "@/components/blocks/address-search-field"
import { SetupCard, SetupLayout, WireBox } from "@/components/blocks/setup-shell"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type AddressParts, EMPTY_ADDRESS, isAddressEmpty } from "@/lib/address"

const countries = [
  { code: "AE", label: "United Arab Emirates" },
  { code: "GB", label: "United Kingdom" },
  { code: "US", label: "United States" },
  { code: "SG", label: "Singapore" },
]

/** The structured grid, kept as its own state because the shared address model
 *  is one line + postcode + country — deliberately, per its spec — while this
 *  step keeps the field set the as-built product has (address, apt, district,
 *  city, state, postcode, country). Picking a place fills these; they stay
 *  editable, because a places result is a starting point and the trade licence
 *  is what has to match. */
type LocationFields = {
  address: string
  apt: string
  district: string
  city: string
  state: string
  postcode: string
  country: string
}

const EMPTY_FIELDS: LocationFields = {
  address: "",
  apt: "",
  district: "",
  city: "",
  state: "",
  postcode: "",
  country: "AE",
}

/**
 * A suggestion's `secondary` reads "District, City, Country" — the shape a
 * places index returns for every entry here. State repeats city, which is what
 * an emirate is; the field stays because the as-built form has it, not because
 * it carries anything new.
 */
function fieldsFromPlace(place: PlaceSuggestion, current: LocationFields): LocationFields {
  const [district = "", city = ""] = place.secondary.split(",").map((part) => part.trim())
  return {
    ...current,
    address: place.primary,
    district,
    city,
    state: city,
    // Apt and postcode survive a pick, for the same reason the shared field
    // keeps the postcode: a map result rarely carries either in the UAE, so
    // taking its empty value would silently wipe what the merchant typed.
  }
}

export default function SetupLocationPage() {
  const [address, setAddress] = useState<AddressParts>(EMPTY_ADDRESS)
  const [fields, setFields] = useState<LocationFields>(EMPTY_FIELDS)
  const picked = !isAddressEmpty(address)

  const set = (key: keyof LocationFields) => (next: string) =>
    setFields((prev) => ({ ...prev, [key]: next }))

  return (
    <SetupLayout stepIndex={3} prevHref="/setup/type">
      <SetupCard
        title="Where's your business?"
        description="Pet Parents see this on your booking page so they know where to find you."
        ctaHref="/setup/invoicing"
      >
        {/* The shared field (docs/specs/address-search-field.md), replacing the
            decorative box this step used to have: a "Search address" input that
            did nothing, with a "Demo: select sample address" link standing in
            for search working. Typing now returns real suggestions, manual
            entry is the first row of the dropdown rather than the reward for a
            failed search, and a picked place carries its pin (PRD-144).

            The grid below stays. It is the field set the as-built product has,
            and the shared address model is narrower than it on purpose — so the
            search fills these fields through `onPick` instead of replacing
            them. Search first, structured fields second, exactly as the spec
            describes. */}
        <AddressSearchField
          value={address}
          onChange={setAddress}
          onPick={(place) => setFields((prev) => fieldsFromPlace(place, prev))}
          label="Where's your business located?"
          className="max-w-none"
        />

        {!picked ? (
          <WireBox
            label="Map preview appears once an address is selected"
            className="mt-1 min-h-48"
          />
        ) : (
          <>
            <WireBox label="Map preview with pin at selected address" className="min-h-48" />

            <h2 className="text-lg font-semibold text-foreground">Business location</h2>

            <div className="grid grid-cols-2 gap-3">
              <Field id="address" label="Address">
                <Input
                  id="address"
                  value={fields.address}
                  onChange={(e) => set("address")(e.target.value)}
                />
              </Field>
              <Field id="apt" label="Apt./Suite (optional)">
                <Input id="apt" value={fields.apt} onChange={(e) => set("apt")(e.target.value)} />
              </Field>
              <Field id="district" label="District">
                <Input
                  id="district"
                  value={fields.district}
                  onChange={(e) => set("district")(e.target.value)}
                />
              </Field>
              <Field id="city" label="City">
                <Input
                  id="city"
                  value={fields.city}
                  onChange={(e) => set("city")(e.target.value)}
                />
              </Field>
              <Field id="state" label="State">
                <Input
                  id="state"
                  value={fields.state}
                  onChange={(e) => set("state")(e.target.value)}
                />
              </Field>
              <Field id="postcode" label="Postcode (optional)">
                <Input
                  id="postcode"
                  value={fields.postcode}
                  onChange={(e) => set("postcode")(e.target.value)}
                />
              </Field>
              <div className="col-span-2">
                <Field id="country" label="Country">
                  <Select value={fields.country} onValueChange={set("country")}>
                    <SelectTrigger
                      id="country"
                      className="h-12 w-full rounded-2xl bg-input px-4 data-[size=default]:h-12"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          </>
        )}
      </SetupCard>
    </SetupLayout>
  )
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}
