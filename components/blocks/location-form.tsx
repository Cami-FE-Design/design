"use client"

import {
  ArrowUpRightIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CopyIcon,
  LinkIcon,
  PencilIcon,
  PlusIcon,
  XIcon,
} from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type Location = {
  id: string
  name: string
  slug: string
  address: string
  city: string
  emirate: string
  phone: string
  email: string
  vatNumber: string
  status: "live" | "draft"
  ownerName: string
  ownerEmail: string
  photoUrl: string
}

const LOCATIONS: Location[] = [
  {
    id: "shampooch-jvc",
    name: "Shampooch JVC",
    slug: "shampooch-jvc",
    address: "Al Ghozlan 4, Jumeirah Village Circle",
    city: "Dubai",
    emirate: "Dubai",
    phone: "+971 50 123 4567",
    email: "hello@shampooch.ae",
    vatNumber: "100123456700003",
    status: "live",
    ownerName: "Maz Khan",
    ownerEmail: "maaz@getcami.io",
    photoUrl: "https://picsum.photos/seed/shampooch/80",
  },
]

/**
 * Locations panel — list of locations. Click a card to open the per-location
 * detail dialog with tabs (General / Hours / Billing / Manage). Form-state
 * wiring is intentionally absent during design iteration.
 */
export function LocationForm() {
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const open = LOCATIONS.find((l) => l.id === openSlug) ?? null

  return (
    <>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
            Locations
          </h2>
          <p className="text-sm leading-5 text-muted-foreground">
            Where you operate. Click a location to manage its details.
          </p>
        </header>

        <div className="flex flex-col gap-3">
          {LOCATIONS.map((loc) => (
            <LocationListCard key={loc.id} location={loc} onOpen={() => setOpenSlug(loc.id)} />
          ))}
        </div>
      </div>

      <LocationDetailDialog location={open} onOpenChange={(o) => !o && setOpenSlug(null)} />
    </>
  )
}

function LocationListCard({ location, onOpen }: { location: Location; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-border/60 p-4 text-left transition-colors hover:bg-foreground/[0.03]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
          {/* biome-ignore lint/performance/noImgElement: placeholder photo for design mock */}
          <img src={location.photoUrl} alt={location.name} className="size-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-heading text-base font-semibold text-foreground">
            {location.name}
          </span>
          <span className="truncate text-sm text-muted-foreground">cami.app/{location.slug}</span>
        </div>
      </div>
      <StatusPill status={location.status} />
    </button>
  )
}

function StatusPill({ status }: { status: Location["status"] }) {
  if (status === "live") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-cami-green-3 px-2.5 py-1 text-xs font-medium text-cami-green-11">
        <span className="size-1.5 rounded-full bg-cami-green-11" />
        Live
      </span>
    )
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-sand-3 px-2.5 py-1 text-xs font-medium text-sand-11">
      Draft
    </span>
  )
}

// ============================================================================
// Per-location detail dialog (centered modal with tabs)
// ============================================================================

function LocationDetailDialog({
  location,
  onOpenChange,
}: {
  location: Location | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <DialogPrimitive.Root open={location !== null} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "h-[720px] max-h-[calc(100dvh-3rem)] w-[720px] max-w-[calc(100vw-3rem)] flex-col gap-0 p-0",
          "sm:max-w-[calc(100vw-3rem)]",
        )}
      >
        <DialogTitle className="sr-only">{location?.name ?? "Location"}</DialogTitle>
        <DialogDescription className="sr-only">
          Manage this location's profile, hours, billing, and operational settings.
        </DialogDescription>

        {location && (
          <LocationDetailContent location={location} onClose={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </DialogPrimitive.Root>
  )
}

function LocationDetailContent({ location, onClose }: { location: Location; onClose: () => void }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-start justify-between gap-3 px-6 pt-6 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
            {/* biome-ignore lint/performance/noImgElement: placeholder photo for design mock */}
            <img src={location.photoUrl} alt={location.name} className="size-full object-cover" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-heading text-xl font-semibold leading-7 text-foreground">
              {location.name}
            </span>
            <span className="truncate font-mono text-sm text-muted-foreground">
              cami.app/{location.slug}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          radius="full"
          aria-label="Close"
          onClick={onClose}
        >
          <XIcon className="size-5" />
        </Button>
      </header>

      <Tabs defaultValue="general" className="flex min-h-0 flex-1 flex-col gap-0">
        <TabsList variant="line" className="px-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <TabsContent value="general">
            <GeneralTab location={location} />
          </TabsContent>
          <TabsContent value="hours">
            <HoursTab />
          </TabsContent>
          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>
          <TabsContent value="manage">
            <ManageTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

// ============================================================================
// Tab content
// ============================================================================

function GeneralTab({ location }: { location: Location }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-cami-green-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2Icon className="size-5 shrink-0 text-cami-green-11" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-cami-green-11">Live</span>
            <span className="text-xs text-cami-green-11/80">
              Owner can sign in and accept bookings
            </span>
          </div>
        </div>
      </div>

      <SummaryCard heading="Profile" onEdit={() => {}}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <SummaryRow label="Business name" value={location.name} />
          <SummaryRow
            label="Address"
            value={`${location.address}, ${location.city}, ${location.emirate}`}
          />
          <SummaryRow label="Contact" value={`${location.phone} · ${location.email}`} />
          <SummaryRow label="VAT number" value={location.vatNumber} />
        </div>
      </SummaryCard>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 p-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-medium leading-5 text-foreground">Public booking URL</span>
          <span className="truncate font-mono text-sm text-muted-foreground">
            cami.app/{location.slug}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button type="button" variant="ghost" size="sm" radius="full" asChild>
            <a href={`/${location.slug}`} target="_blank" rel="noopener noreferrer">
              <ArrowUpRightIcon className="size-4" />
              Open
            </a>
          </Button>
          <Button type="button" variant="ghost" size="sm" radius="full">
            <LinkIcon className="size-4" />
            Change slug
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" radius="full" aria-label="Copy URL">
            <CopyIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function HoursTab() {
  return (
    <SummaryCard heading="Opening hours" onEdit={() => {}}>
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="flex flex-col items-center gap-2 rounded-xl bg-cami-violet-3 p-3 text-center"
          >
            <span className="text-xs font-medium text-cami-violet-11">{day}</span>
            <div className="flex flex-col text-xs leading-tight text-foreground">
              <span>9:00am</span>
              <span className="text-muted-foreground">–</span>
              <span>9:00pm</span>
            </div>
          </div>
        ))}
      </div>
    </SummaryCard>
  )
}

function BillingTab() {
  return (
    <div className="flex flex-col gap-4">
      <SummaryCard heading="Billing details" onEdit={() => {}}>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">Company details</span>
          <span className="text-sm text-muted-foreground">Shampooch JVC</span>
          <span className="text-sm text-muted-foreground">
            Al Ghozlan 4, Jumeirah Village Circle, Dubai
          </span>
        </div>
      </SummaryCard>
      <SummaryCard heading="Tax defaults" onEdit={() => {}}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <SummaryRow label="Services" value="VAT (5%)" />
          <SummaryRow label="Products" value="VAT (5%)" />
        </div>
      </SummaryCard>
      <SummaryCard heading="Receipt sequencing" onEdit={() => {}}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <SummaryRow label="Receipt No. prefix" value={null} />
          <SummaryRow label="Next receipt number" value="21857" />
        </div>
      </SummaryCard>
      <SummaryCard heading="Tipping" onEdit={() => {}}>
        <div className="flex flex-col gap-3">
          <SummaryRow label="Tipping options" value="All options enabled" />
          <SummaryRow label="Default values" value="10% · 18% · 25% · 35% · 45%" />
          <SummaryRow label="Tip calculation" value="All items included" />
        </div>
      </SummaryCard>
    </div>
  )
}

function ManageTab() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-5 text-muted-foreground">
        Lifecycle actions for this location. Archived locations stop accepting bookings; data is
        preserved for 90 days.
      </p>
      <div className="flex flex-col gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" radius="full" className="w-fit">
              Actions
              <ChevronDownIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem>Change photo</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Archive location</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// ============================================================================
// Read-mode helpers
// ============================================================================

function SummaryCard({
  heading,
  onEdit,
  children,
}: {
  heading: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border/60 p-5">
      <header className="flex items-center justify-between gap-2">
        <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
          {heading}
        </h3>
        <Button type="button" variant="ghost" size="sm" radius="full" onClick={onEdit}>
          <PencilIcon className="size-3.5" />
          Edit
        </Button>
      </header>
      {children}
    </section>
  )
}

function SummaryRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium leading-5 text-foreground">{label}</span>
      {value ? (
        <span className="text-sm leading-5 text-muted-foreground">{value}</span>
      ) : (
        <button
          type="button"
          className="inline-flex items-center gap-1 self-start text-sm font-medium leading-5 text-cami-violet-11 hover:underline"
        >
          <PlusIcon className="size-3.5" />
          Add
        </button>
      )}
    </div>
  )
}
