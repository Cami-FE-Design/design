"use client"

import { CheckIcon, ClockIcon, Loader2Icon, PenLineIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { PdfViewer } from "@/components/blocks/pdf-viewer-lazy"
import { PublicTopGradient } from "@/components/blocks/public-top-gradient"
import { SignaturePreview } from "@/components/blocks/sign/signature-dialog"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OtpInput } from "@/components/ui/otp-input"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import { Switch } from "@/components/ui/switch"
import { buildConsentPdfUrl } from "@/lib/mock-pdf"
import type { SignableForm } from "@/lib/signable-form"
import { cn } from "@/lib/utils"

const RESEND_SECONDS = 30
const CODE_LENGTH = 6

type Phase = "verify" | "review" | "completed"
type VerifyState = "idle" | "verifying" | "success" | "error"

export function SignFormFlow({ form }: { form: SignableForm }) {
  // Each seeded state lands the flow on the matching screen so every state is
  // reachable from a URL: a pre-signed link skips OTP into the read-only review;
  // completed is terminal; awaiting starts at OTP verify.
  const [phase, setPhase] = useState<Phase>(() => {
    switch (form.state) {
      case "completed":
        return "completed"
      case "signed":
        return "review"
      default:
        return "verify"
    }
  })

  if (phase === "completed") {
    return (
      <TerminalShell
        tone="success"
        title="Form completed"
        body={`Thanks, ${form.recipientName.split(" ")[0]}. Your signed ${form.formName} has been sent back to ${form.businessName}. You can close this window.`}
      />
    )
  }

  if (phase === "verify") {
    return <VerifyStep form={form} onVerified={() => setPhase("review")} />
  }

  // ── Review + inline signing ────────────────────────────────────────────────
  return (
    <ReviewStep
      form={form}
      alreadySigned={form.state === "signed"}
      onComplete={() => setPhase("completed")}
    />
  )
}

// ─── Step 1 — OTP verification ──────────────────────────────────────────────

function VerifyStep({ form, onVerified }: { form: SignableForm; onVerified: () => void }) {
  const [code, setCode] = useState("")
  const [state, setState] = useState<VerifyState>("idle")
  const [seconds, setSeconds] = useState(RESEND_SECONDS)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  useEffect(() => {
    if (code.length !== CODE_LENGTH) return
    let cancelled = false
    setState("verifying")
    const t = setTimeout(() => {
      if (cancelled) return
      // Demo: any code beginning with "0" fails; everything else verifies.
      if (code.startsWith("0")) {
        setState("error")
        setCode("")
        wrapperRef.current?.classList.remove("animate-shake")
        void wrapperRef.current?.offsetWidth
        wrapperRef.current?.classList.add("animate-shake")
      } else {
        setState("success")
        setTimeout(() => !cancelled && onVerified(), 600)
      }
    }, 1200)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [code, onVerified])

  function handleChange(next: string) {
    if (state === "verifying" || state === "success") return
    if (state === "error") setState("idle")
    setCode(next)
  }

  const locked = state === "verifying" || state === "success"

  return (
    <PublicShell>
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center gap-8 py-10">
        <BusinessMark form={form} />
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Verify it&apos;s you
          </h1>
          <p className="text-sm text-muted-foreground">
            {form.businessName} sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{form.recipientEmailMasked}</span>. Enter
            it to open the {form.formName}.
          </p>
        </div>

        <div ref={wrapperRef} className="flex flex-col items-center gap-3">
          <OtpInput
            value={code}
            onValueChange={handleChange}
            disabled={locked}
            invalid={state === "error"}
          />
          <div className="flex h-5 items-center justify-center text-sm">
            {state === "verifying" ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
                Verifying…
              </span>
            ) : state === "success" ? (
              <span className="flex items-center gap-2 font-medium text-foreground">
                <CheckIcon className="size-4" aria-hidden />
                Verified
              </span>
            ) : state === "error" ? (
              <span role="alert" className="text-destructive">
                That code didn&apos;t match. Try again.
              </span>
            ) : null}
          </div>
        </div>

        <Button
          variant="secondary"
          size="lg"
          radius="full"
          className={cn("w-full", locked && "invisible")}
          disabled={seconds > 0}
          onClick={() => {
            setSeconds(RESEND_SECONDS)
            setCode("")
            setState("idle")
          }}
        >
          {seconds > 0 ? (
            <>
              Request a new code in{" "}
              <strong className="font-medium tabular-nums">
                0:{String(seconds).padStart(2, "0")}
              </strong>
            </>
          ) : (
            "Request a new code"
          )}
        </Button>
      </div>
    </PublicShell>
  )
}

// ─── Step 2 — Review + inline signing ───────────────────────────────────────

const SCRIPT_FONT = "font-['Segoe_Script','Snell_Roundhand','Brush_Script_MT',cursive]"

/** Lenient email check — good enough to gate the demo Sign button. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/**
 * The signing surface: the document as a real PDF on the left, and an inline
 * signing panel on the right — no modal. The recipient fills their legal name +
 * email, types or draws a signature, agrees to the terms, and signs in place.
 * A pre-signed link lands here in a read-only "signed" state.
 */
function ReviewStep({
  form,
  alreadySigned,
  onComplete,
}: {
  form: SignableForm
  alreadySigned: boolean
  onComplete: () => void
}) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  // Inline signing state. Email is pre-filled from the recipient the form was
  // sent to and locked — it identifies who the link belongs to, not free input.
  const [fullName, setFullName] = useState("")
  const email = form.recipientEmail
  const [mode, setMode] = useState<"type" | "draw">("type")
  const [hasInk, setHasInk] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [signatureId] = useState(() => "1783452707055")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)

  // Build the embedded PDF client-side, then revoke the object URL on unmount.
  useEffect(() => {
    let cancelled = false
    let built: string | null = null
    buildConsentPdfUrl(form.documentTitle, form.statements).then((url) => {
      if (cancelled) {
        URL.revokeObjectURL(url)
        return
      }
      built = url
      setPdfUrl(url)
    })
    return () => {
      cancelled = true
      if (built) URL.revokeObjectURL(built)
    }
  }, [form.documentTitle, form.statements])

  // Size the draw canvas to its box (accounting for DPR) and prime the stroke
  // style from the resolved text colour whenever Draw becomes visible.
  useEffect(() => {
    if (mode !== "draw") return
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
  }, [mode])

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
  const hasSignature = mode === "type" ? trimmedName !== "" : hasInk
  const canSign = trimmedName !== "" && looksLikeEmail(email) && hasSignature && agreed

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      {/* No close/dismiss on the public signer — the recipient just fills and
          signs. Body: on desktop the only scroll surface is the PDF viewer. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 lg:overflow-hidden lg:px-10">
        <div className="mx-auto grid w-full max-w-[960px] gap-6 lg:h-full lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          {/* Left — the document */}
          {pdfUrl ? (
            <PdfViewer file={pdfUrl} className="h-[70vh] max-h-none lg:h-full" />
          ) : (
            <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-border/60 bg-muted/30 text-sm text-muted-foreground lg:h-full">
              <Loader2Icon className="mr-2 size-4 animate-spin" aria-hidden />
              Loading document…
            </div>
          )}

          {/* Right — the signing card (full height, matching the View form). */}
          <aside className="flex min-h-0 flex-col gap-6 overflow-y-auto rounded-2xl bg-card p-6 shadow-md ring-1 ring-foreground/5 lg:h-full lg:p-8 dark:ring-foreground/10">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Sign the {form.formName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {alreadySigned
                  ? "This form has already been signed."
                  : "Please provide your full legal name."}
              </p>
            </div>

            {alreadySigned ? (
              <div className="flex flex-col gap-4">
                <span className="flex w-fit items-center gap-1.5 rounded-full bg-cami-green-3 px-3 py-1 text-sm font-medium text-cami-green-11">
                  <CheckIcon className="size-4" />
                  Signed
                </span>
                <SignaturePreview
                  businessName="Cami"
                  fullName={form.recipientName}
                  signatureId={signatureId}
                />
                <p className="text-sm text-muted-foreground">
                  Completed and signed by {form.recipientName}.
                </p>
              </div>
            ) : (
              <>
                <label htmlFor="sign-name" className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-foreground">Full Legal Name</span>
                  <Input
                    id="sign-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter name here…"
                    autoComplete="name"
                  />
                </label>

                <label htmlFor="sign-email" className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-foreground">Email</span>
                  <Input
                    id="sign-email"
                    type="email"
                    value={email}
                    readOnly
                    disabled
                    aria-label="Email the form was sent to"
                  />
                  <span className="text-xs text-muted-foreground">
                    The form was sent to this email and can’t be changed.
                  </span>
                </label>

                <div className="flex flex-col gap-2">
                  <SegmentedToggle
                    className="flex w-full [&>button]:h-10 [&>button]:flex-1 [&>button]:text-sm"
                    ariaLabel="Signature input method"
                    value={mode}
                    onValueChange={(v) => setMode(v as "type" | "draw")}
                    options={[
                      { value: "type", label: "Type" },
                      { value: "draw", label: "Draw" },
                    ]}
                  />
                  {mode === "type" ? (
                    <div className="flex min-h-40 items-center rounded-2xl border border-border/60 px-5 py-4">
                      <span
                        className={cn("text-4xl leading-tight text-foreground", SCRIPT_FONT)}
                        aria-hidden={trimmedName === ""}
                      >
                        {trimmedName || (
                          <span className="text-base text-muted-foreground italic">
                            Your typed name appears here
                          </span>
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Draw your signature</span>
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
                        className="h-40 w-full touch-none rounded-2xl border border-border/60 text-foreground"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between gap-4">
                  <label htmlFor="sign-agree" className="text-sm leading-5 text-muted-foreground">
                    By signing, I confirm that I have read and therefore agree to all contractual
                    terms, which become legally binding.
                  </label>
                  <Switch
                    id="sign-agree"
                    checked={agreed}
                    onCheckedChange={setAgreed}
                    aria-label="Agree to the contractual terms"
                  />
                </div>

                <Button
                  type="button"
                  radius="full"
                  size="lg"
                  className="w-fit"
                  disabled={!canSign}
                  onClick={onComplete}
                >
                  <PenLineIcon className="size-4" />
                  Sign Agreement
                </Button>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}

// ─── Shared shells ──────────────────────────────────────────────────────────

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-dvh flex-col bg-background">
      <PublicTopGradient />
      <div className="relative mx-auto flex w-full max-w-[460px] flex-1 flex-col px-5 pb-6">
        {children}
        <p className="pt-6 text-center text-xs text-muted-foreground">Powered by Cami</p>
      </div>
    </main>
  )
}

function BusinessMark({ form }: { form: SignableForm }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar
        size="xl"
        shape="square"
        fallback="initials"
        name={form.businessName}
        src={form.businessLogoUrl}
        hashSeed={form.businessName}
      />
      <span className="text-sm font-medium text-muted-foreground">{form.businessName}</span>
    </div>
  )
}

function TerminalShell({
  tone,
  title,
  body,
  action,
}: {
  tone: "success" | "neutral"
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <PublicShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-full",
            tone === "success"
              ? "bg-cami-green-3 text-cami-green-11"
              : "bg-muted text-muted-foreground",
          )}
        >
          {tone === "success" ? (
            <CheckIcon className="size-7" strokeWidth={2.5} />
          ) : (
            <ClockIcon className="size-7" />
          )}
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="max-w-xs text-sm text-muted-foreground">{body}</p>
        </div>
        {action}
      </div>
    </PublicShell>
  )
}
