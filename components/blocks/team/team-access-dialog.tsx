"use client"

/**
 * SCR-03 · Branch access grants (R04, R14, R24).
 *
 * The screen that makes R04 visible: role capability on one side, location
 * scope on the other, and nothing that lets one widen the other. Before this,
 * "Edit Roles & Permissions" on the team roster was a `console.log`.
 *
 * The two halves are deliberately asymmetric, because they are owned at
 * different levels:
 *
 * - **Role** is defined once for the whole business (lib/team/roles.ts). Its
 *   capabilities are shown here read-only — editing them would change what
 *   every holder of that role may do, which belongs in the role editor, not in
 *   one person's access dialog.
 * - **Locations** are granted per person. This is the half an owner changes
 *   here, and it is the whole of "Owner scopes a person to named branches".
 *
 * Why the owner's list is not editable: an owner holds every branch by
 * definition, including branches added later. That is `"all"` rather than a
 * ticked set, and the difference matters — a ticked set would silently exclude
 * branch ten.
 *
 * Why an empty grant cannot be confirmed: every role but the owner works
 * somewhere, the same rule the add/edit form enforces. A member seeded with no
 * grant (R24) still opens here and reads as such, but Confirm stays off until
 * a location is ticked. Save errors are the caller's to toast.
 */

import { useEffect, useState } from "react"
import { LoadError, type SurfaceStatus } from "@/components/blocks/shared/surface-states"
import { LocationMultiSelect } from "@/components/blocks/team/location-multi-select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { type LocationGrants, useLocations } from "@/lib/locations/store"
import type { TeamMember } from "@/lib/team/mock"
import { holdsAllLocations, MERCHANT_ROLES, roleById } from "@/lib/team/roles"

export function TeamAccessDialog({
  open,
  onOpenChange,
  member,
  onSave,
  status = "ready",
  onRetry,
}: {
  /**
   * Whether this member's locations have loaded. Loading and error are reached
   * from /playground. Neither asks for a location — claiming the grant is
   * empty before it has arrived is a false statement about somebody's access.
   * Confirm stays off too: saving a grant that was never read would overwrite
   * it with nothing.
   */
  status?: SurfaceStatus
  onRetry?: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
  member: TeamMember | null
  onSave: (memberId: string, roleId: string, grants: LocationGrants) => void
}) {
  // The granted set, not the estate (R18). An owner's grant is "all", so this
  // costs an owner nothing — and stops a manager holding one branch from
  // seeing, assigning to, or configuring the other eight.
  const { granted: locations } = useLocations()
  const [roleId, setRoleId] = useState("staff")
  const [grantedIds, setGrantedIds] = useState<string[]>([])

  useEffect(() => {
    if (!member) return
    setRoleId(member.roleId)
    setGrantedIds(
      member.locationGrants === "all" ? locations.map((l) => l.id) : member.locationGrants,
    )
  }, [member, locations])

  if (!member) return null

  // Captured after the guard: `save` is a hoisted function declaration, so the
  // narrowing above does not reach inside it.
  const memberId = member.id
  const role = roleById(roleId)
  const isOwner = holdsAllLocations(roleId)
  const shownIds = isOwner ? locations.map((l) => l.id) : grantedIds
  // Every role but the owner works somewhere — same rule as the add/edit form.
  const missingLocation = !isOwner && shownIds.length === 0

  function save() {
    // An owner's grant is stored as "all", not as today's list of ids, so a
    // branch added next month is included without anyone revisiting this
    // dialog.
    onSave(memberId, roleId, isOwner ? "all" : grantedIds)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogTitle>Edit permission role for {member.name ?? member.email}</DialogTitle>
        <DialogDescription>Choose a new permission role</DialogDescription>

        <div className="flex flex-col gap-6 pt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="team-access-role">Permission role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger
                id="team-access-role"
                className="h-12 w-full rounded-2xl bg-input px-4 font-medium"
              >
                {/* The trigger shows the name only. `SelectValue` renders the
                    selected item's own children, and the option carries a
                    two-line description — which landed inside a 48px trigger
                    and burst it. */}
                <SelectValue>{role?.name}</SelectValue>
              </SelectTrigger>
              <SelectContent className="w-(--radix-select-trigger-width)">
                {/* Owner is not in the list. It is not a role you are given
                    from here — an owner holds the estate by definition, and
                    promoting somebody into it is a different act from changing
                    what a manager can reach (R04). */}
                {MERCHANT_ROLES.filter((r) => r.id !== "owner").map((r) => (
                  <SelectItem key={r.id} value={r.id} className="py-3">
                    {/* The description sits in the option, not under the
                        select. Reading what a role means only after picking it
                        is choosing blind and then checking. */}
                    <span className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm">{r.name}</span>
                      <span className="whitespace-normal font-normal text-muted-foreground text-xs">
                        {r.capability}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Works at</Label>
            {status === "loading" ? (
              <div role="status" aria-label="Loading locations">
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
            ) : status === "error" ? (
              <LoadError what="this member’s locations" onRetry={onRetry} />
            ) : null}
            {/* A dropdown, not a stack of cards. Nine branches already
                scrolled this dialog past its own buttons and twenty would make
                it unfillable — while the answer stays two or three branches
                either way. Same shape as the topbar switcher, so choosing
                branches is one gesture across the product. */}
            {status === "ready" ? (
              <LocationMultiSelect
                locations={locations}
                selectedIds={shownIds}
                onChange={setGrantedIds}
                disabled={isOwner}
              />
            ) : null}
            {status === "ready" && missingLocation ? (
              // The form's error style (FormMessage), under the control.
              <p role="alert" className="font-medium text-destructive text-sm">
                Pick at least one location.
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              radius="full"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              radius="full"
              onClick={save}
              disabled={status !== "ready" || missingLocation}
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
