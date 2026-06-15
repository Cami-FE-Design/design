"use client"

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
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
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  CheckIcon,
  FileTextIcon,
  GripVerticalIcon,
  ImageIcon,
  type LucideIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SettingsIcon,
  Trash2Icon,
  UsersIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import {
  Controller,
  type FieldErrors,
  type UseFormReturn,
  useFieldArray,
  useForm,
} from "react-hook-form"
import { toast } from "sonner"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import {
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Textarea,
} from "@/components/ui"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import { type TeamMember, useDeleteVariant, useTeamMembers } from "@/lib/service-catalog/store"
import {
  type AddServiceInput,
  AddServiceInputSchema,
  APPOINTMENT_COLORS,
  DURATION_OPTIONS,
  EXTRA_TIME_META,
  EXTRA_TIME_TYPES,
  type ExtraTimeSegment,
  type ExtraTimeType,
  formatDurationMin,
  PRICE_TYPES,
  type Service,
  type ServiceCategory,
  type ServiceVariantInput,
} from "@/lib/service-catalog/types"
import { cn } from "@/lib/utils"
import { AddVariantDialog } from "./AddVariantDialog"

type NewServiceSheetProps = {
  categories: ServiceCategory[]
  defaultCategoryId?: string
  service?: Service
  isLoading?: boolean
  onSave: (data: AddServiceInput) => Promise<void>
  onClose: () => void
}

type NavSection = "basic" | "team" | "online-booking" | "portfolio" | "settings"

const NAV_ITEMS: { id: NavSection; label: string; icon: LucideIcon }[] = [
  { id: "basic", label: "Basic details", icon: FileTextIcon },
  { id: "team", label: "Team members", icon: UsersIcon },
  { id: "online-booking", label: "Online booking", icon: CalendarIcon },
  { id: "portfolio", label: "Portfolio images", icon: ImageIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
]

const triggerOverride = "data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium"

const BASE_ID = "__base__"

function getColorHex(colorValue: string) {
  return APPOINTMENT_COLORS.find((c) => c.value === colorValue)?.hex ?? "#93c5fd"
}

export function NewServiceSheet({
  categories,
  defaultCategoryId,
  service,
  isLoading,
  onSave,
  onClose,
}: NewServiceSheetProps) {
  const { members: rawTeamMembers, isPending: teamLoading } = useTeamMembers("active")
  const teamMembers = useMemo(
    () => Array.from(new Map(rawTeamMembers.map((m) => [m.id, m])).values()),
    [rawTeamMembers],
  )
  const isEdit = service !== undefined
  const hadNoVariantsInitially = isEdit && (service?.variants?.length ?? 0) === 0
  // Show the base variant row in the variant list for new services and for edits that
  // previously had no variants — these are the cases where base will be prepended on save.
  const showBaseInVariantList = !isEdit || hadNoVariantsInitially
  const [isSaving, setIsSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<NavSection>("basic")
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(service?.imageDataUrl ?? null)

  const form = useForm<AddServiceInput>({
    // biome-ignore lint/suspicious/noExplicitAny: resolver type mismatch
    resolver: zodResolver(AddServiceInputSchema) as any,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: isEdit
      ? {
          name: service.name,
          categoryId: service.categoryId,
          description: service.description ?? "",
          priceType: service.priceType,
          price: service.price,
          duration: service.duration,
          teamMemberIds: service.teamMemberIds,
          requirePatchTest: false,
          aftercareInstructions: false,
          reminderToRebook: false,
          costOfService: undefined,
          sku: "",
          variants: (service.variants ?? []).map((v, i) => ({
            id: v.id,
            name: v.name,
            description: "",
            priceType: v.priceType,
            price: v.price,
            duration: v.duration,
            sortOrder: v.sortOrder ?? i,
            extraTimes: v.extraTimes ?? [],
          })),
          extraTimes: service.extraTimes ?? [],
        }
      : {
          name: "",
          categoryId: defaultCategoryId ?? categories[0]?.id ?? "",
          description: "",
          priceType: "Free",
          price: 0,
          duration: 60,
          teamMemberIds: [],
          requirePatchTest: false,
          aftercareInstructions: false,
          reminderToRebook: false,
          costOfService: undefined,
          sku: "",
          variants: [],
        },
  })

  // When editing: reset the form once the fetched service data arrives.
  // Intentionally keyed on service.id only — re-resetting on every prop
  // identity change would wipe in-flight edits.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        categoryId: service.categoryId,
        description: service.description ?? "",
        priceType: service.priceType,
        price: service.price,
        duration: service.duration,
        teamMemberIds: service.teamMemberIds,
        requirePatchTest: false,
        aftercareInstructions: false,
        reminderToRebook: false,
        costOfService: undefined,
        sku: "",
        variants: (service.variants ?? []).map((v, i) => ({
          id: v.id,
          name: v.name,
          description: "",
          priceType: v.priceType,
          price: v.price,
          duration: v.duration,
          sortOrder: v.sortOrder ?? i,
          extraTimes: v.extraTimes ?? [],
        })),
        extraTimes: service.extraTimes ?? [],
      })
      setImageDataUrl(service.imageDataUrl ?? null)
      setBaseVariantName(null) // let it re-mirror the (new) service name
    }
  }, [service?.id])

  // Once team members load, select all by default for new services
  useEffect(() => {
    if (!isEdit && !teamLoading && teamMembers.length > 0) {
      form.setValue(
        "teamMemberIds",
        teamMembers.map((m) => m.id),
      )
    }
  }, [teamLoading, teamMembers, isEdit, form])

  const descriptionLength = (form.watch("description") ?? "").length
  const selectedTeamMemberIds = form.watch("teamMemberIds")

  // Independent base-variant name — null means "mirror the service name".
  // Snapshotted from the service name when the first additional variant is added.
  const [baseVariantName, setBaseVariantName] = useState<string | null>(null)
  const displayBaseName = baseVariantName ?? form.watch("name")

  const handleSubmit = async (values: AddServiceInput) => {
    setIsSaving(true)
    try {
      // On CREATE: prepend the base as the first variant so the backend stores
      // it with its own independent name.
      // On EDIT with no pre-existing variants: treat like CREATE — the base has
      // never been stored as a variant, so prepend it now.
      // On EDIT with existing variants: the base is already stored in the backend;
      // re-prepending would create a duplicate on every save.
      // Always prepend the base as the first variant for new services (or edits of
      // previously variant-free services). This ensures the backend always stores at
      // least one variant, even for plain services.
      const variantsToSend =
        !isEdit || hadNoVariantsInitially
          ? [
              {
                id: undefined,
                name: displayBaseName || values.name,
                description: "",
                priceType: values.priceType,
                price: values.price,
                duration: values.duration,
                sortOrder: 0,
                extraTimes: values.extraTimes ?? [],
              },
              ...values.variants.map((v, i) => ({ ...v, sortOrder: i + 1 })),
            ]
          : values.variants
      await onSave({
        ...values,
        variants: variantsToSend,
        imageDataUrl: imageDataUrl ?? undefined,
      })
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  // Surface required-field validation as a toast when Save is pressed on an
  // invalid form (inline errors alone are easy to miss).
  const handleInvalid = (errors: FieldErrors<AddServiceInput>) => {
    const messages: string[] = []
    for (const err of Object.values(errors)) {
      if (err && typeof err.message === "string" && err.message) {
        messages.push(err.message)
      }
    }
    toast.error(messages.length > 0 ? messages.join(" · ") : "Please fill in all required fields.")
  }

  const toggleTeamMember = (id: string) => {
    const current = form.getValues("teamMemberIds")
    form.setValue(
      "teamMemberIds",
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    )
  }

  const allSelected = teamMembers.length > 0 && selectedTeamMemberIds.length === teamMembers.length

  const toggleAll = () => {
    form.setValue("teamMemberIds", allSelected ? [] : teamMembers.map((m) => m.id))
  }

  const teamCount = selectedTeamMemberIds.length

  function getNavBadge(section: NavSection) {
    if (section === "team") return teamCount > 0 ? teamCount : undefined
    if (section === "portfolio") return imageDataUrl ? 1 : undefined
    return undefined
  }

  if (isLoading) {
    return (
      <FullScreenEditDialog
        open={true}
        onOpenChange={(o) => {
          if (!o) onClose()
        }}
        title="Edit service"
        onSave={() => {}}
        saveDisabled
      >
        <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list — order never changes
                key={i}
                className="h-10 w-full rounded-2xl"
              />
            ))}
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background p-5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </FullScreenEditDialog>
    )
  }

  return (
    <FullScreenEditDialog
      open={true}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
      title={isEdit ? `Edit ${service.name}` : "New service"}
      onSave={form.handleSubmit(handleSubmit, handleInvalid)}
      saveDisabled={isSaving}
    >
      <Form {...form}>
        <form
          noValidate
          className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]"
        >
          <SectionNav active={activeSection} onChange={setActiveSection} getBadge={getNavBadge} />

          <section className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border/60 bg-background p-5">
            {activeSection === "basic" && (
              <BasicDetailsSection
                form={form}
                categories={categories}
                descriptionLength={descriptionLength}
                serviceId={service?.id}
                serviceCategoryName={service?.categoryName ?? null}
                serviceDuration={service?.duration}
                displayBaseName={displayBaseName}
                setBaseVariantName={setBaseVariantName}
                showBaseInVariantList={showBaseInVariantList}
              />
            )}
            {activeSection === "team" && (
              <TeamMembersSection
                teamMembers={teamMembers}
                isLoading={teamLoading}
                selectedIds={selectedTeamMemberIds}
                allSelected={allSelected}
                onToggleAll={toggleAll}
                onToggle={toggleTeamMember}
              />
            )}
            {activeSection === "online-booking" && <OnlineBookingSection />}
            {activeSection === "portfolio" && (
              <PortfolioSection imageDataUrl={imageDataUrl} onImageChange={setImageDataUrl} />
            )}
            {activeSection === "settings" && <SettingsSection form={form} />}
          </section>
        </form>
      </Form>
    </FullScreenEditDialog>
  )
}

function SectionNav({
  active,
  onChange,
  getBadge,
}: {
  active: NavSection
  onChange: (id: NavSection) => void
  getBadge: (id: NavSection) => number | undefined
}) {
  return (
    <aside aria-label="Sections" className="flex min-w-0 flex-col gap-1">
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <SectionNavItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            count={getBadge(item.id)}
            active={active === item.id}
            onSelect={() => onChange(item.id)}
          />
        ))}
      </ul>
    </aside>
  )
}

function SectionNavItem({
  label,
  icon: Icon,
  count,
  active,
  onSelect,
}: {
  label: string
  icon: LucideIcon
  count?: number
  active: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition-colors",
          active ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted/50",
        )}
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <span className="flex-1 truncate font-medium">{label}</span>
        {count !== undefined ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        ) : null}
      </button>
    </li>
  )
}

function BasicDetailsSection({
  form,
  categories,
  descriptionLength,
  serviceId,
  serviceCategoryName,
  serviceDuration,
  displayBaseName,
  setBaseVariantName,
  showBaseInVariantList,
}: {
  form: UseFormReturn<AddServiceInput>
  categories: ServiceCategory[]
  descriptionLength: number
  serviceId?: string
  serviceCategoryName?: string | null
  /** Stable duration value from the loaded service prop — used as fallback when
   *  form.watch("duration") hasn't propagated yet after a form.reset call. */
  serviceDuration?: number
  displayBaseName: string
  setBaseVariantName: (name: string | null) => void
  showBaseInVariantList: boolean
}) {
  const priceType = form.watch("priceType")
  const currency = "AED"

  // ── Extra time (base service only, synced to RHF form) ─────────────────────
  const extraTimePrefix = useId()
  const formExtraTimes = form.watch("extraTimes")
  const [baseExtraTimes, setBaseExtraTimes] = useState<ExtraTimeSegment[]>(
    () => form.getValues("extraTimes") ?? [],
  )

  // Sync local state when the form is reset (e.g., when editing a different service)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — sync on form reset
  useEffect(() => {
    setBaseExtraTimes(formExtraTimes ?? [])
  }, [JSON.stringify(formExtraTimes)])

  function syncExtraTimes(next: ExtraTimeSegment[]) {
    setBaseExtraTimes(next)
    form.setValue("extraTimes", next)
  }
  function addBaseExtraTime(type: ExtraTimeType) {
    syncExtraTimes([
      ...baseExtraTimes,
      {
        id: `${extraTimePrefix}-${baseExtraTimes.length}`,
        type,
        durationMin: 10,
      },
    ])
  }
  function updateBaseExtraTime(id: string, patch: Partial<Omit<ExtraTimeSegment, "id">>) {
    syncExtraTimes(baseExtraTimes.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }
  function removeBaseExtraTime(id: string) {
    syncExtraTimes(baseExtraTimes.filter((s) => s.id !== id))
  }
  function moveBaseExtraTime(id: string, dir: -1 | 1) {
    const idx = baseExtraTimes.findIndex((s) => s.id === id)
    const next = idx + dir
    if (idx < 0 || next < 0 || next >= baseExtraTimes.length) return
    const arr = [...baseExtraTimes]
    ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
    syncExtraTimes(arr)
  }

  const { fields, append, remove, update } = useFieldArray<AddServiceInput, "variants", "_key">({
    control: form.control,
    name: "variants",
    keyName: "_key",
  })

  const [variantDialog, setVariantDialog] = useState<{
    open: boolean
    editingBase: boolean
    index?: number
  }>({ open: false, editingBase: false })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const [itemOrder, setItemOrder] = useState<string[]>([])

  // Sync itemOrder when variants are added or removed
  // biome-ignore lint/correctness/useExhaustiveDependencies: stable join string as dep
  useEffect(() => {
    const newIds = [BASE_ID, ...fields.map((f) => f._key)]
    setItemOrder((prev) => {
      const kept = prev.filter((id) => newIds.includes(id))
      const added = newIds.filter((id) => !prev.includes(id))
      return [...kept, ...added]
    })
  }, [fields.map((f) => f._key).join(",")])

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    setItemOrder((prev) => {
      const oldIdx = prev.indexOf(active.id as string)
      const newIdx = prev.indexOf(over.id as string)
      if (oldIdx === -1 || newIdx === -1) return prev
      return arrayMove(prev, oldIdx, newIdx)
    })
  }

  const deleteVariant = useDeleteVariant()

  const handleVariantSave = (data: ServiceVariantInput) => {
    if (variantDialog.editingBase) {
      setBaseVariantName(data.name) // store independently
      form.setValue("priceType", data.priceType)
      form.setValue("price", data.price)
      form.setValue("duration", data.duration)
      syncExtraTimes(data.extraTimes ?? [])
    } else if (variantDialog.index !== undefined) {
      const existingId = form.getValues("variants")[variantDialog.index]?.id
      update(variantDialog.index, { ...data, id: existingId })
    } else {
      // Snapshot the base name the moment the first variant is added
      if (!hasVariants) {
        setBaseVariantName(displayBaseName || form.getValues("name"))
      }
      append({ ...data, sortOrder: fields.length })
    }
    setVariantDialog({ open: false, editingBase: false })
  }

  const handleDeleteVariant = async (fieldIndex: number) => {
    const variantId = form.getValues("variants")[fieldIndex]?.id
    if (serviceId && variantId) {
      deleteVariant(serviceId, variantId)
      toast.success("Variant deleted")
    } else {
      // Unsaved variant (no backend ID yet) — just remove from form state
      toast.success("Variant removed")
    }
    remove(fieldIndex)
  }

  const hasVariants = fields.length > 0
  // Show the price/duration/extra-time controls when there are no variants, OR when
  // we're editing a service that has exactly 1 stored (base) variant — that row is
  // intentionally hidden, so the pricing fields must remain visible instead.
  const showPricingFields = !hasVariants || (!showBaseInVariantList && fields.length === 1)
  // Only render the DnD variant list when there are rows that will actually be shown.
  const showVariantList = hasVariants && (showBaseInVariantList || fields.length > 1)

  const _serviceName = form.watch("name")
  const basePrice = form.watch("price")
  const basePriceType = form.watch("priceType")

  // Correct the form value when it's stale (0) due to the timing race between
  // form.reset() and the extraTimes watch triggering a re-render.
  // serviceDuration is the stable prop value from the loaded service.
  const rawDuration = form.watch("duration")
  useEffect(() => {
    if (serviceDuration != null && !rawDuration) {
      form.setValue("duration", serviceDuration, { shouldDirty: false })
    }
  }, [rawDuration, serviceDuration, form])

  const baseDuration = rawDuration || serviceDuration || 60

  const selectedCategoryId = form.watch("categoryId")
  const borderColor = getColorHex(
    categories.find((c) => c.id === selectedCategoryId)?.color ?? "blue",
  )
  return (
    <>
      <div className="flex flex-col gap-8">
        <div>
          <h3 className="mb-5 font-heading text-2xl font-semibold leading-9 text-foreground">
            Basic details
          </h3>

          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Service name</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      {(field.value ?? "").length}/255
                    </span>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Add a service name, e.g. Men's Haircut"
                      maxLength={255}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={triggerOverride}>
                        <SelectValue placeholder="Select category">
                          {(() => {
                            const cat = categories.find((c) => c.id === field.value)
                            if (cat) {
                              return (
                                <span className="flex items-center gap-2">
                                  <span
                                    className="inline-block size-3.5 rounded-full"
                                    style={{
                                      backgroundColor: getColorHex(cat.color),
                                    }}
                                  />
                                  {cat.name}
                                </span>
                              )
                            }
                            // Category not in the merchant list (e.g. system-managed
                            // global category) — use the name from the service response.
                            const fallbackName = serviceCategoryName
                            if (field.value && fallbackName) {
                              return <span>{fallbackName}</span>
                            }
                            return "Select category"
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className="inline-block size-3.5 rounded-full"
                              style={{
                                backgroundColor: getColorHex(cat.color),
                              }}
                            />
                            {cat.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The category displayed to you, and to clients online
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>
                      Description{" "}
                      <span className="font-normal text-muted-foreground">(Optional)</span>
                    </FormLabel>
                    <span className="text-xs text-muted-foreground">{descriptionLength}/1000</span>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Add a short description"
                      maxLength={1000}
                      rows={4}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <h4 className="mb-5 font-heading text-2xl font-semibold leading-9 text-foreground">
            Pricing and duration
          </h4>

          <div className="flex flex-col gap-4">
            {showPricingFields ? (
              <div className="grid grid-cols-3 items-start gap-4">
                <FormField
                  control={form.control}
                  name="priceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price type</FormLabel>
                      <Select
                        onValueChange={(v) => {
                          console.log
                          field.onChange(v)
                          if (v === "Free") form.clearErrors("price")
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={triggerOverride}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRICE_TYPES.map((pt) => (
                            <SelectItem key={pt} value={pt}>
                              {pt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="relative h-5">
                        <FormMessage className="absolute inset-x-0 top-0 text-xs leading-tight" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {currency || "AED"}
                          </span>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            className="pl-12"
                            disabled={priceType === "Free"}
                            {...field}
                            value={
                              priceType === "Free"
                                ? ""
                                : field.value === 0
                                  ? ""
                                  : (field.value ?? "")
                            }
                            onKeyDown={(e) => {
                              if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault()
                            }}
                            onChange={(e) => {
                              const val = e.target.value === "" ? 0 : Number(e.target.value)
                              field.onChange(val)
                              if (val === 0) form.setValue("priceType", "Free")
                              else if (form.getValues("priceType") === "Free")
                                form.setValue("priceType", "Fixed")
                            }}
                          />
                        </div>
                      </FormControl>
                      <div className="relative h-5">
                        <FormMessage className="absolute inset-x-0 top-0 text-xs leading-tight" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={field.value != null ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger className={triggerOverride}>
                            {/* Explicitly supply the label so the trigger always shows the
                                correct text even before SelectContent has mounted in its portal. */}
                            <SelectValue>
                              {field.value != null
                                ? (DURATION_OPTIONS.find((d) => d.id === field.value)?.value ??
                                  formatDurationMin(field.value))
                                : null}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {field.value != null &&
                            !DURATION_OPTIONS.some((d) => d.id === field.value) && (
                              <SelectItem value={String(field.value)}>
                                {formatDurationMin(field.value)}
                              </SelectItem>
                            )}
                          {DURATION_OPTIONS.map((d) => (
                            <SelectItem key={d.id} value={String(d.id)}>
                              {d.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="relative h-5">
                        <FormMessage className="absolute inset-x-0 top-0 text-xs leading-tight" />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            ) : null}

            {/* Extra time — shown in no-variant mode and the 1-stored-variant edit case */}
            {showPricingFields && (
              <>
                {baseExtraTimes.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-[1fr_1fr_2rem] gap-3">
                      <span className="text-sm font-medium text-foreground">Duration type</span>
                      <span className="text-sm font-medium text-foreground">Duration</span>
                      <span />
                    </div>
                    {/* Servicing time row: type is fixed, duration mirrors the 3-column Duration field above.
                        We intentionally do NOT register a second FormField for "duration" here to avoid
                        the dual-registration race that clears the value on mount/unmount cycles. */}
                    <div className="grid grid-cols-[1fr_1fr_2rem] items-center gap-3">
                      <Select value="servicing" disabled>
                        <SelectTrigger className={cn(triggerOverride, "opacity-60")}>
                          <SelectValue>Servicing time</SelectValue>
                        </SelectTrigger>
                      </Select>
                      <Select value={baseDuration != null ? String(baseDuration) : ""} disabled>
                        <SelectTrigger className={cn(triggerOverride, "opacity-60")}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {baseDuration && !DURATION_OPTIONS.some((d) => d.id === baseDuration) && (
                            <SelectItem value={String(baseDuration)}>
                              {formatDurationMin(baseDuration)}
                            </SelectItem>
                          )}
                          {DURATION_OPTIONS.map((d) => (
                            <SelectItem key={d.id} value={String(d.id)}>
                              {d.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span />
                    </div>
                    {baseExtraTimes.map((seg, idx) => (
                      <div
                        key={seg.id}
                        className="grid grid-cols-[1fr_1fr_2rem] items-center gap-3"
                      >
                        <Select
                          value={seg.type}
                          onValueChange={(v) =>
                            updateBaseExtraTime(seg.id, {
                              type: v as ExtraTimeType,
                            })
                          }
                        >
                          <SelectTrigger className={triggerOverride}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EXTRA_TIME_TYPES.filter(
                              (t) =>
                                t === seg.type ||
                                !baseExtraTimes.some((s) => s.id !== seg.id && s.type === t),
                            ).map((t) => (
                              <SelectItem key={t} value={t}>
                                {EXTRA_TIME_META[t].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={String(seg.durationMin)}
                          onValueChange={(v) =>
                            updateBaseExtraTime(seg.id, {
                              durationMin: Number(v),
                            })
                          }
                        >
                          <SelectTrigger className={triggerOverride}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 10, 15, 20, 25, 30, 45, 60, 90, 120].map((m) => (
                              <SelectItem key={m} value={String(m)}>
                                {m < 60
                                  ? `${m} min`
                                  : m === 60
                                    ? "1 hr"
                                    : `${Math.floor(m / 60)} hr${m % 60 > 0 ? ` ${m % 60} min` : ""}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted/50"
                              aria-label={`Options for ${EXTRA_TIME_META[seg.type].label}`}
                            >
                              <MoreHorizontalIcon className="size-4" aria-hidden />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => moveBaseExtraTime(seg.id, -1)}
                              disabled={idx === 0}
                            >
                              <ArrowUpIcon className="size-4" aria-hidden /> Move up
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => moveBaseExtraTime(seg.id, 1)}
                              disabled={idx === baseExtraTimes.length - 1}
                            >
                              <ArrowDownIcon className="size-4" aria-hidden /> Move down
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => removeBaseExtraTime(seg.id)}>
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}

                {/* Buttons row + total duration */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {baseExtraTimes.length < EXTRA_TIME_TYPES.length && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex h-10 items-center gap-2 rounded-xl bg-muted/40 px-3 text-sm text-foreground transition-colors hover:bg-muted/60"
                          >
                            <PlusIcon className="size-4 shrink-0" />
                            Add extra time
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-80 p-1">
                          {EXTRA_TIME_TYPES.filter(
                            (t) => !baseExtraTimes.some((s) => s.type === t),
                          ).map((t, i, arr) => (
                            <DropdownMenuItem
                              key={t}
                              className={cn(
                                "flex-col items-start gap-1 rounded-lg px-3 py-2.5",
                                i < arr.length - 1 && "mb-0.5",
                              )}
                              onSelect={() => addBaseExtraTime(t)}
                            >
                              <span className="text-sm font-semibold text-foreground">
                                {EXTRA_TIME_META[t].label}
                              </span>
                              <span className="whitespace-normal text-xs leading-relaxed text-muted-foreground">
                                {EXTRA_TIME_META[t].description}
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setVariantDialog({
                          open: true,
                          editingBase: false,
                          index: undefined,
                        })
                      }
                      className="flex h-10 items-center gap-2 rounded-xl bg-muted/40 px-3 text-sm text-foreground transition-colors hover:bg-muted/60"
                    >
                      <PlusIcon className="size-4 shrink-0" />
                      Add variant
                    </button>
                  </div>

                  {baseExtraTimes.length > 0 &&
                    (() => {
                      const totalMins =
                        (baseDuration ?? 60) + baseExtraTimes.reduce((s, e) => s + e.durationMin, 0)
                      const h = Math.floor(totalMins / 60)
                      const m = totalMins % 60
                      return (
                        <span className="text-sm text-muted-foreground">
                          Total duration:{" "}
                          {h > 0 && m > 0 ? `${h} hr, ${m} min` : h > 0 ? `${h} hr` : `${m} min`}
                        </span>
                      )
                    })()}
                </div>
              </>
            )}

            {showVariantList && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={itemOrder} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-2">
                    {itemOrder.map((itemId) => {
                      if (itemId === BASE_ID) {
                        // Show base row whenever it will be prepended on save
                        // (new services and edits of previously variant-free services).
                        if (!showBaseInVariantList) return null
                        return (
                          <SortableVariantRow
                            key={BASE_ID}
                            id={BASE_ID}
                            name={displayBaseName}
                            priceType={basePriceType}
                            price={basePrice}
                            duration={baseDuration}
                            extraTimes={baseExtraTimes}
                            currency={currency}
                            borderColor={borderColor}
                            onEdit={() =>
                              setVariantDialog({
                                open: true,
                                editingBase: true,
                              })
                            }
                            onDelete={() => {}}
                          />
                        )
                      }
                      const fieldIndex = fields.findIndex((f) => f._key === itemId)
                      if (fieldIndex === -1) return null
                      // In edit mode with existing variants the sole stored variant is
                      // the base — hide it until a second variant is added.
                      if (!showBaseInVariantList && fields.length === 1) return null
                      const field = fields[fieldIndex]
                      return (
                        <SortableVariantRow
                          key={field._key}
                          id={field._key}
                          name={field.name}
                          priceType={field.priceType}
                          price={field.price}
                          duration={field.duration}
                          extraTimes={field.extraTimes}
                          currency={currency}
                          borderColor={borderColor}
                          onEdit={() =>
                            setVariantDialog({
                              open: true,
                              editingBase: false,
                              index: fieldIndex,
                            })
                          }
                          onDelete={() => handleDeleteVariant(fieldIndex)}
                        />
                      )
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {showVariantList && (
              <button
                type="button"
                onClick={() =>
                  setVariantDialog({
                    open: true,
                    editingBase: false,
                    index: undefined,
                  })
                }
                className="flex h-10 items-center gap-2 self-start rounded-xl bg-muted/40 px-3 text-sm text-foreground transition-colors hover:bg-muted/60"
              >
                <PlusIcon className="size-4 shrink-0" />
                Add variant
              </button>
            )}
          </div>
        </div>
      </div>

      <AddVariantDialog
        open={variantDialog.open}
        onOpenChange={(o) => setVariantDialog((prev) => ({ ...prev, open: o }))}
        currency={currency}
        title={
          variantDialog.editingBase
            ? "Edit base variant"
            : variantDialog.index !== undefined
              ? "Edit variant"
              : "Add variant"
        }
        defaultValues={
          variantDialog.editingBase
            ? {
                name: displayBaseName,
                priceType: basePriceType,
                price: basePrice,
                duration: baseDuration,
                extraTimes: baseExtraTimes,
              }
            : variantDialog.index !== undefined
              ? fields[variantDialog.index]
              : undefined
        }
        onSave={handleVariantSave}
      />
    </>
  )
}

function cssTr(t: { x: number; y: number; scaleX: number; scaleY: number } | null) {
  if (!t) return undefined
  return `translate3d(${t.x}px, ${t.y}px, 0)`
}

function formatPrice(priceType: string, price: number, currency: string): string {
  if (priceType === "Free") return "Free"
  if (priceType === "From") return `From ${currency} ${price.toFixed(2)}`
  return `${currency} ${price.toFixed(2)}`
}

function SortableVariantRow({
  id,
  name,
  priceType,
  price,
  duration,
  extraTimes,
  currency,
  borderColor,
  onEdit,
  onDelete,
}: {
  id: string
  name?: string
  priceType: string
  price: number
  duration: number
  extraTimes?: ExtraTimeSegment[]
  currency: string
  borderColor: string
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style = {
    transform: cssTr(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <div className="h-10 w-0.5 shrink-0 rounded-full" style={{ backgroundColor: borderColor }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{name || "—"}</p>
        <p className="text-xs text-muted-foreground">
          {formatDurationMin(duration + (extraTimes ?? []).reduce((s, e) => s + e.durationMin, 0))}
        </p>
      </div>
      <p className="shrink-0 text-sm font-medium text-foreground">
        {formatPrice(priceType, price, currency)}
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-8 items-center gap-1 rounded-full border border-border/60 px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            Actions
            <MoreHorizontalIcon className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <PencilIcon className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
            <Trash2Icon className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function TeamMembersSection({
  teamMembers,
  isLoading,
  selectedIds,
  allSelected,
  onToggleAll,
  onToggle,
}: {
  teamMembers: TeamMember[]
  isLoading?: boolean
  selectedIds: string[]
  allSelected: boolean
  onToggleAll: () => void
  onToggle: (id: string) => void
}) {
  return (
    <div>
      <h3 className="mb-1 font-heading text-2xl font-semibold leading-9 text-foreground">
        Team members required
      </h3>
      <p className="mb-6 text-sm text-muted-foreground">
        Choose which team members will perform this service
      </p>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading team members…</p>
      ) : (
        <div className="flex flex-col gap-0">
          <TeamMemberRow
            label="All team members"
            sublabel=""
            badge={teamMembers.length}
            checked={allSelected}
            onCheckedChange={onToggleAll}
            initials=""
            isAll
          />

          {teamMembers.map((m) => (
            <div key={m.id}>
              <Separator />
              <TeamMemberRow
                label={m.name}
                sublabel={m.title ?? undefined}
                checked={selectedIds.includes(m.id)}
                onCheckedChange={() => onToggle(m.id)}
                initials={m.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TeamMemberRow({
  label,
  sublabel,
  badge,
  checked,
  onCheckedChange,
  initials,
  isAll = false,
}: {
  label: string
  sublabel?: string
  badge?: number
  checked: boolean
  onCheckedChange: () => void
  initials: string
  isAll?: boolean
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-4 py-4 text-left"
      onClick={onCheckedChange}
    >
      <div
        className={`flex size-5 shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors ${
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-transparent"
        }`}
      >
        {checked && <CheckIcon className="size-3.5" />}
      </div>

      {!isAll && (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          {initials}
        </div>
      )}

      <div className="flex-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {badge !== undefined && <span className="ml-2 text-sm text-muted-foreground">{badge}</span>}
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
    </button>
  )
}

function PortfolioSection({
  imageDataUrl,
  onImageChange,
}: {
  imageDataUrl: string | null
  onImageChange: (dataUrl: string | null) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => onImageChange((e.target?.result as string) ?? null)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ""
  }

  return (
    <div>
      <h3 className="mb-1 font-heading text-2xl font-semibold leading-9 text-foreground">
        Portfolio images
      </h3>
      <p className="mb-6 text-sm text-muted-foreground">
        Add and manage service imagery shown to clients when booking online.{" "}
        <span className="cursor-pointer text-primary hover:underline">Learn more</span>
      </p>

      {imageDataUrl ? (
        <div className="flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-2xl border border-border">
            {/* biome-ignore lint/performance/noImgElement: data URL — Next Image cannot optimize inline base64 */}
            <img
              src={imageDataUrl}
              alt="Service preview"
              className="max-h-72 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onImageChange(null)}
              className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow transition-colors hover:bg-background"
              aria-label="Remove image"
            >
              <XIcon className="size-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="self-start text-sm font-medium text-primary hover:underline"
          >
            Change image
          </button>
        </div>
      ) : (
        <button
          type="button"
          data-testid="portfolio-drop-zone"
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragEnter={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-16 transition-colors ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:bg-muted/50"
          }`}
        >
          <ImageIcon className="size-10 text-muted-foreground" strokeWidth={1.2} />
          <div className="text-center">
            <p className="text-base font-medium text-foreground">
              {isDragOver ? "Drop to upload" : "Drag & drop or choose a file"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Supports .jpg, .png, .avif, .webp up to 10 MB
            </p>
          </div>
          <span className="rounded-full border border-border bg-background px-5 py-1.5 text-sm text-foreground">
            Choose a file
          </span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.avif,.webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

// TODO: wire enabled/availableFor to form fields when backend ships these fields
function OnlineBookingSection() {
  const [enabled, setEnabled] = useState(true)
  const [availableFor, setAvailableFor] = useState("all")

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Online booking settings are not yet saved — backend support coming soon.
      </div>
      <header className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="font-heading text-2xl font-semibold leading-9 text-foreground">
            Online booking
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            Configure online booking settings for this service.
          </p>
        </div>
        <SegmentedToggle
          value={enabled ? "on" : "off"}
          onValueChange={(v) => setEnabled(v === "on")}
          options={[
            { value: "off", label: "Off" },
            { value: "on", label: "On", activeTone: "primary" },
          ]}
          ariaLabel="Online booking"
        />
      </header>

      <div aria-disabled={!enabled} className={cn(!enabled && "pointer-events-none opacity-50")}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Select trigger is a button */}
            <label className="text-sm font-medium text-foreground">Available for</label>
            <Select value={availableFor} onValueChange={setAvailableFor} disabled={!enabled}>
              <SelectTrigger className={triggerOverride}>
                <SelectValue placeholder="All types & breed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types & breed</SelectItem>
                <SelectItem value="custom" disabled>
                  Customize <span className="text-muted-foreground">(coming soon)</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsSection({ form }: { form: UseFormReturn<AddServiceInput> }) {
  const currency = "AED"
  const [requireDeposit, setRequireDeposit] = useState(true)
  const [depositDefault, setDepositDefault] = useState("default-25")
  const [depositUnit, setDepositUnit] = useState<"fixed" | "percent">("percent")
  const [requireNoShowFee, setRequireNoShowFee] = useState(true)
  const [noShowFeeDefault, setNoShowFeeDefault] = useState("default-off")

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h4 className="mb-4 font-heading text-2xl font-semibold leading-9 text-foreground">
          General settings
        </h4>
        {/* TODO: wire requireDeposit/requireNoShowFee to form fields when backend ships these fields */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          Deposit and no-show fee settings are not yet saved — backend support coming soon.
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox renders a button; wrapping label is the correct pattern */}
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={requireDeposit}
                onCheckedChange={(v) => setRequireDeposit(v === true)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-foreground">Require a deposit upfront</p>
                <p className="text-sm text-muted-foreground">
                  Clients are required to pay a non-refundable deposit when booking to confirm their
                  appointment.
                </p>
              </div>
            </label>
            {requireDeposit ? (
              <div className="ml-7 flex items-center gap-2">
                <Select value={depositDefault} onValueChange={setDepositDefault}>
                  <SelectTrigger className={triggerOverride}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default-25">Default (25.0% deposit)</SelectItem>
                    <SelectItem value="default-50">Default (50.0% deposit)</SelectItem>
                  </SelectContent>
                </Select>
                <SegmentedToggle
                  value={depositUnit}
                  onValueChange={(v) => setDepositUnit(v as "fixed" | "percent")}
                  options={[
                    { value: "fixed", label: "$" },
                    { value: "percent", label: "%" },
                  ]}
                  ariaLabel="Deposit unit"
                />
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox renders a button; wrapping label is the correct pattern */}
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={requireNoShowFee}
                onCheckedChange={(v) => setRequireNoShowFee(v === true)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-foreground">Require no-show fee</p>
                <p className="text-sm text-muted-foreground">
                  A fee can be applied when appointment is marked as no-show
                </p>
              </div>
            </label>
            {requireNoShowFee ? (
              <div className="ml-7">
                <Select value={noShowFeeDefault} onValueChange={setNoShowFeeDefault}>
                  <SelectTrigger className={triggerOverride}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default-off">Default (Off)</SelectItem>
                    <SelectItem value="default-on">Default (On)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-4 font-heading text-2xl font-semibold leading-9 text-foreground">
          Notifications
        </h4>
        <div className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="aftercareInstructions"
            render={({ field }) => (
              // biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox renders a button; wrapping label is the correct pattern
              <label className="flex cursor-pointer items-start gap-3">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Aftercare instructions</p>
                  <p className="text-sm text-muted-foreground">
                    Provide aftercare instructions to clients in thank you notifications
                  </p>
                </div>
              </label>
            )}
          />
          <Controller
            control={form.control}
            name="reminderToRebook"
            render={({ field }) => (
              // biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox renders a button; wrapping label is the correct pattern
              <label className="flex cursor-pointer items-start gap-3">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Reminder to rebook notifications
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Choose when you would like to notify your clients to rebook this service
                  </p>
                </div>
              </label>
            )}
          />
        </div>
      </div>

      <div>
        <h4 className="mb-4 font-heading text-2xl font-semibold leading-9 text-foreground">
          Advanced settings
        </h4>
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">
              Sales tax{" "}
              <span className="font-normal text-muted-foreground">(Included in price)</span>
            </p>
            <div className="flex items-center justify-between rounded-2xl bg-input px-4 py-3">
              <span className="text-sm text-foreground">All default</span>
              <button type="button" className="text-sm font-medium text-primary hover:underline">
                Edit
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Configure sales tax settings for each of your locations
            </p>
          </div>

          <FormField
            control={form.control}
            name="costOfService"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost of service</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {currency}
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0.00"
                        className="pl-12"
                        {...field}
                        value={field.value ?? ""}
                        onKeyDown={(e) => {
                          if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault()
                        }}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                        }
                      />
                    </div>
                    <SegmentedToggle
                      value="fixed"
                      onValueChange={() => {}}
                      options={[
                        { value: "fixed", label: "$" },
                        { value: "percent", label: "%" },
                      ]}
                      ariaLabel="Cost unit"
                    />
                  </div>
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Set the cost to your business for delivering this service
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>SKU</FormLabel>
                  <span className="text-xs text-muted-foreground">
                    {(field.value ?? "").length}/20
                  </span>
                </div>
                <FormControl>
                  <Input
                    placeholder="ABC-12345-H-SH"
                    maxLength={20}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Assign a SKU to help identify this service in reports and exports
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
