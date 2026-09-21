"use client"

/**
 * SCR-10 · Scheduled shifts (R03, R05, R24, DW2.3, DW2.4).
 *
 * The nav has carried a "Scheduled Shifts" item with no href since before this
 * work started. This is what it points at, and it is the route the built
 * product already has — business/team/scheduled-shifts — rather than a new
 * surface invented here.
 *
 * ## One grid per branch in scope
 *
 * The as-built fetches the schedule under the active venue and gets one
 * branch's back, so its screen is a single grid. This repo has a scope that can
 * hold more than one branch (R03), and the honest rendering of that is one grid
 * per branch rather than a merged week: a merged week would have to pick one
 * row per person and silently drop whichever branch lost, which is the partial
 * truth DW2.3 exists to prevent. Side by side is the same treatment money by
 * branch already gets.
 *
 * ## One week, shared
 *
 * The week picker lives here rather than on each grid. Two branches sitting on
 * different weeks would be two true grids that cannot be compared, which is the
 * whole reason for showing them together.
 *
 * Bounded by grants throughout — `scopedLocations` never reaches past them, and
 * a manager granted one branch of nine sees one grid with no sign the others
 * exist (BG-06).
 */

import {
  ArrowDownWideNarrowIcon,
  ArrowUpWideNarrowIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { useState } from "react"
import {
  AddTeamMemberDialog,
  type AddTeamMemberValues,
} from "@/components/blocks/add-team-member-dialog"
import { AppShell } from "@/components/blocks/app-shell"
import { BranchRotaStrip } from "@/components/blocks/branch-rota-strip"
import {
  addDays,
  DEMO_WEEK_START,
  ScheduledShifts,
  weekLabel,
} from "@/components/blocks/scheduled-shifts"
import { AddTimeOffDialog } from "@/components/blocks/shifts/add-time-off-dialog"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDemoBusiness } from "@/lib/demo-business"
import { useLocations } from "@/lib/locations/store"
import { SHIFT_SORT_LABELS, type ShiftSortOrder } from "@/lib/team/shifts"
import { RotaProvider, useRota } from "@/lib/team/shifts-store"

export default function ScheduledShiftsPage() {
  return (
    <RotaProvider>
      <ScheduledShiftsScreen />
    </RotaProvider>
  )
}

function ScheduledShiftsScreen() {
  const { name: businessName } = useDemoBusiness()
  const { scopedLocations, granted, hasNoAccess, isMultiLocation, byId } = useLocations()
  const [weekOffset, setWeekOffset] = useState(0)
  // One order for every branch on the page. Two grids sorted differently would
  // put the same person in two places and defeat reading them side by side.
  const [sortOrder, setSortOrder] = useState<ShiftSortOrder>("custom")
  const { edited, reset, members, shifts, leaves, blocks, addLeave, addMember } = useRota()
  const [addTimeOff, setAddTimeOff] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)

  // The repo's idiom: an empty scope means "everything granted", not "nothing".
  const inScope = scopedLocations.length > 0 ? scopedLocations : granted
  const weekStart = addDays(DEMO_WEEK_START, weekOffset * 7)

  // Which branch's week is open. Local, not the global scope: narrowing the
  // whole session because somebody looked at one rota would change the topbar,
  // the calendar and every other surface, and that is not what a glance at a
  // week means.
  const [openId, setOpenId] = useState<string | null>(null)
  const open = inScope.find((l) => l.id === openId) ?? inScope[0]
  return (
    <AppShell
      header={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="font-medium text-2xl text-foreground leading-8">Scheduled shifts</h1>
            <p className="text-muted-foreground text-sm">
              {isMultiLocation
                ? "Manage weekly shifts for each location"
                : `Manage weekly shifts for ${businessName}`}
            </p>
          </div>
          {/* The estate's own Add, matching the built page. Both items write
              for real — a dropdown whose entries did nothing would be the
              same dead control the nav item was. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button radius="full" className="gap-1.5">
                Add
                <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setAddTimeOff(true)}>Time off</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setAddMemberOpen(true)}>
                New team member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      {/* No max-width: the week grid is 1040px at its narrowest and a reading
          column would make it unusable — the built page makes the same
          exception for the same reason.

          Nothing here scrolls except the grid. The week nav, the sort and the
          branch strip are how you steer it, and controls that scroll out of
          reach leave you steering something you cannot see. */}
      <div className="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-hidden">
        <TableToolbar
          className="shrink-0"
          tabs={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" radius="full" className="gap-2 font-medium">
                  {SHIFT_SORT_LABELS[sortOrder]}
                  {sortOrder.endsWith("-asc") || sortOrder.startsWith("az-") ? (
                    <ArrowUpWideNarrowIcon className="size-3.5 text-muted-foreground" />
                  ) : (
                    <ArrowDownWideNarrowIcon className="size-3.5 text-muted-foreground" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-55">
                {(Object.keys(SHIFT_SORT_LABELS) as ShiftSortOrder[]).map((key) => (
                  <DropdownMenuItem
                    key={key}
                    onSelect={() => setSortOrder(key)}
                    className="flex items-center justify-between"
                  >
                    {SHIFT_SORT_LABELS[key]}
                    {sortOrder === key ? <CheckIcon className="ml-2 size-4 shrink-0" /> : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          }
          actions={
            <>
              {/* Offered only once the week has been edited, because a reset
                  nobody needs is a button that invites losing work. */}
              {edited ? (
                <Button variant="ghost" size="sm" radius="full" onClick={reset}>
                  Reset schedule
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                radius="full"
                onClick={() => setWeekOffset(0)}
                disabled={weekOffset === 0}
              >
                This week
              </Button>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon-sm"
                  radius="full"
                  aria-label="Previous week"
                  onClick={() => setWeekOffset((o) => o - 1)}
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <span className="min-w-52 px-2 text-center font-medium text-sm tabular-nums">
                  {weekLabel(weekStart)}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  radius="full"
                  aria-label="Next week"
                  onClick={() => setWeekOffset((o) => o + 1)}
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </>
          }
        />

        {hasNoAccess || inScope.length === 0 || !open ? (
          // R24: no grant is a decision with a consequence, said rather than
          // shown as an empty page that reads like a loading failure.
          <p className="rounded-2xl bg-muted/40 p-4 text-muted-foreground text-sm leading-5">
            You do not have access to any locations, so there are no shifts to show. Ask an owner to
            grant you a location.
          </p>
        ) : (
          <>
            <BranchRotaStrip
              locations={inScope}
              selectedId={open.id}
              onSelect={setOpenId}
              members={members}
              shifts={shifts}
              leaves={leaves}
              blocks={blocks}
            />
            <section className="flex min-h-0 flex-1 flex-col items-stretch gap-2">
              {/* The branch is named even when the strip is hidden, because the
                  grid is a claim about a place and an unlabelled one invites
                  the reading that it is the business's whole team. */}
              {/* No heading line. The tab row above already names the
                  branch and counts its people; repeating both under it was
                  two lines saying one thing. The week's hours moved into the
                  grid's own footnote, which names the branch anyway. */}
              <ScheduledShifts locationId={open.id} weekStart={weekStart} sortOrder={sortOrder} />
            </section>
          </>
        )}
      </div>

      <AddTimeOffDialog
        open={addTimeOff}
        onOpenChange={setAddTimeOff}
        members={members.map((m) => ({ id: m.id, name: m.name }))}
        // The branch you are looking at. DW2.2 is a branch manager setting
        // *their* branch's time off, so there is nothing to pick.
        locationId={open?.id ?? ""}
        locationName={open?.name ?? ""}
        alsoWorksAt={(memberId) =>
          (members.find((m) => m.id === memberId)?.locationIds ?? [])
            .filter((id) => id !== open?.id)
            .map((id) => byId(id)?.location.district || byId(id)?.name || id)
        }
        onAdd={addLeave}
      />

      <AddTeamMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        businessName={businessName}
        onAdd={(values: AddTeamMemberValues) => {
          // Straight onto the rota at the branches they were assigned to, with
          // no shifts — assignment is permission to be rostered, not a rota,
          // and the grid saying "Not working" all week is the true state.
          addMember({
            name: `${values.firstName} ${values.lastName}`.trim(),
            role: values.jobTitle || "Team member",
            locationIds: values.assignedLocationIds,
          })
        }}
      />
    </AppShell>
  )
}
