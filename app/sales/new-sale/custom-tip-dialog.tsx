"use client"

import { CoinsIcon, DeleteIcon, PercentIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { formatAedDecimal } from "./mock"

type Mode = "amount" | "percent"

type CustomTipDialogProps = {
  open: boolean
  baseMinor: number
  onOpenChange: (open: boolean) => void
  onApply: (tipMinor: number) => void
}

export function CustomTipDialog({ open, baseMinor, onOpenChange, onApply }: CustomTipDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col gap-5 sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <TipBody baseMinor={baseMinor} onApply={onApply} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function TipBody({
  baseMinor,
  onApply,
  onClose,
}: {
  baseMinor: number
  onApply: (tipMinor: number) => void
  onClose: () => void
}) {
  const [mode, setMode] = useState<Mode>("amount")
  const [entry, setEntry] = useState("")

  const entryNum = Number.parseFloat(entry) || 0
  const tipMinor =
    mode === "amount" ? Math.round(entryNum * 100) : Math.round((baseMinor * entryNum) / 100)
  const pct = baseMinor > 0 ? (tipMinor / baseMinor) * 100 : 0

  function press(key: string) {
    setEntry((prev) => {
      if (key === "del") return prev.slice(0, -1)
      if (key === ".") return prev.includes(".") ? prev : prev === "" ? "0." : `${prev}.`
      // Cap to 2 decimals.
      if (prev.includes(".") && prev.split(".")[1]?.length >= 2) return prev
      return prev === "0" ? key : prev + key
    })
  }

  function apply() {
    onApply(tipMinor)
    onClose()
  }

  // Keyboard input — digits, ".", backspace, Enter to apply.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") {
        press(e.key)
      } else if (e.key === ".") {
        press(".")
      } else if (e.key === "Backspace") {
        press("del")
      } else if (e.key === "Enter") {
        if (tipMinor > 0) apply()
      } else {
        return
      }
      e.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"]
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <DialogTitle className="font-heading font-semibold text-xl">Add a tip</DialogTitle>
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label="Close"
            className="text-muted-foreground"
          >
            <XIcon className="size-5" />
          </Button>
        </DialogClose>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="border-border border-b pb-2 text-center">
          <span className="font-heading font-semibold text-4xl text-foreground tabular-nums">
            {mode === "amount" ? (
              <>
                <span className="text-muted-foreground">AED </span>
                {entry || "0"}
              </>
            ) : (
              <>
                {entry || "0"} <span className="text-muted-foreground">%</span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-muted p-1">
          <ToggleBtn active={mode === "amount"} onClick={() => setMode("amount")} label="Amount">
            <CoinsIcon className="size-4" />
          </ToggleBtn>
          <ToggleBtn active={mode === "percent"} onClick={() => setMode("percent")} label="Percent">
            <PercentIcon className="size-4" />
          </ToggleBtn>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            className="flex h-14 items-center justify-center rounded-full border border-border font-semibold text-foreground text-lg transition-colors hover:bg-muted/50"
          >
            {key === "del" ? <DeleteIcon className="size-5" aria-label="Backspace" /> : key}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-muted-foreground text-sm">
          {mode === "amount"
            ? `${pct.toFixed(2).replace(/\.?0+$/, "")}% tip`
            : `${formatAedDecimal(tipMinor)} tip`}
        </span>
        <Button
          type="button"
          radius="full"
          className="px-8"
          disabled={tipMinor <= 0}
          onClick={apply}
        >
          Add
        </Button>
      </div>
    </>
  )
}

function ToggleBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
      )}
    >
      {children}
    </button>
  )
}
