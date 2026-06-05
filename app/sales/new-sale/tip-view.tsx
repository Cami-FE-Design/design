"use client"

import { PlusCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAedDecimal } from "./mock"

const PRESETS = [
  { id: "0", label: "No tip", pct: 0 },
  { id: "10", label: "10%", pct: 10 },
  { id: "18", label: "18%", pct: 18 },
  { id: "25", label: "25%", pct: 25 },
  { id: "35", label: "35%", pct: 35 },
  { id: "45", label: "45%", pct: 45 },
] as const

/** Tip amount (fils) for a preset id against the cart base. */
export function tipForPreset(id: string, baseMinor: number): number {
  const preset = PRESETS.find((p) => p.id === id)
  return preset ? Math.round((baseMinor * preset.pct) / 100) : 0
}

type TipViewProps = {
  baseMinor: number
  firstName: string
  /** "0".."45" preset id, or "custom". */
  selectedId: string
  onSelect: (id: string) => void
  /** Open the custom-tip numpad modal. */
  onOpenCustom: () => void
}

export function TipView({
  baseMinor,
  firstName,
  selectedId,
  onSelect,
  onOpenCustom,
}: TipViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-semibold text-2xl text-foreground leading-8">
          Select tip
        </h1>
        <p className="text-muted-foreground text-sm">Select an amount for {firstName}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {PRESETS.map((preset) => {
          const amount = Math.round((baseMinor * preset.pct) / 100)
          const active = selectedId === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-2xl border bg-card px-4 py-8 text-center transition-colors",
                active
                  ? "-outline-offset-2 border-transparent bg-cami-violet-3 outline-2 outline-cami-violet-8"
                  : "border-border hover:bg-muted/40",
              )}
            >
              <span className="font-semibold text-base text-foreground">{preset.label}</span>
              {preset.pct > 0 ? (
                <span className="text-muted-foreground text-sm">{formatAedDecimal(amount)}</span>
              ) : null}
            </button>
          )
        })}

        <button
          type="button"
          onClick={onOpenCustom}
          className={cn(
            "flex flex-col items-center justify-center gap-1 rounded-2xl border bg-card px-4 py-8 text-center transition-colors",
            selectedId === "custom"
              ? "-outline-offset-2 border-transparent bg-cami-violet-3 outline-2 outline-cami-violet-8"
              : "border-border hover:bg-muted/40",
          )}
        >
          <PlusCircleIcon className="size-5 text-foreground" />
          <span className="font-semibold text-base text-foreground">Custom tip</span>
        </button>
      </div>
    </div>
  )
}
