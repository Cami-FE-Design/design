"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

const businessSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Business name is required." })
    .max(80, { message: "Keep it under 80 characters." }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters." })
    .max(40, { message: "Keep it under 40 characters." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Lowercase letters, numbers, and dashes only.",
    }),
  ownerFirstName: z.string().min(1, { message: "First name is required." }),
  ownerLastName: z.string().min(1, { message: "Last name is required." }),
  ownerEmail: z.email({ message: "Enter a valid email." }),
})

type BusinessValues = z.infer<typeof businessSchema>

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

type NewBusinessSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (values: BusinessValues) => void
}

export function NewBusinessSheet({ open, onOpenChange, onCreated }: NewBusinessSheetProps) {
  const [slugTouched, setSlugTouched] = useState(false)

  const form = useForm<BusinessValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      slug: "",
      ownerFirstName: "",
      ownerLastName: "",
      ownerEmail: "",
    },
  })

  const name = form.watch("name")
  const slug = form.watch("slug")

  useEffect(() => {
    if (slugTouched) return
    const next = slugify(name)
    if (next !== slug) form.setValue("slug", next, { shouldValidate: false })
  }, [name, slugTouched, slug, form])

  useEffect(() => {
    if (!open) {
      form.reset()
      setSlugTouched(false)
    }
  }, [open, form])

  function onSubmit(values: BusinessValues) {
    onCreated?.(values)
    toast.success(`${values.name} created`, {
      description: `Welcome email sent to ${values.ownerEmail}.`,
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="data-[side=right]:max-w-md">
        <SheetHeader>
          <SheetTitle>New Partner</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Create the account and send the Owner a welcome email to set their password.
          </p>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 px-6 pb-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business name</FormLabel>
                  <FormControl>
                    <Input placeholder="Shampooch JVC" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="shampooch-jvc"
                      autoComplete="off"
                      {...field}
                      onChange={(e) => {
                        setSlugTouched(true)
                        field.onChange(e)
                      }}
                    />
                  </FormControl>
                  {slug ? (
                    <FormDescription>
                      Public booking page will be{" "}
                      <span className="font-mono text-foreground">cami.app/{slug}</span>
                    </FormDescription>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ownerFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner first name</FormLabel>
                    <FormControl>
                      <Input placeholder="Maz" autoComplete="given-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Khan" autoComplete="family-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="ownerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="maaz@getcami.io"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    We'll email a link here to set the first password.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-2 flex flex-col gap-2">
              <Button type="submit" size="xl" radius="full" className="w-full">
                Create and send welcome email
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xl"
                radius="full"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
