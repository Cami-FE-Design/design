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
import {
  locationName,
  type Terminal,
  type TerminalSession,
  TYPICAL_SESSIONS,
  TYPICAL_TERMINALS,
  useTerminals,
} from "@/lib/terminals/store"
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
import { type ActivePaymentLink, PaymentLinkLockScreen } from "./payment-link-lock"
import { PaymentView } from "./payment-view"
import { RedeemGiftCardDialog } from "./redeem-gift-card-dialog"
import { SaleNoteDialog } from "./sale-note-dialog"
import { SelectPaymentModal } from "./select-payment-modal"
import { canTakeSale, SelectTerminalDialog } from "./select-terminal-dialog"
import { type PaymentLinkDetails, SelfCheckoutDialog } from "./self-checkout-dialog"
import { SplitPaymentView } from "./split-payment-view"
import { type ActiveTerminalCharge, TerminalLockScreen } from "./terminal-lock"
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

/** Draft references are short uppercase hex, matching the Sales list (#31A06EA3). */
function newDraftRef(): string {
  return Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .toUpperCase()
    .padStart(8, "0")
}

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

/**
 * Fixed terminal setups behind ?terminals=, so a review link is the same on
 * every machine: `none` hides the POS Terminal tile, `idle` keeps it (the
 * machines exist, nobody has signed in yet), `one` sends straight to the locked
 * screen (one signed-in machine is not a choice), `two` opens the picker.
 * Anything else — including no param — falls through to the store.
 */
function terminalScenario(
  key: string | null,
): { terminals: Terminal[]; sessions: TerminalSession[] } | null {
  if (key === "none") return { terminals: [], sessions: [] }
  // Registered but nobody signed in — the state a merchant is in every morning
  // before the first PIN goes into a machine. The tile stays: hiding it would
  // make the option vanish overnight and come back at lunch, so the picker
  // explains instead.
  if (key === "idle") return { terminals: TYPICAL_TERMINALS, sessions: [] }
  if (key === "one")
    return {
      terminals: [TYPICAL_TERMINALS[0]],
      sessions: TYPICAL_SESSIONS.filter((s) => s.terminalId === TYPICAL_TERMINALS[0].id),
    }
  if (key === "two")
    return {
      terminals: TYPICAL_TERMINALS,
      sessions: [
        ...TYPICAL_SESSIONS,
        // The typical demo set only signs anyone into the first terminal, so
        // the second machine needs a session of its own to be pickable.
        {
          ...TYPICAL_SESSIONS[0],
          id: "SES-DEMO-2",
          terminalId: TYPICAL_TERMINALS[1].id,
          device: "iPad (9th gen)",
          app: "Cami POS 1.4.0 · iPadOS 17",
          ip: "196.20.14.11",
        },
      ],
    }
  return null
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
  // ?terminals=none|one|two pins the terminal setup for review, so a link shows
  // the same thing on every machine regardless of what the reviewer has
  // registered in Payment settings. Without it the checkout reads the store.
  const deepTerminals = controlled ? null : searchParams.get("terminals")
  const seedCheckout =
    deepDialog === "redeem" ||
    deepDialog === "payment-link" ||
    deepDialog === "terminal" ||
    deepTerminals !== null ||
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
      (deepStep === "payment" ||
      deepTerminals !== null ||
      deepDialog === "redeem" ||
      deepDialog === "payment-link" ||
      deepDialog === "terminal"
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
  // A live payment link locks the cart until it is paid or cancelled (PRO-909).
  const [paymentLink, setPaymentLink] = useState<ActivePaymentLink | null>(null)
  // A sale routed to the card machine locks the cart the same way a live link
  // does — see ./terminal-lock.tsx.
  const [terminalCharge, setTerminalCharge] = useState<ActiveTerminalCharge | null>(null)
  // Which machine to send it to, asked only when there is a choice to make.
  const [terminalPickerOpen, setTerminalPickerOpen] = useState(false)
  // Add-a-gift-card-to-cart dialog. Normally opened from the item picker; also
  // deep-linkable via ?dialog=gift-card on the route page.
  const [giftCardAddOpen, setGiftCardAddOpen] = useState(deepDialog === "gift-card")

  // Registered terminals come from the same store Payment settings writes to
  // (DSG-62), so a device registered there is the device offered here. The
  // store starts empty — a merchant's real first-run state — which would leave
  // checkout with no terminal to demo, so an unconfigured store falls back to
  // the two-terminal demo set rather than hiding the flow from review.
  const terminalStore = useTerminals()
  const scenario = terminalScenario(deepTerminals)
  const terminals =
    scenario?.terminals ??
    (terminalStore.terminals.length ? terminalStore.terminals : TYPICAL_TERMINALS)
  const terminalSessions =
    scenario?.sessions ??
    (terminalStore.terminals.length ? terminalStore.sessions : TYPICAL_SESSIONS)
  // Mirrors the real build's one backend boolean: no registered hardware, no
  // tile. Sign-in state is not part of it — a merchant whose device is simply
  // signed out still has a terminal, and the picker is where they learn that.
  const terminalAvailable = terminals.length > 0
  // Machines that can take a sale right now. Few enough and the payment grid
  // lists them one by one instead of a generic tile, so the receptionist taps
  // the register in front of them once (Michelle, DSG review).
  const signedInTerminals = terminals.filter((t) => canTakeSale(t, terminalSessions))

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
    setPaymentLink(null)
    setTerminalCharge(null)
  }

  // `to` forces a navigation even when the cart is controlled — used when the
  // sale has somewhere specific to hand off to, e.g. its draft record.
  function leave(to?: string) {
    resetCart()
    if (controlled) {
      onOpenChange?.(false)
    } else {
      setInternalOpen(false)
    }
    if (to) router.push(to)
    else if (!controlled) router.push("/sales/sales-list")
  }

  // ?dialog=terminal lands directly on the locked screen — the seeded cart is
  // already priced, so the routed amount is the balance it opens with.
  //
  // Waits for the terminals store, which hydrates from localStorage in its own
  // effect: firing on mount would name whichever device the pre-hydration
  // fallback held, and the deep link would disagree with Payment settings for
  // the rest of the session. Once-only, so cancelling doesn't re-lock.
  const [deepTerminalDone, setDeepTerminalDone] = useState(false)
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once the store resolves
  useEffect(() => {
    if (deepDialog !== "terminal" || deepTerminalDone) return
    // Same source the real flow uses, so the deep link can't name a device the
    // merchant doesn't have — a signed-in one if there is one, else the first
    // registered.
    const target = terminals.find((t) => canTakeSale(t, terminalSessions)) ?? terminals[0]
    if (!target) return
    setDeepTerminalDone(true)
    setTerminalCharge({
      amountMinor: totals(seedCheckoutLines()).totalMinor,
      terminalName: target.name,
      terminalLocation: locationName(target.locationId),
      sentAt: Date.now(),
    })
  }, [terminals, terminalSessions, deepTerminalDone])

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
    // A machine picked straight off the grid — nothing left to ask for.
    else if (method.startsWith("terminal:")) {
      const target = terminals.find((t) => t.id === method.slice("terminal:".length))
      if (target) routeToTerminal(target)
    }
    // The generic tile: no machine is signed in, or there are too many to list.
    else if (method === "terminal") sendToTerminal()
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

  // ─── Payment link (PRO-909) ──────────────────────────────────────────────

  // Generating a link creates a draft sale on the backend and locks this cart:
  // the amount and the method are frozen so the two cannot drift apart. The
  // draft's reference is minted here so cancelling can hand back to it; the
  // real build takes the ref off the created draft sale instead.
  function sendPaymentLink(details: PaymentLinkDetails) {
    setPaymentLink({ ...details, sentAt: Date.now(), draftRef: newDraftRef() })
  }

  // Cancelling invalidates the link only — the draft sale survives it. So we
  // close the cart and hand the operator to that draft rather than resuming the
  // locked state; Checkout on the draft picks the journey back up at Tip.
  function cancelPaymentLink() {
    if (!paymentLink) return
    const params = new URLSearchParams({
      tab: "drafts",
      draft: paymentLink.draftRef,
      // Mock plumbing — the draft only exists in this cart's memory, so the
      // list needs enough to render it. Real build looks it up by ref.
      draftTotal: String(paymentLink.amountMinor),
      draftClient: payerName,
    })
    leave(`/sales/sales-list?${params}`)
  }

  function settlePaymentLink() {
    if (!paymentLink) return
    addPayment("link", paymentLink.amountMinor)
    setPaymentLink(null)
    setConfirmed(true)
  }

  // ─── POS Terminal ────────────────────────────────────────────────────────

  // Routing a sale to the card machine locks the cart for the same reason a
  // live payment link does: the machine is about to charge a figure, and the
  // cart must not move underneath it. The terminal settles the whole remaining
  // balance, so there is no amount to collect here — the tile is the action.
  // Only reached from the generic tile, which the grid shows when it can't name
  // the machines itself: none signed in, or more than it can list.
  function sendToTerminal() {
    setTerminalPickerOpen(true)
  }

  function routeToTerminal(terminal: Terminal) {
    setTerminalCharge({
      amountMinor: leftToPayMinor,
      terminalName: terminal.name,
      terminalLocation: locationName(terminal.locationId),
      sentAt: Date.now(),
    })
  }

  // Unlike a cancelled link — which leaves a draft sale behind to hand off to —
  // the operator is standing at the counter with the client in front of them.
  // So this returns them to the payment grid with the cart intact, ready to
  // take cash or another card, rather than closing the drawer.
  function cancelTerminalCharge() {
    setTerminalCharge(null)
  }

  function settleTerminalCharge() {
    if (!terminalCharge) return
    addPayment("terminal", terminalCharge.amountMinor)
    setTerminalCharge(null)
    setConfirmed(true)
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

  // A locked sale — link out, or routed to the card machine — has no dismissal.
  // Escape and the overlay are the last two ways the "Discard draft sale?"
  // prompt could still reach a sale that has already been paid, which is one of
  // the three defects this pattern exists to close. Cancel is the only exit.
  const locked = Boolean(paymentLink || terminalCharge)

  return (
    <Sheet open={open} onOpenChange={(next) => !next && !locked && requestClose()}>
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
        ) : paymentLink ? (
          // Cart is locked while a link is live — no step nav, no editing.
          <PaymentLinkLockScreen
            link={paymentLink}
            onCancelLink={cancelPaymentLink}
            onMarkPaid={settlePaymentLink}
          />
        ) : terminalCharge ? (
          // Same lock, card-present. The drawer is the one place to be while
          // the machine has the sale, and where the settlement lands.
          <TerminalLockScreen
            charge={terminalCharge}
            firstName={firstName}
            onCancel={cancelTerminalCharge}
            onMarkPaid={settleTerminalCharge}
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
                    <PaymentView
                      onSelect={selectPayment}
                      hasGiftCard={hasGiftCard}
                      terminalAvailable={terminalAvailable}
                      signedInTerminals={signedInTerminals}
                    />
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
                      onCancelSale={() => leave()}
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
                            : () => leave()
                    }
                    onAddTip={() => setStep("tip")}
                    onAddCartDiscount={() => setCartDiscountOpen(true)}
                    onAddSaleNote={() => setSaleNoteOpen(true)}
                    onSaveDraft={() => setDraftModalOpen(true)}
                    onCancelSale={() => leave()}
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
          onSend={sendPaymentLink}
        />
      ) : null}

      {/* Remounted per open so the pre-selection is recomputed — which machine
          is signed in can change between two sends. */}
      {terminalPickerOpen ? (
        <SelectTerminalDialog
          open
          onOpenChange={setTerminalPickerOpen}
          terminals={terminals}
          sessions={terminalSessions}
          amountMinor={leftToPayMinor}
          onSend={routeToTerminal}
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
