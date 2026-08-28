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
import { FALLBACK_SENDER_ID, validateSenderId } from "@/lib/notifications/types"

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
  /**
   * Captured at onboarding per GNK's recommendation, adopted by maaz: collect
   * here, editable in Business Settings later, default to CAMI if not provided.
   *
   * "Mandatory with a CAMI default" is a contradiction in a form — a field that
   * always has a valid value isn't one the operator can fail to fill. So it is
   * required-with-a-default: the field always carries something, and leaving it
   * as CAMI is an explicit choice rather than a skipped step. It is deliberately
   * NOT prefilled from the business name — GNK: "rather than inferring branding
   * preferences, we should request the sender ID directly from the merchant."
   * Spec: docs/specs/notifications-sender-id-and-rates.md
   */
  senderId: z.string().superRefine((raw, ctx) => {
    const value = raw.trim()
    // Blank and CAMI both mean the same thing — send under the platform name.
    if (!value || value.toUpperCase() === FALLBACK_SENDER_ID) return
    const problem = validateSenderId(value)
    if (problem) ctx.addIssue({ code: "custom", message: problem })
  }),
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
    resolver: zodResolver(businessSchema as never),
    defaultValues: {
      name: "",
      slug: "",
      ownerFirstName: "",
      ownerLastName: "",
      ownerEmail: "",
      senderId: FALLBACK_SENDER_ID,
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
    const senderId = values.senderId.trim()
    const ownSenderId = senderId && senderId.toUpperCase() !== FALLBACK_SENDER_ID
    toast.success(`${values.name} created`, {
      description: ownSenderId
        ? // The registration clock starts at account creation rather than
          // whenever someone remembers to open settings.
          `Welcome email sent to ${values.ownerEmail}. ${senderId.toUpperCase()} submitted for registration.`
        : `Welcome email sent to ${values.ownerEmail}. Messages send as ${FALLBACK_SENDER_ID}.`,
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
            <FormField
              control={form.control}
              name="senderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMS Sender ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={FALLBACK_SENDER_ID}
                      autoComplete="off"
                      maxLength={11}
                      className="uppercase"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The name their SMS arrives from. 3&ndash;11 letters or numbers. Ask the merchant
                    — don&rsquo;t derive it from the business name. Leave as {FALLBACK_SENDER_ID} to
                    send under the platform name; they can change it in their settings later.
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
