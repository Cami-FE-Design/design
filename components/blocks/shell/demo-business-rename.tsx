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
 *
 * Renaming only. Switching between the venues that actually exist belongs in
 * the workspace switcher beside it, and briefly lived here as well — which made
 * the official-looking control the one that could not change business, and this
 * demo-only icon the one that could. One job each.
 *
 * A name typed here matches no venue by design: that is the case being
 * demonstrated, a merchant who has set up neither logo nor palette. Surfaces
 * that resolve a venue fall back on purpose, and the note below says so, since
 * the fallback is otherwise indistinguishable from something being broken.
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
        <span className="text-sm font-medium text-foreground">Rename for a pitch</span>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Glow Beauty Lounge"
          aria-label="Demo business name"
          className="h-10"
          autoFocus
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            Rebrands the demo. A prospect's name is not a venue, so it gets the default palette and
            no logo — switch venue in the workspace menu instead.
          </span>
          <Button type="button" variant="ghost" size="xs" onClick={reset}>
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
