"use client"

import { useState } from "react"

import { AppShell } from "@/components/blocks/app-shell"
import { AppointmentsToolbar, type ViewMode } from "@/components/blocks/appointments-toolbar"
import { NewAppointmentSheet } from "@/components/blocks/new-appointment-sheet"

const TODAY = "2026-05-13"

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("day")
  const [hasPets, setHasPets] = useState(true)
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false)

  return (
    <>
      <AppShell
        headerClassName="min-h-0 p-3"
        header={
          <AppointmentsToolbar
            date={TODAY}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onPrev={() => undefined}
            onNext={() => undefined}
            onToday={() => undefined}
            onOpenFilters={() => undefined}
            onNewBooking={() => setNewAppointmentOpen(true)}
            hasPets={hasPets}
            onHasPetsChange={setHasPets}
          />
        }
      />
      <NewAppointmentSheet
        open={newAppointmentOpen}
        onOpenChange={setNewAppointmentOpen}
        date={TODAY}
        hasPets={hasPets}
      />
    </>
  )
}
