"use client"

/**
 * The cities a branch can be in, and the one control that sets them.
 *
 * ## A closed list, not free text
 *
 * Typed by hand, "Dubai" and "dubai" are two cities — and every surface that
 * groups branches by city then shows one of them twice. The seven emirates are
 * the whole of it for a UAE chain, and a new one is a decision worth making
 * deliberately rather than by typo.
 *
 * ## Why it is its own file
 *
 * A branch's city is set in five places across three surfaces: the branch
 * editor, the Add-locations takeover, the invoicing tab, and both setup steps.
 * Living inside the branch editor, the setup pages could not reach it without
 * pulling the whole editor in, so each grew its own copy — and the copies
 * drifted, which is exactly how the takeover ended up with a short, outlined
 * trigger beside fields that are tall and borderless.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * The cities a branch can be in.
 *
 * A closed list rather than free text: typed by hand, "Dubai" and "dubai" are
 * two cities, and every surface that groups branches by city then shows one of
 * them twice. The seven emirates are the whole of it for a UAE chain.
 */
/**
 * One City control for all three places a branch's city is set.
 *
 * Keeps a hidden input carrying the value, because the forms around it read
 * their fields off refs — swapping that for state everywhere would be a much
 * larger change than the thing being fixed, and a Select is not something a ref
 * can read.
 */
export function CitySelect({
  id,
  value,
  onChange,
  inputRef,
  disabled,
  invalid,
}: {
  /** So the field's own <Label htmlFor> still lands on something. */
  id?: string
  value: string
  onChange: (v: string) => void
  /**
   * Only where the form around it reads its fields off refs. The Add-locations
   * takeover keeps its rows in state and passes nothing.
   */
  inputRef?: (el: HTMLInputElement | null) => void
  disabled?: boolean
  invalid?: boolean
}) {
  return (
    <>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        {/* The Input's own footprint. A Select defaults to h-9 with a border,
            so beside fields that are h-12, borderless and on `bg-input` it sat
            short and outlined — one control in a row of six that looked like a
            different kind of thing. */}
        <SelectTrigger
          id={id}
          aria-invalid={invalid}
          className="w-full rounded-2xl border-0 bg-input px-4 font-medium data-[size=default]:h-12"
        >
          <SelectValue placeholder="Choose a city" />
        </SelectTrigger>
        <SelectContent>
          {CITY_OPTIONS.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {inputRef ? <input ref={inputRef} type="hidden" value={value} readOnly /> : null}
    </>
  )
}

export const CITY_OPTIONS = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const
