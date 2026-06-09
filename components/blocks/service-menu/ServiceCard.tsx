"use client"

import { useSortable } from "@dnd-kit/sortable"
import { GripVerticalIcon, MoreHorizontalIcon } from "lucide-react"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui"
import {
  APPOINTMENT_COLORS,
  type ExtraTimeSegment,
  type Service,
  type ServiceCategory,
} from "@/lib/service-catalog/types"

function totalMin(duration: number, extraTimes: ExtraTimeSegment[] | undefined): number {
  return duration + (extraTimes ?? []).reduce((s, e) => s + e.durationMin, 0)
}

function minutesToLabel(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const rem = min % 60
  return rem === 0 ? `${h} hr` : `${h} hr, ${rem} min`
}

function formatPrice(priceType: string, price: number, currency: string): string {
  if (priceType === "Free") return "Free"
  if (priceType === "From") return `From ${currency} ${price.toFixed(2)}`
  return `${currency} ${price.toFixed(2)}`
}

function VariantRow({
  name,
  totalDurationMin,
  priceType,
  price,
  currency,
}: {
  name: string
  totalDurationMin: number
  priceType: string
  price: number
  currency: string
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-1.5">
      <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{name}</p>
      <p className="shrink-0 text-sm text-muted-foreground">{minutesToLabel(totalDurationMin)}</p>
      <p className="shrink-0 w-24 text-right text-sm font-medium text-foreground">
        {formatPrice(priceType, price, currency)}
      </p>
    </div>
  )
}

function cssTransform(t: { x: number; y: number; scaleX: number; scaleY: number } | null) {
  if (!t) return undefined
  return `translate3d(${t.x}px, ${t.y}px, 0) scaleX(${t.scaleX}) scaleY(${t.scaleY})`
}

function getColorHex(colorValue: string) {
  return APPOINTMENT_COLORS.find((c) => c.value === colorValue)?.hex ?? "#93c5fd"
}

type ServiceCardProps = {
  service: Service
  category: ServiceCategory
  canManage?: boolean
  onDelete: () => void
  onEdit: () => void
  onArchive?: () => void
  onUnarchive?: () => void
}

export function ServiceCard({
  service,
  category,
  canManage = false,
  onDelete,
  onEdit,
  onArchive,
  onUnarchive,
}: ServiceCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: service.id,
    data: { type: "service", categoryId: service.categoryId },
    disabled: !canManage,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: cssTransform(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <ServiceCardInner
        service={service}
        category={category}
        canManage={canManage}
        onDelete={onDelete}
        onEdit={onEdit}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

export function ServiceCardInner({
  service,
  category,
  canManage = false,
  onDelete,
  onEdit,
  onArchive,
  onUnarchive,
  dragHandleProps = {},
  withHandle = true,
  dragging = false,
}: {
  service: Service
  category: ServiceCategory
  canManage?: boolean
  onDelete: () => void
  onEdit?: () => void
  onArchive?: () => void
  onUnarchive?: () => void
  dragHandleProps?: Record<string, unknown>
  withHandle?: boolean
  dragging?: boolean
}) {
  const colorHex = getColorHex(category.color)
  const currency = "AED"

  const isArchived = service.isActive === false

  // Show multi-variant layout only when 2 or more variants exist; a single variant
  // keeps the same compact single-row layout as a plain service.
  const hasVariants = service.variants.length > 1

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          radius="full"
          className="text-muted-foreground"
          aria-label={`Options for ${service.name}`}
        >
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canManage && <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>}
        <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
        <DropdownMenuItem disabled>Quick booking link</DropdownMenuItem>
        {canManage &&
          (isArchived ? (
            <DropdownMenuItem onClick={onUnarchive}>Unarchive</DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={onArchive}>Archive</DropdownMenuItem>
          ))}
        {canManage && (
          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
            Permanently delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const card = (
    <div
      className={`flex flex-1 overflow-hidden rounded-2xl border border-border/60 bg-background${
        dragging ? " shadow-xl" : ""
      }${isArchived ? " opacity-40" : ""}`}
    >
      <div className="w-4 shrink-0 self-stretch" style={{ backgroundColor: colorHex }} />

      <div className="flex flex-1 flex-col min-w-0">
        {hasVariants ? (
          <>
            {/* Header row */}
            <div className="flex flex-1 items-center gap-4 px-4 py-4">
              <p className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
                {service.name}
              </p>
              {menu}
            </div>

            {/* Variant rows — each shows name | total duration | price */}
            {service.variants.map((v, i) => (
              <VariantRow
                key={v.id ?? i}
                name={v.name}
                totalDurationMin={totalMin(v.duration, v.extraTimes)}
                priceType={v.priceType}
                price={v.price}
                currency={currency}
              />
            ))}

            <div className="h-2" />
          </>
        ) : (
          /* No variants — single row: name + total duration | price + menu */
          <div className="flex flex-1 items-center gap-4 px-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-foreground">{service.name}</p>
              <p className="text-sm text-muted-foreground">
                {minutesToLabel(totalMin(service.duration, service.extraTimes))}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-base font-medium text-foreground">
                {formatPrice(service.priceType, service.price, currency)}
              </span>
              {menu}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (!withHandle) {
    return card
  }

  return (
    <div data-testid="service-card" className="group flex items-center gap-2">
      {canManage && (
        <button
          type="button"
          className={`cursor-grab text-muted-foreground transition-opacity active:cursor-grabbing ${
            dragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          aria-label={`Drag ${service.name}`}
          {...dragHandleProps}
        >
          <GripVerticalIcon className="size-4" />
        </button>
      )}
      {card}
    </div>
  )
}
