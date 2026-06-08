"use client"

import {
  ArrowRightIcon,
  BanknoteIcon,
  CheckIcon,
  CircleDollarSignIcon,
  CreditCardIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Matches the trigger sizing used across the add-pet / add-product forms so the
// refund fields read as the same family (h-12, rounded-2xl, input background).
const triggerOverride = "data-[size=default]:h-12 rounded-2xl bg-input px-4 font-medium"

const CURRENCY = "AED"

function money(minor: number) {
  return `${CURRENCY} ${(minor / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// UAE VAT is 5% and prices are tax-inclusive, so the tax shown on a refund is
// the VAT component already baked into the gross total: gross × 5/105.
function taxOf(grossMinor: number) {
  return Math.round((grossMinor * 5) / 105)
}

const WEEKDAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

// "Friday, 22 May 2026" — matches the sale meta line in the refund header.
function formatLongDate(d: Date) {
  return `${WEEKDAY_LONG[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

// "4 Jun 2026" — used in the per-item meta line under each refundable item.
function formatShortDate(d: Date) {
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

// "11:55am" — matches the per-item meta line in the figma.
function formatTime(d: Date) {
  let h = d.getHours()
  const m = d.getMinutes()
  const meridiem = h >= 12 ? "pm" : "am"
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, "0")}${meridiem}`
}

const REFUND_REASONS = [
  "Accidental charge",
  "Incorrect amount",
  "Duplicate transaction",
  "Item not available",
  "Client's request",
  "Potential fraud",
  "Other",
]

// Payment-method icon kinds — drive the leading glyph in the method dropdown.
type MethodKind = "visa" | "card" | "cash"

function MethodIcon({ kind }: { kind: MethodKind }) {
  if (kind === "cash") return <BanknoteIcon className="size-4 text-cami-green-11" />
  if (kind === "visa") return <CreditCardIcon className="size-4 text-cami-violet-11" />
  return <CircleDollarSignIcon className="size-4 text-cami-violet-11" />
}

export type RefundItem = {
  id: string
  name: string
  /** When the item was sold — drives the "11:55am, 4 Jun 2026 with Yuna" line. */
  at: Date
  /** Team member who delivered the item. */
  staff: string
  /** Gross (tax-inclusive) line amount in minor units (fils). */
  amountMinor: number
}

export type RefundPayment = {
  id: string
  /** Display label, e.g. "Visa *7697" or "Card". */
  method: string
  kind: MethodKind
  /** Amount that can still be refunded against this payment, in minor units. */
  availableMinor: number
}

// Demo line items — mirrors the figma fixture (Sale #22710). Used when a caller
// doesn't pass its own `items`, which is every caller today since the sale list
// only carries summary numbers.
const DEMO_ITEMS: RefundItem[] = [
  {
    id: "i1",
    name: "Nail Art PER nail",
    at: new Date(2026, 5, 4, 11, 55),
    staff: "Yuna",
    amountMinor: 2000,
  },
  {
    id: "i2",
    name: "Nail Art PER nail",
    at: new Date(2026, 5, 4, 11, 45),
    staff: "Yuna",
    amountMinor: 2000,
  },
  {
    id: "i3",
    name: "Cut & Blow Dry",
    at: new Date(2026, 5, 4, 12, 0),
    staff: "Beth R",
    amountMinor: 40500,
  },
  {
    id: "i4",
    name: "Half Head Foils",
    at: new Date(2026, 5, 4, 10, 15),
    staff: "Beth R",
    amountMinor: 67500,
  },
  {
    id: "i5",
    name: "Toner",
    at: new Date(2026, 5, 4, 11, 40),
    staff: "Beth R",
    amountMinor: 18000,
  },
  {
    id: "i6",
    name: "Gel Color",
    at: new Date(2026, 5, 4, 10, 15),
    staff: "Yuna",
    amountMinor: 19800,
  },
]

// Demo split-tender payments — the sale was paid across a Visa card and a
// generic Card terminal, so a refund can be apportioned across both.
const DEMO_PAYMENTS: RefundPayment[] = [
  { id: "p1", method: "Visa *7697", kind: "visa", availableMinor: 41500 },
  { id: "p2", method: "Card", kind: "card", availableMinor: 108300 },
]

export type RefundSale = {
  id: number
  saleAt: Date
  /** Third meta segment after the date, e.g. "Pet". */
  subjectLabel: string
  /** Amount that can still be refunded, in minor units (fils). */
  availableMinor: number
  /** Original payment method label, e.g. "Cash". */
  paymentMethod: string
  /** True once a refund has already been issued for this sale. */
  alreadyRefunded: boolean
  /** Refundable line items. Falls back to the demo fixture when omitted. */
  items?: RefundItem[]
  /** Original payments a refund can be apportioned across. Falls back to demo. */
  payments?: RefundPayment[]
}

type RefundTab = "item" | "amount"

type RefundSaleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale: RefundSale | null
}

export function RefundSaleDialog({ open, onOpenChange, sale }: RefundSaleDialogProps) {
  const [tab, setTab] = useState<RefundTab>("item")
  // Refund-item tab: which line items are selected.
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  // Refund-amount tab: chosen method + entered amount per original payment.
  const [methodById, setMethodById] = useState<Record<string, string>>({})
  const [amountById, setAmountById] = useState<Record<string, string>>({})
  const [reason, setReason] = useState("")
  // Once a refund is issued we swap the form for a centred "Refund complete"
  // confirmation, mirroring the "Payment complete" screen in the sale flow.
  const [done, setDone] = useState(false)
  const [refundedMinor, setRefundedMinor] = useState(0)

  const items = sale?.items ?? DEMO_ITEMS
  const payments = sale?.payments ?? DEMO_PAYMENTS

  // Reset the form each time the dialog opens for a sale.
  useEffect(() => {
    if (!open) return
    setTab("item")
    setSelected(new Set())
    setMethodById(
      Object.fromEntries((sale?.payments ?? DEMO_PAYMENTS).map((p) => [p.id, p.method])),
    )
    setAmountById({})
    setReason("")
    setDone(false)
    setRefundedMinor(0)
  }, [open, sale])

  // Auto-close a moment after the confirmation shows — matches the sale flow.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only re-run when `done` flips
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => onOpenChange(false), 2200)
    return () => clearTimeout(t)
  }, [done])

  if (!sale) return null

  // ─── Refund-item tab totals ───────────────────────────────────────────────
  const selectedTotalMinor = items
    .filter((it) => selected.has(it.id))
    .reduce((sum, it) => sum + it.amountMinor, 0)
  const itemTaxMinor = taxOf(selectedTotalMinor)
  const allChecked: boolean | "indeterminate" =
    selected.size === 0 ? false : selected.size === items.length ? true : "indeterminate"

  function toggleItem(id: string, next: boolean) {
    setSelected((prev) => {
      const out = new Set(prev)
      if (next) out.add(id)
      else out.delete(id)
      return out
    })
  }

  function toggleAll(next: boolean) {
    setSelected(next ? new Set(items.map((it) => it.id)) : new Set())
  }

  // ─── Refund-amount tab totals ─────────────────────────────────────────────
  function amountMinorOf(id: string) {
    const n = Number.parseFloat(amountById[id] ?? "")
    return Number.isFinite(n) ? Math.round(n * 100) : 0
  }
  const amountTotalMinor = payments.reduce((sum, p) => sum + amountMinorOf(p.id), 0)
  const amountWithinLimits = payments.every((p) => amountMinorOf(p.id) <= p.availableMinor)
  const amountTabValid = amountTotalMinor > 0 && amountWithinLimits && reason !== ""

  const saveDisabled = tab === "item" ? selectedTotalMinor <= 0 : !amountTabValid

  function handleSubmit() {
    if (tab === "item") {
      if (selectedTotalMinor <= 0) return
      setRefundedMinor(selectedTotalMinor)
    } else {
      if (!amountTabValid) return
      setRefundedMinor(amountTotalMinor)
    }
    setDone(true)
  }

  if (done) {
    return (
      <RefundCompleteScreen open={open} onOpenChange={onOpenChange} amountMinor={refundedMinor} />
    )
  }

  // Method options per payment — the original method plus Cash (a refund can
  // always be handed back as cash). Skip the duplicate when the original method
  // was already cash.
  function methodOptions(
    p: RefundPayment,
  ): Array<{ value: string; label: string; kind: MethodKind }> {
    const original = { value: p.method, label: p.method, kind: p.kind }
    if (p.kind === "cash") return [original]
    return [original, { value: "Cash", label: "Cash", kind: "cash" }]
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Refund sale"
      contentClassName="max-w-3xl"
      subtitle={
        <span className="flex flex-col gap-1">
          <span className="text-muted-foreground">
            Sale #{sale.id} &nbsp;·&nbsp; {formatLongDate(sale.saleAt)} &nbsp;·&nbsp;{" "}
            {sale.subjectLabel}
          </span>
          <button
            type="button"
            className="w-fit text-sm font-medium text-cami-violet-11 hover:underline"
          >
            Learn more
          </button>
        </span>
      }
      onSave={handleSubmit}
      saveDisabled={saveDisabled}
      saveLabel={
        tab === "item" ? (
          <>
            Continue
            <ArrowRightIcon className="size-4" />
          </>
        ) : (
          "Issue refund"
        )
      }
    >
      <Tabs className="gap-8" value={tab} onValueChange={(v) => setTab(v as RefundTab)}>
        {/* Segmented toggle — full-width two-up control replacing the old
            left-hand section nav. Reuses the default Tabs pill track (gray
            track, white active capsule) sized up to read as a primary toggle. */}
        <TabsList className="h-12 w-full rounded-2xl p-1">
          <TabsTrigger value="item" className="rounded-xl text-base">
            Refund item
          </TabsTrigger>
          <TabsTrigger value="amount" className="rounded-xl text-base">
            Refund amount
          </TabsTrigger>
        </TabsList>

        {/* ─── Refund item ─────────────────────────────────────────────── */}
        <TabsContent value="item" className="flex flex-col">
          {sale.alreadyRefunded ? (
            <div className="mb-5 rounded-2xl bg-cami-violet-3 px-5 py-4 text-sm leading-6 text-foreground">
              You have already processed a refund for this sale. Refunding more items here will
              create an additional refund.
            </div>
          ) : null}

          <div className="flex items-center gap-3 pb-3">
            <Checkbox
              checked={allChecked}
              onCheckedChange={(c) => toggleAll(c === true)}
              aria-label="Select all items"
            />
            <span className="flex-1 font-semibold text-foreground">All items</span>
            <span className="font-semibold text-foreground">Amount</span>
          </div>
          <Separator />

          <ul className="flex flex-col">
            {items.map((it) => {
              const checked = selected.has(it.id)
              return (
                <li key={it.id}>
                  <label
                    htmlFor={`refund-item-${it.id}`}
                    className="flex cursor-pointer items-center gap-3 py-4"
                  >
                    <Checkbox
                      id={`refund-item-${it.id}`}
                      checked={checked}
                      onCheckedChange={(c) => toggleItem(it.id, c === true)}
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-medium text-foreground">{it.name}</span>
                      <span className="truncate text-sm text-muted-foreground">
                        {formatTime(it.at)}, {formatShortDate(it.at)} with {it.staff}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium text-foreground tabular-nums">
                      {money(it.amountMinor)}
                    </span>
                  </label>
                  <Separator />
                </li>
              )
            })}
          </ul>

          <div className="flex items-center justify-between py-3 text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="text-muted-foreground tabular-nums">{money(itemTaxMinor)}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-foreground">
            <span>Total to refund</span>
            <span className="tabular-nums">{money(selectedTotalMinor)}</span>
          </div>
        </TabsContent>

        {/* ─── Refund amount ───────────────────────────────────────────── */}
        <TabsContent value="amount" className="flex flex-col gap-8">
          {payments.map((p, i) => {
            const options = methodOptions(p)
            const overLimit = amountMinorOf(p.id) > p.availableMinor
            return (
              <div key={p.id} className="flex flex-col gap-4">
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  Payment {i + 1}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldRow label="Refund method" description="Original payment method">
                    <Select
                      value={methodById[p.id] ?? p.method}
                      onValueChange={(v) => setMethodById((m) => ({ ...m, [p.id]: v }))}
                    >
                      <SelectTrigger className={cn(triggerOverride, "w-full")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <MethodIcon kind={opt.kind} />
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>

                  <FieldRow
                    label="Refund amount"
                    htmlFor={`refund-amount-${p.id}`}
                    description={`${money(p.availableMinor)} available to refund`}
                  >
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-medium text-muted-foreground">
                        {CURRENCY}
                      </span>
                      <Input
                        id={`refund-amount-${p.id}`}
                        value={amountById[p.id] ?? ""}
                        onChange={(e) => setAmountById((a) => ({ ...a, [p.id]: e.target.value }))}
                        placeholder="0.00"
                        inputMode="decimal"
                        className="pl-14"
                        aria-invalid={overLimit}
                      />
                    </div>
                  </FieldRow>
                </div>
              </div>
            )
          })}

          <FieldRow label="Reason for refund" htmlFor="refund-reason">
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="refund-reason" className={cn(triggerOverride, "w-full")}>
                <SelectValue placeholder="Choose a reason for refund" />
              </SelectTrigger>
              <SelectContent>
                {REFUND_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </TabsContent>
      </Tabs>
    </FullScreenEditDialog>
  )
}

// Full-screen "Refund complete" confirmation — mirrors the "Payment complete"
// screen in the sale flow (centred green check, headline, amount line). Reuses
// the same opaque full-screen sizing as <FullScreenEditDialog> so it reads as
// the same takeover and cleanly covers any dialog stacked beneath it.
const fullScreenSuccessClass =
  "fixed! inset-0! top-0! left-0! h-dvh! w-screen! max-h-none! max-w-none! sm:max-w-none! translate-x-0! translate-y-0! rounded-none! bg-background! p-0"

function RefundCompleteScreen({
  open,
  onOpenChange,
  amountMinor,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  amountMinor: number
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={fullScreenSuccessClass}>
        <DialogTitle className="sr-only">Refund complete</DialogTitle>
        <DialogDescription className="sr-only">{money(amountMinor)} refunded</DialogDescription>
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-cami-green-3 text-cami-green-11">
            <CheckIcon className="size-10" strokeWidth={2.5} />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-semibold text-foreground">Refund complete</h1>
            <p className="text-muted-foreground">{money(amountMinor)} refunded</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Mirrors the FieldRow used in the add-pet / add-product forms: label on top,
// control, then optional muted helper text.
function FieldRow({
  label,
  htmlFor,
  description,
  children,
}: {
  label: string
  htmlFor?: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  )
}
