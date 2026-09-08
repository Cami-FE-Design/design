"use client"

import { CarFrontIcon, MapPinIcon, PencilIcon, UserRoundIcon } from "lucide-react"
import { AddressSearchField } from "@/components/blocks/address-search-field"
import { Checkbox } from "@/components/ui/checkbox"
import {
  type AddressParts,
  addressPlaceRef,
  EMPTY_ADDRESS,
  hasPrecisePoint,
  type PlaceRef,
} from "@/lib/address"

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
//
// The address is entered through the same `<AddressSearchField>` as the billing
// address rather than a bare text box (PRD-144). This is the one address in the
// product someone has to drive to, so picking it from the map search is what
// gets a coordinate onto the booking — and a coordinate is what the Navigate
// link on the popover and detail sheet routes from. Typing still works and
// still saves; it just cannot be pinned, which the line under the field says
// out loud so nobody discovers it in a car.

export type PickupFieldsProps = {
  needsPickup: boolean
  onNeedsPickup: (value: boolean) => void
  useSavedAddress: boolean
  onUseSavedAddress: (value: boolean) => void
  /** Manually typed address, used whenever the saved one isn't in play. */
  address: string
  onAddress: (value: string) => void
  /**
   * Places reference for `address`, when it was picked rather than typed. Held
   * by the caller next to the string so the booking stores both.
   */
  place?: PlaceRef
  onPlace?: (place: PlaceRef | undefined) => void
  /** Address on the selected client's profile, if they have one. */
  savedAddress?: string
  /** Places reference for `savedAddress`, if their profile address was picked. */
  savedPlace?: PlaceRef
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
  place,
  onPlace,
  savedAddress,
  savedPlace,
  clientName,
  idPrefix = "appointment",
}: PickupFieldsProps) {
  const pickupId = `${idPrefix}-needs-pickup`
  const savedId = `${idPrefix}-use-saved-address`

  const reusingSaved = Boolean(savedAddress) && useSavedAddress
  const showAddressInput = needsPickup && !reusingSaved

  // The search field speaks `AddressParts`; a pickup address is one line plus
  // whatever the index knew about it. Country comes from the shared default —
  // it is never asked for here, same as on the billing form.
  const parts: AddressParts = {
    ...EMPTY_ADDRESS,
    line: address,
    placeId: place?.placeId,
    point: place?.point,
  }

  const handleParts = (next: AddressParts) => {
    onAddress(next.line)
    onPlace?.(addressPlaceRef(next))
  }

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
            <div className="flex flex-col gap-1.5">
              <div className="flex items-start gap-2 rounded-xl bg-cami-sage-2 p-3 text-sm text-cami-sage-12">
                <MapPinIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                {savedAddress}
              </div>
              <PinnedNote pinned={hasPrecisePoint(savedPlace)} saved />
            </div>
          ) : null}

          {!clientName ? (
            <div className="flex items-start gap-2 rounded-xl bg-cami-yellow-2 p-3 text-sm text-cami-yellow-12">
              <UserRoundIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              Pick a client above to reuse their saved address, or search for the pet address here.
            </div>
          ) : !savedAddress ? (
            <div className="flex items-start gap-2 rounded-xl bg-cami-yellow-2 p-3 text-sm text-cami-yellow-12">
              <CarFrontIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              No address on {clientName}'s profile yet — search for the pet address below.
            </div>
          ) : null}

          {showAddressInput ? (
            <div className="flex flex-col gap-1.5">
              <AddressSearchField
                singleLine
                label="Your Pet Address"
                placeholder="Search villa / apartment, street, area"
                value={parts}
                onChange={handleParts}
              />
              {address.trim() ? <PinnedNote pinned={hasPrecisePoint(place)} /> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Whether this address can be navigated to precisely, said at capture time.
 * A typed address is not an error — it is the only option for half of Dubai's
 * newer buildings — but the difference between a pin and a text search is the
 * difference between arriving and circling a villa cluster, and the person
 * booking is the only one who can still fix it.
 */
function PinnedNote({ pinned, saved = false }: { pinned: boolean; saved?: boolean }) {
  return (
    <p className="flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
      {pinned ? (
        <MapPinIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      ) : (
        <PencilIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      )}
      {pinned
        ? "Pinned on the map — Navigate will route straight to it."
        : saved
          ? "Typed on the profile, not pinned — Navigate will search this text."
          : "Not pinned — pick a map result if you can, or Navigate just searches this text."}
    </p>
  )
}
