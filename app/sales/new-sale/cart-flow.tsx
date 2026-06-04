"use client"

import { ChevronRightIcon, ChevronsRightIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { CartContent, CartFooter } from "./cart-summary"
import { ClientPanel } from "./client-panel"
import { EditLineDialog, type LinePatch } from "./edit-line-dialog"
import { ItemPicker } from "./item-picker"
import { CLIENT_REQUIRED, CLIENTS, SERVICES } from "./mock"
import type {
  AppointmentItem,
  CartLine,
  CatalogClient,
  ClientAttachment,
  ProductItem,
  ServiceItem,
} from "./types"

// Monotonic line ids — duplicates of the same source stack as separate lines.
let lineSeq = 0
function nextUid(prefix: string): string {
  lineSeq += 1
  return `${prefix}-${lineSeq}`
}

const BREADCRUMB = ["Cart", "Tip", "Payment"] as const

type CartFlowProps = {
  /** Controlled open state. Omit to run standalone (route page) — opens itself. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CartFlow({ open: openProp, onOpenChange }: CartFlowProps = {}) {
  const router = useRouter()
  const controlled = openProp !== undefined
  const [internalOpen, setInternalOpen] = useState(true)
  const open = controlled ? openProp : internalOpen

  const [attachment, setAttachment] = useState<ClientAttachment>({ type: "none" })
  const [lines, setLines] = useState<CartLine[]>([])
  const [draftModalOpen, setDraftModalOpen] = useState(false)
  const [clientSearching, setClientSearching] = useState(false)
  const [editingUid, setEditingUid] = useState<string | null>(null)

  const hasClient = attachment.type !== "none"
  const editingLine = lines.find((l) => l.uid === editingUid) ?? null

  function leave() {
    // Clear the cart so a re-open starts fresh.
    setLines([])
    setAttachment({ type: "none" })
    if (controlled) {
      onOpenChange?.(false)
    } else {
      setInternalOpen(false)
      router.push("/sales/sales-list")
    }
  }

  // ─── Cart mutations ──────────────────────────────────────────────────────

  function addService(service: ServiceItem, staffName = "Any") {
    setLines((prev) => [
      ...prev,
      {
        uid: nextUid("svc"),
        kind: "service",
        name: service.name,
        priceMinor: service.priceMinor,
        durationMin: service.durationMin,
        staffName,
        qty: 1,
        sourceId: service.id,
        categoryId: service.categoryId,
      },
    ])
  }

  function addProduct(product: ProductItem) {
    setLines((prev) => {
      // Products stack quantity rather than adding a second line.
      const existing = prev.find((l) => l.kind === "product" && l.sourceId === product.id)
      if (existing) {
        return prev.map((l) => (l.uid === existing.uid ? { ...l, qty: l.qty + 1 } : l))
      }
      return [
        ...prev,
        {
          uid: nextUid("prd"),
          kind: "product",
          name: product.size ? `${product.name} ${product.size}` : product.name,
          priceMinor: product.priceMinor,
          qty: 1,
          sourceId: product.id,
        },
      ]
    })
  }

  // An appointment can only sit in the cart once — no double-paying.
  const addedApptIds = new Set(lines.map((l) => l.apptId).filter(Boolean) as string[])

  function snapshotAppointment(appt: AppointmentItem) {
    setLines((prev) => {
      if (prev.some((l) => l.apptId === appt.id)) return prev
      return [
        ...prev,
        ...appt.lines.map((line) => ({
          uid: nextUid("svc"),
          kind: "service" as const,
          name: line.name,
          priceMinor: line.priceMinor,
          durationMin: line.durationMin,
          staffName: line.staffName,
          qty: 1,
          sourceId: line.serviceId,
          categoryId: SERVICES.find((s) => s.id === line.serviceId)?.categoryId,
          warnings: line.warnings,
          apptId: appt.id,
        })),
      ]
    })
  }

  // Resolve the full client record (with phone/email) for an appointment.
  function clientForAppt(appt: AppointmentItem): CatalogClient {
    return (
      CLIENTS.find((c) => c.id === appt.clientId) ?? { id: appt.clientId, name: appt.clientName }
    )
  }

  function addAppointment(appt: AppointmentItem) {
    if (addedApptIds.has(appt.id)) return
    // One sale can pay for several clients' appointments. The first appointment
    // sets the payer if none is attached; later ones just merge their services
    // in (each line is labelled with its own client/pet in the cart).
    if (attachment.type === "none") {
      setAttachment({ type: "client", client: clientForAppt(appt) })
    }
    snapshotAppointment(appt)
  }

  function removeLine(uid: string) {
    setLines((prev) => prev.filter((l) => l.uid !== uid))
  }

  function setQty(uid: string, qty: number) {
    setLines((prev) => prev.map((l) => (l.uid === uid ? { ...l, qty: Math.max(1, qty) } : l)))
  }

  function applyLineEdit(uid: string, patch: LinePatch) {
    setLines((prev) =>
      prev.map((l) =>
        l.uid === uid
          ? {
              ...l,
              priceMinor: patch.priceMinor,
              qty: Math.max(1, patch.qty),
              staffName: patch.staffName,
            }
          : l,
      ),
    )
  }

  // ─── Exit / draft ────────────────────────────────────────────────────────

  function requestClose() {
    if (lines.length > 0) {
      setDraftModalOpen(true)
      return
    }
    leave()
  }

  const blockedReason = CLIENT_REQUIRED && !hasClient ? "Attach a client to continue" : undefined

  return (
    <Sheet open={open} onOpenChange={(next) => !next && requestClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-[calc(100vw-16px)] max-w-[960px] flex-col gap-0 overflow-hidden p-0 data-[side=right]:max-w-[960px] sm:max-w-[960px]"
      >
        <SheetTitle className="sr-only">Add to cart</SheetTitle>
        <SheetDescription className="sr-only">
          Build a cart of appointments, services and products for a client.
        </SheetDescription>

        {/* Shared top bar — breadcrumb left, close right, spans both panes */}
        <header className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-border/60 border-b py-2 pr-1.5 pl-6">
          <nav aria-label="Checkout steps" className="flex items-center gap-1.5 text-sm">
            {BREADCRUMB.map((step, i) => (
              <span key={step} className="flex items-center gap-1.5">
                {i > 0 ? (
                  <ChevronRightIcon className="size-4 text-muted-foreground/60" aria-hidden />
                ) : null}
                <span
                  className={cn(i === 0 ? "font-medium text-foreground" : "text-muted-foreground")}
                  aria-current={i === 0 ? "step" : undefined}
                >
                  {step}
                </span>
              </span>
            ))}
          </nav>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close"
            onClick={requestClose}
          >
            <ChevronsRightIcon />
          </Button>
        </header>

        <div className="flex min-h-0 w-full flex-1">
          {/* Left pane — item picker */}
          <div className="flex min-w-0 flex-1 flex-col border-border/60 border-r bg-background">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <ItemPicker
                onAddService={(s) => addService(s)}
                onAddProduct={addProduct}
                onAddAppointment={addAppointment}
                addedApptIds={addedApptIds}
              />
            </div>
          </div>

          {/* Right pane — cart (appointment-sheet aesthetic) */}
          <div className="flex w-[440px] shrink-0 flex-col bg-sand-2">
            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
              <ClientPanel
                attachment={attachment}
                onAttachClient={(client: CatalogClient) =>
                  setAttachment({ type: "client", client })
                }
                onWalkIn={() => setAttachment({ type: "walk-in" })}
                // Real quick-create flow is a sibling ticket; attach a placeholder
                // so the selected-client state is demonstrable.
                onAddNew={() =>
                  setAttachment({
                    type: "client",
                    client: { id: "new-client", name: "New client" },
                  })
                }
                onClear={() => setAttachment({ type: "none" })}
                onSearchingChange={setClientSearching}
              />

              {clientSearching ? null : (
                <CartContent
                  lines={lines}
                  hasClient={hasClient}
                  onRemove={removeLine}
                  onSetQty={setQty}
                  onEditLine={setEditingUid}
                />
              )}
            </div>

            {clientSearching ? null : (
              <CartFooter
                lines={lines}
                blockedReason={blockedReason}
                onContinue={() => {}}
                onSaveDraft={() => setDraftModalOpen(true)}
                onCancelSale={leave}
              />
            )}
          </div>
        </div>
      </SheetContent>

      {/* Draft persistence modal — shown on close attempt with items in the cart */}
      <Dialog open={draftModalOpen} onOpenChange={setDraftModalOpen}>
        <DialogContent className="flex flex-col gap-4 sm:max-w-md">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              radius="full"
              aria-label="Close"
              className="absolute top-4 right-4 text-muted-foreground"
            >
              <XIcon className="size-5" />
            </Button>
          </DialogClose>
          <DialogTitle className="font-heading font-semibold text-2xl">
            Discard draft sale?
          </DialogTitle>
          <p className="text-base text-muted-foreground leading-6">
            Your cart won’t be saved. To keep your changes, save this sale as a draft
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              radius="full"
              className="flex-1"
              onClick={() => {
                // Saving to Drafts is handled by a sibling ticket; close the flow.
                setDraftModalOpen(false)
                leave()
              }}
            >
              Save as draft
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              radius="full"
              className="flex-1"
              onClick={() => {
                setDraftModalOpen(false)
                leave()
              }}
            >
              Discard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {editingLine ? (
        <EditLineDialog
          key={editingLine.uid}
          line={editingLine}
          open
          onOpenChange={(next) => {
            if (!next) setEditingUid(null)
          }}
          onApply={applyLineEdit}
          onDelete={removeLine}
        />
      ) : null}
    </Sheet>
  )
}
