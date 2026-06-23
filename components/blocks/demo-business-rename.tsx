"use client"

import { Building2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDemoBusiness } from "@/lib/demo-business"

/**
 * Demo-only control to rebrand the whole prototype to a prospect's salon name.
 * Lives in a Popover (not a menu) so the text input accepts spaces and every
 * keystroke normally — Radix menus would swallow Space for item typeahead.
 */
export function DemoBusinessRename() {
  const { name, setName, reset } = useDemoBusiness()

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Rename business (demo)"
              className="size-11 rounded-full text-sidebar-foreground"
            >
              <Building2Icon className="size-5" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Rename (demo)</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="flex w-72 flex-col gap-2 p-3">
        <span className="font-medium text-foreground text-sm">Business name (demo)</span>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. SOTA Salon"
          aria-label="Demo business name"
          className="h-10"
          autoFocus
        />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Rebrands the whole demo.</span>
          <Button type="button" variant="ghost" size="xs" onClick={reset}>
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
