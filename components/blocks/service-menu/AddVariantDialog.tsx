"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { LucideIcon } from "lucide-react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react"
import { useEffect, useId, useState } from "react"
import { type Resolver, useForm } from "react-hook-form"
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Textarea,
} from "@/components/ui"
import {
  DURATION_OPTIONS,
  EXTRA_TIME_META,
  EXTRA_TIME_TYPES,
  type ExtraTimeSegment,
  type ExtraTimeType,
  formatDurationMin,
  PRICE_TYPES,
  type ServiceVariantInput,
  ServiceVariantInputSchema,
} from "@/lib/service-catalog/types"
import { cn } from "@/lib/utils"

// ── Extra time helpers ────────────────────────────────────────────────────────

const EXTRA_DURATION_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120]

type NavSection = "basic" | "settings"

const NAV_ITEMS: { id: NavSection; label: string; icon: LucideIcon }[] = [
  { id: "basic", label: "Basic details", icon: FileTextIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
]

const triggerCls = "data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium"

type AddVariantDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Partial<ServiceVariantInput>
  currency: string
  title?: string
  onSave: (data: ServiceVariantInput) => void
}

export function AddVariantDialog({
  open,
  onOpenChange,
  defaultValues,
  currency,
  title = "Add variant",
  onSave,
}: AddVariantDialogProps) {
  const [activeSection, setActiveSection] = useState<NavSection>("basic")
  const segmentPrefix = useId()
  const [extraTimes, setExtraTimes] = useState<ExtraTimeSegment[]>([])

  const form = useForm<ServiceVariantInput>({
    resolver: zodResolver(ServiceVariantInputSchema) as Resolver<ServiceVariantInput>,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      priceType: "Free",
      price: 0,
      duration: 60,
      sortOrder: 0,
      extraTimes: [],
    },
  })

  // Reset form + extra times each time the dialog opens
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only re-run on open toggle
  useEffect(() => {
    if (open) {
      const price = defaultValues?.price ?? 0
      form.reset({
        name: defaultValues?.name ?? "",
        description: defaultValues?.description ?? "",
        priceType: defaultValues?.priceType ?? (price === 0 ? "Free" : "Fixed"),
        price,
        duration: defaultValues?.duration ?? 60,
        sortOrder: defaultValues?.sortOrder ?? 0,
        extraTimes: [],
      })
      setExtraTimes(
        (defaultValues?.extraTimes ?? []).map((s, i) => ({
          ...s,
          id: s.id || `${segmentPrefix}-${i}`,
        })),
      )
      setActiveSection("basic")
    }
  }, [open])

  const priceType = form.watch("priceType")
  const duration = form.watch("duration")
  const nameLength = (form.watch("name") ?? "").length

  const descLength = (form.watch("description") ?? "").length

  const totalDurationMin = (duration ?? 60) + extraTimes.reduce((sum, s) => sum + s.durationMin, 0)

  function addExtraTime(type: ExtraTimeType) {
    setExtraTimes((prev) => [
      ...prev,
      { id: `${segmentPrefix}-${prev.length}`, type, durationMin: 10 },
    ])
  }
  function updateExtraTime(id: string, patch: Partial<Omit<ExtraTimeSegment, "id">>) {
    setExtraTimes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }
  function removeExtraTime(id: string) {
    setExtraTimes((prev) => prev.filter((s) => s.id !== id))
  }
  function moveExtraTime(id: string, dir: -1 | 1) {
    setExtraTimes((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      const next = idx + dir
      if (idx < 0 || next < 0 || next >= prev.length) return prev
      const arr = [...prev]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      return arr
    })
  }

  const handleSubmit = (values: ServiceVariantInput) => {
    onSave({ ...values, extraTimes })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[60vw] sm:max-w-[60vw] gap-0 p-0">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-[500px]"
          >
            <aside className="w-52 shrink-0 border-r border-border/60 p-4">
              <ul className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition-colors",
                        activeSection === item.id
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-muted/50",
                      )}
                    >
                      <item.icon
                        className="size-4 shrink-0 text-muted-foreground"
                        strokeWidth={1.5}
                      />
                      <span className="flex-1 truncate font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto p-6">
                {activeSection === "basic" ? (
                  <div className="flex flex-col gap-6">
                    <h3 className="font-heading text-2xl font-semibold leading-9 text-foreground">
                      Basic details
                    </h3>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Variant name</FormLabel>
                            <span className="text-xs text-muted-foreground">{nameLength}/50</span>
                          </div>
                          <FormControl>
                            <Input placeholder="E.g. Short hair" maxLength={50} {...field} />
                          </FormControl>
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
                              Variant description{" "}
                              <span className="font-normal text-muted-foreground">(Optional)</span>
                            </FormLabel>
                            <span className="text-xs text-muted-foreground">{descLength}/200</span>
                          </div>
                          <FormControl>
                            <Textarea maxLength={200} rows={4} className="resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 items-start gap-4">
                      <FormField
                        control={form.control}
                        name="priceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price type</FormLabel>
                            <Select
                              onValueChange={(v) => {
                                field.onChange(v)
                                if (v === "Free") form.clearErrors("price")
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className={triggerCls}>
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
                                  {currency}
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
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === "" ? 0 : Number(e.target.value),
                                    )
                                  }
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
                                <SelectTrigger className={triggerCls}>
                                  <SelectValue>
                                    {field.value != null
                                      ? (DURATION_OPTIONS.find((d) => d.id === field.value)
                                          ?.value ?? formatDurationMin(field.value))
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

                    {/* Extra time rows */}
                    {extraTimes.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-[1fr_1fr_2rem] gap-3">
                          <span className="text-sm font-medium text-foreground">Duration type</span>
                          <span className="text-sm font-medium text-foreground">Duration</span>
                          <span />
                        </div>
                        <div className="grid grid-cols-[1fr_1fr_2rem] items-center gap-3">
                          <Select value="servicing" disabled>
                            <SelectTrigger className={cn(triggerCls, "opacity-60")}>
                              <SelectValue>Servicing time</SelectValue>
                            </SelectTrigger>
                          </Select>
                          <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                              <Select
                                onValueChange={(v) => field.onChange(Number(v))}
                                value={field.value != null ? String(field.value) : ""}
                              >
                                <SelectTrigger className={triggerCls}>
                                  <SelectValue>
                                    {field.value != null
                                      ? (DURATION_OPTIONS.find((d) => d.id === field.value)
                                          ?.value ?? formatDurationMin(field.value))
                                      : null}
                                  </SelectValue>
                                </SelectTrigger>
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
                            )}
                          />
                          <span />
                        </div>
                        {extraTimes.map((seg, idx) => (
                          <div
                            key={seg.id}
                            className="grid grid-cols-[1fr_1fr_2rem] items-center gap-3"
                          >
                            <Select
                              value={seg.type}
                              onValueChange={(v) =>
                                updateExtraTime(seg.id, {
                                  type: v as ExtraTimeType,
                                })
                              }
                            >
                              <SelectTrigger className={triggerCls}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {EXTRA_TIME_TYPES.filter(
                                  (t) =>
                                    t === seg.type ||
                                    !extraTimes.some((s) => s.id !== seg.id && s.type === t),
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
                                updateExtraTime(seg.id, {
                                  durationMin: Number(v),
                                })
                              }
                            >
                              <SelectTrigger className={triggerCls}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {EXTRA_DURATION_OPTIONS.map((m) => (
                                  <SelectItem key={m} value={String(m)}>
                                    {formatDurationMin(m)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  radius="full"
                                  aria-label={`Options for ${EXTRA_TIME_META[seg.type].label}`}
                                >
                                  <MoreHorizontalIcon className="size-4" aria-hidden />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onSelect={() => moveExtraTime(seg.id, -1)}
                                  disabled={idx === 0}
                                >
                                  <ArrowUpIcon className="size-4" aria-hidden /> Move up
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => moveExtraTime(seg.id, 1)}
                                  disabled={idx === extraTimes.length - 1}
                                >
                                  <ArrowDownIcon className="size-4" aria-hidden /> Move down
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => removeExtraTime(seg.id)}>
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add extra time */}
                    <div className="flex items-center justify-between">
                      {extraTimes.length < EXTRA_TIME_TYPES.length && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" size="sm" radius="full">
                              <PlusIcon className="size-4" aria-hidden />
                              Add extra time
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-80 p-1">
                            {EXTRA_TIME_TYPES.filter(
                              (t) => !extraTimes.some((s) => s.type === t),
                            ).map((t, i, arr) => (
                              <DropdownMenuItem
                                key={t}
                                className={cn(
                                  "flex-col items-start gap-1 rounded-lg px-3 py-2.5",
                                  i < arr.length - 1 && "mb-0.5",
                                )}
                                onSelect={() => addExtraTime(t)}
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
                      {extraTimes.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          Total duration: {formatDurationMin(totalDurationMin)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <h3 className="font-heading text-2xl font-semibold leading-9 text-foreground">
                      Settings
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Additional settings for this variant coming soon.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border/60 p-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
