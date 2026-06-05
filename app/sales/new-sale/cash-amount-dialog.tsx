"use client"

import { ArrowLeftIcon, CheckIcon, DeleteIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { formatAedDecimal, STAFF } from "./mock"

type CashAmountDialogProps = {
  open: boolean
  /** Outstanding amount to cover, in fils. */
  toPayMinor: number
  onOpenChange: (open: boolean) => void
  onApply: (amountMinor: number, receivedBy: string) => void
}

export function CashAmountDialog({
  open,
  toPayMinor,
  onOpenChange,
  onApply,
}: CashAmountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col gap-5 sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <CashBody toPayMinor={toPayMinor} onApply={onApply} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function CashBody({
  toPayMinor,
  onApply,
  onClose,
}: {
  toPayMinor: number
  onApply: (amountMinor: number, receivedBy: string) => void
  onClose: () => void
}) {
  // Prefill with the outstanding amount.
  const [entry, setEntry] = useState((toPayMinor / 100).toString())
  const [receivedBy, setReceivedBy] = useState(STAFF[1].name)
  const [stage, setStage] = useState<"amount" | "member">("amount")

  const amountMinor = Math.round((Number.parseFloat(entry) || 0) * 100)
  const leftMinor = Math.max(0, toPayMinor - amountMinor)
  // Exact, then rounded up to common UAE notes (10 / 20 / 50 / 100 / 500).
  const base = Math.ceil(toPayMinor / 100)
  const chips = Array.from(
    new Set([base, ...[10, 20, 50, 100, 500].map((note) => Math.ceil(base / note) * note)]),
  ).sort((a, b) => a - b)

  function press(key: string) {
    setEntry((prev) => {
      if (key === "del") return prev.slice(0, -1)
      if (key === ".") return prev.includes(".") ? prev : prev === "" ? "0." : `${prev}.`
      if (prev.includes(".") && prev.split(".")[1]?.length >= 2) return prev
      return prev === "0" ? key : prev + key
    })
  }

  function apply() {
    if (amountMinor > 0) {
      onApply(amountMinor, receivedBy)
      onClose()
    }
  }

  useEffect(() => {
    if (stage !== "amount") return
    function onKey(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") press(e.key)
      else if (e.key === ".") press(".")
      else if (e.key === "Backspace") press("del")
      else if (e.key === "Enter") apply()
      else return
      e.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  // ─── Team-member picker stage ────────────────────────────────────────────
  if (stage === "member") {
    const members = STAFF.filter((s) => s.id !== "any")
    const others = members.filter((s) => s.name !== receivedBy)
    return (
      <>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              radius="full"
              aria-label="Back"
              onClick={() => setStage("amount")}
            >
              <ArrowLeftIcon className="size-5" />
            </Button>
            <DialogTitle className="font-heading font-semibold text-xl">Team member</DialogTitle>
          </div>
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

        <div className="-mx-1 flex max-h-96 flex-col gap-1 overflow-y-auto px-1">
          <p className="px-2 py-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Team members in this sale
          </p>
          <MemberRow name={receivedBy} selected onClick={() => setStage("amount")} />
          <div className="my-1 border-border/60 border-t" />
          <p className="px-2 py-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Other team members
          </p>
          {others.map((s) => (
            <MemberRow
              key={s.id}
              name={s.name}
              onClick={() => {
                setReceivedBy(s.name)
                setStage("amount")
              }}
            />
          ))}
        </div>
      </>
    )
  }

  const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"]
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <DialogTitle className="font-heading font-semibold text-xl">Add cash amount</DialogTitle>
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

      <div className="border-border border-b pb-2 text-center">
        <span className="font-heading font-semibold text-4xl text-foreground tabular-nums">
          <span className="text-muted-foreground">AED </span>
          {entry || "0"}
        </span>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setEntry(String(chip))}
            className="shrink-0 rounded-full border border-border px-4 py-1.5 font-medium text-foreground text-sm transition-colors hover:bg-muted/50"
          >
            AED {chip}
          </button>
        ))}
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

      <p className="text-muted-foreground text-sm">
        Cash received by ·{" "}
        <button
          type="button"
          onClick={() => setStage("member")}
          className="font-medium text-cami-violet-11 hover:underline"
        >
          {receivedBy}
        </button>
      </p>

      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-foreground text-sm">
          Left to pay · {formatAedDecimal(leftMinor)}
        </span>
        <Button
          type="button"
          radius="full"
          className="px-8"
          disabled={amountMinor <= 0}
          onClick={apply}
        >
          Add
        </Button>
      </div>
    </>
  )
}

function MemberRow({
  name,
  selected,
  onClick,
}: {
  name: string
  selected?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/60"
    >
      <Avatar name={name} hashSeed={name} fallback="initials" size="md" />
      <span className="min-w-0 flex-1 truncate font-medium text-foreground text-sm">{name}</span>
      {selected ? <CheckIcon className="size-5 shrink-0 text-foreground" /> : null}
    </button>
  )
}
