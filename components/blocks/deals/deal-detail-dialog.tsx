"use client"

/**
 * One deal, read in full (DW3.4, R18, R24).
 *
 * ## A dialog, not an inner page
 *
 * The dev repo swaps the list out for a full-page detail view with a breadcrumb
 * back. Every read-only detail surface in this repo is a dialog instead —
 * `PackageDetailDialog`, `ClientDetailDialog`, the sale sheet — and only
 * *editing* takes over the screen. Reading a deal should not lose the list
 * behind it, and the wizard is where the takeover already lives. So this
 * borrows the package dialog: same width, same fixed height with the content
 * scrolling inside it, same tinted header with an icon tile and an Options menu.
 *
 * ## Two tabs, and a height that fits them
 *
 * The built product has three — Overview, Details, Availability. Overview held
 * four figures and Availability held two fields, so each filled about a third
 * of the panel; they are also the same question, what is this deal doing and
 * where, so they are one tab here.
 *
 * The empty space under them was never the tabs' fault. It was an 800px panel
 * borrowed from `PackageDetailDialog`, whose Sales tab is a long list and needs
 * it. Collapsing the tabs into one column was tried and reads as a wall; the
 * fix is the height. At 640px both tabs fill, and a nine-branch estate scrolls
 * the way a modal should.
 *
 * ## The location facts, said once each
 *
 * On the built product Availability prints
 * `locationIds.length > 0 ? "N selected" : "All locations"`, behind an Edit
 * button that says editing is coming soon. A deal nobody scoped reads as
 * chain-wide, and there is no way to correct it once you notice. Here the
 * branches are named, a chain-wide offer is distinguished from a list that
 * happens to be complete today, "cannot run" is said out loud for the empty
 * one — once, where the branches are, rather than as a stat, a banner and a
 * field all repeating it — and Edit opens the wizard on the step that fixes it.
 */

import {
  ArchiveIcon,
  CirclePercentIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PencilIcon,
  XIcon,
} from "lucide-react"
import type * as React from "react"
import { useState } from "react"

import { SectionCard } from "@/components/blocks/section-card"
import { Badge } from "@/components/ui/badge"
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
import { namesFor } from "@/lib/deals/catalogue"
import {
  applyToRows,
  DEAL_STATUS_LABEL,
  DEAL_TYPE_LABEL,
  type Deal,
  type DealStatus,
  formatDealSummary,
  formatDiscountValue,
  statusFor,
} from "@/lib/deals/mock"
import { publicLabel } from "@/lib/locations/mock"
import { describeScope, isRunnable, reaches } from "@/lib/locations/promotion-scope"
import type { Location } from "@/lib/locations/types"
import { TEAM_MEMBERS } from "@/lib/team/mock"

/**
 * How many branches to name before counting the rest.
 *
 * Six fills the card without turning it into a scroll: past that a reader is
 * not reading names any more, they are looking for a number.
 */
const MAX_NAMED_BRANCHES = 6

const STATUS_VARIANT: Record<DealStatus, "primary-soft" | "outline" | "secondary"> = {
  active: "primary-soft",
  scheduled: "outline",
  inactive: "secondary",
  archived: "secondary",
}

/** Label over value, the shape every other detail dialog uses. */
function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="min-w-0 text-foreground text-sm">{value ?? "–"}</span>
    </div>
  )
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
}

function aed(minor: number): string {
  return `AED ${(minor / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
}

function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function DealDetailDialog({
  open,
  onOpenChange,
  deal,
  todayIso,
  locationName,
  granted,
  estateSize,
  isMultiLocation,
  onEdit,
  onDuplicate,
  onSetStatus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: Deal | null
  todayIso: string
  locationName: (id: string) => string
  /** The branches this reader holds (R18) — never the estate. */
  granted: ReadonlyArray<Location>
  estateSize: number
  isMultiLocation: boolean
  onEdit: () => void
  onDuplicate: () => void
  onSetStatus: (next: DealStatus) => void
}) {
  const [tab, setTab] = useState<"overview" | "details">("overview")
  if (!deal) return null

  const runnable = isRunnable(deal.scope)
  const resolved = runnable
    ? statusFor(deal.status, deal.startDate, deal.endDate, todayIso)
    : "inactive"
  const mine = reaches(deal.scope, granted)
  const team = TEAM_MEMBERS.filter((m) => deal.teamMemberIds.includes(m.id))

  const editAction = (
    <Button variant="secondary" size="sm" radius="full" onClick={onEdit}>
      Edit
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // One height, and the content scrolls inside it — a modal does not
        // resize as you move between its own tabs, which makes the tab bar jump
        // under the pointer and the page behind it reflow.
        //
        // 640px, not the package dialog's 800: that one's Sales tab is a long
        // list and earns the height, while a deal's two tabs are a strip and
        // three cards. At 800 both ended with a third of the panel empty.
        className="flex h-160 max-h-[calc(100vh-100px)] max-w-157.5! flex-col gap-0 p-0 sm:max-w-157.5!"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "overview" | "details")}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-col bg-muted/40">
            <DialogHeader className="flex flex-row items-center gap-3 px-9 pt-8 pb-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-cami-violet-3 text-cami-violet-11">
                <CirclePercentIcon className="size-5.5" />
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex min-w-0 items-center gap-2">
                  <DialogTitle className="truncate font-semibold text-[22px] leading-7">
                    {deal.name}
                  </DialogTitle>
                  <Badge variant={STATUS_VARIANT[resolved]} size="sm" className="shrink-0">
                    {DEAL_STATUS_LABEL[resolved]}
                  </Badge>
                </div>
                <DialogDescription className="truncate text-sm">
                  {DEAL_TYPE_LABEL[deal.type]} · {formatDealSummary(deal)}
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
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onSelect={onEdit}>
                      <PencilIcon className="size-4" />
                      Edit deal
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={onDuplicate}>
                      <CopyIcon className="size-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {resolved !== "archived" ? (
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => onSetStatus("archived")}
                      >
                        <ArchiveIcon className="size-4" />
                        Archive deal
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onSelect={() => onSetStatus("inactive")}>
                        Restore
                      </DropdownMenuItem>
                    )}
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

            <div className="flex items-center gap-6 px-9">
              <TabsList variant="underline">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* One scroll region, and it is this one. */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-9 py-5">
            <TabsContent value="overview" className="flex flex-col gap-3">
              {/* A divided strip, not three cards.
              These are reference figures — nobody opens a deal to read "Total
              clients: 0" — and as bordered cards inside a bordered card they
              were chrome around chrome, every number zero on a deal that has
              not run. The client dialog reached the same conclusion about its
              own lifetime counters: a tinted band reads as reference, and
              leaves "card" meaning something you act on. */}
              <div className="grid grid-cols-3 divide-x divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-muted/50">
                {[
                  { label: "Sales", value: aed(deal.totalSalesMinor) },
                  { label: "Applied", value: String(deal.redemptions) },
                  { label: "Clients", value: String(deal.totalClients) },
                ].map((cell) => (
                  <div key={cell.label} className="flex flex-col items-center gap-1 px-2 py-3">
                    <span className="whitespace-nowrap font-heading font-semibold text-lg leading-none">
                      {cell.value}
                    </span>
                    <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                      {cell.label}
                    </span>
                  </div>
                ))}
              </div>

              <SectionCard
                title={isMultiLocation ? "Where it runs" : "Availability"}
                action={editAction}
              >
                {!runnable ? (
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-cami-tomato-11 text-sm">
                      No locations — this deal cannot run
                    </p>
                    <p className="text-muted-foreground text-sm">
                      It was saved with none chosen, which is not the same as everywhere. Nobody can
                      use it until it has one.
                    </p>
                  </div>
                ) : isMultiLocation ? (
                  <>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-foreground text-sm">
                        {describeScope(deal.scope, locationName)}
                      </span>
                      <span className="shrink-0 text-muted-foreground text-sm tabular-nums">
                        {mine.length} of {granted.length}
                      </span>
                    </div>
                    {/* A chain-wide deal names no branches, because naming them
                        is the one thing that would make it wrong: it runs at
                        the ones that exist AND the ones that do not yet, and a
                        list of today's nine says the opposite. */}
                    {deal.scope.kind === "estate" ? (
                      <p className="-mt-1 text-muted-foreground text-sm">
                        Including any location you open while it is running
                        {granted.length < estateSize ? ", of which these are yours" : ""}.
                      </p>
                    ) : (
                      <>
                        {/* Only the branches it REACHES.
                            Every branch was listed, each marked Running or Not
                            running, and at nine that is six rows of "no" and a
                            scrollbar — at forty it is unusable. The reader's
                            question is which ones it runs at; the rest are the
                            default and are already counted in "3 of 9". */}
                        <ul className="flex flex-col divide-y divide-border/60 border-border/60 border-t">
                          {mine.slice(0, MAX_NAMED_BRANCHES).map((l) => (
                            <li key={l.id} className="flex items-center justify-between gap-3 py-2">
                              <span className="truncate text-foreground text-sm">
                                {publicLabel(l)}
                              </span>
                              <span className="shrink-0 text-cami-green-11 text-sm">Running</span>
                            </li>
                          ))}
                        </ul>
                        {mine.length > MAX_NAMED_BRANCHES ? (
                          // Counted, not trailed off. "…" leaves the reader
                          // unable to tell six from sixteen.
                          <p className="text-muted-foreground text-sm">
                            and {mine.length - MAX_NAMED_BRANCHES} more
                          </p>
                        ) : null}
                        {mine.length === 0 ? (
                          // Scoped to real branches, none of them yours. It is
                          // somebody else's offer and this reader can only see
                          // that it exists (R18).
                          <p className="text-muted-foreground text-sm">
                            None of them are yours, so it does not run anywhere you can see.
                          </p>
                        ) : null}
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Runs at your only location, whenever its dates allow.
                  </p>
                )}
              </SectionCard>

              <SectionCard title="Who can sell it">
                <p className="text-foreground text-sm">
                  {team.length === 0
                    ? "Everybody — nobody was singled out."
                    : team.map((m) => m.name ?? m.email).join(", ")}
                </p>
              </SectionCard>
            </TabsContent>

            <TabsContent value="details" className="flex flex-col gap-3">
              <SectionCard title="The offer" action={editAction}>
                <FieldGrid>
                  <Field label="Deal value" value={formatDiscountValue(deal)} />
                  <Field label="Discount code" value={deal.discountCode || "No code needed"} />
                  <Field label="Starts" value={longDate(deal.startDate)} />
                  <Field
                    label="Ends"
                    value={deal.endDate ? longDate(deal.endDate) : "No end date"}
                  />
                  <Field
                    label="Offered at the till"
                    value={deal.enableAtPointOfSale ? "Yes" : "Online only"}
                  />
                  <Field
                    label="Created"
                    value={new Date(deal.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  />
                  {deal.description ? (
                    <div className="col-span-2">
                      <Field label="Description" value={deal.description} />
                    </div>
                  ) : null}
                </FieldGrid>
              </SectionCard>

              <SectionCard title="What it comes off">
                <FieldGrid>
                  {applyToRows(deal.applicability).map((row) => {
                    const names =
                      row.scope.mode === "selected" ? namesFor(row.key, row.scope.ids) : []
                    return (
                      <Field
                        key={row.key}
                        label={row.label}
                        // Ids are what gets stored, names are what gets read. "3
                        // services" alone makes a merchant reopen the wizard to
                        // find out which three.
                        value={
                          <span className="block truncate" title={names.join(", ") || row.value}>
                            {names.length > 0 ? names.join(", ") : row.value}
                          </span>
                        }
                      />
                    )
                  })}
                  <Field
                    label="Gift cards in store"
                    value={deal.applicability.giftCardsInStore ? "Included" : "Not included"}
                  />
                </FieldGrid>
              </SectionCard>

              <SectionCard title="Limits">
                <FieldGrid>
                  <Field
                    label="One use per client"
                    value={deal.limits.oneUsePerClient ? "Yes" : "No"}
                  />
                  <Field
                    label="Usage limit"
                    value={
                      deal.limits.totalUsesEnabled && deal.limits.totalUses != null
                        ? `${deal.limits.totalUses.toLocaleString("en-US")} total uses`
                        : "Unlimited"
                    }
                  />
                  <Field
                    label="Minimum purchase"
                    value={
                      deal.limits.minimumPurchaseEnabled &&
                      deal.limits.minimumPurchaseAmount != null
                        ? `AED ${deal.limits.minimumPurchaseAmount.toLocaleString("en-US")}`
                        : "None"
                    }
                  />
                </FieldGrid>
              </SectionCard>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
