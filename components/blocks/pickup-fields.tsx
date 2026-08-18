"use client"

import { CarFrontIcon, MapPinIcon, UserRoundIcon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Pickup capture for the staff-side appointment sheet. The public booking flow
// has its own copy of this (consumer wording, single-column) — this one is the
// operator version: it knows which client is selected and can say so.
//
// Five states, all reachable from the two booleans + whether a client with a
// saved address is selected:
//
//   1. off                  → just the checkbox
//   2. on, no client        → "select a client" hint + manual input
//   3. on, saved, reusing   → tick + the saved address, nothing to type
//   4. on, saved, overriding→ tick cleared + manual input
//   5. on, client no address→ "nothing on file" notice + manual input

export type PickupFieldsProps = {
  needsPickup: boolean
  onNeedsPickup: (value: boolean) => void
  useSavedAddress: boolean
  onUseSavedAddress: (value: boolean) => void
  /** Manually typed address, used whenever the saved one isn't in play. */
  address: string
  onAddress: (value: string) => void
  /** Address on the selected client's profile, if they have one. */
  savedAddress?: string
  /** Selected client's name — undefined means no client picked yet. */
  clientName?: string
  /** Distinguishes the field ids when more than one instance is on a page. */
  idPrefix?: string
}

export function PickupFields({
  needsPickup,
  onNeedsPickup,
  useSavedAddress,
  onUseSavedAddress,
  address,
  onAddress,
  savedAddress,
  clientName,
  idPrefix = "appointment",
}: PickupFieldsProps) {
  const pickupId = `${idPrefix}-needs-pickup`
  const savedId = `${idPrefix}-use-saved-address`
  const addressId = `${idPrefix}-pickup-address`

  const reusingSaved = Boolean(savedAddress) && useSavedAddress
  const showAddressInput = needsPickup && !reusingSaved

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4">
      <label htmlFor={pickupId} className="flex cursor-pointer items-start gap-3">
        <Checkbox
          id={pickupId}
          checked={needsPickup}
          onCheckedChange={(value) => onNeedsPickup(value === true)}
          className="mt-0.5"
        />
        <span className="text-sm font-medium text-foreground">Add a pet address</span>
      </label>

      {needsPickup ? (
        <div className="flex flex-col gap-3 border-t border-border/60 pt-3">
          {/* The saved-address tick only exists when there is one to reuse. */}
          {savedAddress ? (
            <label htmlFor={savedId} className="flex cursor-pointer items-center gap-3">
              <Checkbox
                id={savedId}
                checked={useSavedAddress}
                onCheckedChange={(value) => onUseSavedAddress(value === true)}
              />
              <span className="text-sm text-foreground">
                Use the address on {clientName ? `${clientName}'s` : "the client's"} profile
              </span>
            </label>
          ) : null}

          {reusingSaved ? (
            <div className="flex items-start gap-2 rounded-xl bg-cami-sage-2 p-3 text-sm text-cami-sage-12">
              <MapPinIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              {savedAddress}
            </div>
          ) : null}

          {!clientName ? (
            <div className="flex items-start gap-2 rounded-xl bg-cami-yellow-2 p-3 text-sm text-cami-yellow-12">
              <UserRoundIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              Pick a client above to reuse their saved address, or type the pet address here.
            </div>
          ) : !savedAddress ? (
            <div className="flex items-start gap-2 rounded-xl bg-cami-yellow-2 p-3 text-sm text-cami-yellow-12">
              <CarFrontIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              No address on {clientName}'s profile yet — enter the pet address below.
            </div>
          ) : null}

          {showAddressInput ? (
            <div className="flex max-w-md flex-col gap-1.5">
              <Label htmlFor={addressId}>Your Pet Address</Label>
              <Input
                id={addressId}
                value={address}
                onChange={(event) => onAddress(event.target.value)}
                placeholder="Villa / apartment, street, area"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
