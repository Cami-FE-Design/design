"use client"

import {
  closestCorners,
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
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import {
  ArrowDownUpIcon,
  ChevronDownIcon,
  LinkIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SearchInput,
  Skeleton,
} from "@/components/ui"
import {
  useService,
  useServiceCatalogMutations,
  useServiceCategories,
  useServiceSearch,
  useServices,
  useTeamMembers,
} from "@/lib/service-catalog/store"
import type { Service, ServiceCategory } from "@/lib/service-catalog/types"
import { AddCategoryDialog } from "./AddCategoryDialog"
import { CategorySection } from "./CategorySection"
import { CategorySidebar } from "./CategorySidebar"
import { DEFAULT_FILTERS, FiltersDialog, type ServiceFilters } from "./FiltersDialog"
import { NewServiceSheet } from "./NewServiceSheet"
import { ServiceCardInner } from "./ServiceCard"
import { SetMenuOrderSheet } from "./SetMenuOrderSheet"

type ServiceMenuPageProps = {
  initialCategories?: import("@/lib/service-catalog/types").ServiceCategory[]
  initialServices?: import("@/lib/service-catalog/types").Service[]
}

export function ServiceMenuPage({ initialCategories, initialServices }: ServiceMenuPageProps) {
  // Permissions are intentionally omitted in this prototype repo — all
  // management actions are always available.
  const canManage = true

  const { data: rawCategories } = useServiceCategories({
    initialData: initialCategories,
  })
  const mutations = useServiceCatalogMutations()
  const { members: teamMembers } = useTeamMembers("active")

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<ServiceFilters>(DEFAULT_FILTERS)

  const { data: rawServices, isFetching: isFetchingServices } = useServices({
    initialData: initialServices,
    categoryId: selectedCategoryId,
    status: activeFilters.status,
    teamMemberId: activeFilters.teamMemberId || undefined,
  })

  const [categories, setCategories] = useState<ServiceCategory[]>(() =>
    (rawCategories ?? []).filter((c) => !c.isSystemManaged),
  )
  // All active categories (including system-managed) — used by the edit sheet so
  // a service assigned to a system-managed category still resolves its display name.
  const allCategories = rawCategories?.filter((c) => c.isActive !== false) ?? categories
  const [services, setServices] = useState<Service[]>(() =>
    [...(rawServices ?? [])].sort((a, b) => a.order - b.order),
  )

  const prevRawCategoriesRef = useRef(rawCategories)
  useEffect(() => {
    if (rawCategories === prevRawCategoriesRef.current) return
    prevRawCategoriesRef.current = rawCategories
    setCategories((rawCategories ?? []).filter((c) => !c.isSystemManaged))
  }, [rawCategories])

  const prevRawServicesRef = useRef(rawServices)
  useEffect(() => {
    if (rawServices === prevRawServicesRef.current) return
    prevRawServicesRef.current = rawServices
    setServices([...(rawServices ?? [])].sort((a, b) => a.order - b.order))
  }, [rawServices])
  const [searchQuery, setSearchQuery] = useState("")
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [editCategoryTarget, setEditCategoryTarget] = useState<ServiceCategory | null>(null)
  const [newServiceOpen, setNewServiceOpen] = useState(false)
  const [menuOrderOpen, setMenuOrderOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [defaultNewCategoryId, setDefaultNewCategoryId] = useState<string | undefined>()
  const [editServiceTargetId, setEditServiceTargetId] = useState<string | null>(null)
  const { data: editServiceDetail, isLoading: isLoadingEditService } =
    useService(editServiceTargetId)
  const editServiceTarget = editServiceDetail ?? null
  const [activeId, setActiveId] = useState<string | null>(null)
  const dragSourceRef = useRef<{ id: string; categoryId: string } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const { data: searchResults, isFetching: isSearching } = useServiceSearch(searchQuery)

  const filteredServices = useMemo(() => {
    // Only switch to search results once the API has responded (searchResults defined).
    // While isSearching (debounce fired but response pending), keep showing local data.
    return searchQuery.trim() && searchResults !== undefined ? searchResults : services
  }, [services, searchQuery, searchResults])

  const visibleCategories = useMemo(() => {
    if (selectedCategoryId) {
      return categories.filter((c) => c.id === selectedCategoryId)
    }
    if (searchQuery.trim()) {
      const matchingCategoryIds = new Set(filteredServices.map((s) => s.categoryId))
      return categories.filter((c) => matchingCategoryIds.has(c.id))
    }
    return categories
  }, [categories, selectedCategoryId, searchQuery, filteredServices])

  const uncategorizedServices = useMemo(() => {
    const categoryIds = new Set(categories.map((c) => c.id))
    return filteredServices.filter((s) => !s.categoryId || !categoryIds.has(s.categoryId))
  }, [filteredServices, categories])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of categories) {
      counts[c.id] = c.servicesCount ?? 0
    }
    return counts
  }, [categories])

  const handleAddCategory = (data: Parameters<typeof mutations.createCategory.mutate>[0]) => {
    mutations.createCategory.mutate(data, {
      onSuccess: () => setAddCategoryOpen(false),
    })
  }

  const handleEditCategory = (data: Parameters<typeof mutations.createCategory.mutate>[0]) => {
    if (!editCategoryTarget) return
    const id = editCategoryTarget.id
    mutations.updateCategory.mutate(
      { id, patch: data },
      {
        onSuccess: () => {
          setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
          setEditCategoryTarget(null)
        },
      },
    )
  }

  const handleAddService = async (
    data: Parameters<typeof mutations.createService.mutate>[0],
  ): Promise<void> => {
    await mutations.createService.mutateAsync(data)
  }

  const handleEditService = async (
    data: Parameters<typeof mutations.createService.mutate>[0],
  ): Promise<void> => {
    if (!editServiceTarget) return
    await mutations.updateService.mutateAsync({
      id: editServiceTarget.id,
      patch: data,
    })
    setServices((prev) => prev.map((s) => (s.id === editServiceTarget.id ? { ...s, ...data } : s)))
  }

  const handleOpenEditService = (id: string) => {
    setEditServiceTargetId(id)
  }

  const handleDeleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id))
    mutations.deleteService.mutate(id)
  }

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setServices((prev) => prev.filter((s) => s.categoryId !== id))
    if (selectedCategoryId === id) setSelectedCategoryId(null)
    mutations.deleteCategory.mutate(id)
  }

  const handleArchiveService = (id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: false } : s)))
    mutations.archiveService.mutate(id)
  }

  const handleUnarchiveService = (id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: true } : s)))
    mutations.unarchiveService.mutate(id)
  }

  const handleArchiveCategory = (id: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: false } : c)))
    if (selectedCategoryId === id) setSelectedCategoryId(null)
    mutations.archiveCategory.mutate(id)
  }

  const handleUnarchiveCategory = (id: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: true } : c)))
    mutations.unarchiveCategory.mutate(id)
  }

  const handleOpenNewService = (categoryId?: string) => {
    setDefaultNewCategoryId(categoryId)
    setNewServiceOpen(true)
  }

  const handleSaveMenuOrder = (
    reorderedCategories: ServiceCategory[],
    reorderedServices: Service[],
  ) => {
    setCategories(reorderedCategories)
    setServices(reorderedServices)
    mutations.reorderCategories.mutate(reorderedCategories)
    mutations.reorderServices.mutate(reorderedServices)
    setMenuOrderOpen(false)
  }

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string)
    const svc = services.find((s) => s.id === active.id)
    dragSourceRef.current = svc ? { id: svc.id, categoryId: svc.categoryId } : null
  }

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return

    const overData = over.data.current as
      | { categoryId?: string; sortable?: { containerId?: string } }
      | undefined

    // Destination category: from the hovered service's data, or from the
    // droppable container id (category section), or from over.id itself.
    const destCategoryId =
      overData?.categoryId ?? overData?.sortable?.containerId ?? (over.id as string)

    setServices((prev) => {
      const activeService = prev.find((s) => s.id === active.id)
      if (!activeService || activeService.categoryId === destCategoryId) return prev
      return prev.map((s) => (s.id === activeService.id ? { ...s, categoryId: destCategoryId } : s))
    })
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    const source = dragSourceRef.current
    dragSourceRef.current = null

    if (!over) return

    const overId = over.id as string
    const activeServiceId = active.id as string

    // Determine destination category: prefer the over-item's categoryId from
    // its sortable data, fall back to droppable container id (empty category).
    const overData = over.data.current as
      | {
          type?: string
          categoryId?: string
          sortable?: { containerId?: string }
        }
      | undefined
    const overCategoryId = overData?.categoryId ?? overData?.sortable?.containerId ?? overId // overId itself is the category when dropping on empty zone

    let nextServices: Service[] = []

    setServices((prev) => {
      const activeIndex = prev.findIndex((s) => s.id === activeServiceId)
      if (activeIndex === -1) return prev

      const overIndex = prev.findIndex((s) => s.id === overId)

      let reordered: typeof prev
      let _moved: (typeof prev)[0]

      if (overIndex === -1) {
        reordered = prev.map((s) =>
          s.id === activeServiceId ? { ...s, categoryId: overCategoryId } : s,
        )
        _moved = reordered.find((s) => s.id === activeServiceId)!
      } else if (activeServiceId === overId) {
        reordered = prev
        _moved = prev[activeIndex]
      } else {
        reordered = arrayMove(prev, activeIndex, overIndex)
        _moved = reordered[overIndex]
      }

      nextServices = reordered
      return reordered
    })

    // Fire API outside the state updater to avoid StrictMode double-invocation.
    queueMicrotask(() => {
      if (nextServices.length === 0) return

      const moved = nextServices.find((s) => s.id === activeServiceId)
      if (!moved) return

      const categoryChanged = source !== null && moved.categoryId !== source.categoryId

      if (categoryChanged) {
        // Category changed — call updateService to re-link the category.
        mutations.updateService.mutate({
          id: moved.id,
          patch: { categoryId: moved.categoryId },
        })
      } else {
        // Same category — reorder all services in that category.
        const categoryServices = nextServices
          .filter((s) => s.categoryId === moved.categoryId)
          .map((s, i) => ({ ...s, order: i }))
        mutations.reorderServices.mutate(categoryServices)
      }
    })
  }

  const activeService = activeId ? services.find((s) => s.id === activeId) : null
  const activeServiceCategory = activeService
    ? (categories.find((c) => c.id === activeService.categoryId) ?? null)
    : null

  if (newServiceOpen || editServiceTargetId) {
    return (
      <NewServiceSheet
        key={editServiceTarget?.id ?? "__loading__"}
        categories={editServiceTargetId ? allCategories : categories}
        defaultCategoryId={editServiceTarget?.categoryId ?? defaultNewCategoryId}
        service={editServiceTarget ?? undefined}
        isLoading={!!editServiceTargetId && isLoadingEditService}
        onSave={editServiceTargetId ? handleEditService : handleAddService}
        onClose={() => {
          setNewServiceOpen(false)
          setEditServiceTargetId(null)
        }}
      />
    )
  }

  if (menuOrderOpen) {
    return (
      <SetMenuOrderSheet
        categories={categories}
        services={services}
        onSave={handleSaveMenuOrder}
        onClose={() => setMenuOrderOpen(false)}
      />
    )
  }

  return (
    <>
      <header className="flex w-full items-center justify-center px-6 py-6">
        <div className="flex w-full max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-medium leading-8 text-foreground">Service menu</h1>
            <p className="text-sm text-muted-foreground">
              View and manage the services offered by your business.{" "}
              <span className="cursor-pointer text-primary hover:underline">Learn more</span>
            </p>
          </div>
          <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  radius="full"
                  size="sm"
                  disabled
                  className="flex-1 gap-1.5 px-4 sm:flex-initial"
                >
                  Options
                  <ChevronDownIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="gap-3 py-2.5">
                  <LinkIcon className="size-4 text-foreground" />
                  Quick booking link
                </DropdownMenuItem>
                {canManage && (
                  <DropdownMenuItem className="gap-3 py-2.5" onClick={() => setMenuOrderOpen(true)}>
                    <ArrowDownUpIcon className="size-4 text-foreground" />
                    Set menu order
                  </DropdownMenuItem>
                )}
                {canManage && (
                  <DropdownMenuItem className="gap-3 py-2.5">
                    <ArrowDownUpIcon className="size-4 text-foreground" />
                    Set booking sequence
                  </DropdownMenuItem>
                )}
                {canManage && (
                  <DropdownMenuItem className="gap-3 py-2.5">
                    <SettingsIcon className="size-4 text-foreground" />
                    Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-3 py-2.5">
                  <PdfFileIcon />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 py-2.5">
                  <XlsFileIcon />
                  Download Excel
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 py-2.5">
                  <CsvFileIcon />
                  Download CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button radius="full" size="sm" className="flex-1 gap-1.5 px-5 sm:flex-initial">
                    Add
                    <ChevronDownIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem className="py-2.5" onClick={() => handleOpenNewService()}>
                    Single service
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2.5" onClick={() => setAddCategoryOpen(true)}>
                    Category
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <div className="flex w-full items-center justify-center px-6 pb-4">
        <div className="flex w-full max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-initial">
            <div className="relative w-full sm:w-64">
              <SearchInput
                placeholder="Search service name"
                onValueChange={setSearchQuery}
                containerClassName="w-full"
                className="h-9 w-full"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted border-t-foreground" />
                </div>
              )}
            </div>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              variant="outline"
              radius="full"
              size="sm"
              aria-label="Filters"
              onClick={() => setFiltersOpen(true)}
              className="flex-1 gap-1.5 px-4 sm:flex-none sm:size-icon-sm"
            >
              <SlidersHorizontalIcon className="size-4" />
              <span className="sm:hidden">Filters</span>
            </Button>
            {canManage && (
              <Button
                variant="outline"
                radius="full"
                size="sm"
                className="flex-1 gap-1.5 sm:w-auto sm:flex-none"
                onClick={() => setMenuOrderOpen(true)}
              >
                <ArrowDownUpIcon className="size-4" />
                Order
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 justify-center px-6 pb-10">
        <div className="flex w-full max-w-6xl flex-col gap-6 md:flex-row">
          <CategorySidebar
            categories={categories.filter((c) => c.isActive !== false)}
            selectedId={selectedCategoryId}
            counts={categoryCounts}
            totalCount={categories
              .filter((c) => c.isActive !== false)
              .reduce((sum, c) => sum + (c.servicesCount ?? 0), 0)}
            onSelect={setSelectedCategoryId}
            onAddCategory={() => setAddCategoryOpen(true)}
            onAddService={handleOpenNewService}
            onDeleteCategory={handleDeleteCategory}
          />

          <div className="min-w-0 flex-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {isFetchingServices && selectedCategoryId && (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
                </div>
              )}
              {isSearching && (
                <div className="flex flex-col gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length loading skeleton, no stable ID
                    <div key={i} className="rounded-2xl border border-border/60 bg-sand-2 p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <Skeleton className="h-7 w-36" />
                        <Skeleton className="h-8 w-20 rounded-full" />
                      </div>
                      <div className="flex flex-col gap-2">
                        {Array.from({ length: 2 }).map((_, j) => (
                          <div
                            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length loading skeleton, no stable ID
                            key={j}
                            className="flex items-center overflow-hidden rounded-2xl border border-border/60 bg-background"
                          >
                            <Skeleton className="w-4 self-stretch rounded-none" />
                            <div className="flex flex-1 items-center gap-4 px-4 py-4">
                              <div className="flex-1 space-y-1.5">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                              </div>
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div
                className={`flex flex-col gap-6${isSearching ? " hidden" : ""}${isFetchingServices && selectedCategoryId ? " opacity-40 pointer-events-none" : ""}`}
              >
                {visibleCategories.map((cat) => {
                  const catServices = filteredServices.filter((s) => s.categoryId === cat.id)
                  return (
                    <CategorySection
                      key={cat.id}
                      category={cat}
                      services={catServices}
                      canManage={canManage}
                      onDeleteService={handleDeleteService}
                      onAddService={() => handleOpenNewService(cat.id)}
                      onDeleteCategory={() => handleDeleteCategory(cat.id)}
                      onEditService={handleOpenEditService}
                      onEditCategory={() => setEditCategoryTarget(cat)}
                      onArchiveCategory={() => handleArchiveCategory(cat.id)}
                      onUnarchiveCategory={() => handleUnarchiveCategory(cat.id)}
                      onArchiveService={handleArchiveService}
                      onUnarchiveService={handleUnarchiveService}
                    />
                  )
                })}

                {!selectedCategoryId && uncategorizedServices.length > 0 && (
                  <CategorySection
                    category={{
                      id: "",
                      name: "Uncategorized",
                      color: "blue",
                      order: 9999,
                      parentId: null,
                      isSystemManaged: true,
                      isActive: true,
                      servicesCount: uncategorizedServices.length,
                    }}
                    services={uncategorizedServices}
                    canManage={canManage}
                    onDeleteService={handleDeleteService}
                    onAddService={() => handleOpenNewService()}
                    onDeleteCategory={() => {}}
                    onEditService={handleOpenEditService}
                    onArchiveService={handleArchiveService}
                  />
                )}

                {visibleCategories.length === 0 && uncategorizedServices.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
                    <p className="text-sm text-muted-foreground">
                      No categories yet.{" "}
                      {canManage && (
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => setAddCategoryOpen(true)}
                        >
                          Add a category
                        </button>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <DragOverlay>
                {activeService && activeServiceCategory ? (
                  <ServiceCardInner
                    service={activeService}
                    category={activeServiceCategory}
                    onDelete={() => {}}
                    dragging={true}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>

      <AddCategoryDialog
        open={addCategoryOpen}
        onOpenChange={setAddCategoryOpen}
        onAdd={handleAddCategory}
        isPending={mutations.createCategory.isPending}
      />

      <AddCategoryDialog
        open={editCategoryTarget !== null}
        onOpenChange={(next) => {
          if (!next) setEditCategoryTarget(null)
        }}
        onAdd={handleEditCategory}
        category={editCategoryTarget ?? undefined}
        isPending={mutations.updateCategory.isPending}
      />

      <FiltersDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={activeFilters}
        teamMembers={Array.from(
          new Map(teamMembers.map((m) => [m.id, { id: m.id, name: m.name }])).values(),
        )}
        onApply={setActiveFilters}
      />
    </>
  )
}

function PdfFileIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="2" y="1" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M9.5 1v3.5H13"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="4"
        y="11.5"
        fontSize="3.8"
        fontWeight="700"
        fill="currentColor"
        fontFamily="sans-serif"
      >
        PDF
      </text>
    </svg>
  )
}

function XlsFileIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="2" y="1" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M9.5 1v3.5H13"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="4"
        y="11.5"
        fontSize="3.8"
        fontWeight="700"
        fill="currentColor"
        fontFamily="sans-serif"
      >
        XLS
      </text>
    </svg>
  )
}

function CsvFileIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="2" y="1" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M9.5 1v3.5H13"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="4"
        y="11.5"
        fontSize="3.8"
        fontWeight="700"
        fill="currentColor"
        fontFamily="sans-serif"
      >
        CSV
      </text>
    </svg>
  )
}
