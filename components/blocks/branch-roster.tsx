"use client"

/**
 * SCR-10 · A branch's roster, and the clash that spans branches (R05, E07,
 * DW2.3, DW2.4).
 *
 * ## Per branch, with the shared person on both
 *
 * DW2.3: "a stylist working Marina mornings and JLT evenings is scheduled
 * correctly at each". So the roster is the branch's, and somebody assigned to
 * two branches appears on both — with the hours they work *there*, not their
 * whole day. That is not cosmetic: DW2.3's acceptance is that "booking only
 * offers them at a branch during their rostered hours there", and a roster
 * showing a person's whole day at every branch would offer them everywhere.
 *
 * ## One clash, and only one
 *
 * DW2.4: a person is never booked at two branches at once, while two
 * overlapping bookings at the *same* branch still go through — ADR-023 stays
 * unchanged there. So overlap inside a branch is legal and is not marked;
 * overlap across branches is the conflict. Seeded both ways, because a screen
 * that flagged the legal case would be reporting the product's own behaviour as
 * an error.
 *
 * ## What this does not do, on purpose
 *
 * Block anything. Whether an overlapping booking is refused or merely warned
 * extends ADR-023, which the PRD marks as needing an extension — an engineering
 * rule, not a screen's decision. Either way the roster has to *show* the clash,
 * so it names it and stops there.
 */

import { AlertTriangleIcon } from "lucide-react"
import { formatTime12h, WEEK_DAYS } from "@/lib/locations/hours"
import { useLocations } from "@/lib/locations/store"
import {
  clashingShiftIds,
  crossBranchClashes,
  membersAt,
  type RosterMember,
  type Shift,
  shiftsAt,
} from "@/lib/team/shifts"
import { ROSTER_MEMBERS, ROSTER_SHIFTS } from "@/lib/team/shifts-mock"
import { cn } from "@/lib/utils"

export function BranchRoster({
  locationId,
  members = ROSTER_MEMBERS,
  shifts = ROSTER_SHIFTS,
}: {
  /** Whose roster this is. A roster always belongs to one branch (DW2.3). */
  locationId: string
  members?: ReadonlyArray<RosterMember>
  shifts?: ReadonlyArray<Shift>
}) {
  const { byId, locationName } = useLocations()
  const rostered = membersAt(members, locationId)

  // Computed over every shift, not just this branch's — a clash is only
  // visible from outside one roster, which is the whole point of checking it
  // here rather than inside the branch's own data.
  const clashing = clashingShiftIds(shifts)
  const clashes = crossBranchClashes(shifts).filter(
    (clash) => clash.a.locationId === locationId || clash.b.locationId === locationId,
  )

  if (rostered.length === 0) {
    return (
      <p className="rounded-2xl bg-muted/40 p-4 text-sm leading-5 text-muted-foreground">
        Nobody is assigned to {locationName(locationId)} yet. Assign a team member to this location
        and their shifts here appear on this roster — a person can be assigned to more than one.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {clashes.length > 0 ? (
        <div className="flex items-start gap-3 rounded-xl bg-cami-yellow-2 p-3">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-cami-yellow-11" />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-sm font-medium leading-5 text-foreground">
              {clashes.length === 1
                ? "One person is rostered at two locations at the same time"
                : `${clashes.length} people are rostered at two locations at the same time`}
            </p>
            <ul className="flex flex-col gap-0.5">
              {clashes.map((clash) => {
                const other =
                  clash.a.locationId === locationId ? clash.b.locationId : clash.a.locationId
                const member = members.find((m) => m.id === clash.a.memberId)
                return (
                  <li
                    key={`${clash.a.id}-${clash.b.id}`}
                    className="text-sm leading-5 text-foreground"
                  >
                    {member?.name ?? clash.a.memberId} also has{" "}
                    {formatTime12h(clash.b.locationId === other ? clash.b.start : clash.a.start)} –{" "}
                    {formatTime12h(clash.b.locationId === other ? clash.b.end : clash.a.end)} at{" "}
                    {locationName(other)}.
                  </li>
                )
              })}
            </ul>
            {/* Not "this is blocked". Whether booking refuses it extends
                ADR-023, and that is not settled — so the roster states the
                fact and leaves the rule to the rule. */}
            <p className="text-sm leading-5 text-muted-foreground">
              One person cannot be in two places. Two overlapping shifts at this location on their
              own are fine.
            </p>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-background px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Team member
              </th>
              {WEEK_DAYS.map((day) => (
                <th
                  key={day.id}
                  className="px-2 py-2 text-left text-xs font-medium text-muted-foreground"
                >
                  {day.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rostered.map((member) => {
              const mine = shiftsAt(shifts, locationId, member.id)
              // Which other branches this person also works at — the fact that
              // makes a per-branch roster comprehensible rather than partial.
              const elsewhere = member.locationIds.filter((id) => id !== locationId)
              return (
                <tr key={member.id}>
                  <td className="sticky left-0 z-10 bg-background px-3 py-2 align-top">
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">{member.name}</span>
                      <span className="text-xs text-muted-foreground">{member.role}</span>
                      {elsewhere.length > 0 ? (
                        <span className="text-xs text-muted-foreground">
                          Also at {elsewhere.map((id) => byId(id)?.name ?? id).join(", ")}
                        </span>
                      ) : null}
                    </span>
                  </td>
                  {WEEK_DAYS.map((day) => {
                    const onDay = mine.filter((shift) => shift.day === day.id)
                    return (
                      <td key={day.id} className="px-2 py-2 align-top">
                        {onDay.length === 0 ? (
                          <span className="text-xs text-muted-foreground/60">–</span>
                        ) : (
                          <span className="flex flex-col gap-1">
                            {onDay.map((shift) => (
                              <span
                                key={shift.id}
                                className={cn(
                                  "whitespace-nowrap rounded-lg px-2 py-1 text-xs",
                                  clashing.has(shift.id)
                                    ? "bg-cami-yellow-3 font-medium text-cami-yellow-11"
                                    : "bg-muted text-foreground",
                                )}
                                // The clash is named, not only tinted — colour
                                // is never the only carrier.
                                title={
                                  clashing.has(shift.id)
                                    ? "Also rostered at another location at this time"
                                    : undefined
                                }
                              >
                                {formatTime12h(shift.start)}–{formatTime12h(shift.end)}
                                {clashing.has(shift.id) ? " ⚠" : ""}
                              </span>
                            ))}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        These are the hours worked at {locationName(locationId)}. Booking offers a team member here
        only during them — never the location&apos;s opening hours, which is how somebody gets
        booked on a day they do not work.
      </p>
    </div>
  )
}
