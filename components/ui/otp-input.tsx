"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"

type OtpInputProps = {
  length?: number
  value: string
  onValueChange: (value: string) => void
  ariaLabel?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
}

export function OtpInput({
  length = 6,
  value,
  onValueChange,
  ariaLabel = "Verification code",
  disabled = false,
  invalid = false,
  className,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? "")

  const writeAt = (index: number, char: string) => {
    const arr = digits.slice()
    arr[index] = char
    onValueChange(arr.join("").slice(0, length))
  }

  return (
    <fieldset className={cn("flex items-center justify-center gap-2 border-0 p-0", className)}>
      <legend className="sr-only">{ariaLabel}</legend>
      {digits.map((digit, i) => (
        <input
          // biome-ignore lint/suspicious/noArrayIndexKey: stable index for fixed-length OTP slot
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, "").slice(-1)
            writeAt(i, next)
            if (next && i < length - 1) refs.current[i + 1]?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digit && i > 0) {
              e.preventDefault()
              writeAt(i - 1, "")
              refs.current[i - 1]?.focus()
            }
            if (e.key === "ArrowLeft" && i > 0) {
              e.preventDefault()
              refs.current[i - 1]?.focus()
            }
            if (e.key === "ArrowRight" && i < length - 1) {
              e.preventDefault()
              refs.current[i + 1]?.focus()
            }
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
            if (!text) return
            e.preventDefault()
            onValueChange(text)
            const focusIndex = Math.min(text.length, length - 1)
            refs.current[focusIndex]?.focus()
          }}
          className="size-14 rounded-2xl border border-border bg-background text-center text-2xl font-medium text-foreground outline-none transition-colors focus:border-foreground focus:ring-2 focus:ring-foreground/15 disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20"
        />
      ))}
    </fieldset>
  )
}
