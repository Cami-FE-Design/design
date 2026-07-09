import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { AppShell } from "@/components/blocks/app-shell"
import { Button } from "@/components/ui/button"
import {
  colorClasses,
  RESOURCE_BOOKINGS,
  RESOURCE_DAY_END,
  RESOURCE_DAY_START,
  RESOURCES,
} from "@/lib/scheduling-mock"

const PX_PER_MIN = 0.95
const TOTAL_MIN = RESOURCE_DAY_END - RESOURCE_DAY_START
const TIME_AXIS = 60

function hourLabels() {
  const out: { min: number; label: string }[] = []
  for (let m = RESOURCE_DAY_START; m <= RESOURCE_DAY_END; m += 60) {
    const h = Math.floor(m / 60)
    const suffix = h >= 12 ? "pm" : "am"
    const disp = h % 12 === 0 ? 12 : h % 12
    out.push({ min: m - RESOURCE_DAY_START, label: `${disp}${suffix}` })
  }
  return out
}

export default function ResourceCalendarPage() {
  const hours = hourLabels()

  return (
    <AppShell
      headerClassName="min-h-0 p-3"
      header={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm" radius="full" aria-label="Previous day">
              <ChevronLeftIcon className="size-4" />
            </Button>
            <span className="text-sm font-medium text-foreground">Today · Tue 30 Jun</span>
            <Button variant="outline" size="icon-sm" radius="full" aria-label="Next day">
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Button variant="outline" size="sm" radius="full" className="h-8" asChild>
              <a href="/appointments">By team member</a>
            </Button>
            <Button size="sm" radius="full" className="h-8">
              By resource
            </Button>
          </div>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          {/* Column headers */}
          <div
            className="grid border-b border-border"
            style={{
              gridTemplateColumns: `${TIME_AXIS}px repeat(${RESOURCES.length}, minmax(120px, 1fr))`,
            }}
          >
            <div />
            {RESOURCES.map((r) => {
              const c = colorClasses(r.color)
              return (
                <div key={r.id} className="flex flex-col items-center gap-1 px-2 py-3">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <span className={`size-2 rounded-full ${c.dot}`} />
                    {r.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {r.capacity === 1 ? r.type : `${r.type} · ${r.capacity} max`}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Grid body */}
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: `${TIME_AXIS}px repeat(${RESOURCES.length}, minmax(120px, 1fr))`,
              height: `${TOTAL_MIN * PX_PER_MIN}px`,
            }}
          >
            {/* Time axis */}
            <div className="relative border-r border-border">
              {hours.map((h) => (
                <span
                  key={h.min}
                  className="absolute right-2 -translate-y-1/2 text-xs tabular-nums text-muted-foreground"
                  style={{ top: `${h.min * PX_PER_MIN}px` }}
                >
                  {h.label}
                </span>
              ))}
            </div>

            {/* Resource columns */}
            {RESOURCES.map((r) => (
              <div key={r.id} className="relative border-r border-border/60">
                {/* hour rules */}
                {hours.map((h) => (
                  <span
                    key={h.min}
                    className="absolute inset-x-0 border-t border-border/40"
                    style={{ top: `${h.min * PX_PER_MIN}px` }}
                  />
                ))}
                {/* bookings */}
                {RESOURCE_BOOKINGS.filter((b) => b.resourceId === r.id).map((b) => {
                  const c = colorClasses(b.color)
                  return (
                    <div
                      key={b.id}
                      className={`absolute inset-x-1 overflow-hidden rounded-lg border ${c.bg} ${c.border} px-2 py-1`}
                      style={{
                        top: `${b.startMin * PX_PER_MIN}px`,
                        height: `${(b.endMin - b.startMin) * PX_PER_MIN - 4}px`,
                      }}
                    >
                      <p className={`truncate text-xs font-medium ${c.text}`}>{b.title}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{b.sub}</p>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
