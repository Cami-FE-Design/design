"use client"

import {
  type CollisionDetection,
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { ChevronDownIcon } from "lucide-react"
import { useMemo, useState } from "react"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui"
import { APPOINTMENT_COLORS, type Service, type ServiceCategory } from "@/lib/service-catalog/types"

type SetMenuOrderSheetProps = {
  categories: ServiceCategory[]
  services: Service[]
  onSave: (categories: ServiceCategory[], services: Service[]) => void
  onClose: () => void
}

type DragItem =
  | { type: "category"; id: string }
  | { type: "service"; id: string; categoryId: string }

type ViewFilter = "categories-and-services" | "categories" | "services"

const VIEW_FILTER_LABELS: Record<ViewFilter, string> = {
  "categories-and-services": "Categories and services",
  categories: "Categories only",
  services: "Services only",
}

function getColorHex(colorValue: string) {
  return APPOINTMENT_COLORS.find((c) => c.value === colorValue)?.hex ?? "#93c5fd"
}

function cssTransform(
  transform: {
    x: number
    y: number
    scaleX: number
    scaleY: number
  } | null,
) {
  if (!transform) return undefined
  return `translate3d(${transform.x}px, ${transform.y}px, 0)`
}

// When dragging a category, only collide with other categories.
// When dragging a service, use normal closestCenter.
function buildCollisionDetection(categoryIds: Set<string>): CollisionDetection {
  return (args) => {
    const activeData = args.active.data.current as { type?: string } | undefined
    if (activeData?.type === "category") {
      const categoryDroppables = args.droppableContainers.filter((d) =>
        categoryIds.has(d.id as string),
      )
      if (categoryDroppables.length > 0) {
        return closestCenter({
          ...args,
          droppableContainers: categoryDroppables,
        })
      }
    }
    return closestCenter(args)
  }
}

export function SetMenuOrderSheet({
  categories: initialCategories,
  services: initialServices,
  onSave,
  onClose,
}: SetMenuOrderSheetProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>(
    [...initialCategories].sort((a, b) => a.order - b.order),
  )
  const [services, setServices] = useState<Service[]>(initialServices)
  const [activeItem, setActiveItem] = useState<DragItem | null>(null)
  const [viewFilter, setViewFilter] = useState<ViewFilter>("categories-and-services")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const categoryIdSet = useMemo(() => new Set(categories.map((c) => c.id)), [categories])

  const collisionDetection = useMemo(() => buildCollisionDetection(categoryIdSet), [categoryIdSet])

  const handleDragStart = ({ active }: DragStartEvent) => {
    const data = active.data.current as
      | { type: "category" | "service"; categoryId?: string }
      | undefined
    if (!data) return
    if (data.type === "category") {
      setActiveItem({ type: "category", id: active.id as string })
    } else {
      setActiveItem({
        type: "service",
        id: active.id as string,
        categoryId: data.categoryId ?? "",
      })
    }
  }

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || active.id === over.id) return
    const activeData = active.data.current as { type: string; categoryId?: string } | undefined
    // Only handle cross-category moves for services
    if (!activeData || activeData.type !== "service") return

    const overData = over.data.current as { type?: string; categoryId?: string } | undefined
    const activeCategoryId = activeData.categoryId
    const overCategoryId =
      overData?.categoryId ?? (overData?.type === "category" ? (over.id as string) : null)

    if (overCategoryId && activeCategoryId !== overCategoryId) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === (active.id as string) ? { ...s, categoryId: overCategoryId as string } : s,
        ),
      )
    }
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveItem(null)
    if (!over || active.id === over.id) return

    const activeData = active.data.current as { type: string } | undefined
    if (!activeData) return

    if (activeData.type === "category") {
      setCategories((prev) => {
        const oldIndex = prev.findIndex((c) => c.id === active.id)
        // Custom collision already ensures over.id is a category ID,
        // but guard just in case.
        const overData = over.data.current as { type?: string; categoryId?: string } | undefined
        let targetId = over.id as string
        if (overData?.type === "service" && overData.categoryId) {
          targetId = overData.categoryId
        }
        const newIndex = prev.findIndex((c) => c.id === targetId)
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev
        return arrayMove(prev, oldIndex, newIndex).map((c, i) => ({
          ...c,
          order: i,
        }))
      })
    } else {
      setServices((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === active.id)
        const newIndex = prev.findIndex((s) => s.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return prev
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const showCategories = viewFilter === "categories-and-services" || viewFilter === "categories"
  const showServices = viewFilter === "categories-and-services" || viewFilter === "services"

  const categoryIds = categories.map((c) => c.id)

  return (
    // Fix 1: absolute inset-0 fills only the content area (below the app topbar),
    // avoiding any z-index conflict with the shell's z-[2] topbar.
    <div className="absolute inset-0 z-10 flex flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-end gap-2 border-b border-border px-6 py-3">
        <Button type="button" variant="outline" radius="full" size="sm" onClick={onClose}>
          Close
        </Button>
        <Button type="button" radius="full" size="sm" onClick={() => onSave(categories, services)}>
          Save
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <h1 className="text-3xl font-bold text-foreground">Set menu order</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Define the order that services will appear to clients when booking online.
          </p>

          {/* Filter dropdown */}
          <div className="mt-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" radius="full" size="sm" className="gap-2 px-4">
                  {VIEW_FILTER_LABELS[viewFilter]}
                  <ChevronDownIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {(Object.entries(VIEW_FILTER_LABELS) as [ViewFilter, string][]).map(
                  ([value, label]) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => setViewFilter(value)}
                      className={viewFilter === value ? "font-medium" : ""}
                    >
                      {label}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* DnD list */}
          <div className="mt-6">
            <DndContext
              sensors={sensors}
              collisionDetection={collisionDetection}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-4">
                  {categories.map((cat) => {
                    const catServices = services.filter((s) => s.categoryId === cat.id)
                    return (
                      <SortableCategoryGroup
                        key={cat.id}
                        category={cat}
                        services={catServices}
                        showCategory={showCategories}
                        showServices={showServices}
                      />
                    )
                  })}
                </div>
              </SortableContext>

              <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
                {activeItem?.type === "category" &&
                  (() => {
                    const cat = categories.find((c) => c.id === activeItem.id)
                    if (!cat) return null
                    return (
                      <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-xl opacity-95">
                        <div className="flex items-center gap-3">
                          <DotsGrid />
                          <span className="text-base font-bold text-foreground">{cat.name}</span>
                        </div>
                      </div>
                    )
                  })()}
                {activeItem?.type === "service" &&
                  (() => {
                    const svc = services.find((s) => s.id === activeItem.id)
                    const cat = categories.find((c) => c.id === svc?.categoryId)
                    if (!svc || !cat) return null
                    return (
                      <div className="rotate-1 shadow-xl">
                        <ServiceRow service={svc} category={cat} />
                      </div>
                    )
                  })()}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  )
}

function SortableCategoryGroup({
  category,
  services,
  showCategory,
  showServices,
}: {
  category: ServiceCategory
  services: Service[]
  showCategory: boolean
  showServices: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    data: { type: "category" },
    disabled: !showCategory,
  })

  const style = {
    transform: cssTransform(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  const serviceIds = services.map((s) => s.id)

  return (
    <div ref={setNodeRef} style={style}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {showCategory && (
          <div className="flex items-center gap-3 px-5 py-4">
            <button
              type="button"
              className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
              aria-label={`Drag ${category.name} category`}
              {...attributes}
              {...listeners}
            >
              <DotsGrid />
            </button>
            <span className="text-base font-bold text-foreground">{category.name}</span>
          </div>
        )}

        {showServices && (
          <SortableContext items={serviceIds} strategy={verticalListSortingStrategy}>
            <div className={`flex flex-col gap-2 ${showCategory ? "px-4 pb-4" : "p-4"}`}>
              {services.map((svc) => (
                <SortableServiceRow key={svc.id} service={svc} category={category} />
              ))}
              {services.length === 0 && (
                <p className="py-2 text-sm text-muted-foreground">No services in this category</p>
              )}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  )
}

function SortableServiceRow({
  service,
  category,
}: {
  service: Service
  category: ServiceCategory
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: service.id,
    data: { type: "service", categoryId: service.categoryId },
  })

  const style = {
    transform: cssTransform(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ServiceRow
        service={service}
        category={category}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

function ServiceRow({
  service,
  category,
  dragHandleProps = {},
}: {
  service: Service
  category: ServiceCategory
  dragHandleProps?: Record<string, unknown>
}) {
  const colorHex = getColorHex(category.color)
  return (
    <div className="flex items-center overflow-hidden rounded-2xl border border-border bg-background">
      <div className="w-1 self-stretch" style={{ backgroundColor: colorHex }} />
      <div className="flex flex-1 items-center gap-3 px-4 py-3.5">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          aria-label={`Drag ${service.name}`}
          {...dragHandleProps}
        >
          <DotsGrid />
        </button>
        <span className="text-sm font-medium text-foreground">{service.name}</span>
      </div>
    </div>
  )
}

function DotsGrid({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`shrink-0 text-muted-foreground ${className}`}
    >
      <circle cx="5" cy="4" r="1.2" fill="currentColor" />
      <circle cx="5" cy="8" r="1.2" fill="currentColor" />
      <circle cx="5" cy="12" r="1.2" fill="currentColor" />
      <circle cx="11" cy="4" r="1.2" fill="currentColor" />
      <circle cx="11" cy="8" r="1.2" fill="currentColor" />
      <circle cx="11" cy="12" r="1.2" fill="currentColor" />
    </svg>
  )
}
