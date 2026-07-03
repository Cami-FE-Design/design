"use client"

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { LucideIcon } from "lucide-react"
import {
  ArrowUpRightIcon,
  BanknoteIcon,
  CalendarClockIcon,
  ChevronDownIcon,
  CircleDollarSignIcon,
  CirclePlusIcon,
  GiftIcon,
  LockIcon,
  PencilIcon,
  StoreIcon,
  TagIcon,
  Trash2Icon,
  WalletIcon,
  XIcon,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog as DialogPrimitive } from "radix-ui"
import { Fragment, useEffect, useRef, useState } from "react"
import { EmptyState } from "@/components/blocks/empty-state"
import { NotionBreadcrumb } from "@/components/blocks/notion-breadcrumb"
import { SettingsRow } from "@/components/blocks/settings-row"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

// Full-window dialog overrides. The important suffix beats the base sm:max-w-md
// from the Dialog primitive. `bg-background!` replaces the dialog's translucent
// `bg-white-a11` so the full-screen takeover stays opaque over the settings
// modal's dim overlay (otherwise the backdrop bleeds through as a grey haze).
const fullScreenDialogClass =
  "fixed! inset-0! top-0! left-0! h-dvh! w-screen! max-h-none! max-w-none! sm:max-w-none! translate-x-0! translate-y-0! rounded-none! flex-col bg-background! p-0"

const selectTriggerOverride =
  "data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium"

const EXPIRATION_OPTIONS = [
  "14 days",
  "1 month",
  "2 months",
  "3 months",
  "4 months",
  "6 months",
  "1 year",
  "2 years",
  "3 years",
  "5 years",
  "Never",
]

type GiftCardConfig = {
  enabled: boolean
  values: string[]
  expiration: string
}

// Defaults to an already-set-up program so the populated state shows first; the
// bottom "Show empty state" demo toggle flips to the inactive empty state.
const DEFAULT_GIFT_CARD_CONFIG: GiftCardConfig = {
  enabled: true,
  values: ["1800", "3500", "5300", "7000"],
  expiration: "1 year",
}

function formatAed(value: string) {
  const n = Number(value)
  return Number.isFinite(n) ? `AED ${n.toLocaleString("en-US")}` : `AED ${value}`
}

/**
 * Full-screen edit/add takeover with the shared scroll-reveal header title:
 * the header shows the title only once the large body title scrolls out of
 * view (matches the business-details edit dialog). `actions` is the right-side
 * button cluster (Close / Save / Options …).
 */
function FullScreenTakeover({
  title,
  ariaDescription,
  subtitle,
  actions,
  onClose,
  children,
}: {
  title: string
  ariaDescription: string
  subtitle?: string
  actions: React.ReactNode
  onClose: () => void
  children: React.ReactNode
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [showHeaderTitle, setShowHeaderTitle] = useState(false)

  useEffect(() => {
    let cleanup: (() => void) | undefined
    const setup = () => {
      const el = scrollRef.current
      const title = titleRef.current
      if (!el || !title) {
        const id = window.requestAnimationFrame(setup)
        cleanup = () => window.cancelAnimationFrame(id)
        return
      }
      const update = () => {
        const titleRect = title.getBoundingClientRect()
        const containerRect = el.getBoundingClientRect()
        setShowHeaderTitle(titleRect.bottom < containerRect.top)
      }
      update()
      el.addEventListener("scroll", update, { passive: true })
      cleanup = () => el.removeEventListener("scroll", update)
    }
    setup()
    return () => cleanup?.()
  }, [])

  return (
    <DialogPrimitive.Root open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={fullScreenDialogClass}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{ariaDescription}</DialogDescription>

        <header className="sticky top-0 z-10 border-b border-border/40 bg-background px-6 py-3 lg:px-10">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            <span
              className={cn(
                "min-w-0 truncate font-heading text-base font-semibold leading-6 text-foreground transition-opacity duration-200",
                showHeaderTitle ? "opacity-100" : "opacity-0",
              )}
              aria-hidden={!showHeaderTitle}
            >
              {title}
            </span>
            <div className="ms-auto flex items-center gap-2">{actions}</div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-12 lg:px-10">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
            <div className="flex flex-col gap-3">
              <h2
                ref={titleRef}
                className="font-heading text-2xl font-semibold leading-tight text-foreground lg:text-4xl"
              >
                {title}
              </h2>
              {subtitle ? (
                <p className="max-w-2xl text-base leading-6 text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            {children}
          </div>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  )
}

type SalesView = "home" | "payment-methods" | "gift-cards"

type SalesCard = {
  id: Exclude<SalesView, "home">
  label: string
  description: string
  icon: LucideIcon
}

const SALES_CARDS: SalesCard[] = [
  {
    id: "payment-methods",
    label: "Payment methods",
    description: "Customize the payment methods displayed at checkout for your team members.",
    icon: WalletIcon,
  },
  {
    id: "gift-cards",
    label: "Gift cards",
    description: "Let your clients buy personalized gift cards for your business.",
    icon: GiftIcon,
  },
]

type PaymentMethod = {
  id: string
  name: string
  icon: LucideIcon
  iconClassName?: string
  /** Soft tinted icon-tile background, paired with iconClassName. */
  tileClassName?: string
  /** Built-in method (Cash) — can't be edited or deleted (still reorderable). */
  locked?: boolean
}

// Neutral icon treatment shared by every payment method, matching the rest of
// the settings list items. Colored per-method tints (Cash green, custom violet)
// are intentionally omitted for now: checkout doesn't render these colors, so
// settings + checkout would be inconsistent. Revisit colored variants — the
// iconClassName/tileClassName fields still support them — once checkout does.
const NEUTRAL_PAYMENT_METHOD_STYLE = {
  iconClassName: "text-muted-foreground",
  tileClassName: "border border-border/50 bg-background",
} satisfies Pick<PaymentMethod, "iconClassName" | "tileClassName">

// Every custom payment method (the seed "Other" and any the user adds) shares
// this icon + tile so the list stays visually uniform. Defined once so the seed
// and the add handler can't drift apart.
const CUSTOM_PAYMENT_METHOD_STYLE = {
  icon: CircleDollarSignIcon,
  ...NEUTRAL_PAYMENT_METHOD_STYLE,
} satisfies Pick<PaymentMethod, "icon" | "iconClassName" | "tileClassName">

// Cash is always present and locked.
const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "cash",
    name: "Cash",
    icon: BanknoteIcon,
    ...NEUTRAL_PAYMENT_METHOD_STYLE,
    locked: true,
  },
  {
    id: "other",
    name: "Other",
    ...CUSTOM_PAYMENT_METHOD_STYLE,
  },
]

export function SalesSettings() {
  // Deep-links from /screens: ?sub=payment-methods|gift-cards opens straight into
  // a sub-screen; the per-panel ?pm / ?gc params open a specific takeover/state.
  const searchParams = useSearchParams()
  const sub = searchParams.get("sub")
  const [view, setView] = useState<SalesView>(
    sub === "payment-methods" ? "payment-methods" : sub === "gift-cards" ? "gift-cards" : "home",
  )

  if (view === "payment-methods") {
    return (
      <PaymentMethodsPanel onBack={() => setView("home")} initialAction={searchParams.get("pm")} />
    )
  }
  if (view === "gift-cards") {
    return <GiftCardsPanel onBack={() => setView("home")} initialGift={searchParams.get("gc")} />
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">Sales</h2>
        <p className="text-sm leading-5 text-muted-foreground">
          Manage how you take payments and sell gift cards at checkout.
        </p>
      </header>

      {/* Width matches the Business details "Business info" card: its inner
          16rem+16rem grid + gap-x-8 (34rem) + the card's p-5 padding (2.5rem)
          = 36.5rem (w-146). The two Sales cards fill that same footprint. */}
      <div className="grid gap-3 sm:w-146 sm:grid-cols-2">
        {SALES_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setView(card.id)}
              className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 text-left transition-colors hover:bg-foreground/3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground">
                <Icon className="size-5" />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-base font-semibold text-foreground">{card.label}</span>
                <span className="text-sm leading-5 text-muted-foreground">{card.description}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Notion-style breadcrumb + title row for a Sales sub-screen. Mirrors the
 * Business details header: clean h2 + plain description, no inline actions.
 */
function SubScreenHeader({
  onBack,
  title,
  description,
}: {
  onBack: () => void
  title: string
  description?: string
}) {
  return (
    <div className="flex shrink-0 flex-col gap-4">
      <NotionBreadcrumb
        segments={[{ label: "Sales", icon: TagIcon, onClick: onBack }, { label: title }]}
      />
      <header className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </header>
    </div>
  )
}

/**
 * Action row shown below a Sales sub-screen's content card, mirroring the
 * "Add pet" affordance on the client detail. `onAdd` renders the primary
 * secondary-pill button; children render extra controls (e.g. an Options
 * dropdown) to its left.
 */
function SubScreenActions({
  addLabel,
  onAdd,
  children,
}: {
  addLabel?: string
  onAdd?: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}
      {onAdd && addLabel ? (
        <Button type="button" variant="secondary" size="sm" radius="full" onClick={onAdd}>
          <CirclePlusIcon />
          {addLabel}
        </Button>
      ) : null}
    </div>
  )
}

type FormState = { mode: "add" } | { mode: "edit"; method: PaymentMethod } | null

function PaymentMethodsPanel({
  onBack,
  initialAction,
}: {
  onBack: () => void
  /** Deep-link: "add" | "edit" | "order" opens the matching takeover on mount. */
  initialAction?: string | null
}) {
  const [methods, setMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS)
  const [form, setForm] = useState<FormState>(() => {
    if (initialAction === "add") return { mode: "add" }
    if (initialAction === "edit") {
      // Edit the first non-locked sample method so the takeover has real data.
      const editable = DEFAULT_PAYMENT_METHODS.find((m) => !m.locked)
      return editable ? { mode: "edit", method: editable } : null
    }
    return null
  })
  const [ordering, setOrdering] = useState(initialAction === "order")
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null)
  const nextId = useRef(0)

  const move = (id: string, direction: -1 | 1) => {
    setMethods((prev) => {
      const index = prev.findIndex((m) => m.id === id)
      const target = index + direction
      if (index === -1 || target < 0 || target >= prev.length) return prev
      return arrayMove(prev, index, target)
    })
  }

  const handleSubmit = (name: string) => {
    if (form?.mode === "edit") {
      const id = form.method.id
      setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)))
    } else {
      nextId.current += 1
      setMethods((prev) => [
        ...prev,
        {
          id: `pm-${nextId.current}`,
          name,
          ...CUSTOM_PAYMENT_METHOD_STYLE,
        },
      ])
    }
    setForm(null)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setMethods((prev) => prev.filter((m) => m.id !== id))
    setDeleteTarget(null)
    // Close the edit takeover too (no-op when delete came from the list row).
    setForm(null)
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <SubScreenHeader
        onBack={onBack}
        title="Payment methods"
        description="View and customize the payment methods displayed at checkout for your team members."
      />
      <div className="flex flex-col gap-4">
        <ul className="flex max-h-105 w-full flex-col gap-4 overflow-y-auto rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146">
          {methods.map((method, index) => (
            <Fragment key={method.id}>
              {index > 0 ? <li aria-hidden className="h-px shrink-0 bg-border/60" /> : null}
              <PaymentMethodRow
                method={method}
                canMoveUp={index > 0}
                canMoveDown={index < methods.length - 1}
                onEdit={() => setForm({ mode: "edit", method })}
                onDelete={() => setDeleteTarget(method)}
                onMoveUp={() => move(method.id, -1)}
                onMoveDown={() => move(method.id, 1)}
              />
            </Fragment>
          ))}
        </ul>
        <SubScreenActions addLabel="Add payment method" onAdd={() => setForm({ mode: "add" })}>
          {methods.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="secondary" size="sm" radius="full">
                  Options
                  <ChevronDownIcon className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onSelect={() => setOrdering(true)}>Change order</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </SubScreenActions>
      </div>

      {form ? (
        <PaymentMethodFormDialog
          mode={form.mode}
          initialName={form.mode === "edit" ? form.method.name : ""}
          onClose={() => setForm(null)}
          onSubmit={handleSubmit}
          onDelete={
            form.mode === "edit" && !form.method.locked
              ? () => setDeleteTarget(form.method)
              : undefined
          }
        />
      ) : null}

      {ordering ? (
        <PaymentMethodsOrderDialog
          methods={methods}
          onClose={() => setOrdering(false)}
          onSave={(ordered) => {
            setMethods(ordered)
            setOrdering(false)
          }}
        />
      ) : null}

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

function PaymentMethodRow({
  method,
  canMoveUp,
  canMoveDown,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  method: PaymentMethod
  canMoveUp: boolean
  canMoveDown: boolean
  onEdit: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const Icon = method.icon
  return (
    <li className="flex shrink-0 items-center gap-4">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          method.tileClassName ?? "bg-muted",
        )}
      >
        <Icon className={cn("size-5", method.iconClassName)} />
      </span>
      <span className="text-base font-semibold text-foreground">{method.name}</span>
      <div className="ml-auto flex items-center">
        {method.locked ? (
          <LockIcon className="size-4 text-muted-foreground" aria-label="Locked" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" radius="full" className="gap-1.5">
                Actions
                <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuItem onSelect={onEdit}>
                <PencilIcon className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                <Trash2Icon className="size-4" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={!canMoveUp} onSelect={onMoveUp}>
                Move up
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canMoveDown} onSelect={onMoveDown}>
                Move down
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </li>
  )
}

/** Full-screen add/edit takeover with a single Name field. */
function PaymentMethodFormDialog({
  mode,
  initialName,
  onClose,
  onSubmit,
  onDelete,
}: {
  mode: "add" | "edit"
  initialName: string
  onClose: () => void
  onSubmit: (name: string) => void
  onDelete?: () => void
}) {
  const [name, setName] = useState(initialName)
  const title = mode === "add" ? "Add payment method" : "Edit payment method"
  const submitLabel = mode === "add" ? "Add" : "Save"
  const canSubmit = name.trim().length > 0

  return (
    <FullScreenTakeover
      title={title}
      ariaDescription={mode === "add" ? "Add a new payment method." : "Edit this payment method."}
      onClose={onClose}
      actions={
        <>
          {mode === "edit" && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              radius="full"
              onClick={onDelete}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Delete
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="lg" radius="full" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            size="lg"
            radius="full"
            disabled={!canSubmit}
            onClick={() => canSubmit && onSubmit(name.trim())}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      {/* biome-ignore lint/a11y/noLabelWithoutControl: control is the Input child */}
      <label className="flex w-full max-w-md flex-col gap-1.5">
        <span className="text-sm font-medium leading-5 text-foreground">Name</span>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g Mastercard"
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSubmit) onSubmit(name.trim())
          }}
        />
      </label>
    </FullScreenTakeover>
  )
}

/** Full-screen drag-and-drop ordering takeover. */
function PaymentMethodsOrderDialog({
  methods,
  onClose,
  onSave,
}: {
  methods: PaymentMethod[]
  onClose: () => void
  onSave: (ordered: PaymentMethod[]) => void
}) {
  const [ordered, setOrdered] = useState<PaymentMethod[]>(methods)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    setOrdered((prev) => {
      const oldIndex = prev.findIndex((m) => m.id === active.id)
      const newIndex = prev.findIndex((m) => m.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  return (
    <FullScreenTakeover
      title="Payment methods order"
      ariaDescription="Drag and drop to reorder payment methods."
      subtitle="Drag and drop the order of items, these will be reflected in all lists."
      onClose={onClose}
      actions={
        <>
          <Button type="button" variant="outline" size="lg" radius="full" onClick={onClose}>
            Close
          </Button>
          <Button type="button" size="lg" radius="full" onClick={() => onSave(ordered)}>
            Save order
          </Button>
        </>
      }
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ordered.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-3">
            {ordered.map((method) => (
              <SortablePaymentRow key={method.id} method={method} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </FullScreenTakeover>
  )
}

function SortablePaymentRow({ method }: { method: PaymentMethod }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: method.id,
  })
  const Icon = method.icon
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4",
        isDragging && "opacity-50",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          method.tileClassName ?? "bg-muted",
        )}
      >
        <Icon className={cn("size-5", method.iconClassName)} />
      </span>
      <span className="text-base font-semibold text-foreground">{method.name}</span>
      <button
        type="button"
        className="ml-auto cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label={`Drag ${method.name}`}
        {...attributes}
        {...listeners}
      >
        <DotsGrid />
      </button>
    </li>
  )
}

function DotsGrid() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="5" cy="4" r="1.2" fill="currentColor" />
      <circle cx="5" cy="8" r="1.2" fill="currentColor" />
      <circle cx="5" cy="12" r="1.2" fill="currentColor" />
      <circle cx="11" cy="4" r="1.2" fill="currentColor" />
      <circle cx="11" cy="8" r="1.2" fill="currentColor" />
      <circle cx="11" cy="12" r="1.2" fill="currentColor" />
    </svg>
  )
}

/** Centered confirmation modal for deleting a payment method. */
function DeleteConfirmDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md gap-0 p-6">
        <div className="flex items-start justify-between gap-4">
          <DialogTitle className="font-heading text-2xl font-semibold text-foreground">
            Delete payment method
          </DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label="Close"
            onClick={onCancel}
            className="-mr-2 -mt-1 text-muted-foreground"
          >
            <XIcon className="size-5" />
          </Button>
        </div>
        <DialogDescription className="mt-4 text-sm leading-5 text-foreground">
          Are you sure you want to delete this payment method?
        </DialogDescription>
        <div className="mt-8 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="lg" radius="full" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" size="lg" radius="full" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  )
}

// Unlike payment methods, a gift-card program has no delete: once set up it can
// only be edited (or toggled off via the settings takeover). There is
// deliberately no Delete affordance anywhere in this flow.
function GiftCardsPanel({
  onBack,
  initialGift,
}: {
  onBack: () => void
  /** Deep-link: "empty" shows the inactive state, "setup" opens the settings takeover. */
  initialGift?: string | null
}) {
  const [config, setConfig] = useState<GiftCardConfig>(
    initialGift === "empty"
      ? { ...DEFAULT_GIFT_CARD_CONFIG, enabled: false }
      : DEFAULT_GIFT_CARD_CONFIG,
  )
  const [settingsOpen, setSettingsOpen] = useState(initialGift === "setup")
  const router = useRouter()
  // The Gift cards enable toggle is the single source of truth: off => empty state.
  const active = config.enabled

  return (
    <div className="flex h-full flex-col gap-6">
      <SubScreenHeader
        onBack={onBack}
        title="Gift cards"
        description="Choose how you would like to sell your gift cards, and customize their settings."
      />

      {active ? (
        <GiftCardSummary
          config={config}
          onEdit={() => setSettingsOpen(true)}
          onViewSold={() => router.push("/sales/gift-cards-sold")}
        />
      ) : (
        <section className="flex w-full flex-col rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146">
          <EmptyState
            icon={GiftIcon}
            title="Gift cards inactive"
            description="Let your clients buy personalized gift cards and send to friends & family for your business."
            action={
              <Button
                type="button"
                variant="secondary"
                radius="full"
                onClick={() => setSettingsOpen(true)}
              >
                Set up
              </Button>
            }
          />
        </section>
      )}

      {/* Prototype demo toggle — flips the real enabled flag so the empty state
          mirrors what turning the Gift cards toggle off in settings does. */}
      <div className="mt-auto flex justify-end pt-2">
        <button
          type="button"
          onClick={() => setConfig((c) => ({ ...c, enabled: !c.enabled }))}
          className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
        >
          {active ? "Show empty state" : "Show populated state"}
        </button>
      </div>

      {settingsOpen ? (
        <GiftCardSettingsDialog
          initial={config}
          onClose={() => setSettingsOpen(false)}
          onSave={(next) => {
            setConfig(next)
            setSettingsOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}

function GiftCardSummary({
  config,
  onEdit,
  onViewSold,
}: {
  config: GiftCardConfig
  onEdit: () => void
  onViewSold?: () => void
}) {
  // Keep this row inside the two-column grid like the others: show the first
  // couple of values inline and roll the rest into a "+N more" count so a long
  // list can't span the card full-width. The full list lives in the Edit view.
  const values = config.values.filter(Boolean)
  const INLINE_COUNT = 2
  const valuesLabel =
    values.length === 0
      ? "—"
      : values.length <= INLINE_COUNT
        ? values.map(formatAed).join(", ")
        : `${values.slice(0, INLINE_COUNT).map(formatAed).join(", ")} +${
            values.length - INLINE_COUNT
          } more`

  return (
    <div className="flex flex-col items-start gap-3">
      <section className="flex w-full flex-col gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit">
        <header className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
            Availability and values
          </h3>
          <Button type="button" variant="secondary" size="sm" radius="full" onClick={onEdit}>
            Edit
          </Button>
        </header>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-[16rem_16rem]">
          <SettingsRow icon={StoreIcon} label="Available for sale" value="In-store only" />
          <SettingsRow
            icon={CalendarClockIcon}
            label="Default expiration period"
            value={config.expiration}
          />
          <SettingsRow icon={CircleDollarSignIcon} label="Gift card values" value={valuesLabel} />
        </div>
      </section>
      {/* Navigation action, not a card setting — lives outside the card with a
          trailing arrow to signal it leaves the settings panel. */}
      {onViewSold ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          radius="full"
          onClick={onViewSold}
          className="gap-1.5"
        >
          Gift cards sold
          <ArrowUpRightIcon className="size-4" />
        </Button>
      ) : null}
    </div>
  )
}

/** Full-screen takeover: toggle gift cards, edit preset values, set expiration. */
function GiftCardSettingsDialog({
  initial,
  onClose,
  onSave,
}: {
  initial: GiftCardConfig
  onClose: () => void
  onSave: (config: GiftCardConfig) => void
}) {
  const [enabled, setEnabled] = useState(initial.enabled)
  const [values, setValues] = useState<string[]>(initial.values)
  const [expiration, setExpiration] = useState(initial.expiration)

  const updateValue = (index: number, raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "")
    setValues((prev) => prev.map((v, i) => (i === index ? digits : v)))
  }
  const removeValue = (index: number) => {
    setValues((prev) => prev.filter((_, i) => i !== index))
  }
  const addValue = () => setValues((prev) => [...prev, ""])

  const handleSave = () => {
    onSave({ enabled, values: values.filter(Boolean), expiration })
  }

  return (
    <FullScreenTakeover
      title="Gift card settings"
      ariaDescription="Toggle gift cards, set preset values and the default expiration period."
      onClose={onClose}
      actions={
        <>
          <Button type="button" variant="outline" size="lg" radius="full" onClick={onClose}>
            Close
          </Button>
          <Button type="button" size="lg" radius="full" onClick={handleSave}>
            Save
          </Button>
        </>
      }
    >
      <section className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
              Gift cards
            </h3>
            <Badge variant="secondary" className="font-normal">
              {enabled ? "On" : "Off"}
            </Badge>
          </div>
          <p className="text-sm leading-5 text-muted-foreground">
            Sell and redeem gift cards at your business.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Enable gift cards" />
      </section>

      <hr className="border-border/40" />

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold leading-6 text-foreground">Values</h3>
          <p className="text-sm leading-5 text-muted-foreground">
            Choose preset values that allow clients to quickly select an amount, and enable custom
            values within minimum and maximum.
          </p>
        </div>
        <div className="flex w-full max-w-md flex-col gap-3">
          {values.map((value, index) => (
            <GiftCardValueRow
              // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional and editable in place
              key={index}
              value={value}
              onChange={(raw) => updateValue(index, raw)}
              onDelete={() => removeValue(index)}
            />
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              radius="full"
              className="gap-1.5"
              onClick={addValue}
            >
              <CirclePlusIcon className="size-4" />
              Add value
            </Button>
          </div>
        </div>
      </section>

      <hr className="border-border/40" />

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
            Expiration
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            Choose your default expiration period for all sold gift cards. Changing this only
            affects newly sold gift cards.
          </p>
        </div>

        {/* biome-ignore lint/a11y/noLabelWithoutControl: control is the Select child */}
        <label className="flex w-full max-w-md flex-col gap-1.5">
          <span className="text-sm font-medium leading-5 text-foreground">
            Default expiration period
          </span>
          <Select value={expiration} onValueChange={setExpiration}>
            <SelectTrigger className={selectTriggerOverride}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPIRATION_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm leading-5 text-muted-foreground">
            Expiration period starts from the date of purchase
          </span>
        </label>
      </section>
    </FullScreenTakeover>
  )
}

function GiftCardValueRow({
  value,
  onChange,
  onDelete,
}: {
  value: string
  onChange: (raw: string) => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-2xl bg-input px-4 ring-inset focus-within:ring-2 focus-within:ring-foreground">
        <span className="text-sm font-medium text-muted-foreground">AED</span>
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
          aria-label="Gift card value"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        radius="full"
        aria-label="Delete value"
        onClick={onDelete}
        className="text-muted-foreground"
      >
        <Trash2Icon className="size-5" />
      </Button>
    </div>
  )
}
