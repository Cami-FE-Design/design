import type { LucideIcon } from "lucide-react"
import { ChevronRightIcon } from "lucide-react"
import { Fragment } from "react"
import { cn } from "@/lib/utils"

export type BreadcrumbSegment = {
  label: string
  icon?: LucideIcon
  photoUrl?: string
  onClick?: () => void
}

/** Notion-style breadcrumb: icon/avatar + label segments joined by chevrons. */
export function NotionBreadcrumb({ segments }: { segments: BreadcrumbSegment[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1
        return (
          <Fragment key={seg.label}>
            {i > 0 && <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground/50" />}
            <BreadcrumbSegmentNode segment={seg} active={isLast} />
          </Fragment>
        )
      })}
    </nav>
  )
}

function BreadcrumbSegmentNode({
  segment,
  active,
}: {
  segment: BreadcrumbSegment
  active: boolean
}) {
  const Icon = segment.icon
  const inner = (
    <>
      {segment.photoUrl ? (
        <span className="size-4 shrink-0 overflow-hidden rounded-sm bg-muted">
          {/* biome-ignore lint/performance/noImgElement: tiny breadcrumb avatar */}
          <img src={segment.photoUrl} alt="" className="size-full object-cover" />
        </span>
      ) : Icon ? (
        <Icon className="size-4 shrink-0" />
      ) : null}
      <span className="truncate">{segment.label}</span>
    </>
  )

  const base = "inline-flex max-w-[16rem] items-center gap-1.5 leading-none"

  if (segment.onClick) {
    return (
      <button
        type="button"
        onClick={segment.onClick}
        className={cn(base, "hover:text-foreground hover:underline underline-offset-4")}
      >
        {inner}
      </button>
    )
  }

  return (
    <span
      className={cn(base, active && "font-medium text-foreground")}
      aria-current={active ? "page" : undefined}
    >
      {inner}
    </span>
  )
}
