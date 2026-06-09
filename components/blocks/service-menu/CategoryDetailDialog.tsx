"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PencilIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  type AddCategoryInput,
  AddCategoryInputSchema,
  APPOINTMENT_COLORS,
  type ServiceCategory,
} from "@/lib/service-catalog/types"

type Mode = "view" | "edit"

type CategoryDetailDialogProps = {
  category: ServiceCategory | null
  onClose: () => void
  onUpdate: (id: string, patch: Partial<AddCategoryInput>) => Promise<void>
  initialMode?: Mode
}

export function CategoryDetailDialog({
  category,
  onClose,
  onUpdate,
  initialMode = "view",
}: CategoryDetailDialogProps) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [isSaving, setIsSaving] = useState(false)

  // When a new category is loaded, reset to the requested initial mode
  useEffect(() => {
    if (category) setMode(initialMode)
  }, [category, initialMode])

  const form = useForm<AddCategoryInput>({
    // biome-ignore lint/suspicious/noExplicitAny: resolver type mismatch with zod v4
    resolver: zodResolver(AddCategoryInputSchema) as any,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { name: "", color: "blue", description: "" },
  })

  // Populate form fields whenever we enter edit mode; category?.id is intentional proxy
  // biome-ignore lint/correctness/useExhaustiveDependencies: category?.id as proxy avoids resetting on unrelated field changes
  useEffect(() => {
    if (mode === "edit" && category) {
      form.reset({
        name: category.name,
        color: category.color,
        description: category.description ?? "",
        // parentId: category.parentId ?? "",
      })
    }
  }, [mode, category?.id])

  const description = form.watch("description") ?? ""

  const handleSave = async (values: AddCategoryInput) => {
    if (!category) return
    setIsSaving(true)
    try {
      await onUpdate(category.id, values)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    form.reset()
    setMode("view")
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  // const adminById = Object.fromEntries(adminCategories.map((c) => [c.id, c]));
  // const parent = category?.parentId ? (adminById[category.parentId] ?? null) : null;
  const colorMeta = APPOINTMENT_COLORS.find((c) => c.value === category?.color)

  return (
    <Dialog
      open={category !== null}
      onOpenChange={(next) => {
        if (!next) handleClose()
      }}
    >
      <DialogContent className="sm:max-w-lg px-8 pt-8 pb-6">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <XIcon className="size-5" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {mode === "view" ? "Category details" : "Edit category"}
          </DialogTitle>
        </DialogHeader>

        {/* ── View mode ─────────────────────────────────────────── */}
        {mode === "view" && category && (
          <div className="mt-4 flex flex-col gap-5">
            <div className="rounded-xl border border-border bg-muted/30 p-5 flex flex-col gap-4">
              <DetailRow label="Category name" value={category.name} />

              {/* Global category row — commented out until parent category is needed
              {adminCategories.length > 0 && (
                <DetailRow
                  label="Global category"
                  value={
                    parent ? (
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block size-3 rounded-full"
                          style={{
                            backgroundColor: APPOINTMENT_COLORS.find(
                              (c) => c.value === parent.color,
                            )?.hex,
                          }}
                        />
                        {parent.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )
                  }
                />
              )}
              */}

              <DetailRow
                label="Appointment color"
                value={
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block size-4 rounded-full border border-border"
                      style={{ backgroundColor: colorMeta?.hex }}
                    />
                    {colorMeta?.label ?? category.color}
                  </span>
                }
              />

              <DetailRow
                label="Description"
                value={
                  category.description ? (
                    category.description
                  ) : (
                    <span className="text-muted-foreground">No description</span>
                  )
                }
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                radius="full"
                className="px-6"
                onClick={handleClose}
              >
                Close
              </Button>
              <Button
                type="button"
                radius="full"
                className="gap-2 px-6"
                onClick={() => setMode("edit")}
              >
                <PencilIcon className="size-4" />
                Edit
              </Button>
            </div>
          </div>
        )}

        {/* ── Edit mode ─────────────────────────────────────────── */}
        {mode === "edit" && category && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSave)}
              className="flex flex-col gap-5 mt-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Hair Services"
                        className="rounded-xl border border-border bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Global category field — commented out until parent category is needed
              {adminCategories.length > 0 && (
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Global category</FormLabel>
                      <Select
                        key={field.value ?? "none"}
                        onValueChange={(val) =>
                          field.onChange(val === "none" ? null : val)
                        }
                        value={field.value ?? "none"}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full rounded-xl border border-border bg-background">
                            <SelectValue placeholder="Select a global category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">— None —</SelectItem>
                          {adminCategories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              */}

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment color</FormLabel>
                    <Select key={field.value} onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full rounded-xl border border-border bg-background">
                          <SelectValue>
                            {(() => {
                              const found = APPOINTMENT_COLORS.find((c) => c.value === field.value)
                              return found ? (
                                <span className="flex items-center gap-2">
                                  <span
                                    className="inline-block size-4 rounded-full"
                                    style={{ backgroundColor: found.hex }}
                                  />
                                  {found.label}
                                </span>
                              ) : null
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {APPOINTMENT_COLORS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            <span className="flex items-center gap-2">
                              <span
                                className="inline-block size-3.5 rounded-full"
                                style={{ backgroundColor: c.hex }}
                              />
                              {c.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <FormLabel>Description</FormLabel>
                      <span className="text-xs text-muted-foreground">
                        {description.length}/255
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        rows={4}
                        maxLength={255}
                        className="resize-none rounded-xl border border-border bg-background min-h-[110px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  radius="full"
                  className="px-6"
                  disabled={isSaving}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button type="submit" radius="full" className="px-8" disabled={isSaving}>
                  {isSaving ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}
