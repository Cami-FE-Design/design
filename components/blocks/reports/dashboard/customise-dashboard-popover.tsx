"use client"

// "Customise" — widget visibility + role preview for the Performance dashboard.
//
// Third container for this, and the reason is worth recording. A modal was
// wrong: it takes over the screen to edit the thing behind it. A dropdown menu
// was worse: menu checkmarks give no sign that a row is a toggle, so it read
// as navigation. A popover with real switches says what it is at a glance,
// keeps the dashboard visible while you flick things off, and needs no
// header/footer chrome of its own.

import { RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SegmentedToggle, type SegmentedToggleOption } from "@/components/ui/segmented-toggle"
import { Switch } from "@/components/ui/switch"
import {
  DASHBOARD_SECTIONS,
  DASHBOARD_WIDGETS,
  type DashboardRole,
  ROLE_LABELS,
} from "@/lib/reports/dashboard/widgets"

const ROLE_OPTIONS = [
  { value: "owner", label: ROLE_LABELS.owner },
  { value: "manager", label: ROLE_LABELS.manager },
  { value: "staff", label: ROLE_LABELS.staff },
] as const satisfies readonly SegmentedToggleOption<DashboardRole>[]

export function CustomiseDashboardPopover({
  visible,
  onToggle,
  onReset,
  role,
  onRoleChange,
}: {
  visible: string[]
  onToggle: (id: string) => void
  onReset: () => void
  role: DashboardRole
  onRoleChange: (role: DashboardRole) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" radius="full" size="sm">
          <SlidersHorizontalIcon className="size-3.5" />
          Customise
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[340px] p-0">
        <div className="flex flex-col gap-2 border-b border-border/60 p-4">
          <span className="text-sm font-semibold text-foreground">Preview as</span>
          {/* Sized to its three short labels. Stretched to the popover width the
              track ran on past "Staff" as a slab of empty grey, which read as a
              half-filled input rather than a control. */}
          <SegmentedToggle
            value={role}
            onValueChange={onRoleChange}
            options={ROLE_OPTIONS}
            size="sm"
            ariaLabel="Preview dashboard as role"
            className="w-fit"
          />
        </div>

        <div className="flex max-h-[52vh] flex-col gap-4 overflow-x-hidden overflow-y-auto p-4">
          {DASHBOARD_SECTIONS.map((section) => (
            <div key={section.id} className="flex flex-col gap-1">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {section.label}
              </span>
              {DASHBOARD_WIDGETS.filter((w) => w.section === section.id).map((widget) => {
                const noAccess = widget.access[role] === "none"
                return (
                  <div key={widget.id} className="flex items-center justify-between gap-3 py-1.5">
                    <span className="min-w-0 truncate text-sm text-foreground">{widget.title}</span>
                    <Switch
                      size="sm"
                      checked={visible.includes(widget.id) && !noAccess}
                      onCheckedChange={() => onToggle(widget.id)}
                      disabled={noAccess}
                      aria-label={`Show ${widget.title}`}
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="border-t border-border/60 p-2">
          <Button
            variant="ghost"
            size="sm"
            radius="full"
            className="w-full justify-start"
            onClick={onReset}
          >
            <RotateCcwIcon className="size-3.5" />
            Reset to default
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
