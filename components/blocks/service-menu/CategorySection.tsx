"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ChevronDownIcon } from "lucide-react"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui"
import type { Service, ServiceCategory } from "@/lib/service-catalog/types"
import { ServiceCard } from "./ServiceCard"

type CategorySectionProps = {
  category: ServiceCategory
  services: Service[]
  canManage?: boolean
  onDeleteService: (id: string) => void
  onAddService: () => void
  onDeleteCategory: () => void
  onEditService: (id: string) => void
  onEditCategory?: () => void
  onArchiveCategory?: () => void
  onUnarchiveCategory?: () => void
  onArchiveService?: (id: string) => void
  onUnarchiveService?: (id: string) => void
}

export function CategorySection({
  category,
  services,
  canManage = false,
  onDeleteService,
  onAddService,
  onDeleteCategory,
  onEditService,
  onEditCategory,
  onArchiveCategory,
  onUnarchiveCategory,
  onArchiveService,
  onUnarchiveService,
}: CategorySectionProps) {
  const serviceIds = services.map((s) => s.id)
  const isArchived = category.isActive === false

  // Make the whole section a drop target so services can be dropped onto
  // empty categories. The id matches the category id so handleDragEnd can
  // identify it as a category drop zone.
  const { setNodeRef: setDropRef } = useDroppable({ id: category.id })

  return (
    <div
      ref={setDropRef}
      data-testid="category-section"
      className={`rounded-2xl border border-border/60 bg-sand-2 p-5${isArchived ? " opacity-50" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-2xl font-semibold leading-9 text-foreground">
          {category.name}
        </h3>
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" radius="full" className="gap-1.5">
                Actions
                <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isArchived && (
                <DropdownMenuItem onClick={onEditCategory} disabled={!onEditCategory}>
                  Edit
                </DropdownMenuItem>
              )}
              {!isArchived && (
                <DropdownMenuItem onClick={onAddService}>Add service</DropdownMenuItem>
              )}
              {isArchived ? (
                <DropdownMenuItem onClick={onUnarchiveCategory}>Unarchive</DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onArchiveCategory}>Archive</DropdownMenuItem>
              )}
              {!isArchived && (
                <DropdownMenuItem
                  onClick={onDeleteCategory}
                  className="text-destructive focus:text-destructive"
                >
                  Permanently delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <SortableContext items={serviceIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              category={category}
              canManage={canManage}
              onDelete={() => onDeleteService(service.id)}
              onEdit={() => onEditService(service.id)}
              onArchive={onArchiveService ? () => onArchiveService(service.id) : undefined}
              onUnarchive={onUnarchiveService ? () => onUnarchiveService(service.id) : undefined}
            />
          ))}
        </div>
      </SortableContext>

      {services.length === 0 && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-border py-8">
          {canManage ? (
            <Button
              variant="ghost"
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={onAddService}
            >
              + Add a service to this category
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">No services yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
