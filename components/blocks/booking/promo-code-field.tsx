"use client"

/**
 * "Have a promo code?" on the booking review step (DZ-352, DZ-200 §5.4B).
 *
 * Sits after phone verification on purpose: a one-use-per-client code can only
 * be checked once we know who the client is, and asking for a code before
 * that would mean accepting it and refusing it a step later.
 *
 * A booking may carry more than one code, one promotion per line (D6), the
 * way the calendar takes a different promotion on each item. Each applied code
 * is its own card; "Add another code" opens the field again.
 *
 * The field holds what the client is typing; the flow holds the codes that
 * were applied and re-checks them on every render. So if the client goes back
 * and swaps the groom for a combo, they come back to the code still named,
 * with the reason it no longer applies — never a discount that silently
 * vanished.
 */

import { Loader2Icon, TicketPercentIcon, XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDiscountValue } from "@/lib/deals/mock"
import {
  type BookingCodeCheck,
  type BookingPromoRefusal,
  type BookingPromoResult,
  normalizeCode,
} from "@/lib/deals/online"
import { formatAed } from "@/lib/format"
import { formatMoney } from "@/lib/money/format"

/**
 * `AED 39` when there are no fils, `AED 5.25` when there are. The booking flow
 * prices in whole AED, so a promo amount shows fils only when it has some —
 * "AED 221.00" next to "AED 260" reads as two different systems.
 */
export function formatPromoMoney(minor: number): string {
  return minor % 100 === 0 ? formatAed(minor / 100) : formatMoney(minor)
}

/** Long enough to read as a check, short enough not to feel like a wait. */
const CHECK_MS = 600

export function PromoCodeField({
  applied,
  onApply,
  onRemove,
  canAddAnother = true,
  rechecking = false,
  defaultOpen = false,
  defaultCode = "",
  defaultRefusal = null,
  defaultChecking = false,
}: {
  /** The applied codes, in the order entered, re-checked against the booking as it stands now. */
  applied: ReadonlyArray<BookingCodeCheck>
  /** Check a code. The flow stores it only when the answer is yes. */
  onApply: (code: string) => BookingPromoResult
  onRemove: (code: string) => void
  /**
   * Whether another code could take anything off. False once every line that
   * can be discounted already is, so the client is not offered a field that
   * can only answer "already covered".
   */
  canAddAnother?: boolean
  /**
   * The applied codes are being checked again because the booking changed.
   * Each card says so in place of its amount, until the answer is back.
   */
  rechecking?: boolean
  /** Playground seams — open on a typed code, an error, or mid-check. */
  defaultOpen?: boolean
  defaultCode?: string
  defaultRefusal?: BookingPromoRefusal | null
  defaultChecking?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [draft, setDraft] = useState(defaultCode)
  const [checking, setChecking] = useState(defaultChecking)
  const [refusal, setRefusal] = useState<BookingPromoRefusal | null>(defaultRefusal)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  function apply() {
    const code = normalizeCode(draft)
    if (!code || checking) return
    setChecking(true)
    setRefusal(null)
    timer.current = setTimeout(() => {
      setChecking(false)
      const result = onApply(code)
      if (result.ok) {
        setDraft("")
        setOpen(false)
      } else {
        setRefusal(result.refusal)
      }
    }, CHECK_MS)
  }

  function remove(code: string) {
    onRemove(code)
    // Taking the only code off leaves the field open and empty, ready for
    // another; taking one of several leaves the rest as they were.
    if (applied.length === 1) {
      setDraft("")
      setRefusal(null)
      setOpen(true)
    }
  }

  const hasCodes = applied.length > 0

  return (
    <div className="flex flex-col gap-2">
      {applied.map((check) =>
        rechecking ? (
          <CheckingCard key={check.code} code={check.code} />
        ) : check.result.ok ? (
          <AppliedCard key={check.code} check={check} onRemove={() => remove(check.code)} />
        ) : (
          <NoLongerAppliesCard
            key={check.code}
            code={check.code}
            refusal={check.result.refusal}
            onRemove={() => remove(check.code)}
          />
        ),
      )}

      {rechecking ? null : open ? (
        <form
          className="flex flex-col gap-1.5"
          onSubmit={(e) => {
            e.preventDefault()
            apply()
          }}
        >
          <Label htmlFor="promo-code">Promo code</Label>
          <div className="flex gap-2">
            <Input
              id="promo-code"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value.toUpperCase())
                if (refusal) setRefusal(null)
              }}
              placeholder="Enter code"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={20}
              disabled={checking}
              aria-invalid={refusal ? true : undefined}
              aria-describedby={refusal ? "promo-code-error" : undefined}
              className="flex-1 font-medium tracking-wide"
            />
            <Button
              type="submit"
              variant="outline"
              radius="full"
              size="lg"
              disabled={!normalizeCode(draft) || checking}
              className="min-w-24"
            >
              {checking ? (
                <Loader2Icon className="size-4 animate-spin" aria-label="Checking" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>
          {refusal ? (
            <div id="promo-code-error" className="flex flex-col gap-0.5">
              <p role="alert" className="text-sm font-medium text-destructive">
                {refusal.message}
              </p>
              {refusal.detail ? (
                <p className="text-sm text-muted-foreground">{refusal.detail}</p>
              ) : null}
            </div>
          ) : null}
        </form>
      ) : !hasCodes || canAddAnother ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 self-start py-1 text-sm font-medium text-foreground hover:opacity-70"
        >
          <TicketPercentIcon className="size-4 text-muted-foreground" aria-hidden />
          {hasCodes ? "Add another code" : "Have a promo code?"}
        </button>
      ) : null}
    </div>
  )
}

function AppliedCard({ check, onRemove }: { check: BookingCodeCheck; onRemove: () => void }) {
  if (!check.result.ok) return null
  const { promo } = check.result
  const partial = promo.coveredLines < promo.totalLines
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-cami-green-3 px-4 py-3">
      <TicketPercentIcon className="size-5 shrink-0 text-cami-green-11" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-sm font-semibold text-foreground">
          {promo.code} <span className="font-normal text-cami-green-11">applied</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {[
            promo.deal.name,
            // Owners often put the value in the name ("Spa add-ons 20% off");
            // saying it twice reads as a mistake.
            promo.deal.name.includes(formatDiscountValue(promo.deal))
              ? null
              : `${formatDiscountValue(promo.deal)} off`,
            partial ? `applies to ${promo.coveredLines} of ${promo.totalLines} services` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>
      <span className="shrink-0 text-sm font-medium tabular-nums text-cami-green-11">
        - {formatPromoMoney(promo.discountMinor)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${promo.code}`}
        className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-cami-green-4"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  )
}

/** A code being checked again after the booking changed — no amount until it is back. */
function CheckingCard({ code }: { code: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-muted/50 px-4 py-3" aria-busy="true">
      <TicketPercentIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
        {code} <span className="font-normal text-muted-foreground">checking</span>
      </span>
      <Loader2Icon className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
    </div>
  )
}

/**
 * Applied earlier, no longer good — the booking changed under it, or the
 * promotion did. Named, with the reason, and the total already shows the
 * full price.
 */
function NoLongerAppliesCard({
  code,
  refusal,
  onRemove,
}: {
  code: string
  refusal: BookingPromoRefusal
  onRemove: () => void
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-muted/50 px-4 py-3">
      <TicketPercentIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
        <span className="text-sm font-semibold text-foreground">
          {code} <span className="font-normal text-muted-foreground">no longer applies</span>
        </span>
        <span role="alert" className="text-sm font-medium text-destructive">
          {refusal.message}
        </span>
        {refusal.detail ? (
          <span className="text-sm text-muted-foreground">{refusal.detail}</span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${code}`}
        className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  )
}
