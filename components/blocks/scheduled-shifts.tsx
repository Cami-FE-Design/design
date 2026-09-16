"use client"

/**
 * SCR-10 · Scheduled shifts, per branch (R05, E07, DW2.3, DW2.4).
 *
 * The built product already has this screen — `ShiftsTable` under
 * business/team/scheduled-shifts, a week of members against Mon–Sun, fetched
 * from `/merchant/team-members/schedules` under the active venue. This is that
 * grid, so the multi-location layer lands on the screen the team already uses
 * rather than on a roster nobody would recognise.
 *
 * ## Per branch, with the shared person on both
 *
 * DW2.3: "a stylist working Marina mornings and JLT evenings is scheduled
 * correctly at each". A grid belongs to one branch, and somebody assigned to
 * two appears on both — with the hours they work *there*. Not cosmetic: the
 * acceptance is that "booking only offers them at a branch during their
 * rostered hours there", and a grid showing a person's whole day at every
 * branch would offer them everywhere. Each row says which other branches they
 * also work, because a per-branch grid is otherwise a partial truth with no
 * sign that it is partial.
 *
 * ## A branch holds its own shifts and block times. An absence is the person's
 *
 * DW2.2 is P0: "set my branch's schedules and time off separately from other
 * branches", accepted when "another branch's **roster change** never affects
 * mine". A rota is that change, so shifts and block times are keyed to the
 * branch here and a manager at one never sees or moves another's.
 *
 * An absence is not a roster change, so it is not scoped. Lena's Thursday is
 * the seeded check: she is entered as off at JVC, and her Jumeirah day closes
 * too. The other reading leaves an estate free to sell a person who is out of
 * the country, which protects nobody.
 *
 * ## One clash, and only one
 *
 * DW2.4: never booked at two branches at once. Overlapping shifts at one branch
 * are not the same thing and are not seeded, because the built shift dialog
 * refuses them and requires at least thirty minutes between windows — which is
 * precisely why the cross-branch case needs its own check. Each branch's rota
 * is written under its own venue and nothing compares two of them, so the one
 * overlap nothing refuses today is the one that spans branches.
 *
 * The clash is named as a **pair**, because a conflict is a relationship and
 * flagging one of the two shifts sends the operator to change whichever they
 * happened to be looking at. (ADR-023, which does allow overlap, is about
 * overlapping *appointments* and is untouched by any of this.)
 *
 * The refusal itself is not here. Maaz settled on 15 Sep that a cross-branch
 * overlap is blocked, and `lib/locations/cross-branch-availability` enforces it
 * where a slot is offered. A grid is where a manager sees the clash and fixes
 * the rota; refusing a booking here would be refusing the wrong person at the
 * wrong moment.
 *
 * ## The week belongs to the page, not to a grid
 *
 * The as-built has one venue and so one toolbar. A scope here can hold several
 * branches, and a week picker per grid would let two branches sit on different
 * weeks — two true grids that cannot be compared, which is the whole reason for
 * showing them together. So the page owns the week and passes it down.
 */

import {
  AlertTriangleIcon,
  CalendarOffIcon,
  CirclePlusIcon,
  HourglassIcon,
  MoreHorizontalIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { AddShiftDialog } from "@/components/blocks/shifts/add-shift-dialog"
import { AddTimeOffDialog } from "@/components/blocks/shifts/add-time-off-dialog"
import { SetRepeatingShiftsDialog } from "@/components/blocks/shifts/set-repeating-shifts-dialog"
import { TeamMemberFilterDialog } from "@/components/blocks/shifts/team-member-filter-dialog"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatTime12h, WEEK_DAYS } from "@/lib/locations/hours"
import { useLocations } from "@/lib/locations/store"
import { acceptsWrites } from "@/lib/locations/types"
import {
  type BlockTime,
  clashingShiftIds,
  crossBranchClashes,
  dayCell,
  formatHours,
  fullDayLeave,
  type Leave,
  membersAt,
  type RosterMember,
  type Shift,
  type ShiftSortOrder,
  sortShiftRows,
  subtractIntervals,
  workingMinutes,
} from "@/lib/team/shifts"
import { useRota } from "@/lib/team/shifts-store"
import { cn } from "@/lib/utils"

/**
 * The demo's Monday and its today. Pinned rather than read from the clock, so
 * the grid does not drift between a server render and a client one and a
 * reviewer opening it next month still sees the states it was written to show.
 */
export const DEMO_WEEK_START = "2026-09-14"
const DEMO_TODAY = "2026-09-15"

export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

/** "September 14 – 20, 2026", the way the built product writes a week. */
export function weekLabel(weekStart: string): string {
  const start = new Date(`${weekStart}T00:00:00.000Z`)
  const end = new Date(`${addDays(weekStart, 6)}T00:00:00.000Z`)
  const month = (d: Date) => d.toLocaleString("en-GB", { month: "long", timeZone: "UTC" })
  const head =
    start.getUTCMonth() === end.getUTCMonth()
      ? `${month(start)} ${start.getUTCDate()} – ${end.getUTCDate()}`
      : `${month(start)} ${start.getUTCDate()} – ${month(end)} ${end.getUTCDate()}`
  return `${head}, ${end.getUTCFullYear()}`
}

// Every cell carries its own left and bottom rule, which is what makes a week
// readable across seven columns — an unruled grid asks the eye to hold a row
// and a column at once.
// The hatch is what makes an empty half-cell read as grid rather than as a hole
// — the built product uses the same texture, and without it a week with one
// pill per day looks unfinished rather than quiet.
const CELL = "border-border border-b border-l p-1 align-top"
// The header row rules only underneath. Its vertical lines came from the day
// cells below it in the built grid, so adding them here put a border to the
// right of "Team member" that the rest of the column does not have.
const HEAD_CELL = "border-border border-b p-1 align-top"
const SLOT = "flex h-9 w-full items-center justify-center rounded-xl px-3 text-xs leading-4"
const ROW_MIN = "min-h-9"

export function ScheduledShifts({
  locationId,
  weekStart = DEMO_WEEK_START,
  sortOrder = "custom",
  members: membersProp,
  shifts: shiftsProp,
  leaves: leavesProp,
  blocks: blocksProp,
}: {
  /** Whose grid this is. A schedule always belongs to one branch (DW2.3). */
  locationId: string
  /** The Monday being shown. Owned by the page, so branches stay comparable. */
  weekStart?: string
  /** How to stack the rows. Also the page's, so branches read the same way. */
  sortOrder?: ShiftSortOrder
  members?: ReadonlyArray<RosterMember>
  shifts?: ReadonlyArray<Shift>
  leaves?: ReadonlyArray<Leave>
  blocks?: ReadonlyArray<BlockTime>
}) {
  const { byId, granted, locationName } = useLocations()
  const grantedIds = new Set(granted.map((l) => l.id))
  const rota = useRota()
  // Props win when a caller pins a fixture — the playground shows fixed states
  // and must not move when a reviewer edits the real page.
  const members = membersProp ?? rota.members
  const shifts = shiftsProp ?? rota.shifts
  const leaves = leavesProp ?? rota.leaves
  const blocks = blocksProp ?? rota.blocks
  const pinned = Boolean(shiftsProp)
  // R12: readable, but no writes. A suspended branch's rota is still real —
  // those hours are owed and worked — so it stays on screen and only the
  // writing stops. Only visible at nine branches, where a non-trading site
  // holds a full week.
  const branch = byId(locationId)
  const writable = branch ? acceptsWrites(branch.status) : true
  const canEdit = rota.canEdit && !pinned && writable

  const [shiftDialog, setShiftDialog] = useState<{ memberId: string; day: string } | null>(null)
  const [timeOff, setTimeOff] = useState<{ memberId: string; day: string } | null>(null)
  const [repeating, setRepeating] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  // `null` is "everyone", not an empty set — an empty set is a real choice
  // (show nobody) and the two must not collapse into each other.
  const [visibleIds, setVisibleIds] = useState<Set<string> | null>(null)

  const rostered = membersAt(members, locationId)

  // A clash is only visible from outside one grid, so the check reaches past
  // this branch — but only as far as the grant does.
  //
  // Two branches, two managers, two separate rotas and nobody holding both
  // grants is exactly how a person ends up rostered in two places. Whoever can
  // see both is the only one who can see it happen, and the only one who can
  // fix it. Naming a branch somebody is not granted would be the leak BG-06
  // exists to prevent — and it would name a rota they cannot open.
  const visibleShifts = shifts.filter((shift) => grantedIds.has(shift.locationId))
  const clashing = clashingShiftIds(visibleShifts)
  const clashes = crossBranchClashes(visibleShifts).filter(
    (clash) => clash.a.locationId === locationId || clash.b.locationId === locationId,
  )

  // The rota repeats weekly, so the windows stand in any week. A leave is a
  // date and does not — unless it was entered as repeating, which is the whole
  // point of the checkbox. Repeating every leave would have the grid claim
  // somebody is never available; repeating none would make the checkbox a lie.
  const shownLeaves =
    weekStart === DEMO_WEEK_START ? leaves : leaves.filter((leave) => leave.repeats)

  if (rostered.length === 0) {
    return (
      <p className="rounded-2xl bg-muted/40 p-4 text-muted-foreground text-sm leading-5">
        Nobody is assigned to {locationName(locationId)} yet. Assign a team member to this location
        and their shifts here appear on this schedule — a person can be assigned to more than one.
      </p>
    )
  }

  const rows = sortShiftRows(
    rostered
      .filter((member) => !visibleIds || visibleIds.has(member.id))
      .map((member) => ({
        member,
        cells: WEEK_DAYS.map((day) =>
          dayCell(shifts, shownLeaves, blocks, member.id, locationId, day.id),
        ),
      })),
    sortOrder,
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {clashes.length > 0 ? (
        <p className="flex items-start gap-2 rounded-xl bg-cami-yellow-2 px-3 py-2 text-sm leading-5">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-cami-yellow-11" />
          <span className="min-w-0">
            {clashes.map((clash, i) => {
              const other =
                clash.a.locationId === locationId ? clash.b.locationId : clash.a.locationId
              const there = clash.a.locationId === other ? clash.a : clash.b
              const member = members.find((m) => m.id === clash.a.memberId)
              return (
                <span key={`${clash.a.id}-${clash.b.id}`}>
                  {i > 0 ? " " : null}
                  <span className="font-medium">{member?.name ?? clash.a.memberId}</span> is also at{" "}
                  {locationName(other)} {formatTime12h(there.start)}–{formatTime12h(there.end)}, so
                  booking refuses those hours at both.
                </span>
              )
            })}
          </span>
        </p>
      ) : null}

      {/* The ground rides on the table, not on the scroll box. On the box it
            filled whatever height was left over, so a three-person week ended
            in a band of hatch with nothing under it. */}
      {/* Sized by the week, not by the window. `flex-1` made the box take
            every pixel left over, so three people left a screenful of empty
            bordered space under them. A flex child that only shrinks does both
            jobs: short weeks end where they end, long ones scroll inside. */}
      <div className="min-h-0 shrink overflow-auto rounded-2xl border border-border bg-background">
        {/* Fixed layout, so the seven days are seven equal columns. Auto layout
            sizes each one from its content, which is why a day holding
            "12pm – 12:30pm Lunch" was wider than a day holding nothing — the
            week stops being comparable the moment its columns are not. */}
        <table
          className="w-full min-w-[1040px] table-fixed bg-gold-2 bg-stripe-gold text-sm"
          style={{ borderCollapse: "separate", borderSpacing: 0 }}
        >
          <colgroup>
            <col style={{ width: "200px" }} />
            {WEEK_DAYS.map((day) => (
              <col key={day.id} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-20 bg-background">
            <tr>
              <th className="sticky left-0 z-10 border-border border-b bg-background px-4 py-3 text-left align-bottom font-medium text-foreground text-sm max-lg:shadow-[4px_0_8px_-2px_rgb(0_0_0_/_0.08)]">
                Team member{" "}
                {canEdit ? (
                  <button
                    type="button"
                    className="font-medium text-cami-violet-11 underline-offset-2 hover:underline"
                    onClick={() => setFilterOpen(true)}
                  >
                    Change
                  </button>
                ) : null}
              </th>
              {WEEK_DAYS.map((day, i) => {
                const date = addDays(weekStart, i)
                const isToday = date === DEMO_TODAY
                const working = rows.filter((row) => workingMinutes(row.cells[i]!) > 0)
                const minutes = rows.reduce(
                  (total, row) => total + workingMinutes(row.cells[i]!),
                  0,
                )
                return (
                  <th
                    key={day.id}
                    className={cn(
                      HEAD_CELL,
                      "bg-background px-2 py-3 text-center align-bottom font-normal",
                      isToday && "bg-gold-3",
                    )}
                  >
                    <span className="flex flex-col items-center gap-1">
                      <span className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground text-xs">
                          {day.short}, {longDate(date)}
                        </span>
                        {isToday ? (
                          <span className="rounded-full bg-gold-9 px-1.5 py-0.5 font-semibold text-[10px] text-white leading-none">
                            Today
                          </span>
                        ) : null}
                      </span>
                      {/* Who makes up the day's hours, not just how many. A
                          column reading 19 hr is a different fact depending on
                          whether it is three people or one doing doubles. */}
                      <span className="flex min-h-5 items-center gap-1.5 text-muted-foreground text-xs">
                        {working.length > 0 ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex cursor-default items-center">
                                {working.slice(0, 3).map((row, idx) => (
                                  <Avatar
                                    key={row.member.id}
                                    size="xs"
                                    name={row.member.name}
                                    className={cn(idx > 0 && "-ml-1")}
                                  />
                                ))}
                                {working.length > 3 ? (
                                  <span className="ml-1 font-medium text-[10px]">
                                    +{working.length - 3}
                                  </span>
                                ) : null}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="flex flex-col gap-0.5">
                              {working.map((row) => (
                                <span key={row.member.id} className="text-xs leading-snug">
                                  {row.member.name}
                                </span>
                              ))}
                            </TooltipContent>
                          </Tooltip>
                        ) : null}
                        <span className="tabular-nums">{formatHours(minutes)}</span>
                      </span>
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          {/* The last row drops its bottom rule, so the week ends on the
              container's own rounded edge instead of a line floating a pixel
              above it. */}
          <tbody className="[&>tr:last-child>td]:border-b-0">
            {rows.map(({ member, cells }) => {
              // Which other branches this person also works — the fact that
              // makes a per-branch grid comprehensible rather than partial.
              const elsewhere = member.locationIds.filter((id) => id !== locationId)
              const weekMinutes = cells.reduce((total, cell) => total + workingMinutes(cell), 0)

              return (
                <tr key={member.id}>
                  <td className="sticky left-0 z-10 border-border border-b bg-background p-1 align-middle max-lg:shadow-[4px_0_8px_-2px_rgb(0_0_0_/_0.08)]">
                    <div className="group/row relative flex items-center gap-2.5 px-2 py-1.5 pr-1">
                      <Avatar name={member.name} size="md" className="shrink-0" />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium text-foreground text-sm leading-snug">
                          {member.name}
                        </span>
                        <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                          <HourglassIcon className="size-3 shrink-0" aria-hidden />
                          {/* "here" only when there is an elsewhere. It is
                              load-bearing for somebody on two rotas — this is
                              the branch's total, not their week — and for
                              everyone else it is a word that buys nothing and
                              wrapped "37 hr, 30 min here" onto a second line. */}
                          {formatHours(weekMinutes)}
                          {elsewhere.length > 0 ? " here" : ""}
                        </span>
                        {/* The district, not the full name. Every branch in a
                            chain starts with the business, so a 200px column
                            truncated "Also at Shampooch Jumeirah" to "Also at
                            Shamp…" — the half that cannot tell two branches
                            apart. Full names on hover. */}
                        {elsewhere.length > 0 ? (
                          <span
                            className="truncate text-muted-foreground text-xs"
                            title={elsewhere.map((id) => byId(id)?.name ?? id).join(", ")}
                          >
                            {elsewhere.length === 1
                              ? `Also at ${byId(elsewhere[0]!)?.location.district || byId(elsewhere[0]!)?.name || elsewhere[0]}`
                              : `Also at ${elsewhere.length} other locations`}
                          </span>
                        ) : null}
                      </div>
                      {canEdit ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              radius="full"
                              aria-label={`Actions for ${member.name}`}
                              className="-translate-y-1/2 absolute top-1/2 right-0 bg-background opacity-0 shadow-[-8px_0_8px_-4px_var(--color-background)] transition-opacity focus-visible:opacity-100 group-hover/row:opacity-100 data-[state=open]:opacity-100"
                            >
                              <MoreHorizontalIcon className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuItem onSelect={() => setRepeating(member.id)}>
                              Set repeating shifts
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => setTimeOff({ memberId: member.id, day: "mon" })}
                            >
                              Add time off
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => rota.unassignFromLocation(member.id, locationId)}
                            >
                              Unassign from {locationName(locationId)}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => rota.clearMemberWeek(member.id, locationId)}
                            >
                              {/* Named, not "delete all shifts". A person on two
                                  rotas keeps the other, and a label that did not
                                  say so would read as removing them everywhere. */}
                              Delete shifts at {locationName(locationId)}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {/* The member on the URL, so the link opens that
                                person rather than a list of everyone. */}
                            <DropdownMenuItem asChild>
                              <Link href={`/settings/team?member=${member.id}`}>
                                View team member
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/settings/team?member=${member.id}`}>
                                Edit team member
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </div>
                  </td>
                  {WEEK_DAYS.map((day, i) => (
                    <DayColumn
                      key={day.id}
                      cell={cells[i]!}
                      today={addDays(weekStart, i) === DEMO_TODAY}
                      shifts={shifts.filter(
                        (s) =>
                          s.memberId === member.id &&
                          s.locationId === locationId &&
                          s.day === day.id,
                      )}
                      clashing={clashing}
                      onAddShift={
                        canEdit
                          ? () => setShiftDialog({ memberId: member.id, day: day.id })
                          : undefined
                      }
                      onAddTimeOff={
                        canEdit ? () => setTimeOff({ memberId: member.id, day: day.id }) : undefined
                      }
                      onSetRepeating={canEdit ? () => setRepeating(member.id) : undefined}
                      onDeleteLeave={canEdit ? rota.removeLeave : undefined}
                    />
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!writable && branch ? (
        <p className="flex shrink-0 items-start gap-2 rounded-xl bg-cami-yellow-2 px-3 py-2 text-sm leading-5">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-cami-yellow-11" />
          <span>
            {locationName(locationId)} is not trading, so this week cannot be edited and none of it
            is bookable. The hours stand — they are still worked and still owed.
          </span>
        </p>
      ) : null}

      <p className="shrink-0 text-muted-foreground text-xs leading-5">
        <span className="font-medium text-foreground">
          {formatHours(
            rows.reduce((t, r) => t + r.cells.reduce((n, c) => n + workingMinutes(c), 0), 0),
          )}{" "}
          this week at {locationName(locationId)}
        </span>{" "}
        — booking offers a team member here only during these hours, never the location&apos;s
        opening hours. Time off is left out, block times are kept.
      </p>

      {canEdit && shiftDialog ? (
        <AddShiftDialog
          open
          onOpenChange={(next) => {
            if (!next) setShiftDialog(null)
          }}
          memberName={members.find((m) => m.id === shiftDialog.memberId)?.name ?? ""}
          locationName={locationName(locationId)}
          dayLabel={dayLabelFor(weekStart, shiftDialog.day)}
          windows={windowsFor(shifts, shiftDialog.memberId, locationId, shiftDialog.day)}
          leaveWindows={shownLeaves
            .filter((l) => l.memberId === shiftDialog.memberId && l.day === shiftDialog.day)
            .map((l) => ({ start: l.start, end: l.end }))}
          elsewhere={visibleShifts
            .filter(
              (other) =>
                other.memberId === shiftDialog.memberId &&
                other.locationId !== locationId &&
                other.day === shiftDialog.day,
            )
            .map((other) => ({
              start: other.start,
              end: other.end,
              locationName: locationName(other.locationId),
            }))}
          onSave={(windows) =>
            rota.setDay(shiftDialog.memberId, locationId, shiftDialog.day, windows)
          }
          onDelete={() => rota.setDay(shiftDialog.memberId, locationId, shiftDialog.day, [])}
          onOpenRepeating={() => setRepeating(shiftDialog.memberId)}
        />
      ) : null}

      {canEdit && timeOff ? (
        <AddTimeOffDialog
          open
          onOpenChange={(next) => {
            if (!next) setTimeOff(null)
          }}
          members={rostered.map((m) => ({ id: m.id, name: m.name }))}
          defaultMemberId={timeOff.memberId}
          defaultDay={timeOff.day}
          locationId={locationId}
          locationName={locationName(locationId)}
          alsoWorksAt={(memberId) =>
            (members.find((m) => m.id === memberId)?.locationIds ?? [])
              .filter((id) => id !== locationId)
              .map((id) => byId(id)?.location.district || byId(id)?.name || id)
          }
          onAdd={rota.addLeave}
        />
      ) : null}

      {canEdit ? (
        <TeamMemberFilterDialog
          open={filterOpen}
          onOpenChange={setFilterOpen}
          members={rostered.map((m) => ({ id: m.id, name: m.name, role: m.role }))}
          visibleIds={visibleIds ?? new Set(rostered.map((m) => m.id))}
          locationName={locationName(locationId)}
          onApply={(ids) => setVisibleIds(ids.size === rostered.length ? null : ids)}
        />
      ) : null}

      {canEdit && repeating ? (
        <SetRepeatingShiftsDialog
          open
          onOpenChange={(next) => {
            if (!next) setRepeating(null)
          }}
          memberName={members.find((m) => m.id === repeating)?.name ?? ""}
          memberRole={members.find((m) => m.id === repeating)?.role ?? "Team member"}
          locationName={locationName(locationId)}
          effectiveFrom={weekLabel(weekStart)}
          current={WEEK_DAYS.map((d) => ({
            day: d.id,
            windows: windowsFor(shifts, repeating, locationId, d.id),
          }))}
          onSave={(pattern) => rota.setWeek(repeating, locationId, [...pattern])}
        />
      ) : null}
    </div>
  )
}

/** One person's windows for one day at one branch, in clock order. */
function windowsFor(
  shifts: ReadonlyArray<Shift>,
  memberId: string,
  locationId: string,
  day: string,
) {
  return shifts
    .filter((s) => s.memberId === memberId && s.locationId === locationId && s.day === day)
    .map(({ start, end }) => ({ start, end }))
    .sort((a, b) => a.start.localeCompare(b.start))
}

/** "Tue, September 15" — the dialog says which day, never just "this day". */
function dayLabelFor(weekStart: string, day: string): string {
  const index = WEEK_DAYS.findIndex((d) => d.id === day)
  const date = addDays(weekStart, index < 0 ? 0 : index)
  return `${WEEK_DAYS[index < 0 ? 0 : index]?.short}, ${longDate(date)}`
}

function DayColumn({
  cell,
  shifts,
  clashing,
  today,
  onAddShift,
  onAddTimeOff,
  onSetRepeating,
  onDeleteLeave,
}: {
  cell: ReturnType<typeof dayCell>
  shifts: ReadonlyArray<Shift>
  clashing: ReadonlySet<string>
  today: boolean
  /** Absent means this grid is read-only — a fixture, or no provider. */
  onAddShift?: () => void
  onAddTimeOff?: () => void
  onSetRepeating?: () => void
  onDeleteLeave?: (leaveId: string) => void
}) {
  const allDay = fullDayLeave(cell)
  const tint = today ? "bg-gold-2/60" : undefined
  const editable = Boolean(onAddShift)

  // The whole cell is the target, not a small button in a corner. A rota is
  // edited a day at a time, and hunting for a plus in a 7-column grid is the
  // friction that sends people back to a spreadsheet.
  const menu = editable ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Edit this day"
          className={cn(
            SLOT,
            "gap-1.5 border border-border border-dashed bg-background/80 text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover/cell:opacity-100 data-[state=open]:opacity-100",
          )}
        >
          <CirclePlusIcon className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuItem onSelect={() => onSetRepeating?.()}>
          Set repeating shifts
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onAddShift?.()}>
          {cell.windows.length > 0 ? "Edit shift" : "Add shift"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onAddTimeOff?.()}>Add time off</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null

  // A full-day leave takes the cell over. Drawing it beside the windows would
  // leave two true-looking statements next to each other, one of which is not.
  if (allDay) {
    return (
      <td className={cn(CELL, "group/cell", tint)}>
        <span className={cn("flex flex-col gap-1", ROW_MIN)}>
          {editable ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={cn(SLOT, "gap-1.5 bg-gold-5 text-gold-12")}>
                  <CalendarOffIcon className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">
                    {allDay.type}
                    {allDay.approved === false ? " · Pending" : ""}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuItem onSelect={() => onAddTimeOff?.()}>Edit time off</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => onDeleteLeave?.(allDay.id)}>
                  Delete time off
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className={cn(SLOT, "gap-1.5 bg-gold-5 text-gold-12")}>
              <CalendarOffIcon className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">
                {allDay.type}
                {allDay.approved === false ? " · Pending" : ""}
              </span>
            </span>
          )}
          {menu}
        </span>
      </td>
    )
  }

  if (cell.notWorking) {
    return (
      <td className={cn(CELL, "group/cell", tint)}>
        {/* Said, not left blank. An empty cell reads as a rota nobody has
            filled in; "Not working" is somebody's decision, and booking treats
            the two the same way while an operator must not have to guess.

            Quiet, though. A day off is the most ordinary thing in a week, and
            a rota with eight of them painted in the alarm colour reads as eight
            problems — which also buries the one cell that is a problem. */}
        <span className={cn("flex flex-col gap-1", ROW_MIN)}>
          <span className={cn(SLOT, "bg-gold-6 text-gold-12")}>Not working</span>
          {menu}
        </span>
      </td>
    )
  }

  const partial = cell.leaves.filter((l) => !l.fullDay)

  // One list, in clock order. Rendering shifts, then leave, then blocks put
  // Omar's 10am sick leave underneath his 4pm shift — a day read top to bottom
  // that does not run top to bottom, which is how an hour gets missed.
  const pills = [
    ...shifts.flatMap((shift) =>
      subtractIntervals({ start: shift.start, end: shift.end }, partial).map((piece) => ({
        key: `${shift.id}-${piece.start}`,
        start: piece.start,
        end: piece.end,
        kind: "shift" as const,
        clashes: clashing.has(shift.id),
        label: "",
      })),
    ),
    ...partial.map((leave) => ({
      key: leave.id,
      start: leave.start,
      end: leave.end,
      kind: "leave" as const,
      clashes: false,
      label: leave.type,
    })),
    ...cell.blocks.map((block) => ({
      key: block.id,
      start: block.start,
      end: block.end,
      kind: "block" as const,
      clashes: false,
      label: block.title,
    })),
  ].sort((a, b) => a.start.localeCompare(b.start))

  return (
    <td className={cn(CELL, "group/cell", tint)}>
      <span className={cn("flex flex-col gap-1", ROW_MIN)}>
        {pills.map((pill) => {
          const body = (
            <>
              {pill.kind === "leave" ? (
                <CalendarOffIcon className="size-3.5 shrink-0" aria-hidden />
              ) : null}
              <span className="truncate tabular-nums">
                {formatTime12h(pill.start)} – {formatTime12h(pill.end)}
                {pill.label ? ` ${pill.label}` : ""}
              </span>
              {pill.clashes ? (
                <AlertTriangleIcon className="size-3.5 shrink-0" aria-hidden />
              ) : null}
            </>
          )
          const className = cn(
            SLOT,
            "gap-1.5",
            pill.kind === "leave" && "bg-gold-5 text-gold-12",
            pill.kind === "block" &&
              "border border-border border-dashed bg-background text-muted-foreground",
            // The clash is the only loud thing on the grid, because it is the
            // only cell anybody has to act on.
            pill.kind === "shift" &&
              (pill.clashes
                ? "border border-cami-yellow-9 bg-cami-yellow-2 font-medium text-foreground"
                : "border border-border bg-background text-foreground"),
          )
          // Named, not only tinted. Colour is never the only carrier.
          const title = pill.clashes ? "Also rostered at another location at this time" : undefined

          // A block time is not editable here: nothing in this repo creates
          // one, and a menu whose items did nothing is worse than no menu.
          if (!editable || pill.kind === "block") {
            return (
              <span key={pill.key} className={className} title={title}>
                {body}
              </span>
            )
          }

          return (
            <DropdownMenu key={pill.key}>
              <DropdownMenuTrigger asChild>
                <button type="button" className={className} title={title}>
                  {body}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {pill.kind === "shift" ? (
                  <>
                    <DropdownMenuItem onSelect={() => onAddShift?.()}>Edit shift</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onAddTimeOff?.()}>
                      Add time off
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => onAddShift?.()}>
                      Edit or clear this day
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onSelect={() => onAddTimeOff?.()}>
                      Edit time off
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => onDeleteLeave?.(pill.key)}
                    >
                      Delete time off
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })}
        {menu}
      </span>
    </td>
  )
}
