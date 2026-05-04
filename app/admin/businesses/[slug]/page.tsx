"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowUpRightIcon,
  ChevronDownIcon,
  KeyRoundIcon,
  LinkIcon,
  PencilIcon,
} from "lucide-react"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { use, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { AdminShell } from "@/components/blocks/admin-shell"
import { LoginAsOwnerDialog } from "@/components/blocks/login-as-owner-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import {
  type AdminBusiness,
  findBusinessBySlug,
  formatDate,
  formatDateTime,
  REASON_CODES,
  type ReasonCodeId,
  relativeTime,
  stateBadge,
} from "@/lib/admin-businesses"
import { PermissionGate } from "@/lib/auth-mock"
import { EMIRATES } from "@/lib/business-profile"

const profileSchema = z.object({
  name: z.string().min(1, "Required"),
  street: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  emirate: z.enum(EMIRATES, { error: "Required" }),
  phone: z.string().min(1, "Required"),
  email: z.email("Invalid email"),
  vatNumber: z.string().optional(),
})
type ProfileValues = z.infer<typeof profileSchema>

const slugSchema = z.object({
  slug: z
    .string()
    .min(2, "Minimum 2 characters")
    .max(40, "Maximum 40 characters")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  acknowledged: z.literal(true, { error: "Tick the acknowledgement to proceed" }),
})
type SlugValues = z.infer<typeof slugSchema>

const reasonSchema = z.object({
  reason: z.enum(REASON_CODES.map((r) => r.id) as [ReasonCodeId, ...ReasonCodeId[]], {
    error: "Pick a reason",
  }),
  note: z.string().max(280, "Keep it under 280 characters").optional(),
})
type ReasonValues = z.infer<typeof reasonSchema>

function StatBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}

function ProfileSheet({
  open,
  onOpenChange,
  business,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: AdminBusiness
  onSave: (values: ProfileValues) => void
}) {
  const form = useForm<ProfileValues>({
    // @ts-expect-error -- @hookform/resolvers 5.2 bundles zod 4.0 types; we have 4.3, version-tag mismatch only
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: business.name,
      street: business.street,
      city: business.city,
      emirate: business.emirate,
      phone: business.phone,
      email: business.email,
      vatNumber: business.vatNumber ?? "",
    },
  })

  function onSubmit(values: ProfileValues) {
    onSave(values)
    onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset()
        onOpenChange(next)
      }}
    >
      <SheetContent side="right" className="data-[side=right]:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Pet Business profile</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Ops-only edits. Logo, description, and services stay with the Owner.
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
                    <Input autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street address</FormLabel>
                  <FormControl>
                    <Input autoComplete="street-address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input autoComplete="address-level2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emirate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emirate</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMIRATES.map((emirate) => (
                          <SelectItem key={emirate} value={emirate}>
                            {emirate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" autoComplete="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vatNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VAT number</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      placeholder="100123456700003"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>UAE TRN, optional.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-2 flex flex-col gap-2">
              <Button type="submit" size="xl" radius="full" className="w-full">
                Save changes
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

function ChangeSlugDialog({
  open,
  onOpenChange,
  business,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: AdminBusiness
  onSave: (newSlug: string) => void
}) {
  const form = useForm<SlugValues>({
    // @ts-expect-error -- @hookform/resolvers 5.2 bundles zod 4.0 types; we have 4.3, version-tag mismatch only
    resolver: zodResolver(slugSchema),
    defaultValues: { slug: business.slug, acknowledged: false as unknown as true },
  })
  const slug = form.watch("slug")

  function onSubmit(values: SlugValues) {
    onSave(values.slug)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset({ slug: business.slug, acknowledged: false as unknown as true })
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change URL slug</DialogTitle>
          <DialogDescription>
            The public booking page lives at{" "}
            <span className="font-mono text-foreground">cami.app/{business.slug}</span>. Changing
            the slug breaks any existing links the Owner has shared. The old URL won't redirect.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-4">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New slug</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" {...field} />
                  </FormControl>
                  {slug && slug !== business.slug ? (
                    <FormDescription>
                      New URL: <span className="font-mono text-foreground">cami.app/{slug}</span>
                    </FormDescription>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acknowledged"
              render={({ field }) => (
                <FormItem>
                  <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl bg-tomato-3 p-4 text-sm">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 cursor-pointer accent-tomato-9"
                      checked={field.value === true}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                    <span className="flex flex-col gap-1 text-tomato-12">
                      <span className="font-medium">I understand this breaks shared links.</span>
                      <span className="text-tomato-11">
                        The Owner will need to re-share the booking URL with anyone who saved it.
                      </span>
                    </span>
                  </label>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Change slug</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function ResetPasswordDialog({
  open,
  onOpenChange,
  business,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: AdminBusiness
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Owner password</DialogTitle>
          <DialogDescription>
            We'll email <span className="font-medium text-foreground">{business.ownerEmail}</span> a
            magic-link to set a new password. Their current password keeps working until they click
            the link.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Send reset link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SuspendDialog({
  open,
  onOpenChange,
  business,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: AdminBusiness
  onConfirm: (reason: ReasonCodeId, note?: string) => void
}) {
  const form = useForm<ReasonValues>({
    // @ts-expect-error -- @hookform/resolvers 5.2 bundles zod 4.0 types; we have 4.3, version-tag mismatch only
    resolver: zodResolver(reasonSchema),
    defaultValues: { note: "" },
  })

  function onSubmit(values: ReasonValues) {
    onConfirm(values.reason, values.note)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset()
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspend {business.name}?</DialogTitle>
          <DialogDescription>
            The Owner can't log in and the public booking page is hidden. Bookings, services, and
            staff records are preserved. You can un-suspend at any time.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REASON_CODES.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
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
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal note (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Anything ops should know"
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>Visible only in Cami HQ. Audit-logged.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Suspend account
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function ArchiveDialog({
  open,
  onOpenChange,
  business,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: AdminBusiness
  onConfirm: (reason: ReasonCodeId, note?: string) => void
}) {
  const form = useForm<ReasonValues>({
    // @ts-expect-error -- @hookform/resolvers 5.2 bundles zod 4.0 types; we have 4.3, version-tag mismatch only
    resolver: zodResolver(reasonSchema),
    defaultValues: { note: "" },
  })

  function onSubmit(values: ReasonValues) {
    onConfirm(values.reason, values.note)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset()
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive {business.name}?</DialogTitle>
          <DialogDescription>
            Soft-delete the account and mark the pilot ended. Data is preserved for 90 days, then
            permanently removed. The slug is freed up after 90 days.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-4">
            <div className="flex items-start gap-2.5 rounded-2xl bg-tomato-3 p-4 text-sm">
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-tomato-11" />
              <div className="flex flex-col gap-1 text-tomato-12">
                <span className="font-medium">This is not reversible after 90 days.</span>
                <span className="text-tomato-11">
                  Within 90 days, ops can restore the account from the Archived tab.
                </span>
              </div>
            </div>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REASON_CODES.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
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
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal note (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Anything ops should know"
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Archive account
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function StatusBadges({ business }: { business: AdminBusiness }) {
  const state = stateBadge(business.state)
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge className={state.className}>{state.label}</Badge>
    </div>
  )
}

export default function BusinessDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const initial = findBusinessBySlug(slug)
  if (!initial) notFound()

  const [business, setBusiness] = useState<AdminBusiness>(initial)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [changeSlugOpen, setChangeSlugOpen] = useState(false)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)

  const isSuspended = business.state === "suspended"
  const isArchived = business.state === "archived"

  function handleProfileSave(values: ProfileValues) {
    setBusiness((prev) => ({ ...prev, ...values, vatNumber: values.vatNumber || undefined }))
    toast.success("Profile saved")
  }

  function handleSlugSave(newSlug: string) {
    setBusiness((prev) => ({ ...prev, slug: newSlug }))
    toast.success(`Slug changed to cami.app/${newSlug}`)
    router.replace(`/admin/businesses/${newSlug}`)
  }

  function handleResetPassword() {
    toast.success(`Reset link sent to ${business.ownerEmail}`)
  }

  function handleSuspend(reason: ReasonCodeId, note?: string) {
    setBusiness((prev) => ({ ...prev, state: "suspended", reasonCode: reason, reasonNote: note }))
    toast.success(`${business.name} is suspended`)
  }

  function handleUnsuspend() {
    setBusiness((prev) => ({
      ...prev,
      state: "live",
      reasonCode: undefined,
      reasonNote: undefined,
    }))
    toast.success(`${business.name} is live again`)
  }

  function handleArchive(reason: ReasonCodeId, note?: string) {
    setBusiness((prev) => ({
      ...prev,
      state: "archived",
      reasonCode: reason,
      reasonNote: note,
    }))
    toast.success(`${business.name} archived`)
  }

  function handleRestore() {
    setBusiness((prev) => ({
      ...prev,
      state: "live",
      reasonCode: undefined,
      reasonNote: undefined,
    }))
    toast.success(`${business.name} restored`)
  }

  return (
    <AdminShell
      header={
        <div className="flex w-full max-w-4xl items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Back to all businesses"
              onClick={() => router.push("/admin/businesses")}
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-medium leading-8 text-foreground">{business.name}</h1>
                <StatusBadges business={business} />
              </div>
              <span className="font-mono text-sm text-muted-foreground">
                cami.app/{business.slug}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" asChild>
              <a href={`/${business.slug}`} target="_blank" rel="noopener noreferrer">
                <ArrowUpRightIcon className="size-4" />
                Public page
              </a>
            </Button>
            <PermissionGate permission="merchants.impersonate">
              <LoginAsOwnerDialog
                business={{
                  id: business.slug,
                  name: business.name,
                  ownerName: business.ownerName,
                  ownerEmail: business.ownerEmail,
                }}
              />
            </PermissionGate>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  Actions
                  <ChevronDownIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onSelect={() => setEditProfileOpen(true)} disabled={isArchived}>
                  <PencilIcon />
                  Edit profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setChangeSlugOpen(true)} disabled={isArchived}>
                  <LinkIcon />
                  Change URL slug
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setResetPasswordOpen(true)} disabled={isArchived}>
                  <KeyRoundIcon />
                  Reset Owner password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isSuspended ? (
                  <DropdownMenuItem onSelect={handleUnsuspend}>Un-suspend</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onSelect={() => setSuspendOpen(true)}
                    disabled={isArchived}
                    variant="destructive"
                  >
                    Suspend account
                  </DropdownMenuItem>
                )}
                {isArchived ? (
                  <DropdownMenuItem onSelect={handleRestore}>Restore from archive</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={() => setArchiveOpen(true)} variant="destructive">
                    Archive account
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pt-2">
        {(isSuspended || isArchived) && (
          <ReasonBanner
            business={business}
            onUnsuspend={handleUnsuspend}
            onRestore={handleRestore}
          />
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Profile</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditProfileOpen(true)}
                disabled={isArchived}
              >
                <PencilIcon />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-5">
              <StatBlock label="Business name" value={business.name} />
              <StatBlock
                label="URL slug"
                value={<span className="font-mono text-sm">cami.app/{business.slug}</span>}
              />
              <StatBlock
                label="Address"
                value={
                  <span className="block">
                    {business.street}
                    <br />
                    <span className="text-muted-foreground">
                      {business.city}, {business.emirate}
                    </span>
                  </span>
                }
              />
              <StatBlock
                label="Contact"
                value={
                  <span className="block">
                    {business.phone}
                    <br />
                    <span className="text-muted-foreground">{business.email}</span>
                  </span>
                }
              />
              <StatBlock label="VAT number" value={business.vatNumber ?? "—"} />
              <StatBlock label="Joined" value={formatDate(business.createdAt)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Owner</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border-[1.21px] border-cami-violet-7 bg-cami-violet-8 text-sm font-medium text-white"
                >
                  {business.ownerName
                    .split(/\s+/)
                    .map((p) => p.charAt(0).toUpperCase())
                    .slice(0, 2)
                    .join("")}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {business.ownerName}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    {business.ownerEmail}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setResetPasswordOpen(true)}
                disabled={isArchived}
              >
                <KeyRoundIcon className="size-4" />
                Send password reset link
              </Button>
              <p className="text-xs text-muted-foreground">
                Last login {relativeTime(business.lastActivityAt)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Staff</CardTitle>
              <span className="text-sm text-muted-foreground">{business.staffCount}</span>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {business.staffPreview.length === 0 ? (
                <p className="text-sm text-muted-foreground">No staff yet.</p>
              ) : (
                business.staffPreview.slice(0, 4).map((name) => (
                  <div key={name} className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cami-violet-3 text-xs font-medium text-cami-violet-11"
                    >
                      {name
                        .split(/\s+/)
                        .map((p) => p.charAt(0).toUpperCase())
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <span className="truncate text-sm text-foreground">{name}</span>
                  </div>
                ))
              )}
              <p className="pt-2 text-xs text-muted-foreground">
                Staff is owner-managed. Use impersonation to edit.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Services</CardTitle>
              <span className="text-sm text-muted-foreground">{business.servicesCount}</span>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {business.servicesPreview.length === 0 ? (
                <p className="text-sm text-muted-foreground">No services yet.</p>
              ) : (
                business.servicesPreview.slice(0, 4).map((name) => (
                  <div key={name} className="flex items-center gap-2.5">
                    <span className="size-1.5 shrink-0 rounded-full bg-foreground/40" />
                    <span className="truncate text-sm text-foreground">{name}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              {business.audit.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <ul className="flex flex-col">
                  {business.audit.map((event, i) => (
                    <li
                      key={event.id}
                      className={
                        i === 0
                          ? "grid grid-cols-[180px_1fr] items-start gap-4 py-3"
                          : "grid grid-cols-[180px_1fr] items-start gap-4 border-t border-border/60 py-3"
                      }
                    >
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">{relativeTime(event.at)}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(event.at)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">
                          <span className="font-medium">{event.actor}</span>
                          <span className="text-muted-foreground"> — {event.action}</span>
                        </span>
                        {event.detail ? (
                          <span className="text-sm text-muted-foreground">{event.detail}</span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Need to take action on a booking, schedule, or service?{" "}
          <Link
            href="/admin/businesses"
            className="text-foreground underline-offset-3 hover:underline"
          >
            Use impersonation mode
          </Link>{" "}
          (E6-3).
        </p>
      </div>

      <ProfileSheet
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        business={business}
        onSave={handleProfileSave}
      />
      <ChangeSlugDialog
        open={changeSlugOpen}
        onOpenChange={setChangeSlugOpen}
        business={business}
        onSave={handleSlugSave}
      />
      <ResetPasswordDialog
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
        business={business}
        onConfirm={handleResetPassword}
      />
      <SuspendDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        business={business}
        onConfirm={handleSuspend}
      />
      <ArchiveDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        business={business}
        onConfirm={handleArchive}
      />
    </AdminShell>
  )
}

function ReasonBanner({
  business,
  onUnsuspend,
  onRestore,
}: {
  business: AdminBusiness
  onUnsuspend: () => void
  onRestore: () => void
}) {
  const isSuspended = business.state === "suspended"
  const reasonLabel = REASON_CODES.find((r) => r.id === business.reasonCode)?.label ?? "Other"
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-tomato-3 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-tomato-11" />
        <div className="flex flex-col">
          <span className="font-medium text-tomato-12">
            {isSuspended
              ? "Account is suspended. Owner cannot log in and the public page is hidden."
              : "Account is archived. Data is preserved for 90 days then permanently removed."}
          </span>
          <span className="text-tomato-11">
            Reason: {reasonLabel}
            {business.reasonNote ? ` — ${business.reasonNote}` : ""}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" variant="outline" onClick={isSuspended ? onUnsuspend : onRestore}>
          {isSuspended ? "Un-suspend" : "Restore"}
        </Button>
      </div>
    </div>
  )
}
