"use client"

import { PlusCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const PRESETS = [
  { id: "0", label: "No tip", aed: 0 },
  { id: "5", label: "AED 5", aed: 5 },
  { id: "10", label: "AED 10", aed: 10 },
  { id: "20", label: "AED 20", aed: 20 },
  { id: "30", label: "AED 30", aed: 30 },
  { id: "50", label: "AED 50", aed: 50 },
] as const

/** Fixed tip amount (fils) for a preset id. */
export function tipForPreset(id: string): number {
  const preset = PRESETS.find((p) => p.id === id)
  return preset ? preset.aed * 100 : 0
}

type TipViewProps = {
  firstName: string
  /** Preset id ("0" / "5" / …), or "custom". */
  selectedId: string
  onSelect: (id: string) => void
  /** Open the custom-tip numpad modal. */
  onOpenCustom: () => void
}

export function TipView({ firstName, selectedId, onSelect, onOpenCustom }: TipViewProps) {
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
          const active = selectedId === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.id)}
              className={cn(
                "flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border bg-card px-4 text-center transition-colors",
                active
                  ? "-outline-offset-2 border-transparent bg-cami-violet-3 outline-2 outline-cami-violet-8"
                  : "border-border hover:bg-muted/40",
              )}
            >
              <span className="font-semibold text-base text-foreground">{preset.label}</span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={onOpenCustom}
          className={cn(
            "flex h-28 flex-col items-center justify-center gap-1 rounded-2xl border bg-card px-4 text-center transition-colors",
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
