"use client"

import {
  ChevronDownIcon,
  ChevronUpIcon,
  CoinsIcon,
  MinusIcon,
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
import { APPOINTMENTS, formatDuration, HAS_PETS, money, totals, VAT_RATE } from "./mock"
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
}

export function CartContent({
  lines,
  hasClient,
  onRemove,
  onSetQty,
  onEditLine,
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

  // Flat invoice list — every line in one card (Figma 2686-24022).
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-2">
      <ul className="flex flex-col gap-1">
        {lines.map((line) =>
          line.kind === "service" ? (
            <ServiceLineRow
              key={line.uid}
              line={line}
              subject={lineSubject(line.apptId)}
              onRemove={() => onRemove(line.uid)}
              onEdit={onEditLine ? () => onEditLine(line.uid) : undefined}
            />
          ) : (
            <ProductLineRow
              key={line.uid}
              line={line}
              onRemove={() => onRemove(line.uid)}
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
  onRemove,
  onEdit,
}: {
  line: CartLine
  subject?: string
  onRemove: () => void
  onEdit?: () => void
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
            onRemove={onRemove}
            onEdit={onEdit}
          />
        </div>
      </div>
    </li>
  )
}

// Product line — bold name with an inline quantity stepper; remove on hover.
function ProductLineRow({
  line,
  onRemove,
  onSetQty,
}: {
  line: CartLine
  onRemove: () => void
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
            <QtyStepper qty={line.qty} onChange={onSetQty} />
          </div>
          <RowActions
            value={money(line.priceMinor * line.qty)}
            name={line.name}
            onRemove={onRemove}
          />
        </div>
      </div>
    </li>
  )
}

// Bold price that swaps to round edit + remove buttons on row hover/focus.
function RowActions({
  value,
  name,
  onRemove,
  onEdit,
}: {
  value: string
  name: string
  onRemove: () => void
  onEdit?: () => void
}) {
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
  blockedReason?: string
  onContinue: () => void
  onSaveDraft: () => void
  onCancelSale: () => void
}

export function CartFooter({
  lines,
  blockedReason,
  onContinue,
  onSaveDraft,
  onCancelSale,
}: CartFooterProps) {
  const [expanded, setExpanded] = useState(false)
  const { totalMinor, subtotalMinor, taxMinor } = totals(lines)

  // Empty cart → no CTA (ticket: "Continue to payment" is hidden).
  if (lines.length === 0) return null

  return (
    <footer className="border-border border-t bg-card px-6 py-4">
      {expanded ? (
        <div className="mb-3 flex flex-col gap-2">
          <BreakdownRow label="Total amount (excl. discounts)" value={money(totalMinor)} />
          {/* Discount rows are populated by the backend and hidden when none apply. */}
          <BreakdownRow label="Subtotal" value={money(subtotalMinor)} muted />
          <BreakdownRow
            label={`Tax (VAT ${Math.round(VAT_RATE * 100)}%)`}
            value={money(taxMinor)}
            muted
          />
          <div className="mt-1 border-border/60 border-t pt-2">
            <BreakdownRow label="Total" value={money(totalMinor)} strong />
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-col gap-0.5 text-left"
          aria-expanded={expanded}
        >
          <span className="text-xs text-muted-foreground">To pay</span>
          <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
            {money(totalMinor)}
            <ChevronUpIcon
              className={cn(
                "size-3.5 text-muted-foreground transition-transform",
                expanded ? "rotate-0" : "rotate-180",
              )}
            />
          </span>
        </button>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" radius="full" className="gap-1">
                Action
                <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56">
              <DropdownMenuItem>
                <CoinsIcon className="size-4" />
                Add tip
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TagIcon className="size-4" />
                Add cart discount
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onSaveDraft}>Save as draft</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={onCancelSale}>
                Cancel sale
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex flex-col items-end gap-1">
            <Button
              type="button"
              radius="full"
              className="px-7"
              disabled={Boolean(blockedReason)}
              onClick={onContinue}
            >
              Continue to payment
            </Button>
            {blockedReason ? (
              <span className="text-xs text-destructive">{blockedReason}</span>
            ) : null}
          </div>
        </div>
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
