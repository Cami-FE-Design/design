"use client"

import { CheckIcon, ChevronRightIcon, ChevronsRightIcon, CirclePlusIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { CardAmountDialog } from "./card-amount-dialog"
import { CartDiscountDialog } from "./cart-discount-dialog"
import { CartContent, CartFooter, CheckoutFooter, type Payment } from "./cart-summary"
import { CashAmountDialog } from "./cash-amount-dialog"
import { ClientPanel } from "./client-panel"
import { ClientSummaryCard } from "./client-summary-card"
import { CustomTipDialog } from "./custom-tip-dialog"
import { EditLineDialog, type LinePatch } from "./edit-line-dialog"
import { ItemPicker } from "./item-picker"
import { CLIENT_REQUIRED, CLIENTS, formatAedDecimal, SERVICES, totals } from "./mock"
import { PaymentView } from "./payment-view"
import { SaleNoteDialog } from "./sale-note-dialog"
import { SelectPaymentModal } from "./select-payment-modal"
import { SplitPaymentView } from "./split-payment-view"
import { TipView, tipForPreset } from "./tip-view"
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

let paymentSeq = 0

const STEPS = ["cart", "tip", "payment"] as const
type Step = (typeof STEPS)[number]
const STEP_LABEL: Record<Step, string> = { cart: "Cart", tip: "Tip", payment: "Payment" }

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
  const [step, setStep] = useState<Step>("cart")
  const [tipId, setTipId] = useState("0")
  const [customTipMinor, setCustomTipMinor] = useState(0)
  const [paymentMode, setPaymentMode] = useState<"select" | "split">("select")
  const [customTipOpen, setCustomTipOpen] = useState(false)
  const [cartDiscountOpen, setCartDiscountOpen] = useState(false)
  const [discountMinor, setDiscountMinor] = useState(0)
  const [saleNoteOpen, setSaleNoteOpen] = useState(false)
  const [saleNote, setSaleNote] = useState("")
  const [payments, setPayments] = useState<Payment[]>([])
  const [cashDialogOpen, setCashDialogOpen] = useState(false)
  const [cardDialogOpen, setCardDialogOpen] = useState(false)
  const [methodPickerOpen, setMethodPickerOpen] = useState(false)
  // Inline client picker on the Tip / Payment summary card.
  const [clientEditing, setClientEditing] = useState(false)
  // Confirmation screen shown after Pay now.
  const [confirmed, setConfirmed] = useState(false)

  const hasClient = attachment.type !== "none"
  const editingLine = lines.find((l) => l.uid === editingUid) ?? null

  // Base = cart total less any cart discount; tip and checkout totals build on it.
  const baseMinor = Math.max(0, totals(lines).totalMinor - discountMinor)
  const tipMinor = tipId === "custom" ? customTipMinor : tipForPreset(tipId)
  const toPayMinor = baseMinor + tipMinor
  const paidMinor = payments.reduce((sum, p) => sum + p.amountMinor, 0)
  const leftToPayMinor = Math.max(0, toPayMinor - paidMinor)
  const fullyPaid = toPayMinor > 0 && paidMinor >= toPayMinor
  const payerName = attachment.type === "client" ? attachment.client.name : "Walk-In"
  const firstName = payerName.split(" ")[0]
  const stepIndex = STEPS.indexOf(step)

  // Clear the sale back to a fresh empty cart.
  function resetCart() {
    setLines([])
    setAttachment({ type: "none" })
    setStep("cart")
    setTipId("0")
    setCustomTipMinor(0)
    setPaymentMode("select")
    setDiscountMinor(0)
    setSaleNote("")
    setPayments([])
    setClientEditing(false)
    setConfirmed(false)
  }

  function leave() {
    resetCart()
    if (controlled) {
      onOpenChange?.(false)
    } else {
      setInternalOpen(false)
      router.push("/sales/sales-list")
    }
  }

  // Auto-close the drawer a moment after the confirmation shows.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only re-run when `confirmed` flips
  useEffect(() => {
    if (!confirmed) return
    const t = setTimeout(() => leave(), 2200)
    return () => clearTimeout(t)
  }, [confirmed])

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

  // ─── Payment ─────────────────────────────────────────────────────────────

  // Pick a method from the payment grid or the split-flow picker.
  function selectPayment(method: string) {
    if (method === "cash") setCashDialogOpen(true)
    else if (method === "card") setCardDialogOpen(true)
    else if (method === "split") setPaymentMode("split")
  }

  function addPayment(method: Payment["method"], amountMinor: number, receivedBy?: string) {
    setPayments((prev) => {
      // Entries for the same method sum into a single line.
      const existing = prev.find((p) => p.method === method)
      if (existing) {
        return prev.map((p) =>
          p.id === existing.id ? { ...p, amountMinor: p.amountMinor + amountMinor } : p,
        )
      }
      paymentSeq += 1
      return [...prev, { id: paymentSeq, method, amountMinor, receivedBy }]
    })
  }

  function removePayment(id: number) {
    setPayments((prev) => prev.filter((p) => p.id !== id))
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

        {confirmed ? (
          <ConfirmationScreen
            paidMinor={paidMinor}
            changeMinor={Math.max(0, paidMinor - toPayMinor)}
          />
        ) : (
          <>
            {/* Shared top bar — breadcrumb left, close right, spans both panes */}
            <header className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-border/60 border-b py-2 pr-1.5 pl-6">
              <nav aria-label="Checkout steps" className="flex items-center gap-1.5 text-sm">
                {STEPS.map((s, i) => (
                  <span key={s} className="flex items-center gap-1.5">
                    {i > 0 ? (
                      <ChevronRightIcon className="size-4 text-muted-foreground/60" aria-hidden />
                    ) : null}
                    <button
                      type="button"
                      // Visited steps are clickable to go back; future steps are not.
                      disabled={i > stepIndex}
                      onClick={() => setStep(s)}
                      className={cn(
                        i === stepIndex ? "font-medium text-foreground" : "text-muted-foreground",
                        i < stepIndex && "hover:text-foreground",
                        i > stepIndex && "cursor-default",
                      )}
                      aria-current={i === stepIndex ? "step" : undefined}
                    >
                      {STEP_LABEL[s]}
                    </button>
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
              {/* Left pane — step content */}
              <div className="flex min-w-0 flex-1 flex-col border-border/60 border-r bg-background">
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                  {step === "cart" ? (
                    <ItemPicker
                      onAddService={(s) => addService(s)}
                      onAddProduct={addProduct}
                      onAddAppointment={addAppointment}
                      addedApptIds={addedApptIds}
                    />
                  ) : step === "tip" ? (
                    <TipView
                      firstName={firstName}
                      selectedId={tipId}
                      onSelect={setTipId}
                      onOpenCustom={() => setCustomTipOpen(true)}
                    />
                  ) : paymentMode === "split" ? (
                    <SplitPaymentView
                      payments={payments}
                      onBack={() => setPaymentMode("select")}
                      onAddMethod={() => setMethodPickerOpen(true)}
                      onRemovePayment={removePayment}
                    />
                  ) : (
                    <PaymentView onSelect={selectPayment} />
                  )}
                </div>
              </div>

              {/* Right pane — cart / checkout summary */}
              <div className="flex w-[440px] shrink-0 flex-col bg-sand-2">
                <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
                  {step === "cart" ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      {clientEditing ? (
                        // Inline client picker — stays on the current step.
                        <ClientPanel
                          attachment={attachment}
                          initialSearching
                          onAttachClient={(client: CatalogClient) => {
                            setAttachment({ type: "client", client })
                            setClientEditing(false)
                          }}
                          onWalkIn={() => {
                            setAttachment({ type: "walk-in" })
                            setClientEditing(false)
                          }}
                          onAddNew={() => {
                            setAttachment({
                              type: "client",
                              client: { id: "new-client", name: "New client" },
                            })
                            setClientEditing(false)
                          }}
                          onClear={() => setAttachment({ type: "none" })}
                        />
                      ) : (
                        <ClientSummaryCard
                          attachment={attachment}
                          onRemove={() => setAttachment({ type: "none" })}
                          onChangeClient={() => {
                            setAttachment({ type: "none" })
                            setClientEditing(true)
                          }}
                        />
                      )}
                      <CartContent
                        lines={lines}
                        hasClient={hasClient}
                        onRemove={removeLine}
                        onSetQty={setQty}
                        onEditLine={setEditingUid}
                        readOnly
                      />
                      <Button
                        type="button"
                        variant="outline"
                        radius="full"
                        className="w-fit gap-2"
                        onClick={() => setStep("cart")}
                      >
                        <CirclePlusIcon className="size-4" />
                        Add
                      </Button>
                    </>
                  )}
                </div>

                {step === "cart" ? (
                  clientSearching ? null : (
                    <CartFooter
                      lines={lines}
                      discountMinor={discountMinor}
                      blockedReason={blockedReason}
                      onContinue={() => setStep("tip")}
                      onAddTip={() => setStep("tip")}
                      onAddCartDiscount={() => setCartDiscountOpen(true)}
                      onAddSaleNote={() => setSaleNoteOpen(true)}
                      onSaveDraft={() => setDraftModalOpen(true)}
                      onCancelSale={leave}
                    />
                  )
                ) : (
                  <CheckoutFooter
                    baseMinor={baseMinor}
                    tipMinor={tipMinor}
                    payments={step === "payment" ? payments : []}
                    onRemovePayment={removePayment}
                    ctaLabel={
                      step === "tip"
                        ? "Continue to payment"
                        : fullyPaid
                          ? "Pay now"
                          : payments.length > 0
                            ? "Save part-paid"
                            : "Save unpaid"
                    }
                    onCta={
                      step === "tip"
                        ? () => setStep("payment")
                        : fullyPaid
                          ? () => setConfirmed(true)
                          : leave
                    }
                    onAddTip={() => setStep("tip")}
                    onAddCartDiscount={() => setCartDiscountOpen(true)}
                    onAddSaleNote={() => setSaleNoteOpen(true)}
                    onSaveDraft={() => setDraftModalOpen(true)}
                    onCancelSale={leave}
                  />
                )}
              </div>
            </div>
          </>
        )}
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
          onDelete={step === "cart" ? removeLine : undefined}
        />
      ) : null}

      {customTipOpen ? (
        <CustomTipDialog
          open
          baseMinor={baseMinor}
          onOpenChange={setCustomTipOpen}
          onApply={(minor) => {
            setTipId("custom")
            setCustomTipMinor(minor)
          }}
        />
      ) : null}

      {cartDiscountOpen ? (
        <CartDiscountDialog
          open
          baseMinor={totals(lines).totalMinor}
          onOpenChange={setCartDiscountOpen}
          onApply={setDiscountMinor}
        />
      ) : null}

      {cashDialogOpen ? (
        <CashAmountDialog
          open
          toPayMinor={leftToPayMinor}
          onOpenChange={setCashDialogOpen}
          onApply={(amount, receivedBy) => addPayment("cash", amount, receivedBy)}
        />
      ) : null}

      {cardDialogOpen ? (
        <CardAmountDialog
          open
          toPayMinor={leftToPayMinor}
          onOpenChange={setCardDialogOpen}
          onApply={(amount) => addPayment("card", amount)}
        />
      ) : null}

      <SelectPaymentModal
        open={methodPickerOpen}
        onOpenChange={setMethodPickerOpen}
        onSelect={selectPayment}
      />

      {saleNoteOpen ? (
        <SaleNoteDialog open note={saleNote} onOpenChange={setSaleNoteOpen} onSave={setSaleNote} />
      ) : null}
    </Sheet>
  )
}

function ConfirmationScreen({
  paidMinor,
  changeMinor,
}: {
  paidMinor: number
  changeMinor: number
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-cami-green-3 text-cami-green-11">
        <CheckIcon className="size-10" strokeWidth={2.5} />
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-semibold text-2xl text-foreground">Payment complete</h1>
        <p className="text-muted-foreground">{formatAedDecimal(paidMinor)} paid</p>
        {changeMinor > 0 ? (
          <p className="font-medium text-foreground">Change · {formatAedDecimal(changeMinor)}</p>
        ) : null}
      </div>
    </div>
  )
}
