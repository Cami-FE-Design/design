"use client"

import {
  ChevronDownIcon,
  CoinsIcon,
  MinusIcon,
  NotebookPenIcon,
  PencilIcon,
  PlusIcon,
  ShoppingCartIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/blocks/empty-state"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  APPOINTMENTS,
  formatAedDecimal,
  formatDuration,
  HAS_PETS,
  money,
  totals,
  VAT_RATE,
} from "./mock"
import type { CartLine } from "./types"

/**
 * Subject appended to a snapshotted appointment line's meta — the pet on
 * with-pets businesses, otherwise the appointment's client. Lets one sale that
 * merges several clients' appointments show whose service each line is.
 */
function lineSubject(apptId?: string): string | undefined {
  if (!apptId) return undefined
  const appt = APPOINTMENTS.find((a) => a.id === apptId)
  if (!appt) return undefined
  return HAS_PETS ? appt.pet?.name : appt.clientName
}

// ─── Cart content ─────────────────────────────────────────────────────────────

type CartContentProps = {
  lines: CartLine[]
  hasClient: boolean
  onRemove: (uid: string) => void
  onSetQty: (uid: string, qty: number) => void
  /** Edit a service line (staff, duration). No-op placeholder until the edit panel exists. */
  onEditLine?: (uid: string) => void
  /** Read-only summary (Tip / Payment steps): no edit / remove / qty controls. */
  readOnly?: boolean
}

export function CartContent({
  lines,
  hasClient,
  onRemove,
  onSetQty,
  onEditLine,
  readOnly = false,
}: CartContentProps) {
  if (lines.length === 0) {
    return (
      <EmptyState
        className="flex-1"
        icon={ShoppingCartIcon}
        title="Your cart is empty"
        description={
          hasClient
            ? "Tap an item to add to cart"
            : "Tap an item to add to cart or add an existing client for smart recommendations"
        }
      />
    )
  }

  // Flat invoice list — every line in one card (Figma 2686-24022). Read-only on
  // the Tip / Payment steps keeps the same card, just without the row controls.
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-2">
      <ul className="flex flex-col gap-1">
        {lines.map((line) =>
          line.kind === "gift-card" ? (
            <GiftCardLineRow
              key={line.uid}
              line={line}
              onEdit={onEditLine ? () => onEditLine(line.uid) : undefined}
              onRemove={readOnly ? undefined : () => onRemove(line.uid)}
            />
          ) : line.kind === "service" ? (
            <ServiceLineRow
              key={line.uid}
              line={line}
              subject={lineSubject(line.apptId)}
              onEdit={onEditLine ? () => onEditLine(line.uid) : undefined}
              // Read-only summaries (Tip / Payment) are editable but not deletable.
              onRemove={readOnly ? undefined : () => onRemove(line.uid)}
            />
          ) : (
            <ProductLineRow
              key={line.uid}
              line={line}
              showStepper={!readOnly}
              onEdit={onEditLine ? () => onEditLine(line.uid) : undefined}
              onRemove={readOnly ? undefined : () => onRemove(line.uid)}
              onSetQty={(qty) => onSetQty(line.uid, qty)}
            />
          ),
        )}
      </ul>
    </div>
  )
}

// Service line — deep-violet accent bar, bold name, and "duration · subject"
// meta (no staff while building the cart); an edit + remove control set reveals
// on hover (Figma 2686-24022).
function ServiceLineRow({
  line,
  subject,
  onEdit,
  onRemove,
}: {
  line: CartLine
  subject?: string
  onEdit?: () => void
  onRemove?: () => void
}) {
  const meta = [line.durationMin != null ? formatDuration(line.durationMin) : null, subject]
    .filter(Boolean)
    .join(" · ")

  return (
    <li className="group/service flex gap-3 rounded-2xl px-3 py-2 transition-colors hover:bg-muted/50">
      <span aria-hidden className="w-1 shrink-0 self-stretch rounded-full bg-cami-violet-12" />
      <div className="flex min-w-0 flex-1 py-1.5">
        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <span
              className="truncate font-semibold text-base text-foreground leading-6"
              title={line.name}
            >
              {line.name}
            </span>
            {meta ? (
              <span className="truncate text-muted-foreground text-sm leading-5">{meta}</span>
            ) : null}
          </div>
          <RowActions
            value={money(line.priceMinor)}
            name={line.name}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        </div>
      </div>
    </li>
  )
}

// Product line — bold name with an inline quantity stepper (cart) or static qty.
function ProductLineRow({
  line,
  showStepper,
  onEdit,
  onRemove,
  onSetQty,
}: {
  line: CartLine
  showStepper?: boolean
  onEdit?: () => void
  onRemove?: () => void
  onSetQty: (qty: number) => void
}) {
  return (
    <li className="group/service flex gap-3 rounded-2xl px-3 py-2 transition-colors hover:bg-muted/50">
      <span aria-hidden className="w-1 shrink-0 self-stretch rounded-full bg-cami-violet-12" />
      <div className="flex min-w-0 flex-1 py-1.5">
        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <span
              className="truncate font-semibold text-base text-foreground leading-6"
              title={line.name}
            >
              {line.name}
            </span>
            {showStepper ? (
              <QtyStepper qty={line.qty} onChange={onSetQty} />
            ) : line.qty > 1 ? (
              <span className="text-muted-foreground text-sm">Qty {line.qty}</span>
            ) : null}
          </div>
          <RowActions
            value={money(line.priceMinor * line.qty)}
            name={line.name}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        </div>
      </div>
    </li>
  )
}

// Gift-card line — same violet-accent invoice row, with a "value · validity ·
// team member" meta line built from the gift-card payload.
function GiftCardLineRow({
  line,
  onEdit,
  onRemove,
}: {
  line: CartLine
  onEdit?: () => void
  onRemove?: () => void
}) {
  const gc = line.giftCard
  const meta = gc
    ? [
        `${money(gc.valueMinor)} value`,
        gc.expiration === "Never" ? "no expiry" : `valid for ${gc.expiration}`,
        gc.staffName,
      ]
        .filter(Boolean)
        .join(" · ")
    : undefined

  return (
    <li className="group/service flex gap-3 rounded-2xl px-3 py-2 transition-colors hover:bg-muted/50">
      <span aria-hidden className="w-1 shrink-0 self-stretch rounded-full bg-cami-violet-12" />
      <div className="flex min-w-0 flex-1 py-1.5">
        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-semibold text-base text-foreground leading-6">
              {line.name}
            </span>
            {meta ? (
              <span className="truncate text-muted-foreground text-sm leading-5">{meta}</span>
            ) : null}
          </div>
          <RowActions
            value={money(line.priceMinor)}
            name={line.name}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        </div>
      </div>
    </li>
  )
}

// Bold price that swaps to whichever round controls are available (edit / remove)
// on row hover/focus. With no controls it renders the price alone.
function RowActions({
  value,
  name,
  onEdit,
  onRemove,
}: {
  value: string
  name: string
  onEdit?: () => void
  onRemove?: () => void
}) {
  if (!onEdit && !onRemove) {
    return (
      <span className="shrink-0 font-semibold text-base text-foreground tabular-nums">{value}</span>
    )
  }
  return (
    <div className="relative flex shrink-0 items-center">
      <span className="font-semibold text-base text-foreground tabular-nums transition-opacity group-hover/service:invisible">
        {value}
      </span>
      <div className="absolute inset-y-0 right-0 flex items-center gap-1.5 opacity-0 transition-opacity group-focus-within/service:opacity-100 group-hover/service:opacity-100">
        {onEdit ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                radius="full"
                onClick={onEdit}
                aria-label={`Edit ${name}`}
              >
                <PencilIcon className="size-4" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
        ) : null}
        {onRemove ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                radius="full"
                onClick={onRemove}
                aria-label={`Remove ${name}`}
              >
                <Trash2Icon className="size-4" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </div>
  )
}

function QtyStepper({ qty, onChange }: { qty: number; onChange: (qty: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        radius="full"
        aria-label="Decrease quantity"
        disabled={qty <= 1}
        onClick={() => onChange(qty - 1)}
      >
        <MinusIcon className="size-3.5" />
      </Button>
      <span className="min-w-5 text-center text-sm tabular-nums text-foreground">{qty}</span>
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        radius="full"
        aria-label="Increase quantity"
        onClick={() => onChange(qty + 1)}
      >
        <PlusIcon className="size-3.5" />
      </Button>
    </div>
  )
}

// ─── Totals footer ────────────────────────────────────────────────────────────

type CartFooterProps = {
  lines: CartLine[]
  discountMinor?: number
  blockedReason?: string
  onContinue: () => void
  onAddTip: () => void
  onAddCartDiscount: () => void
  onAddSaleNote: () => void
  onSaveDraft: () => void
  onCancelSale: () => void
}

export function CartFooter({
  lines,
  discountMinor = 0,
  blockedReason,
  onContinue,
  onAddTip,
  onAddCartDiscount,
  onAddSaleNote,
  onSaveDraft,
  onCancelSale,
}: CartFooterProps) {
  const { totalMinor } = totals(lines)
  // Discount reduces the gross; To pay is the discounted total.
  const discountedMinor = Math.max(0, totalMinor - discountMinor)

  // Empty cart → no CTA (ticket: "Continue to payment" is hidden).
  if (lines.length === 0) return null

  return (
    <footer className="border-border border-t bg-card px-6 py-4">
      <div className="mb-3 flex flex-col gap-1">
        <BreakdownRow label="Total" value={formatAedDecimal(totalMinor)} muted />
        {discountMinor > 0 ? (
          <BreakdownRow label="Discount" value={`- ${formatAedDecimal(discountMinor)}`} muted />
        ) : null}
        <BreakdownRow label="To pay" value={formatAedDecimal(discountedMinor)} strong />
        {blockedReason ? <span className="text-destructive text-xs">{blockedReason}</span> : null}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" radius="full" className="gap-1">
              Action
              <ChevronDownIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuItem onSelect={onAddTip}>
              <CoinsIcon className="size-4" />
              Add tip
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onAddCartDiscount}>
              <TagIcon className="size-4" />
              Add cart discount
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onAddSaleNote}>
              <NotebookPenIcon className="size-4" />
              Add sale note
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onSaveDraft}>Save as draft</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onCancelSale}>
              Cancel sale
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          type="button"
          radius="full"
          className="flex-1"
          disabled={Boolean(blockedReason)}
          onClick={onContinue}
        >
          Continue to payment
        </Button>
      </div>
    </footer>
  )
}

// ─── Checkout footer (Tip / Payment steps) ───────────────────────────────────
//
// Shows Total + Tips + To pay stacked, plus a kebab Quick-actions menu and the
// step CTA (Continue to payment / Save unpaid).

export type Payment = {
  id: number
  method: "cash" | "card" | "gift-card" | "link"
  amountMinor: number
  receivedBy?: string
}

const METHOD_LABEL: Record<Payment["method"], string> = {
  cash: "Cash",
  card: "Card",
  "gift-card": "Gift card",
  link: "Payment link",
}

type CheckoutFooterProps = {
  baseMinor: number
  tipMinor: number
  ctaLabel: string
  onCta: () => void
  onAddTip: () => void
  onAddCartDiscount: () => void
  onAddSaleNote: () => void
  onSaveDraft: () => void
  onCancelSale: () => void
  /** Recorded payments (Payment step). When present, shows the paid breakdown. */
  payments?: Payment[]
  onRemovePayment?: (id: number) => void
}

export function CheckoutFooter({
  baseMinor,
  tipMinor,
  ctaLabel,
  onCta,
  onAddTip,
  onAddCartDiscount,
  onAddSaleNote,
  onSaveDraft,
  onCancelSale,
  payments = [],
  onRemovePayment,
}: CheckoutFooterProps) {
  const [expanded, setExpanded] = useState(true)
  const toPay = baseMinor + tipMinor
  const paid = payments.reduce((sum, p) => sum + p.amountMinor, 0)
  const left = Math.max(0, toPay - paid)
  const change = Math.max(0, paid - toPay)
  const subtotalMinor = Math.round(toPay / (1 + VAT_RATE))
  const taxMinor = toPay - subtotalMinor

  return (
    <footer className="relative border-border border-t bg-card px-6 py-4">
      {payments.length > 0 ? (
        // Paid breakdown with a centered expand/collapse handle.
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse summary" : "Expand summary"}
            aria-expanded={expanded}
            className="-top-3.5 -translate-x-1/2 absolute left-1/2 flex size-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          >
            <ChevronDownIcon
              className={cn("size-4 transition-transform", expanded ? "rotate-180" : "rotate-0")}
            />
          </button>
          <div className="mb-3 flex flex-col gap-1">
            {expanded ? (
              <>
                <BreakdownRow label="Subtotal" value={formatAedDecimal(subtotalMinor)} muted />
                <BreakdownRow
                  label={`Tax (VAT ${Math.round(VAT_RATE * 100)}%)`}
                  value={formatAedDecimal(taxMinor)}
                  muted
                />
                {tipMinor > 0 ? (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-cami-violet-11">Tips</span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatAedDecimal(tipMinor)}
                    </span>
                  </div>
                ) : null}
                <div className="border-border/60 border-t pt-1">
                  <BreakdownRow label="Total" value={formatAedDecimal(toPay)} strong />
                </div>
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 pt-1 text-sm">
                    <span className="flex items-center gap-1.5 text-foreground">
                      {METHOD_LABEL[p.method]}
                      {onRemovePayment ? (
                        <button
                          type="button"
                          onClick={() => onRemovePayment(p.id)}
                          aria-label={`Remove ${METHOD_LABEL[p.method]} payment`}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      ) : null}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      - {formatAedDecimal(p.amountMinor)}
                    </span>
                  </div>
                ))}
              </>
            ) : null}
            {change > 0 ? (
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="font-semibold text-foreground text-sm">Change</span>
                <span className="font-semibold text-foreground text-sm tabular-nums">
                  {formatAedDecimal(change)}
                </span>
              </div>
            ) : (
              <p className="pt-1 font-semibold text-foreground text-sm">
                {left === 0 ? "Full payment added" : `Left to pay · ${formatAedDecimal(left)}`}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="mb-3 flex flex-col gap-1">
          <BreakdownRow label="Total" value={formatAedDecimal(baseMinor)} muted />
          {tipMinor > 0 ? (
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-cami-violet-11">Tips</span>
              <span className="text-muted-foreground tabular-nums">
                {formatAedDecimal(tipMinor)}
              </span>
            </div>
          ) : null}
          <BreakdownRow label="To pay" value={formatAedDecimal(toPay)} strong />
        </div>
      )}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" radius="full" className="gap-1">
              Action
              <ChevronDownIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuItem onSelect={onAddTip}>
              <CoinsIcon className="size-4" />
              Add tip
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onAddCartDiscount}>
              <TagIcon className="size-4" />
              Add cart discount
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onAddSaleNote}>
              <NotebookPenIcon className="size-4" />
              Add sale note
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onSaveDraft}>Save as draft</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onCancelSale}>
              Cancel sale
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button type="button" radius="full" className="flex-1" onClick={onCta}>
          {ctaLabel}
        </Button>
      </div>
    </footer>
  )
}

function BreakdownRow({
  label,
  value,
  muted,
  strong,
}: {
  label: string
  value: string
  muted?: boolean
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span
        className={cn(
          muted ? "text-muted-foreground" : "text-foreground",
          strong && "font-semibold",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          muted ? "text-muted-foreground" : "text-foreground",
          strong && "font-semibold",
        )}
      >
        {value}
      </span>
    </div>
  )
}
