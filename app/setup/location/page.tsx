"use client"

import { MapPinIcon } from "lucide-react"
import { useState } from "react"
import { SetupCard, SetupLayout, WireBox } from "@/components/blocks/setup-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const countries = [
  { code: "AE", label: "United Arab Emirates" },
  { code: "GB", label: "United Kingdom" },
  { code: "US", label: "United States" },
  { code: "SG", label: "Singapore" },
]

export default function SetupLocationPage() {
  const [addressSelected, setAddressSelected] = useState(false)

  return (
    <SetupLayout stepIndex={3} prevHref="/setup/type">
      <SetupCard
        title="Where's your business?"
        description="Pet Parents see this on your booking page so they know where to find you."
        ctaHref="/setup/invoicing"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="search-address">Where's your business located?</Label>
          <div className="relative">
            <MapPinIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search-address"
              className="pl-10"
              placeholder="Search address"
              defaultValue={addressSelected ? "Sunny Paws, Marina Tower, Dubai" : ""}
            />
          </div>
          {!addressSelected ? (
            <Button
              type="button"
              variant="link"
              onClick={() => setAddressSelected(true)}
              className="self-start"
            >
              Demo: select sample address
            </Button>
          ) : null}
          {!addressSelected ? (
            <WireBox
              label="Map preview appears once an address is selected"
              className="mt-1 min-h-48"
            />
          ) : null}
        </div>

        {addressSelected ? (
          <>
            <WireBox label="Map preview with pin at selected address" className="min-h-48" />

            <h2 className="text-lg font-semibold text-foreground">Business location</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="Sunny Paws, Marina Tower" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="apt">Apt./Suite (optional)</Label>
                <Input id="apt" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="district">District</Label>
                <Input id="district" defaultValue="Marina" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" defaultValue="Dubai" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="state">State</Label>
                <Input id="state" defaultValue="Dubai" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="postcode">Postcode</Label>
                <Input id="postcode" />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="country">Country</Label>
                <Select defaultValue="AE">
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
              </div>
            </div>
          </>
        ) : null}
      </SetupCard>
    </SetupLayout>
  )
}
