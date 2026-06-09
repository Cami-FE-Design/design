"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { XIcon } from "lucide-react"
import { useEffect } from "react"
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

type AddCategoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: AddCategoryInput) => void
  isPending?: boolean
  category?: ServiceCategory
}

const buildDefaults = (cat?: ServiceCategory): AddCategoryInput => ({
  name: cat?.name ?? "",
  color: cat?.color ?? "blue",
  description: cat?.description ?? "",
})

export function AddCategoryDialog({
  open,
  onOpenChange,
  onAdd,
  isPending,
  category,
}: AddCategoryDialogProps) {
  const isEdit = category !== undefined

  const form = useForm<AddCategoryInput>({
    // biome-ignore lint/suspicious/noExplicitAny: resolver type mismatch with zod v4
    resolver: zodResolver(AddCategoryInputSchema) as any,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: buildDefaults(category),
  })

  useEffect(() => {
    if (open) form.reset(buildDefaults(category))
    else form.reset(buildDefaults())
  }, [open, category, form.reset])

  const description = form.watch("description") ?? ""

  const handleSubmit = (values: AddCategoryInput) => {
    onAdd(values)
  }

  const handleCancel = () => {
    form.reset(buildDefaults())
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset(buildDefaults())
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-lg px-8 pt-8 pb-6">
        <button
          type="button"
          onClick={handleCancel}
          className="absolute right-5 top-5 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <XIcon className="size-5" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEdit ? "Edit category" : "Add category"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
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

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment color</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <span className="text-xs text-muted-foreground">{description.length}/255</span>
                  </div>
                  <FormControl>
                    <Textarea
                      rows={5}
                      maxLength={255}
                      className="resize-none rounded-xl border border-border bg-background min-h-[140px]"
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
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type="submit" radius="full" className="px-8" disabled={isPending}>
                {isEdit ? (isPending ? "Saving…" : "Save") : isPending ? "Adding…" : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
