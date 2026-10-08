"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

/** Dial codes offered in the country-code selector. */
export const PHONE_CODES = ["+971", "+966", "+965", "+974", "+44", "+1"]

const triggerOverride = "data-[size=default]:h-12 rounded-2xl bg-input px-4 font-medium"

/**
 * Phone number field — a dial-code `<Select>` next to a number `<Input>`.
 * Split into `code` + `number` so callers store them separately (matching the
 * client / contact edit forms). Reused across the edit sheet and consent forms.
 */
export function PhoneField({
  label,
  code,
  number,
  onCodeChange,
  onNumberChange,
  id,
  disabled = false,
  placeholder = "50 000 0000",
}: {
  label: string
  code: string
  number: string
  onCodeChange: (next: string) => void
  onNumberChange: (next: string) => void
  /** Optional id wired to the number input for label association. */
  id?: string
  /** Locks both controls — used once a number is verified and can't be edited. */
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex w-full items-center gap-2">
        <Select value={code} onValueChange={onCodeChange} disabled={disabled}>
          <SelectTrigger className={cn(triggerOverride, "w-24 shrink-0")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PHONE_CODES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id={id}
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          value={number}
          onChange={(e) => onNumberChange(e.target.value)}
          className="min-w-0 flex-1"
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
