"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ChevronDownIcon, CirclePlusIcon, ScissorsIcon } from "lucide-react"
import { EmptyState } from "@/components/blocks/empty-state"
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
  /**
   * The business has services in here and this branch has turned them all off.
   *
   * A different thing from a category nobody has filled in, and it needs a
   * different sentence: one is a catalog to tidy, the other is this branch's own
   * decision (GNK §4).
   */
  emptiedHere?: boolean
  /** Named in that sentence, so the fact is about a place rather than "here". */
  branchName?: string
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
  emptiedHere = false,
  branchName,
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

      {services.length === 0 && emptiedHere ? (
        /* Not offered HERE, which is not the same as not existing. Kept on the
           operator's menu rather than hidden, because reception is the person
           who can say "not here, but Jumeirah does it" — and no Add button,
           since the services exist and the branch switched them off. */
        <p className="rounded-xl bg-muted/50 p-3 text-sm leading-5 text-muted-foreground">
          Not offered at {branchName ?? "this location"}. The business has{" "}
          {category.servicesCount ?? 0} in this category, all turned off here.
        </p>
      ) : null}

      {services.length === 0 && !emptiedHere && (
        <EmptyState
          icon={ScissorsIcon}
          title="No services yet."
          action={
            canManage ? (
              <Button
                variant="secondary"
                size="sm"
                radius="full"
                type="button"
                onClick={onAddService}
              >
                <CirclePlusIcon />
                Add a service
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  )
}
