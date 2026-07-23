"use client"

// Percent / fixed-AED amount input used for the deposit and no-show fee
// (Fresha parity: numeric field with a coins/% segmented toggle beside it).

import { CoinsIcon, PercentIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import type { AmountMode, AmountValue } from "@/lib/payment-policy/types"
import { cn } from "@/lib/utils"

type AmountInputProps = {
  value: AmountValue
  onChange: (next: AmountValue) => void
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export function AmountInput({ value, onChange, disabled, className, ariaLabel }: AmountInputProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-medium text-muted-foreground">
          {value.mode === "percent" ? "%" : "AED"}
        </span>
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          max={value.mode === "percent" ? 100 : undefined}
          value={Number.isFinite(value.value) ? value.value : ""}
          disabled={disabled}
          aria-label={ariaLabel ?? "Amount"}
          // Field styling matches the settings takeovers (h-12 rounded-2xl bg-input).
          className={cn(
            "h-12 rounded-2xl bg-input px-4 font-medium",
            value.mode === "percent" ? "pl-9" : "pl-14",
          )}
          onChange={(e) => {
            const raw = Number(e.target.value)
            const next = Number.isFinite(raw) ? Math.max(0, raw) : 0
            onChange({
              ...value,
              // Percent is capped 0–100 per the ticket; fixed AED is open-ended.
              value: value.mode === "percent" ? Math.min(100, next) : next,
            })
          }}
        />
      </div>
      <SegmentedToggle<AmountMode>
        value={value.mode}
        disabled={disabled}
        ariaLabel="Amount type"
        options={[
          { value: "fixed", label: <CoinsIcon className="size-4" aria-label="Fixed amount" /> },
          { value: "percent", label: <PercentIcon className="size-4" aria-label="Percentage" /> },
        ]}
        onValueChange={(mode) => {
          if (mode === value.mode) return
          // Reset to a sensible value when switching modes so a 950 AED fee
          // doesn't become 950%.
          onChange({ mode, value: mode === "percent" ? Math.min(100, value.value) : value.value })
        }}
      />
    </div>
  )
}
