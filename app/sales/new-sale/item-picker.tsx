"use client"

import {
  ArrowLeftIcon,
  CalendarClockIcon,
  ClipboardCheckIcon,
  CreditCardIcon,
  GiftIcon,
  type LucideIcon,
  PackageIcon,
  SearchXIcon,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { cn } from "@/lib/utils"
import { AppointmentSubject } from "./appointment-subject"
import {
  APPOINTMENTS,
  formatDuration,
  MEMBERSHIPS,
  membershipMeta,
  money,
  PRODUCTS,
  SERVICE_CATEGORIES,
  SERVICES,
} from "./mock"
import type {
  AppointmentItem,
  MembershipPickItem,
  PickerView,
  ProductItem,
  ServiceItem,
} from "./types"

type ItemPickerProps = {
  onAddService: (service: ServiceItem) => void
  onAddProduct: (product: ProductItem) => void
  onAddAppointment: (appt: AppointmentItem) => void
  onAddMembership: (membership: MembershipPickItem) => void
  /** Appointment ids already in the cart — shown as "Added", not re-addable. */
  addedApptIds: Set<string>
}

const ROOT_TILES: {
  view: PickerView | null
  label: string
  icon: LucideIcon
  disabled?: boolean
}[] = [
  { view: "appointments", label: "Appointments", icon: CalendarClockIcon },
  { view: "services", label: "Services", icon: ClipboardCheckIcon },
  { view: "products", label: "Products", icon: PackageIcon },
  { view: "memberships", label: "Memberships", icon: CreditCardIcon },
  { view: null, label: "Gift cards", icon: GiftIcon, disabled: true },
]

export function ItemPicker({
  onAddService,
  onAddProduct,
  onAddAppointment,
  onAddMembership,
  addedApptIds,
}: ItemPickerProps) {
  const [view, setView] = useState<PickerView>("root")
  const [rootQuery, setRootQuery] = useState("")

  const searching = view === "root" && rootQuery.trim().length > 0

  if (view === "services") {
    return <ServicesView onBack={() => setView("root")} onAdd={onAddService} />
  }
  if (view === "products") {
    return <ProductsView onBack={() => setView("root")} onAdd={onAddProduct} />
  }
  if (view === "memberships") {
    return <MembershipsView onBack={() => setView("root")} onAdd={onAddMembership} />
  }
  if (view === "appointments") {
    return (
      <AppointmentsView
        onBack={() => setView("root")}
        // Snapshotting an appointment returns to the cart home (one appointment per cart).
        onAdd={(appt) => {
          onAddAppointment(appt)
          setView("root")
        }}
        addedApptIds={addedApptIds}
      />
    )
  }

  // Root: global search + category tiles (or aggregated search results).
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold leading-8 text-foreground">
          Add to cart
        </h1>
      </div>

      <SearchInput
        size="lg"
        placeholder="Search"
        onValueChange={setRootQuery}
        aria-label="Search services and products"
      />

      {searching ? (
        <GlobalSearchResults
          query={rootQuery.trim()}
          onAddService={onAddService}
          onAddProduct={onAddProduct}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ROOT_TILES.map((tile) => (
            <CategoryTile
              key={tile.label}
              icon={tile.icon}
              label={tile.label}
              disabled={tile.disabled}
              onClick={tile.view ? () => setView(tile.view as PickerView) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Root category tile ───────────────────────────────────────────────────────

function CategoryTile({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: LucideIcon
  label: string
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex flex-col gap-6 rounded-2xl border border-border bg-card p-4 text-left transition-colors",
        disabled ? "cursor-not-allowed opacity-50" : "hover:bg-muted/40",
      )}
    >
      <Icon className="size-5 stroke-[1.5] text-foreground" />
      <span className="text-base font-medium text-foreground">{label}</span>
    </button>
  )
}

// ─── Drilldown header ─────────────────────────────────────────────────────────

function DrilldownHeader({ onBack }: { onBack: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      radius="full"
      className="w-fit gap-1.5"
      onClick={onBack}
    >
      <ArrowLeftIcon className="size-4" />
      Back
    </Button>
  )
}

// ─── Services drilldown ───────────────────────────────────────────────────────

function ServicesView({
  onBack,
  onAdd,
}: {
  onBack: () => void
  onAdd: (service: ServiceItem) => void
}) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => filterServices(query), [query])

  return (
    <div className="flex flex-col gap-5">
      <DrilldownHeader onBack={onBack} />
      <SearchInput size="lg" placeholder="Search services" onValueChange={setQuery} autoFocus />
      {filtered.length === 0 ? (
        <NoResults query={query} />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((service) => (
            <ServiceRow key={service.id} service={service} onAdd={() => onAdd(service)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ServiceRow({ service, onAdd }: { service: ServiceItem; onAdd: () => void }) {
  const accent =
    SERVICE_CATEGORIES.find((c) => c.id === service.categoryId)?.accent ?? "bg-cami-violet-9"
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-border bg-card pr-4 text-left transition-colors hover:bg-muted/40"
    >
      <div className="flex min-w-0 items-stretch gap-3">
        <span className={cn("w-1 shrink-0 self-stretch", accent)} />
        <div className="flex min-w-0 flex-col py-3">
          <span className="truncate text-sm font-medium text-foreground">{service.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDuration(service.durationMin)}
          </span>
        </div>
      </div>
      <span className="shrink-0 text-sm font-medium text-foreground">
        {money(service.priceMinor)}
      </span>
    </button>
  )
}

// ─── Products drilldown ───────────────────────────────────────────────────────

function ProductsView({
  onBack,
  onAdd,
}: {
  onBack: () => void
  onAdd: (product: ProductItem) => void
}) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => filterProducts(query), [query])

  return (
    <div className="flex flex-col gap-5">
      <DrilldownHeader onBack={onBack} />
      <SearchInput size="lg" placeholder="Search products" onValueChange={setQuery} autoFocus />
      {filtered.length === 0 ? (
        <NoResults query={query} />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((product) => (
            <ProductRow key={product.id} product={product} onAdd={() => onAdd(product)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductRow({ product, onAdd }: { product: ProductItem; onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/40"
    >
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{product.name}</span>
        {product.size ? (
          <span className="text-xs text-muted-foreground">{product.size}</span>
        ) : null}
      </div>
      <span className="shrink-0 text-sm font-medium text-foreground">
        {money(product.priceMinor)}
      </span>
    </button>
  )
}

// ─── Memberships drilldown ────────────────────────────────────────────────────

function MembershipsView({
  onBack,
  onAdd,
}: {
  onBack: () => void
  onAdd: (membership: MembershipPickItem) => void
}) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => filterMemberships(query), [query])

  return (
    <div className="flex flex-col gap-5">
      <DrilldownHeader onBack={onBack} />
      <SearchInput size="lg" placeholder="Search memberships" onValueChange={setQuery} autoFocus />
      {filtered.length === 0 ? (
        <NoResults query={query} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((membership) => (
            <MembershipRow
              key={membership.id}
              membership={membership}
              onAdd={() => onAdd(membership)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MembershipRow({
  membership,
  onAdd,
}: {
  membership: MembershipPickItem
  onAdd: () => void
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex items-stretch gap-3 overflow-hidden rounded-2xl border border-border bg-card text-left transition-colors hover:bg-muted/40"
    >
      <span className={cn("w-1 shrink-0 self-stretch", membership.accent)} />
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-3 pr-4">
        <span className="truncate text-sm font-medium text-foreground">{membership.name}</span>
        <span className="text-xs text-muted-foreground">{membershipMeta(membership)}</span>
        <span className="text-sm font-medium text-foreground">{money(membership.priceMinor)}</span>
      </div>
    </button>
  )
}

// ─── Appointments drilldown ───────────────────────────────────────────────────

function AppointmentsView({
  onBack,
  onAdd,
  addedApptIds,
}: {
  onBack: () => void
  onAdd: (appt: AppointmentItem) => void
  addedApptIds: Set<string>
}) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matched = q
      ? APPOINTMENTS.filter((a) => a.clientName.toLowerCase().includes(q))
      : APPOINTMENTS
    // Chronological by start time, earliest first.
    return [...matched].sort((a, b) => startMinutes(a.start) - startMinutes(b.start))
  }, [query])

  return (
    <div className="flex flex-col gap-5">
      <DrilldownHeader onBack={onBack} />
      <SearchInput size="lg" placeholder="Search appointments" onValueChange={setQuery} autoFocus />
      {filtered.length === 0 ? (
        <NoResults query={query} />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appt={appt}
              added={addedApptIds.has(appt.id)}
              onAdd={() => onAdd(appt)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AppointmentCard({
  appt,
  added,
  onAdd,
}: {
  appt: AppointmentItem
  added: boolean
  onAdd: () => void
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={added}
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition-colors",
        added ? "cursor-not-allowed opacity-70 ring-1 ring-cami-violet-7" : "hover:bg-muted/40",
      )}
    >
      {/* Header — time · location, subject row, and status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex min-w-0 items-center text-sm">
            <span className="font-semibold text-foreground">{appt.start}</span>
            {appt.location ? (
              <span className="truncate text-muted-foreground"> · {appt.location}</span>
            ) : null}
          </div>
          <AppointmentSubject appt={appt} />
        </div>
        {added ? <AddedBadge /> : <StatusBadge label={appt.status} />}
      </div>

      {/* Service lines — name · staff · duration, price right */}
      <div className="flex flex-col gap-2">
        {appt.lines.map((line) => (
          <div key={line.serviceId} className="flex items-start justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">
              <span className="text-foreground">{line.name}</span>
              <span className="text-muted-foreground">
                {" "}
                · {line.staffName} · {formatDuration(line.durationMin)}
              </span>
            </span>
            <span className="shrink-0 font-medium text-foreground tabular-nums">
              {money(line.priceMinor)}
            </span>
          </div>
        ))}
      </div>
    </button>
  )
}

function StatusBadge({ label }: { label?: string }) {
  if (!label) return null
  return (
    <span className="shrink-0 rounded-lg bg-blue-4 px-1.5 py-0.5 font-medium text-[11px] text-blue-12">
      {label}
    </span>
  )
}

function AddedBadge() {
  return (
    <span className="shrink-0 rounded-lg bg-cami-violet-3 px-1.5 py-0.5 font-medium text-[11px] text-cami-violet-11">
      Added
    </span>
  )
}

// ─── Global search results (aggregate services + products) ────────────────────

function GlobalSearchResults({
  query,
  onAddService,
  onAddProduct,
}: {
  query: string
  onAddService: (service: ServiceItem) => void
  onAddProduct: (product: ProductItem) => void
}) {
  const services = useMemo(() => filterServices(query), [query])
  const products = useMemo(() => filterProducts(query), [query])

  if (services.length === 0 && products.length === 0) {
    return <NoResults query={query} />
  }

  return (
    <div className="flex flex-col gap-6">
      {services.length > 0 ? (
        <section className="flex flex-col gap-3">
          <GroupHeader label="Services" count={services.length} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {services.map((service) => (
              <ServiceRow key={service.id} service={service} onAdd={() => onAddService(service)} />
            ))}
          </div>
        </section>
      ) : null}
      {products.length > 0 ? (
        <section className="flex flex-col gap-3">
          <GroupHeader label="Products" count={products.length} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} onAdd={() => onAddProduct(product)} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
        {count}
      </span>
    </div>
  )
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <SearchXIcon className="size-10 stroke-[1.25] text-muted-foreground/50" aria-hidden />
      <p className="text-sm font-medium text-muted-foreground">No results for “{query}”</p>
    </div>
  )
}

// ─── Filters ──────────────────────────────────────────────────────────────────

/** Parse a "9:00am" / "2:00pm" label into minutes-since-midnight for sorting. */
function startMinutes(start: string): number {
  const m = start.match(/(\d+):(\d+)\s*(am|pm)/i)
  if (!m) return 0
  let hour = Number(m[1]) % 12
  if (m[3].toLowerCase() === "pm") hour += 12
  return hour * 60 + Number(m[2])
}

function filterServices(query: string): ServiceItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return SERVICES
  return SERVICES.filter((s) => s.name.toLowerCase().includes(q))
}

function filterProducts(query: string): ProductItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return PRODUCTS
  return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q))
}

function filterMemberships(query: string): MembershipPickItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return MEMBERSHIPS
  return MEMBERSHIPS.filter((m) => m.name.toLowerCase().includes(q))
}
