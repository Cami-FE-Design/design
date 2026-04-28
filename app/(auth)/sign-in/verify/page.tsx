"use client"

import { CheckIcon, Loader2Icon, XIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { AuthCard } from "@/components/blocks/auth-card"
import { AuthLayout } from "@/components/blocks/auth-layout"
import { Button } from "@/components/ui/button"
import { OtpInput } from "@/components/ui/otp-input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const phoneMasked = "+971 •••• ••45"
const resendSeconds = 17
const codeLength = 6

function formatCountdown(s: number) {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0")
  const ss = (s % 60).toString().padStart(2, "0")
  return `${m}:${ss}`
}

type VerifyState = "idle" | "verifying" | "success" | "error"

export default function SignInVerifyPage() {
  const [code, setCode] = useState("")
  const [seconds, setSeconds] = useState(resendSeconds)
  const [state, setState] = useState<VerifyState>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const otpWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  useEffect(() => {
    if (code.length !== codeLength) return

    let cancelled = false
    setState("verifying")
    setErrorMessage(null)

    const t = setTimeout(() => {
      if (cancelled) return
      // Demo: any code beginning with "0" simulates a failure; everything else succeeds.
      if (code.startsWith("0")) {
        setState("error")
        setErrorMessage("That code didn't match. Try again.")
        setCode("")
        // play shake
        otpWrapperRef.current?.classList.remove("animate-shake")
        // reflow so the class re-applies
        void otpWrapperRef.current?.offsetWidth
        otpWrapperRef.current?.classList.add("animate-shake")
      } else {
        setState("success")
      }
    }, 1500)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [code])

  function handleCodeChange(next: string) {
    if (state === "verifying" || state === "success") return
    if (state === "error") {
      setState("idle")
      setErrorMessage(null)
    }
    setCode(next)
  }

  function handleResend() {
    setSeconds(resendSeconds)
    setCode("")
    setState("idle")
    setErrorMessage(null)
  }

  const isLocked = state === "verifying" || state === "success"

  return (
    <AuthLayout splitPane={false}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant="ghost"
            size="icon-xl"
            radius="full"
            aria-label="Cancel"
            className="absolute top-6 right-6 lg:top-8 lg:right-8"
          >
            <Link href="/sign-in">
              <XIcon className="size-6" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Cancel</TooltipContent>
      </Tooltip>
      <AuthCard
        title={
          <>
            Enter the code we sent to <span className="block">{phoneMasked}</span>
          </>
        }
        description="This helps us keep your account secure."
      >
        <div ref={otpWrapperRef} className="flex flex-col items-center gap-3">
          <OtpInput
            value={code}
            onValueChange={handleCodeChange}
            disabled={isLocked}
            invalid={state === "error"}
          />
          <div className="flex h-5 w-full items-center justify-start text-sm">
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
            ) : state === "error" && errorMessage ? (
              <span role="alert" className="text-destructive">
                {errorMessage}
              </span>
            ) : null}
          </div>
        </div>
        {seconds > 0 ? (
          <Button
            variant="secondary"
            size="xl"
            radius="full"
            className={cn("w-full", isLocked && "invisible")}
            disabled
          >
            Request a new code in{" "}
            <strong className="font-medium tabular-nums">{formatCountdown(seconds)}</strong>
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="xl"
            radius="full"
            className={cn("w-full", isLocked && "invisible")}
            onClick={handleResend}
          >
            Request a new code
          </Button>
        )}
      </AuthCard>
    </AuthLayout>
  )
}
