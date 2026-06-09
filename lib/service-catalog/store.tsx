"use client"

// Local, mock-backed replacement for the developer repo's data layer.
//
// The developer repo wires the Service-menu / Categories screens to
// react-query + Redux + an HTTP service layer. This design/prototype repo has
// none of that, so this module re-implements the SAME hook surface
// (useServices, useServiceCategories, useService, useServiceSearch,
// useServiceCatalogMutations, useTeamMembers) over plain React state seeded
// from mock-data.ts. The hooks return react-query-shaped results
// ({ data, isLoading, isFetching } and mutation objects with
// .mutate / .mutateAsync / .isPending) so the ported components compile and
// behave with minimal edits.
//
// There is no network, no permissions, and no auth here — by design.

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { seedCategories, seedServices, seedTeamMembers, type TeamMember } from "./mock-data"
import type { AddCategoryInput, AddServiceInput, Service, ServiceCategory } from "./types"

export type { TeamMember }

function genId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
  }
  return `${prefix}-${Math.floor(Math.random() * 1e9).toString(36)}`
}

// ─── Context ────────────────────────────────────────────────────────────────

type CatalogContextValue = {
  categories: ServiceCategory[]
  services: Service[]
  teamMembers: TeamMember[]
  createCategory: (input: AddCategoryInput) => ServiceCategory
  updateCategory: (id: string, patch: Partial<AddCategoryInput>) => void
  deleteCategory: (id: string) => void
  reorderCategories: (ordered: ServiceCategory[]) => void
  archiveCategory: (id: string) => void
  unarchiveCategory: (id: string) => void
  createService: (input: AddServiceInput) => Service
  updateService: (id: string, patch: Partial<AddServiceInput>) => void
  deleteService: (id: string) => void
  reorderServices: (reordered: Service[]) => void
  archiveService: (id: string) => void
  unarchiveService: (id: string) => void
  deleteVariant: (serviceId: string, variantId: string) => void
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function ServiceCatalogProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<ServiceCategory[]>(seedCategories)
  const [services, setServices] = useState<Service[]>(seedServices)
  const [teamMembers] = useState<TeamMember[]>(seedTeamMembers)

  // Categories enriched with a live `servicesCount`. Recomputed only when the
  // underlying state changes, so the reference is stable across unrelated
  // re-renders — the consuming pages sync local state off this reference.
  const categoriesWithCounts = useMemo<ServiceCategory[]>(
    () =>
      categories.map((c) => ({
        ...c,
        servicesCount: services.filter((s) => s.categoryId === c.id && s.isActive !== false).length,
      })),
    [categories, services],
  )

  const value = useMemo<CatalogContextValue>(() => {
    const nameFor = (categoryId: string) =>
      categories.find((c) => c.id === categoryId)?.name ?? null

    return {
      categories: categoriesWithCounts,
      services,
      teamMembers,

      // ── Categories ──────────────────────────────────────────────────────
      createCategory: (input) => {
        const siblings = categories.filter((c) => !c.isSystemManaged)
        const created: ServiceCategory = {
          id: genId("cat"),
          name: input.name,
          color: input.color ?? "blue",
          description: input.description,
          order: siblings.length,
          parentId: null,
          isSystemManaged: false,
          isActive: true,
          servicesCount: 0,
        }
        setCategories((prev) => [...prev, created])
        return created
      },
      updateCategory: (id, patch) => {
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
      },
      deleteCategory: (id) => {
        setCategories((prev) => prev.filter((c) => c.id !== id))
        setServices((prev) => prev.filter((s) => s.categoryId !== id))
      },
      reorderCategories: (ordered) => {
        const orderById = new Map(ordered.map((c, i) => [c.id, i]))
        setCategories((prev) =>
          [...prev]
            .sort((a, b) => {
              const ai = orderById.get(a.id)
              const bi = orderById.get(b.id)
              if (ai == null && bi == null) return a.order - b.order
              if (ai == null) return 1
              if (bi == null) return -1
              return ai - bi
            })
            .map((c) => {
              const i = orderById.get(c.id)
              return i == null ? c : { ...c, order: i }
            }),
        )
      },
      archiveCategory: (id) => {
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: false } : c)))
      },
      unarchiveCategory: (id) => {
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: true } : c)))
      },

      // ── Services ────────────────────────────────────────────────────────
      createService: (input) => {
        const inCategory = services.filter((s) => s.categoryId === input.categoryId)
        const created: Service = {
          id: genId("svc"),
          name: input.name,
          categoryId: input.categoryId,
          categoryName: nameFor(input.categoryId),
          description: input.description,
          priceType: input.priceType,
          price: input.price,
          duration: input.duration,
          order: inCategory.length,
          teamMemberIds: input.teamMemberIds ?? [],
          imageDataUrl: input.imageDataUrl,
          isActive: true,
          variants: (input.variants ?? []) as Service["variants"],
          extraTimes: input.extraTimes ?? [],
        }
        setServices((prev) => [...prev, created])
        return created
      },
      updateService: (id, patch) => {
        setServices((prev) =>
          prev.map((s) => {
            if (s.id !== id) return s
            const next = { ...s, ...patch } as Service
            if (patch.categoryId && patch.categoryId !== s.categoryId) {
              next.categoryName = nameFor(patch.categoryId)
            }
            return next
          }),
        )
      },
      deleteService: (id) => {
        setServices((prev) => prev.filter((s) => s.id !== id))
      },
      reorderServices: (reordered) => {
        const orderById = new Map(reordered.map((s) => [s.id, s]))
        setServices((prev) => prev.map((s) => orderById.get(s.id) ?? s))
      },
      archiveService: (id) => {
        setServices((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: false } : s)))
      },
      unarchiveService: (id) => {
        setServices((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: true } : s)))
      },
      deleteVariant: (serviceId, variantId) => {
        setServices((prev) =>
          prev.map((s) =>
            s.id === serviceId
              ? {
                  ...s,
                  variants: (s.variants ?? []).filter((v) => v.id !== variantId),
                }
              : s,
          ),
        )
      },
    }
  }, [categories, categoriesWithCounts, services, teamMembers])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext)
  if (!ctx) {
    throw new Error("Service catalog hooks must be used within <ServiceCatalogProvider>")
  }
  return ctx
}

// ─── react-query-shaped query hooks ──────────────────────────────────────────

type QueryResult<T> = {
  data: T
  isLoading: boolean
  isFetching: boolean
  isError: false
  error: null
  refetch: () => void
}

const noop = () => {}

function asQuery<T>(data: T): QueryResult<T> {
  return {
    data,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: noop,
  }
}

export const SERVICE_CATEGORIES_QUERY_KEY = ["service-categories"] as const
export const SERVICES_QUERY_KEY = ["services"] as const

export function useServiceCategories(opts?: {
  initialData?: ServiceCategory[]
  status?: string
}): QueryResult<ServiceCategory[]> {
  const { categories } = useCatalog()
  const data = useMemo(() => {
    if (!opts?.status || opts.status === "all") return categories
    if (opts.status === "active") return categories.filter((c) => c.isActive !== false)
    return categories.filter((c) => c.isActive === false)
  }, [categories, opts?.status])
  return asQuery(data)
}

export function useServices(opts?: {
  initialData?: Service[]
  categoryId?: string | null
  status?: string
  teamMemberId?: string
}): QueryResult<Service[]> {
  const { services } = useCatalog()
  const { categoryId, status, teamMemberId } = opts ?? {}
  const data = useMemo(() => {
    let out = services
    if (categoryId) out = out.filter((s) => s.categoryId === categoryId)
    if (status === "active") out = out.filter((s) => s.isActive !== false)
    else if (status === "archived" || status === "inactive")
      out = out.filter((s) => s.isActive === false)
    if (teamMemberId) out = out.filter((s) => s.teamMemberIds.includes(teamMemberId))
    return [...out].sort((a, b) => a.order - b.order)
  }, [services, categoryId, status, teamMemberId])
  return asQuery(data)
}

export function useService(uuid: string | null): QueryResult<Service | null> {
  const { services } = useCatalog()
  const data = useMemo(
    () => (uuid ? (services.find((s) => s.id === uuid) ?? null) : null),
    [services, uuid],
  )
  return asQuery(data)
}

export function useServiceSearch(q: string): QueryResult<Service[] | undefined> {
  const { services } = useCatalog()
  const [debouncedQ, setDebouncedQ] = useState(q)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(id)
  }, [q])
  const data = useMemo(() => {
    const needle = debouncedQ.trim().toLowerCase()
    if (!needle) return undefined
    return services.filter((s) => s.name.toLowerCase().includes(needle))
  }, [services, debouncedQ])
  return asQuery(data)
}

// ─── react-query-shaped mutation hooks ───────────────────────────────────────

type MutateOptions<TData, TVars> = {
  onSuccess?: (data: TData, variables: TVars) => void
  onError?: (error: Error, variables: TVars) => void
  onSettled?: () => void
}

type Mutation<TData, TVars> = {
  mutate: (variables: TVars, options?: MutateOptions<TData, TVars>) => void
  mutateAsync: (variables: TVars) => Promise<TData>
  isPending: boolean
}

function makeMutation<TData, TVars>(
  fn: (variables: TVars) => TData,
  successToast?: string,
): Mutation<TData, TVars> {
  const run = (variables: TVars, options?: MutateOptions<TData, TVars>) => {
    const data = fn(variables)
    if (successToast) toast.success(successToast)
    options?.onSuccess?.(data, variables)
    options?.onSettled?.()
    return data
  }
  return {
    mutate: run,
    mutateAsync: (variables) => Promise.resolve(run(variables)),
    isPending: false,
  }
}

export function useServiceCatalogMutations() {
  const c = useCatalog()

  const createCategory = makeMutation<ServiceCategory, AddCategoryInput>(
    (input) => c.createCategory(input),
    "Category added",
  )
  const updateCategory = makeMutation<void, { id: string; patch: Partial<AddCategoryInput> }>(
    ({ id, patch }) => c.updateCategory(id, patch),
    "Category updated",
  )
  const deleteCategory = makeMutation<void, string>(
    (id) => c.deleteCategory(id),
    "Category deleted",
  )
  const reorderCategories = makeMutation<void, ServiceCategory[]>((ordered) =>
    c.reorderCategories(ordered),
  )
  const archiveCategory = makeMutation<void, string>(
    (id) => c.archiveCategory(id),
    "Category archived",
  )
  const unarchiveCategory = makeMutation<void, string>(
    (id) => c.unarchiveCategory(id),
    "Category restored",
  )

  const createService = makeMutation<Service, AddServiceInput>(
    (input) => c.createService(input),
    "Service added",
  )
  const updateService = makeMutation<void, { id: string; patch: Partial<AddServiceInput> }>(
    ({ id, patch }) => c.updateService(id, patch),
    "Service updated",
  )
  const deleteService = makeMutation<void, string>((id) => c.deleteService(id), "Service deleted")
  const reorderServices = makeMutation<void, Service[]>((reordered) => c.reorderServices(reordered))
  const archiveService = makeMutation<void, string>(
    (id) => c.archiveService(id),
    "Service archived",
  )
  const unarchiveService = makeMutation<void, string>(
    (id) => c.unarchiveService(id),
    "Service restored",
  )

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    archiveCategory,
    unarchiveCategory,
    createService,
    updateService,
    deleteService,
    reorderServices,
    archiveService,
    unarchiveService,
    isCreatingCategory: false,
    isUpdatingCategory: false,
    isDeletingCategory: false,
    isReorderingCategories: false,
    isArchivingCategory: false,
    isCreatingService: false,
    isUpdatingService: false,
    isDeletingService: false,
    isReorderingServices: false,
    isArchivingService: false,
  }
}

// ─── Team members (replaces @/modules/team) ──────────────────────────────────

export function useTeamMembers(_status?: string): {
  members: TeamMember[]
  isPending: boolean
} {
  const { teamMembers } = useCatalog()
  return { members: teamMembers, isPending: false }
}

// ─── Variant deletion (replaces ../actions/catalog.actions) ───────────────────

export function useDeleteVariant() {
  const { deleteVariant } = useCatalog()
  return deleteVariant
}
