"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import {
  AppointmentsToolbar,
  type ViewMode,
} from "@/components/blocks/appointments/appointments-toolbar"
import { NewAppointmentSheet } from "@/components/blocks/appointments/new-appointment-sheet"
import { TeamDropdown } from "@/components/blocks/appointments/team-dropdown"
import { CartFlow } from "@/components/blocks/sales/new-sale/cart-flow"
import { AppShell } from "@/components/blocks/shell/app-shell"
import { DesignRepoBar } from "@/components/blocks/shell/design-repo-bar"
import { Button } from "@/components/ui/button"
import type { CartLine, ClientAttachment } from "@/lib/sales/cart-types"
import {
  DEFAULT_TEAM_SELECTION,
  rotaDay,
  scheduledMemberIds,
  type TeamSelection,
  visibleMemberIds,
} from "@/lib/team/calendar-team"
import { membersAt } from "@/lib/team/shifts"
import { ROSTER_BLOCKS, ROSTER_LEAVES, ROSTER_MEMBERS, ROSTER_SHIFTS } from "@/lib/team/shifts-mock"

const TODAY = "2026-05-13"

// The rota demo is seeded for this branch, so the team picker reads its team
// and its shifts. Same people as Team > Scheduled shifts.
const ROTA_LOCATION = "shampooch-jvc"
const ROTA = { shifts: ROSTER_SHIFTS, leaves: ROSTER_LEAVES, blocks: ROSTER_BLOCKS }

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function AppointmentsPage() {
  return (
    <Suspense>
      <AppointmentsScreen />
    </Suspense>
  )
}

function AppointmentsScreen() {
  // Opens on Scheduled team (BUG-21); ?team=all opens on All team as before,
  // and ?team-open=1 with the picker open, so a review link lands on it.
  const params = useSearchParams()
  const [date, setDate] = useState(TODAY)
  const [viewMode, setViewMode] = useState<ViewMode>("day")
  const [hasPets, setHasPets] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [team, setTeam] = useState<TeamSelection>(
    params.get("team") === "all" ? { mode: "all" } : DEFAULT_TEAM_SELECTION,
  )
  // When set, the appointment's services launch the checkout flow at the Tip step.
  const [checkout, setCheckout] = useState<{
    lines: CartLine[]
    attachment: ClientAttachment
  } | null>(null)

  const members = membersAt(ROSTER_MEMBERS, ROTA_LOCATION)
  const scheduled = scheduledMemberIds(members, ROTA, ROTA_LOCATION, rotaDay(date))
  const shown = members.filter((m) => visibleMemberIds(team, members, scheduled).has(m.id))

  return (
    <>
      <AppShell
        headerClassName="min-h-0 p-3"
        header={
          <AppointmentsToolbar
            date={date}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onPrev={() => setDate((d) => addDays(d, -1))}
            onNext={() => setDate((d) => addDays(d, 1))}
            onToday={() => setDate(TODAY)}
            onOpenFilters={() => undefined}
            onNewBooking={() => setCreateOpen(true)}
            hasPets={hasPets}
            onHasPetsChange={setHasPets}
            teamControl={
              <TeamDropdown
                members={members}
                scheduledIds={scheduled}
                selection={team}
                onSelectionChange={setTeam}
                defaultOpen={params.get("team-open") === "1"}
              />
            }
          />
        }
      >
        <div className="flex flex-col gap-3 p-6">
          <DesignRepoBar label="open the appointment sheet on a booking that already exists">
            <Button size="sm" variant="outline" radius="full" onClick={() => setEditOpen(true)}>
              Edit existing appointment
            </Button>
          </DesignRepoBar>
          {/* No day grid in this repo, so the picker's effect is spelled out
              here: these are the columns the grid would draw. */}
          <DesignRepoBar label="the staff columns the day grid would draw">
            <span className="text-muted-foreground text-sm">
              {shown.length === 0
                ? "No columns"
                : `${shown.map((m) => m.name).join(", ")} (${shown.length} of ${members.length})`}
            </span>
          </DesignRepoBar>
        </div>
      </AppShell>
      <NewAppointmentSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        date={date}
        hasPets={hasPets}
      />
      <NewAppointmentSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        date={date}
        hasPets={hasPets}
        flow="edit"
        initialStatus="booked"
        // An existing booking has a branch; the demo has to supply one for the
        // sheet to have anything to state. Any branch of the estate does — what
        // is being shown is that the sheet names it, not which one it is.
        existingLocationId="shampooch-jumeirah"
        onCheckout={(lines, client) => {
          setEditOpen(false)
          setCheckout({
            lines,
            attachment: client ? { type: "client", client } : { type: "walk-in" },
          })
        }}
      />
      {checkout ? (
        <CartFlow
          open
          onOpenChange={(next) => !next && setCheckout(null)}
          initialLines={checkout.lines}
          initialAttachment={checkout.attachment}
          initialStep="tip"
        />
      ) : null}
    </>
  )
}
