"use client"

import type * as React from "react"
import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Tone the toggle takes when this option is active.
 *  - `neutral` (default): gray track, white pill, muted inactive labels.
 *  - `primary`: foreground (near-black) track, white pill, light inactive labels — switch-style "on".
 */
export type SegmentedToggleTone = "neutral" | "primary"

export type SegmentedToggleOption<T extends string> = {
  value: T
  label: React.ReactNode
  /** Tone applied to the whole toggle (track + inactive labels) when this option is active. */
  activeTone?: SegmentedToggleTone
}

type SegmentedToggleProps<T extends string> = {
  value: T
  onValueChange: (next: T) => void
  options: readonly [
    SegmentedToggleOption<T>,
    SegmentedToggleOption<T>,
    ...SegmentedToggleOption<T>[],
  ]
  /** `lg` matches the h-12 settings-takeover form fields (track p-1 + h-10 segments). */
  size?: "sm" | "default" | "lg"
  /** Optional accessible label for the whole toggle group (e.g. "Permission area state"). */
  ariaLabel?: string
  className?: string
  disabled?: boolean
}

/**
 * Segmented pill toggle — N options inside one rounded track. The active
 * option gets a white capsule that slides on change rather than snapping.
 *
 * Sizing matches the Mobbin reference: track p-1, segment h-7 px-2,
 * text-xs semibold. The pill is absolutely positioned and measures the
 * active button via refs so segments can be variable width.
 */
export function SegmentedToggle<T extends string>({
  value,
  onValueChange,
  options,
  size = "default",
  ariaLabel,
  className,
  disabled,
}: SegmentedToggleProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [pill, setPill] = useState<{
    left: number
    top: number
    width: number
    height: number
  } | null>(null)
  // Suppress the slide on first paint so the pill appears in place rather than
  // animating in from 0,0. After layout has settled once, future value changes
  // animate normally.
  const [animate, setAnimate] = useState(false)

  const activeIndex = options.findIndex((o) => o.value === value)

  // Measure relative to the container's bounding rect, not offsetParent —
  // <fieldset> has a peculiar layout box (the legend slot) that makes
  // offsetTop unreliable, which previously caused the pill to bleed below
  // the track by exactly the padding amount.
  const measure = useCallback(() => {
    const btn = buttonRefs.current[activeIndex]
    const container = containerRef.current
    if (!btn || !container) return
    const b = btn.getBoundingClientRect()
    const c = container.getBoundingClientRect()
    setPill({
      left: b.left - c.left,
      top: b.top - c.top,
      width: b.width,
      height: b.height,
    })
  }, [activeIndex])

  useLayoutEffect(() => {
    measure()
  }, [measure])

  // Recompute on container resize — labels can wrap or shift on mobile.
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => measure())
    ro.observe(container)
    return () => ro.disconnect()
  }, [measure])

  // Enable transitions one frame after first measurement.
  useLayoutEffect(() => {
    if (pill && !animate) {
      const id = requestAnimationFrame(() => setAnimate(true))
      return () => cancelAnimationFrame(id)
    }
  }, [pill, animate])

  const tone: SegmentedToggleTone = options[activeIndex]?.activeTone ?? "neutral"

  return (
    <div
      ref={containerRef}
      data-slot="segmented-toggle"
      data-size={size}
      data-tone={tone}
      data-disabled={disabled || undefined}
      className={cn(
        "relative inline-flex items-center rounded-full transition-colors duration-[220ms] ease-[cubic-bezier(0.33,1,0.68,1)] data-disabled:cursor-not-allowed data-disabled:opacity-60",
        // Track tone — switch-style: gray when neutral, near-black when primary.
        tone === "primary" ? "bg-foreground" : "bg-muted",
        size === "sm" ? "p-0.5" : "p-1",
        className,
      )}
    >
      {ariaLabel ? <span className="sr-only">{ariaLabel}</span> : null}

      {pill ? (
        <span
          aria-hidden
          data-slot="segmented-toggle-pill"
          className={cn(
            "pointer-events-none absolute rounded-full bg-background shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.04)]",
            animate
              ? "transition-[left,top,width,height] duration-[220ms] ease-[cubic-bezier(0.33,1,0.68,1)]"
              : null,
          )}
          style={{
            left: pill.left,
            top: pill.top,
            width: pill.width,
            height: pill.height,
          }}
        />
      ) : null}

      {options.map((option, index) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            ref={(el) => {
              buttonRefs.current[index] = el
            }}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => {
              if (!disabled && !active) onValueChange(option.value)
            }}
            data-state={active ? "active" : "inactive"}
            className={cn(
              "relative z-[1] inline-flex items-center justify-center rounded-full text-xs font-semibold transition-colors duration-[220ms] ease-[cubic-bezier(0.33,1,0.68,1)] outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed",
              size === "sm" ? "h-5 px-1.5" : size === "lg" ? "h-10 px-3" : "h-7 px-2",
              active
                ? // Active label sits on the white pill — always dark/foreground regardless of tone.
                  "text-foreground"
                : tone === "primary"
                  ? "text-background/70 hover:text-background"
                  : "text-muted-foreground hover:text-foreground/80",
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
