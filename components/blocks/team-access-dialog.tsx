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
 * Why an empty grant is allowed and named: it is a real state with a real
 * consequence (R24). The member reads and writes nothing, and it must never
 * resolve to every branch. Left as an unticked list it would look like an
 * unfinished form rather than a decision.
 */

import { BuildingIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { LocationStatusBadge } from "@/components/blocks/location-status-badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type LocationGrants, useLocations } from "@/lib/locations/store"
import type { TeamMember } from "@/lib/team/mock"
import { holdsAllLocations, MERCHANT_ROLES, roleById, VENUE_CAPABILITIES } from "@/lib/team/roles"
import { cn } from "@/lib/utils"

export function TeamAccessDialog({
  open,
  onOpenChange,
  member,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: TeamMember | null
  onSave: (memberId: string, roleId: string, grants: LocationGrants) => void
}) {
  const { locations } = useLocations()
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
  // What this role actually holds today, out of what the product actually has.
  const shippedCapabilities = VENUE_CAPABILITIES.filter(
    (cap) => cap.shipped && role?.venueCapabilities.includes(cap.code),
  )
  const isOwner = holdsAllLocations(roleId)
  const shownIds = isOwner ? locations.map((l) => l.id) : grantedIds

  function toggle(id: string, next: boolean) {
    if (isOwner) return
    setGrantedIds((prev) => (next ? [...prev, id] : prev.filter((x) => x !== id)))
  }

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
        <DialogTitle>Roles &amp; permissions</DialogTitle>
        <DialogDescription>
          {member.name ?? member.email} — what they can do, and where they can do it.
        </DialogDescription>

        <div className="flex flex-col gap-6 pt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="team-access-role">Role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger
                id="team-access-role"
                className="h-12 w-full rounded-2xl bg-input px-4 font-medium"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MERCHANT_ROLES.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {role ? <p className="text-sm text-muted-foreground">{role.capability}</p> : null}
          </div>

          {role ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Location permissions</span>
              <p className="text-sm text-muted-foreground">
                Defined once for the {role.name} role, not per person. Typical scope:{" "}
                {role.typicalScope.toLowerCase()}.
              </p>
              {/* Only the capabilities that exist. The four proposed `venues:*`
                  codes — splitting hours, invoice, state and create out of
                  today's single `venues:read` — used to be listed here with
                  "Proposed" badges, which was engineering detail in a merchant's
                  dialog and reads as a product promise to anyone who has not
                  followed the thread. The proposal lives in
                  docs/specs/multi-location-foundations.md and in
                  lib/team/roles.ts, where the people deciding it will look. */}
              <ul className="flex flex-col gap-1.5 pt-1">
                {shippedCapabilities.length > 0 ? (
                  shippedCapabilities.map((cap) => (
                    <li key={cap.code} className="flex items-start gap-2 text-sm">
                      <span
                        aria-hidden
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cami-green-9"
                      />
                      <span className="text-foreground">{cap.label}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground">
                    No location-wide access. This role works only at the locations granted below.
                  </li>
                )}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Works at</span>
            {isOwner ? (
              <p className="rounded-xl bg-cami-yellow-2 p-3 text-sm text-foreground">
                An owner holds every location, including any added later. Change the role to grant a
                named set instead.
              </p>
            ) : shownIds.length === 0 ? (
              <p className="rounded-xl bg-cami-yellow-2 p-3 text-sm text-foreground">
                No location granted. This member reads and writes nothing — an empty grant never
                means every location.
              </p>
            ) : null}
            <ul className="flex flex-col gap-2">
              {locations.map((loc) => {
                const inputId = `access-${loc.id}`
                const checked = shownIds.includes(loc.id)
                return (
                  <li key={loc.id}>
                    <label
                      htmlFor={inputId}
                      className={cn(
                        "flex items-center gap-3 rounded-xl bg-muted/30 p-3 transition-colors",
                        isOwner
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:bg-muted/40",
                      )}
                    >
                      <Checkbox
                        id={inputId}
                        size="lg"
                        checked={checked}
                        disabled={isOwner}
                        onCheckedChange={(v) => toggle(loc.id, v === true)}
                      />
                      <div className="flex size-10 items-center justify-center rounded-xl bg-cami-violet-3 text-cami-violet-11">
                        <BuildingIcon className="size-5" strokeWidth={1.5} />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {loc.name}
                          </span>
                          <LocationStatusBadge status={loc.status} />
                        </span>
                        <span className="truncate text-sm text-muted-foreground">
                          {[loc.location.city, loc.location.country].filter(Boolean).join(", ") ||
                            "Location"}
                        </span>
                      </div>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              radius="full"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" radius="full" onClick={save}>
              Save access
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
