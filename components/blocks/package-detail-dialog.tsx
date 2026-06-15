"use client"

import {
  CalendarClockIcon,
  MoreHorizontalIcon,
  PencilIcon,
  ShoppingBagIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { EmptyState } from "@/components/blocks/empty-state"
import { SectionCard } from "@/components/blocks/section-card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ─── Types ────────────────────────────────────────────────────────────────────

export type PackageSummary = {
  id: string
  name: string
  serviceCount: number
  validFor: string
  sessions: string
  price: number
  color: string
  /** Optional richer fields shown in detail; sensible defaults when absent. */
  payment?: string
  tax?: string
}

// ─── Field helpers ──────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value ?? "–"}</span>
    </div>
  )
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
}

// ─── Component ───────────────────────────────────────────────────────────────

type PackageDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pkg: PackageSummary | null
  onDelete?: (id: string) => void
}

type TabId = "details" | "sales"

export function PackageDetailDialog({
  open,
  onOpenChange,
  pkg,
  onDelete,
}: PackageDetailDialogProps) {
  const router = useRouter()
  const [tab, setTab] = useState<TabId>("details")

  if (!pkg) return null

  function handleEdit() {
    onOpenChange(false)
    router.push(`/catalogs/packages/${pkg!.id}/edit`)
  }

  function handleDelete() {
    onDelete?.(pkg!.id)
    onOpenChange(false)
  }

  const editAction = (
    <Button variant="secondary" size="sm" radius="full" onClick={handleEdit}>
      Edit
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-200 max-h-[calc(100vh-100px)] max-w-157.5! flex-col gap-0 p-0 sm:max-w-157.5!"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as TabId)}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="flex flex-col gap-0 bg-muted/40">
            <DialogHeader className="flex flex-row items-center gap-3 px-9 pt-8.5 pb-5">
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: pkg.color }}
              >
                <CalendarClockIcon className="size-5.5" />
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <DialogTitle className="truncate text-[22px] leading-7 font-semibold">
                  {pkg.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {pkg.name} package details
                </DialogDescription>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      radius="full"
                      aria-label="More actions"
                    >
                      <MoreHorizontalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onSelect={handleEdit}>
                      <PencilIcon className="size-4" />
                      Edit package
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
                      <Trash2Icon className="size-4" />
                      Delete package
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    radius="full"
                    aria-label="Close"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </DialogClose>
              </div>
            </DialogHeader>

            {/* Tab strip */}
            <div className="flex items-center gap-6 px-9">
              <TabsList variant="underline">
                <TabsTrigger value="details">Package details</TabsTrigger>
                <TabsTrigger value="sales">Sales</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* ── Scrollable content ────────────────────────────────────── */}
          <div className="min-h-0 flex-1 overflow-y-auto px-9 pt-5 pb-5">
            <TabsContent value="details" className="flex flex-col gap-3">
              <SectionCard title="Basic info" action={editAction}>
                <FieldGrid>
                  <Field label="Valid for" value={pkg.validFor} />
                  <Field label="Sessions" value={pkg.sessions} />
                  <Field label="Price" value={`AED ${pkg.price.toLocaleString("en-US")}`} />
                  <Field label="Payment" value={pkg.payment ?? "One-time payment"} />
                  <Field label="Tax rate" value={pkg.tax ?? "VAT (5%)"} />
                </FieldGrid>
              </SectionCard>

              <SectionCard title="Included services" action={editAction}>
                <Field
                  label="Services"
                  value={`${pkg.serviceCount} service${pkg.serviceCount === 1 ? "" : "s"}`}
                />
              </SectionCard>
            </TabsContent>

            <TabsContent value="sales">
              <EmptyState
                icon={ShoppingBagIcon}
                title="No sales yet"
                description="Packages sold to clients will appear here."
                className="py-16"
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
