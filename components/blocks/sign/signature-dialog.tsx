"use client"

import { PenLineIcon, XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import { cn } from "@/lib/utils"

// Scripted preview / signed-block font — matches the operator-side consent view
// (documents-files-card) so a typed signature looks the same everywhere.
const SCRIPT_FONT = "font-['Segoe_Script','Snell_Roundhand','Brush_Script_MT',cursive]"

type SignatureMode = "type" | "draw"

export type SignatureResult = {
  fullName: string
  title: string
  mode: SignatureMode
  /** PNG data URL of the drawn strokes — present only when `mode === "draw"`. */
  drawingDataUrl?: string
  /** Millisecond-timestamp id, printed under the signature. */
  signatureId: string
}

type SignatureDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Business name shown as the label above the framed signature. */
  businessName: string
  /** Pre-fill the full name (e.g. the recipient on file). */
  defaultFullName?: string
  onSign: (result: SignatureResult) => void
}

export function SignatureDialog({
  open,
  onOpenChange,
  businessName,
  defaultFullName = "",
  onSign,
}: SignatureDialogProps) {
  const [fullName, setFullName] = useState(defaultFullName)
  const [title, setTitle] = useState("")
  const [mode, setMode] = useState<SignatureMode>("type")
  const [signatureId, setSignatureId] = useState("")
  const [hasInk, setHasInk] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)

  // Fresh state + a new signature id every time the dialog opens.
  useEffect(() => {
    if (!open) return
    setFullName(defaultFullName)
    setTitle("")
    setMode("type")
    setHasInk(false)
    setSignatureId(String(Date.now()))
  }, [open, defaultFullName])

  // Size the canvas to its box (with devicePixelRatio) whenever the Draw tab
  // becomes visible, and prime the stroke style from the resolved text color so
  // it follows the theme.
  useEffect(() => {
    if (!open || mode !== "draw") return
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = getComputedStyle(canvas).color
  }, [open, mode])

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function startStroke(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drawingRef.current = true
    const { x, y } = pointerPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function moveStroke(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const { x, y } = pointerPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    if (!hasInk) setHasInk(true)
  }

  function endStroke() {
    drawingRef.current = false
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasInk(false)
  }

  const trimmedName = fullName.trim()
  const canSign = trimmedName !== "" && (mode === "type" || hasInk)

  function handleSign() {
    if (!canSign) return
    onSign({
      fullName: trimmedName,
      title: title.trim(),
      mode,
      drawingDataUrl: mode === "draw" ? canvasRef.current?.toDataURL("image/png") : undefined,
      signatureId,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 px-0 pt-0 pb-0 sm:max-w-[640px]">
        <div className="flex items-start justify-between gap-4 px-8 pt-8">
          <DialogTitle className="text-[26px] leading-8 font-semibold">Add a signature</DialogTitle>
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
        <DialogDescription className="sr-only">
          Enter your name and either type or draw your signature, then sign to complete the form.
        </DialogDescription>

        <div className="flex flex-col gap-6 px-8 pt-7 pb-8">
          {/* Name + title */}
          <div className="grid grid-cols-2 gap-4">
            <label htmlFor="sig-full-name" className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">Full name</span>
              <Input
                id="sig-full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </label>
            <label htmlFor="sig-title" className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">Title</span>
              <Input
                id="sig-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Therapist"
                autoComplete="off"
              />
            </label>
          </div>

          {/* Type / Draw switch — full-width segmented control */}
          <SegmentedToggle
            className="flex w-full [&>button]:h-10 [&>button]:flex-1 [&>button]:text-sm"
            ariaLabel="Signature input method"
            value={mode}
            onValueChange={(v) => setMode(v as SignatureMode)}
            options={[
              { value: "type", label: "Type" },
              { value: "draw", label: "Draw" },
            ]}
          />

          {mode === "type" ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground">Preview</span>
              <div className="rounded-2xl border border-border/60 px-5 py-5">
                <SignaturePreview
                  businessName={businessName}
                  fullName={trimmedName}
                  signatureId={signatureId}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Draw your signature here
                </span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="link text-sm font-medium text-destructive"
                >
                  Clear
                </button>
              </div>
              <canvas
                ref={canvasRef}
                onPointerDown={startStroke}
                onPointerMove={moveStroke}
                onPointerUp={endStroke}
                onPointerLeave={endStroke}
                className="h-44 w-full touch-none rounded-2xl border border-border/60 text-foreground"
              />
            </div>
          )}

          <p className="text-xs leading-5 text-muted-foreground">
            This document is completed as part of and is subject to the{" "}
            <a href="#terms" className="text-cami-violet-11 underline underline-offset-2">
              Terms of Service
            </a>
            . By signing it with an electronic signature, you agree that such signature will be as
            valid as handwritten signatures and considered originals to the extent allowed by
            applicable law.
          </p>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              radius="full"
              size="lg"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" radius="full" size="lg" disabled={!canSign} onClick={handleSign}>
              <PenLineIcon className="size-4" />
              Sign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * The framed, scripted signature block — a "[" bracket gutter with the business
 * label above, the scripted name inside, and the Signature ID beneath. Shared
 * by the Type preview here and the signed-state block in the signer flow.
 */
export function SignaturePreview({
  businessName,
  fullName,
  signatureId,
  drawingDataUrl,
  className,
}: {
  businessName: string
  fullName: string
  signatureId: string
  /** When present, the drawn strokes replace the scripted name. */
  drawingDataUrl?: string
  className?: string
}) {
  return (
    <div className={cn("w-fit", className)}>
      <span className="mb-1 block pl-10 text-sm font-semibold leading-none text-foreground">
        {businessName}
      </span>
      <div className="relative min-w-60 pl-10">
        <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-foreground" />
        <span aria-hidden className="absolute top-0 left-0 h-px w-10 bg-foreground" />
        <span aria-hidden className="absolute bottom-0 left-0 h-px w-10 bg-foreground" />
        {drawingDataUrl ? (
          // biome-ignore lint/performance/noImgElement: user-drawn data URL, not a static asset
          <img
            src={drawingDataUrl}
            alt={`${fullName || "Signer"}'s signature`}
            className="my-1 h-14 w-auto object-contain"
          />
        ) : (
          <span className={cn("block py-1 text-4xl leading-tight text-foreground", SCRIPT_FONT)}>
            {fullName || " "}
          </span>
        )}
      </div>
      <span className="mt-1 block pl-10 text-xs text-muted-foreground">
        Signature ID: {signatureId}
      </span>
    </div>
  )
}
