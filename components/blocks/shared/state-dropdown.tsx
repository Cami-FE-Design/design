"use client"

import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  type BusinessState,
  STATE_DOT,
  STATE_OPTIONS,
  STATE_TRIGGER_TEXT,
} from "@/lib/admin-businesses"
import { cn } from "@/lib/utils"

type StateDropdownProps = {
  state: BusinessState
  onChange: (next: BusinessState) => void
  /** Apply -mx-3 to align the trigger flush with the surrounding cell padding. */
  inset?: boolean
  className?: string
}

export function StateDropdown({ state, onChange, inset, className }: StateDropdownProps) {
  const current = STATE_OPTIONS.find((s) => s.id === state)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          radius="default"
          className={cn("font-normal", inset && "-mx-3", STATE_TRIGGER_TEXT[state], className)}
          data-icon="inline-end"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {current?.label}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()} className="w-44">
        {STATE_OPTIONS.map((option) => {
          const active = option.id === state
          return (
            <DropdownMenuItem
              key={option.id}
              onSelect={() => {
                if (!active) onChange(option.id)
              }}
              className="gap-2"
            >
              <span
                aria-hidden
                className={cn("size-1.5 shrink-0 rounded-full", STATE_DOT[option.id])}
              />
              <span className="flex-1">{option.label}</span>
              {active ? <CheckIcon className="size-3.5 text-muted-foreground" /> : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
