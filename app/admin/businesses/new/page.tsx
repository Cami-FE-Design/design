"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
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
  ownerEmail: z.string().email({ message: "Enter a valid email." }),
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

type CreatedSummary = {
  name: string
  slug: string
  email: string
}

export default function NewBusinessPage() {
  const [created, setCreated] = useState<CreatedSummary | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)

  const form = useForm<BusinessValues>({
    // @ts-ignore -- @hookform/resolvers 5.2 bundles zod 4.0 types; we have 4.3, version-tag mismatch only
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

  // Auto-sync slug from name until the user manually edits the slug field.
  useEffect(() => {
    if (slugTouched) return
    const next = slugify(name)
    if (next !== slug) form.setValue("slug", next, { shouldValidate: false })
  }, [name, slugTouched, slug, form])

  function onSubmit(values: BusinessValues) {
    console.log("Create business:", values)
    setCreated({ name: values.name, slug: values.slug, email: values.ownerEmail })
  }

  function handleCreateAnother() {
    form.reset()
    setSlugTouched(false)
    setCreated(null)
  }

  if (created) {
    return (
      <div className="flex min-h-screen w-full justify-center bg-sand-3 px-3 py-6 lg:py-12">
        <div className="flex w-full max-w-lg flex-col gap-8 rounded-2xl bg-background px-6 py-12 lg:px-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl leading-9 font-medium tracking-tight text-foreground">
              Pet Business created
            </h1>
            <p className="text-sm text-muted-foreground">
              <strong className="font-medium text-foreground">{created.name}</strong> is live at{" "}
              <span className="font-mono">cami.app/{created.slug}</span>. We sent{" "}
              <strong className="font-medium text-foreground">{created.email}</strong> a welcome
              email with a link to set their password.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Button
              type="button"
              size="xl"
              radius="full"
              className="w-full"
              onClick={handleCreateAnother}
            >
              Create another business
            </Button>
            <Link
              href="/admin/businesses"
              className="link self-center text-sm font-medium text-muted-foreground"
            >
              Back to all businesses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full justify-center bg-sand-3 px-3 py-6 lg:py-12">
      <div className="flex w-full max-w-lg flex-col gap-8 rounded-2xl bg-background px-6 py-12 lg:px-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl leading-9 font-medium tracking-tight text-foreground">
            New Pet Business
          </h1>
          <p className="text-sm text-muted-foreground">
            Create the account and send the Owner a welcome email to set their password.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
            <div className="flex flex-col gap-4 pt-2">
              <Button type="submit" size="xl" radius="full" className="w-full">
                Create and send welcome email
              </Button>
              <Link
                href="/admin/businesses"
                className="link self-center text-sm font-medium text-muted-foreground"
              >
                Cancel
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
