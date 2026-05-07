import type { Metadata } from "next"
import { SetupCard, SetupLayout } from "@/components/blocks/setup-shell"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const metadata: Metadata = {
  title: "About your business — Cami setup",
}

const countryCodes = ["+971", "+44", "+1", "+65"]

export default function SetupAboutPage() {
  return (
    <SetupLayout stepIndex={1}>
      <SetupCard
        title="About your business"
        description="The name and contact details Pet Parents will see on your booking page. You can polish everything else after."
        ctaHref="/setup/type"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="display-name">Business display name</Label>
          <Input id="display-name" placeholder="Public name. e.g. Sunny Paws Grooming" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <div className="flex gap-2">
            <Select defaultValue="+971">
              <SelectTrigger
                id="country-code"
                className="h-12 w-24 rounded-2xl bg-input px-4 data-[size=default]:h-12"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input id="phone" type="tel" placeholder="Phone number" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="hello@yourbusiness.com" />
        </div>
      </SetupCard>
    </SetupLayout>
  )
}
