"use client"

import {
  CheckIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  CirclePlusIcon,
  InfoIcon,
  XIcon,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
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
import { GiftCardDialog, newGiftCardDraft } from "./gift-card-dialog"
import { ItemPicker } from "./item-picker"
import { CLIENT_REQUIRED, CLIENTS, formatAedDecimal, SERVICES, totals } from "./mock"
import { PaymentView } from "./payment-view"
import { RedeemGiftCardDialog } from "./redeem-gift-card-dialog"
import { SaleNoteDialog } from "./sale-note-dialog"
import { SelectPaymentModal } from "./select-payment-modal"
import { SelfCheckoutDialog } from "./self-checkout-dialog"
import { SplitPaymentView } from "./split-payment-view"
import { TipView, tipForPreset } from "./tip-view"
import type {
  AppointmentItem,
  CartLine,
  CatalogClient,
  ClientAttachment,
  GiftCardDraft,
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

// Demo seed for the checkout deep-links (?step=tip|payment and ?dialog=redeem on
// the route page): one priced service + a sample client, so the Tip / Payment
// steps and the redeem-gift-card flow have a real balance to act on.
function seedCheckoutLines(): CartLine[] {
  const svc = SERVICES.find((s) => s.priceMinor > 0) ?? SERVICES[0]
  return [
    {
      uid: nextUid("svc"),
      kind: "service",
      name: svc.name,
      priceMinor: svc.priceMinor,
      durationMin: svc.durationMin,
      staffName: "Any",
      qty: 1,
      sourceId: svc.id,
      categoryId: svc.categoryId,
    },
  ]
}

const STEPS = ["cart", "tip", "payment"] as const
type Step = (typeof STEPS)[number]
const STEP_LABEL: Record<Step, string> = { cart: "Cart", tip: "Tip", payment: "Payment" }

type CartFlowProps = {
  /** Controlled open state. Omit to run standalone (route page) — opens itself. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Pre-seed the cart — e.g. launching checkout from an appointment's services. */
  initialLines?: CartLine[]
  /** Pre-attach a client / walk-in for the seeded sale. */
  initialAttachment?: ClientAttachment
  /** Step to open on. Defaults to "cart"; appointment checkout opens at "tip". */
  initialStep?: Step
}

// useSearchParams() bails out of static prerendering unless it runs inside a
// Suspense boundary; CartFlow is rendered on several statically-rendered pages
// (new-sale, daily-summary, sales-list, appointments), so the boundary lives
// here in the wrapper rather than at every call site.
export function CartFlow(props: CartFlowProps = {}) {
  return (
    <Suspense fallback={null}>
      <CartFlowInner {...props} />
    </Suspense>
  )
}

function CartFlowInner({
  open: openProp,
  onOpenChange,
  initialLines,
  initialAttachment,
  initialStep,
}: CartFlowProps = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const controlled = openProp !== undefined
  const [internalOpen, setInternalOpen] = useState(true)
  const open = controlled ? openProp : internalOpen

  // Deep-link intent — only honored on the standalone route page (uncontrolled).
  // ?dialog=gift-card opens the Add-gift-card dialog over an empty cart;
  // ?dialog=redeem and ?step=tip|payment seed a demo cart so the checkout
  // surfaces have a real balance to act on.
  const deepDialog = controlled ? null : searchParams.get("dialog")
  const deepStep = controlled ? null : searchParams.get("step")
  const seedCheckout =
    deepDialog === "redeem" ||
    deepDialog === "payment-link" ||
    deepStep === "tip" ||
    deepStep === "payment"

  const [attachment, setAttachment] = useState<ClientAttachment>(
    initialAttachment ?? (seedCheckout ? { type: "client", client: CLIENTS[1] } : { type: "none" }),
  )
  const [lines, setLines] = useState<CartLine[]>(
    initialLines ?? (seedCheckout ? seedCheckoutLines() : []),
  )
  const [draftModalOpen, setDraftModalOpen] = useState(false)
  const [clientSearching, setClientSearching] = useState(false)
  const [editingUid, setEditingUid] = useState<string | null>(null)
  const [step, setStep] = useState<Step>(
    initialStep ??
      (deepStep === "payment" || deepDialog === "redeem" || deepDialog === "payment-link"
        ? "payment"
        : deepStep === "tip"
          ? "tip"
          : "cart"),
  )
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
  // "Unpaid sale" guard shown when finishing a gift-card sale without full payment.
  const [unpaidConfirmOpen, setUnpaidConfirmOpen] = useState(false)
  // Redeem-an-existing-gift-card-to-pay dialog (Gift card payment method).
  const [redeemOpen, setRedeemOpen] = useState(deepDialog === "redeem")
  // Send-the-client-a-checkout-link dialog (Payment link payment method).
  const [selfCheckoutOpen, setSelfCheckoutOpen] = useState(deepDialog === "payment-link")
  // Add-a-gift-card-to-cart dialog. Normally opened from the item picker; also
  // deep-linkable via ?dialog=gift-card on the route page.
  const [giftCardAddOpen, setGiftCardAddOpen] = useState(deepDialog === "gift-card")

  const hasClient = attachment.type !== "none"
  const hasGiftCard = lines.some((l) => l.kind === "gift-card")
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

  function addGiftCard(draft: GiftCardDraft) {
    setLines((prev) => [
      ...prev,
      {
        uid: nextUid("gc"),
        kind: "gift-card",
        name: "Gift card",
        priceMinor: draft.priceMinor,
        staffName: draft.staffName,
        qty: 1,
        sourceId: "gift-card",
        giftCard: draft,
      },
    ])
  }

  function applyGiftCardEdit(uid: string, draft: GiftCardDraft) {
    setLines((prev) =>
      prev.map((l) =>
        l.uid === uid
          ? { ...l, priceMinor: draft.priceMinor, staffName: draft.staffName, giftCard: draft }
          : l,
      ),
    )
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
    // Redeem an existing gift card to pay. The tile is disabled when the cart
    // is itself selling a gift card (can't pay for a gift card with one).
    else if (method === "gift-card") setRedeemOpen(true)
    // Text the client a secure link; they pay on their own phone (PRO-396).
    else if (method === "link") setSelfCheckoutOpen(true)
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
                      onAddGiftCard={addGiftCard}
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
                    <PaymentView onSelect={selectPayment} hasGiftCard={hasGiftCard} />
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
                          : // A gift card stays inactive until the sale is fully paid —
                            // confirm before saving it unpaid / part-paid.
                            hasGiftCard
                            ? () => setUnpaidConfirmOpen(true)
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

      {/* Unpaid-sale guard — gift cards stay inactive until the sale is fully paid */}
      <Dialog open={unpaidConfirmOpen} onOpenChange={setUnpaidConfirmOpen}>
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
          <DialogTitle className="font-heading font-semibold text-2xl">Unpaid sale</DialogTitle>
          <div className="flex items-start gap-3 rounded-2xl bg-cami-yellow-3 px-4 py-3 text-cami-yellow-11">
            <InfoIcon className="mt-0.5 size-5 shrink-0" />
            <p className="text-sm leading-5">
              Gift cards in this sale will be inactive until full payment is added.
            </p>
          </div>
          <p className="text-base text-foreground leading-6">
            Do you want to continue without payment?
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              radius="full"
              className="flex-1"
              onClick={() => setUnpaidConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="lg"
              radius="full"
              className="flex-1"
              onClick={() => {
                setUnpaidConfirmOpen(false)
                leave()
              }}
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {editingLine && editingLine.kind === "gift-card" && editingLine.giftCard ? (
        <GiftCardDialog
          key={editingLine.uid}
          mode="edit"
          initial={editingLine.giftCard}
          open
          onOpenChange={(next) => {
            if (!next) setEditingUid(null)
          }}
          onApply={(draft) => applyGiftCardEdit(editingLine.uid, draft)}
          onDelete={step === "cart" ? () => removeLine(editingLine.uid) : undefined}
        />
      ) : editingLine ? (
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

      <RedeemGiftCardDialog
        open={redeemOpen}
        onOpenChange={setRedeemOpen}
        leftToPayMinor={leftToPayMinor}
        onApply={(amount) => addPayment("gift-card", amount)}
      />

      {selfCheckoutOpen ? (
        <SelfCheckoutDialog
          open
          onOpenChange={setSelfCheckoutOpen}
          toPayMinor={leftToPayMinor}
          defaultName={attachment.type === "client" ? attachment.client.name : undefined}
          defaultPhone={attachment.type === "client" ? attachment.client.phone : undefined}
          onPaid={(amount) => addPayment("link", amount)}
        />
      ) : null}

      {giftCardAddOpen ? (
        <GiftCardDialog
          mode="add"
          initial={newGiftCardDraft(10000)}
          open
          onOpenChange={(next) => !next && setGiftCardAddOpen(false)}
          onApply={addGiftCard}
        />
      ) : null}

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
