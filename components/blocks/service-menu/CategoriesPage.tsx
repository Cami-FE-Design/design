"use client"

import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  MoreHorizontalIcon,
  PlusIcon,
} from "lucide-react"
import { useRef, useState } from "react"
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui"
import { useServiceCatalogMutations, useServiceCategories } from "@/lib/service-catalog/store"
import type { ServiceCategory } from "@/lib/service-catalog/types"
import { AddCategoryDialog } from "./AddCategoryDialog"
import { CategoryDetailDialog } from "./CategoryDetailDialog"

type CategoriesPageProps = {
  initialCategories?: ServiceCategory[]
}

export function CategoriesPage({ initialCategories }: CategoriesPageProps) {
  const { data: allCategories = [], isLoading: catsLoading } = useServiceCategories({
    initialData: initialCategories,
  })
  const mutations = useServiceCatalogMutations()

  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceCategory | null>(null)
  const [confirming, setConfirming] = useState<{
    category: ServiceCategory
    action: "archive" | "delete"
  } | null>(null)
  const lastConfirmingRef = useRef<typeof confirming>(null)

  const PAGE_SIZE = 10
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [sort, setSort] = useState<{
    key: "name" | "servicesCount"
    dir: "asc" | "desc"
  } | null>(null)

  const toggleSort = (key: "name" | "servicesCount") => {
    setSort((prev) =>
      prev?.key === key ? (prev.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" },
    )
  }

  const merchantCategories = allCategories.filter((c) => c.isSystemManaged === false)

  const sortedCategories = sort
    ? [...merchantCategories].sort((a, b) => {
        const mul = sort.dir === "asc" ? 1 : -1
        if (sort.key === "name") return mul * a.name.localeCompare(b.name)
        return mul * (a.servicesCount - b.servicesCount)
      })
    : merchantCategories

  const visibleCategories = sortedCategories.slice(0, visibleCount)
  const hasMore = visibleCount < sortedCategories.length
  const handleAdd = (data: Parameters<typeof mutations.createCategory.mutate>[0]) => {
    mutations.createCategory.mutate(data, {
      onSuccess: () => setAddOpen(false),
    })
  }

  const handleUpdate = async (
    id: string,
    patch: Parameters<typeof mutations.updateCategory.mutate>[0]["patch"],
  ): Promise<void> => {
    await mutations.updateCategory.mutateAsync({ id, patch })
  }

  const _handleDelete = (id: string) => {
    mutations.deleteCategory.mutate(id)
  }

  const handleArchive = (id: string) => {
    mutations.archiveCategory.mutate(id, {
      onSuccess: () => setConfirming(null),
    })
  }

  const handleUnarchive = (id: string) => {
    mutations.unarchiveCategory.mutate(id)
  }

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-background">
          <header className="flex w-full items-center justify-center px-6 py-6">
            <div className="flex w-full max-w-5xl items-center justify-between gap-3">
              <div className="flex flex-col">
                <h1 className="text-2xl font-medium leading-8 text-foreground">Categories</h1>
                <p className="text-sm text-muted-foreground">
                  Manage the service categories for your business.
                </p>
              </div>
              <Button
                radius="full"
                size="sm"
                className="gap-1.5 px-5"
                onClick={() => setAddOpen(true)}
              >
                <PlusIcon className="size-4" />
                Add category
              </Button>
            </div>
          </header>
        </div>

        {/* Scrollable table area */}
        <div className="flex-1 overflow-auto px-6 pb-10">
          <div className="flex w-full justify-center">
            <div className="w-full max-w-5xl">
              <Table containerClassName="overflow-visible">
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead>
                      <button
                        type="button"
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => toggleSort("name")}
                      >
                        Name
                        <SortIcon active={sort?.key === "name"} dir={sort?.dir} />
                      </button>
                    </TableHead>
                    <TableHead className="w-20">Color</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">
                      <button
                        type="button"
                        className="ml-auto flex items-center gap-1 hover:text-foreground"
                        onClick={() => toggleSort("servicesCount")}
                      >
                        Total services
                        <SortIcon active={sort?.key === "servicesCount"} dir={sort?.dir} />
                      </button>
                    </TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {catsLoading &&
                    Array.from({ length: 5 }).map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length loading skeleton, no stable ID
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="size-3 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell className="flex justify-end">
                          <Skeleton className="h-4 w-6" />
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    ))}
                  {!catsLoading && merchantCategories.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        No categories yet.{" "}
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => setAddOpen(true)}
                        >
                          Add your first category.
                        </button>
                      </TableCell>
                    </TableRow>
                  )}
                  {visibleCategories.map((cat) => (
                    <TableRow
                      key={cat.id}
                      data-testid="category-row"
                      className={cat.isActive === false ? "opacity-50" : ""}
                    >
                      <TableCell className="font-medium text-foreground">{cat.name}</TableCell>
                      <TableCell>
                        <span
                          role="img"
                          aria-label={cat.color}
                          className="inline-block size-3 rounded-full"
                          style={{ backgroundColor: colorHex(cat.color) }}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {cat.description ? (
                          <span className="line-clamp-1">{cat.description}</span>
                        ) : (
                          <span>—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-foreground">
                        {cat.servicesCount}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              radius="full"
                              className="text-muted-foreground"
                              aria-label={`Actions for ${cat.name}`}
                            >
                              <MoreHorizontalIcon className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            {cat.isActive !== false && (
                              <DropdownMenuItem onClick={() => setEditing(cat)}>
                                Edit
                              </DropdownMenuItem>
                            )}
                            {cat.isActive === false ? (
                              <DropdownMenuItem onClick={() => handleUnarchive(cat.id)}>
                                Unarchive
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  setConfirming({
                                    category: cat,
                                    action: "archive",
                                  })
                                }
                              >
                                Archive
                              </DropdownMenuItem>
                            )}
                            {cat.isActive !== false && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() =>
                                    setConfirming({
                                      category: cat,
                                      action: "delete",
                                    })
                                  }
                                >
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                    Load more
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddCategoryDialog
        open={addOpen}
        onOpenChange={(open) => {
          if (!open && !mutations.isCreatingCategory) setAddOpen(false)
        }}
        onAdd={handleAdd}
        isPending={mutations.isCreatingCategory}
      />

      <CategoryDetailDialog
        category={editing}
        initialMode="edit"
        onClose={() => setEditing(null)}
        onUpdate={handleUpdate}
      />

      {(() => {
        if (confirming) lastConfirmingRef.current = confirming
        const display = lastConfirmingRef.current
        const isDelete = display?.action === "delete"
        return (
          <Dialog
            open={confirming !== null}
            onOpenChange={(open) => {
              if (!open) setConfirming(null)
            }}
          >
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>
                  {display
                    ? isDelete
                      ? `Delete ${display.category.name}?`
                      : `Archive ${display.category.name}?`
                    : ""}
                </DialogTitle>
                <DialogDescription>
                  {isDelete
                    ? "This permanently removes the category and all its services. This cannot be undone."
                    : "Archived categories are hidden from clients but you can restore them later."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" radius="full" size="sm">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  variant={isDelete ? "destructive" : "default"}
                  radius="full"
                  size="sm"
                  disabled={mutations.isDeletingCategory}
                  onClick={() => {
                    if (!display) return
                    if (display.action === "delete") {
                      mutations.deleteCategory.mutate(display.category.id, {
                        onSuccess: () => setConfirming(null),
                      })
                    } else {
                      handleArchive(display.category.id)
                      setConfirming(null)
                    }
                  }}
                >
                  {mutations.isDeletingCategory ? "Deleting…" : isDelete ? "Delete" : "Archive"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      })()}
    </>
  )
}

function SortIcon({ active, dir }: { active: boolean; dir?: "asc" | "desc" }) {
  if (!active) return <ArrowUpDownIcon className="size-3 text-muted-foreground" />
  return dir === "asc" ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />
}

const COLOR_HEX: Record<string, string> = {
  blue: "#93c5fd",
  purple: "#c4b5fd",
  pink: "#f9a8d4",
  red: "#fca5a5",
  orange: "#fdba74",
  yellow: "#fde047",
  green: "#86efac",
  teal: "#5eead4",
}

function colorHex(color: string): string {
  return COLOR_HEX[color] ?? "#e5e7eb"
}
