"use client"

import { useState } from "react"
import { CartFlow } from "@/app/sales/new-sale/cart-flow"
import type { CartLine, ClientAttachment } from "@/app/sales/new-sale/types"
import { AppShell } from "@/components/blocks/app-shell"
import { AppointmentsToolbar, type ViewMode } from "@/components/blocks/appointments-toolbar"
import { NewAppointmentSheet } from "@/components/blocks/new-appointment-sheet"
import { Button } from "@/components/ui/button"

const TODAY = "2026-05-13"

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("day")
  const [hasPets, setHasPets] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  // When set, the appointment's services launch the checkout flow at the Tip step.
  const [checkout, setCheckout] = useState<{
    lines: CartLine[]
    attachment: ClientAttachment
  } | null>(null)

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
            onNewBooking={() => setCreateOpen(true)}
            hasPets={hasPets}
            onHasPetsChange={setHasPets}
          />
        }
      >
        <div className="flex items-center gap-3 p-6">
          <Button radius="full" onClick={() => setEditOpen(true)}>
            Edit existing appointment (demo)
          </Button>
          <span className="text-xs text-muted-foreground">
            Opens the same sheet in edit flow — status pill visible, CTA = Checkout.
          </span>
        </div>
      </AppShell>
      <NewAppointmentSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        date={TODAY}
        hasPets={hasPets}
      />
      <NewAppointmentSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        date={TODAY}
        hasPets={hasPets}
        flow="edit"
        initialStatus="booked"
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
