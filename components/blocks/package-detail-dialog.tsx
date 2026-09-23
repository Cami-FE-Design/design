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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatAed } from "@/lib/format"
import { useLocations } from "@/lib/locations/store"
import {
  LENGTH_LABEL,
  type Package,
  priceLabel,
  sessionsLabel,
  VALID_FOR_LABEL,
} from "@/lib/packages/catalog"

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Kept as an alias so nothing downstream had to be renamed when the seven-field
 * card grew into the built product's model.
 */
export type PackageSummary = Package

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
  const { granted, locationName, isMultiLocation, scopeLabel, scopedLocations } = useLocations()

  if (!pkg) return null

  const price = priceLabel(pkg)
  // Bounded before it is counted (R18): the scope a user has narrowed to, or
  // their whole grant when they have not.
  const inScope = new Set((scopedLocations.length > 0 ? scopedLocations : granted).map((l) => l.id))
  const allSales = pkg.sales ?? []
  const sales = isMultiLocation
    ? allSales.filter((row) => inScope.has(row.soldAtLocationId))
    : allSales
  const withheld = allSales.length - sales.length

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
                style={{ backgroundColor: pkg.colour }}
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
                  <Field label="Sessions" value={sessionsLabel(pkg)} />
                  <Field
                    label={pkg.payment === "recurring" ? "Billed" : "Price"}
                    value={`${formatAed(Math.round(price.amountMinor / 100))}${price.suffix ? ` ${price.suffix}` : ""}`}
                  />
                  <Field
                    label="Payment"
                    value={pkg.payment === "recurring" ? "Recurring" : "One-time payment"}
                  />
                  {/* A one-time package expires; a recurring one runs for a
                      length and is cancelled. Printing "Valid for" on both put a
                      dash on every subscription. */}
                  {pkg.payment === "recurring" ? (
                    <Field label="Runs for" value={pkg.length ? LENGTH_LABEL[pkg.length] : null} />
                  ) : (
                    <Field
                      label="Valid for"
                      value={pkg.validFor ? VALID_FOR_LABEL[pkg.validFor] : null}
                    />
                  )}
                  <Field label="Tax rate" value={pkg.taxRate ? "VAT (5%)" : null} />
                </FieldGrid>
              </SectionCard>

              <SectionCard title="Included services" action={editAction}>
                {/* Named, not counted. "3 services" answers a question nobody
                    asks — reception opens this to see whether the groom is in
                    it. */}
                <Field label="Services" value={pkg.services.join(", ")} />
              </SectionCard>

              <SectionCard title="Online" action={editAction}>
                <FieldGrid>
                  <Field
                    label="Sold online"
                    value={pkg.onlineSales ? "Yes, on the booking page" : "In the salon only"}
                  />
                  <Field
                    label="Redeemed online"
                    value={pkg.onlineRedemption ? "Yes" : "In the salon only"}
                  />
                </FieldGrid>
              </SectionCard>

              {pkg.terms ? (
                <SectionCard title="Terms" action={editAction}>
                  <p className="text-sm leading-5 text-foreground">{pkg.terms}</p>
                </SectionCard>
              ) : null}
            </TabsContent>

            <TabsContent value="sales">
              {sales.length === 0 ? (
                <EmptyState
                  icon={ShoppingBagIcon}
                  title={withheld > 0 ? "No sales at your locations" : "No sales yet"}
                  description={
                    withheld > 0
                      ? "It has sold elsewhere in the business."
                      : "Packages sold to clients will appear here."
                  }
                  className="py-16"
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {/* R18: the rows are bounded by the grant before they are
                      counted, and the bound is said out loud — a manager seeing
                      one sale of six should know it is their branch's one
                      rather than the whole book. */}
                  {withheld > 0 ? (
                    <p className="rounded-xl bg-cami-blue-2 p-3 text-sm leading-5 text-foreground">
                      Showing sales at {scopeLabel}. {withheld} more{" "}
                      {withheld === 1 ? "was" : "were"} sold at locations you do not hold.
                    </p>
                  ) : null}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        {isMultiLocation ? <TableHead>Sold at</TableHead> : null}
                        <TableHead>Sessions</TableHead>
                        <TableHead>Purchased</TableHead>
                        <TableHead>Expires</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((row) => (
                        <TableRow key={row.customerPackageId}>
                          <TableCell>
                            <span className="text-sm text-foreground">{row.customerName}</span>
                            <span className="block font-mono text-xs text-muted-foreground">
                              {row.code}
                            </span>
                          </TableCell>
                          {isMultiLocation ? (
                            <TableCell className="text-sm text-muted-foreground">
                              {locationName(row.soldAtLocationId)}
                            </TableCell>
                          ) : null}
                          <TableCell className="text-sm text-muted-foreground">
                            {row.sessionsRemaining == null
                              ? `Unlimited · ${row.sessionsUsed ?? 0} used`
                              : `${row.sessionsRemaining} of ${row.sessionsTotal} left`}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {row.purchasedAt}
                          </TableCell>
                          {/* Out of time and out of sessions are different
                              states, and a client asks about them differently. */}
                          <TableCell className="text-sm text-muted-foreground">
                            {row.expiresAt ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
