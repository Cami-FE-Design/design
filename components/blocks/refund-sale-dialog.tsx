"use client"

import { ArrowRightIcon, BanknoteIcon, PackageIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { type SectionItem, SectionNav } from "@/components/blocks/section-nav"
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

const REFUND_REASONS = [
  "Accidental charge",
  "Incorrect amount",
  "Duplicate transaction",
  "Item not available",
  "Client's request",
  "Potential fraud",
  "Other",
]

// Staff who can hand over a cash refund — defaults to the signed-in user.
const REFUND_STAFF = ["Hussain Shabbir", "Sarah Lee", "Aya Hassan"]

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
}

type RefundTab = "item" | "amount"

// Left-hand section nav — mirrors the Add product / Add client full-screen
// forms (vertical SectionNav + bordered content card) so the refund takeover
// reads as the same family rather than a one-off segmented toggle.
const REFUND_SECTIONS: SectionItem<RefundTab>[] = [
  { id: "item", label: "Refund item", icon: PackageIcon },
  { id: "amount", label: "Refund amount", icon: BanknoteIcon },
]

type RefundSaleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale: RefundSale | null
}

export function RefundSaleDialog({ open, onOpenChange, sale }: RefundSaleDialogProps) {
  const [tab, setTab] = useState<RefundTab>("amount")
  const [amount, setAmount] = useState("")
  const [givenBy, setGivenBy] = useState(REFUND_STAFF[0])
  const [reason, setReason] = useState("")

  // Reset the form each time the dialog opens for a sale.
  useEffect(() => {
    if (open) {
      setTab("amount")
      setAmount("")
      setGivenBy(REFUND_STAFF[0])
      setReason("")
    }
  }, [open])

  if (!sale) return null

  const amountNum = Number.parseFloat(amount)
  const amountMinor = Number.isFinite(amountNum) ? Math.round(amountNum * 100) : 0
  const amountValid = amountMinor > 0 && amountMinor <= sale.availableMinor

  // The item tab is "notice only" for now, so it never has a valid action — the
  // user is steered to the amount tab. The amount tab needs a valid amount and a
  // reason before a refund can be issued.
  const saveDisabled = tab === "item" ? true : !amountValid || reason === ""

  function handleSubmit() {
    if (tab !== "amount" || !amountValid || reason === "") return
    toast.success(`Refund of ${money(amountMinor)} issued`)
    onOpenChange(false)
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Refund sale"
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
      {/* Same two-column layout as the Add product / Add client takeovers:
          vertical SectionNav on the left, a single bordered content card on
          the right. */}
      <div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-[260px_minmax(0,1fr)]">
        <SectionNav
          sections={REFUND_SECTIONS}
          active={tab}
          onChange={setTab}
          ariaLabel="Refund type"
        />

        <div className="min-w-0">
          {tab === "item" ? (
            <FormCard title="Refund item" description="Refund whole items back from this sale.">
              {/* Notice only for now — item-level refund selection comes later. */}
              <div className="rounded-2xl bg-cami-violet-3 px-5 py-4 text-sm leading-6 text-foreground">
                You have already processed a refund for this sale. If you would like to give another
                refund, please use refund amount option instead.
              </div>
            </FormCard>
          ) : (
            <FormCard
              title="Refund amount"
              description="Refund a custom amount back to the client."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldRow label="Refund method" description="Original payment method">
                  <Select value="cash" disabled>
                    <SelectTrigger className={cn(triggerOverride, "w-full")}>
                      <span className="flex items-center gap-2">
                        <BanknoteIcon className="size-4 text-muted-foreground" />
                        <SelectValue />
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{sale.paymentMethod}</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldRow>

                <FieldRow
                  label="Refund amount"
                  htmlFor="refund-amount"
                  description={`${money(sale.availableMinor)} available to refund`}
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-medium text-muted-foreground">
                      {CURRENCY}
                    </span>
                    <Input
                      id="refund-amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      inputMode="decimal"
                      className="pl-14"
                      aria-invalid={amount !== "" && !amountValid}
                    />
                  </div>
                </FieldRow>
              </div>

              <FieldRow label="Cash refund given by" htmlFor="refund-given-by">
                <Select value={givenBy} onValueChange={setGivenBy}>
                  <SelectTrigger id="refund-given-by" className={cn(triggerOverride, "w-full")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REFUND_STAFF.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>

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
            </FormCard>
          )}
        </div>
      </div>
    </FullScreenEditDialog>
  )
}

// Bordered content card — mirrors the `FormSection` used in the add-product
// form (heading + description, separator, then a gap-5 field stack).
function FormCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
      <div className="flex flex-col gap-1 px-6 py-5">
        <h2 className="font-heading text-2xl font-semibold leading-9 text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Separator />
      <div className="flex flex-col gap-5 px-6 py-5">{children}</div>
    </div>
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
