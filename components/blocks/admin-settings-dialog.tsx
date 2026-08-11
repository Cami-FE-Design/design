"use client"

import {
  BellIcon,
  ChevronLeftIcon,
  GlobeIcon,
  InfoIcon,
  type LucideIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import type * as React from "react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PermissionRolesPane } from "@/components/blocks/permission-roles-pane"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-mock"
import { useHqRates } from "@/lib/notifications/hq-store"
import { CHANNEL_LABEL, CHANNELS, formatRate } from "@/lib/notifications/types"
import { cn } from "@/lib/utils"

type SettingsCategory = {
  id: string
  label: string
  /** Subtitle shown under the right-pane title. */
  description?: string
  /** Icon shown in the left rail, except for the avatar item. */
  icon?: LucideIcon
  /** Marks the screen as not yet ready for handoff. Adds a visible WIP badge. */
  wip?: boolean
}

type SettingsGroup = {
  label: string
  items: SettingsCategory[]
}

const GROUPS: SettingsGroup[] = [
  {
    label: "Account",
    items: [
      {
        id: "profile",
        label: "My profile",
        description: "Your HQ identity. Profile editing isn't in v0.",
        wip: true,
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        id: "language",
        label: "Language & region",
        description: "Switching locale flips the entire HQ console direction.",
        icon: GlobeIcon,
        wip: true,
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        id: "roles",
        label: "Roles & Permissions",
        description: "Cami uses fixed role definitions. To request a change, contact engineering.",
        icon: ShieldCheckIcon,
      },
      {
        id: "notification-rates",
        label: "Notification rates",
        description:
          "What Cami charges partners per message. Per-partner overrides live on the partner record, under Notifications.",
        icon: BellIcon,
      },
    ],
  },
]

const ALL_CATEGORIES: SettingsCategory[] = GROUPS.flatMap((g) => g.items)

type AdminSettingsDialogProps = {
  /** Controlled open state. */
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCategoryId?: string
}

export function AdminSettingsDialog({
  open,
  onOpenChange,
  defaultCategoryId = "roles",
}: AdminSettingsDialogProps) {
  const auth = useAuth()
  const [activeId, setActiveId] = useState(defaultCategoryId)
  const [mobileView, setMobileView] = useState<"rail" | "content">("rail")
  const active = ALL_CATEGORIES.find((c) => c.id === activeId) ?? ALL_CATEGORIES[0]

  useEffect(() => {
    if (open) setMobileView("rail")
  }, [open])

  useEffect(() => {
    if (open) setActiveId(defaultCategoryId)
  }, [open, defaultCategoryId])

  const initials = auth.user.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "h-[680px] max-h-[calc(100dvh-3rem)] w-[1080px] max-w-[calc(100vw-3rem)] flex-row gap-0 p-0",
          "sm:max-w-[calc(100vw-3rem)]",
          "max-lg:h-[calc(100dvh-3rem)]",
        )}
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Cami HQ settings, organized by category.
        </DialogDescription>

        <aside
          className={cn(
            "shrink-0 flex-col gap-5 overflow-y-auto bg-muted/30 px-3 py-5",
            "w-full lg:w-[260px] lg:border-r lg:border-border/40",
            mobileView === "rail" ? "flex" : "hidden lg:flex",
          )}
        >
          {GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="px-2 text-xs font-medium text-muted-foreground">{group.label}</p>
              <ul className="flex flex-col gap-px">
                {group.items.map((item) => {
                  const isActive = item.id === activeId
                  const isProfile = item.id === "profile"
                  const Icon = item.icon
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveId(item.id)
                          setMobileView("content")
                        }}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-foreground/5",
                          isActive && "bg-foreground/10",
                        )}
                      >
                        {isProfile ? (
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-cami-violet-9 text-[9px] font-medium leading-none text-white">
                            {initials}
                          </span>
                        ) : Icon ? (
                          <Icon className="size-4 shrink-0 text-muted-foreground" />
                        ) : null}
                        <span className="truncate">{isProfile ? auth.user.name : item.label}</span>
                        {item.wip ? (
                          <Badge variant="secondary" className="ml-auto font-normal">
                            WIP
                          </Badge>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </aside>

        <div
          className={cn(
            "relative min-w-0 flex-1 flex-col overflow-hidden",
            mobileView === "content" ? "flex" : "hidden lg:flex",
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Back to settings menu"
            onClick={() => setMobileView("rail")}
            className="absolute left-3 top-3 z-10 rounded-full text-muted-foreground lg:hidden"
          >
            <ChevronLeftIcon className="size-5" />
          </Button>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close settings"
              className="absolute right-4 top-4 z-10 rounded-full text-muted-foreground"
            >
              <XIcon className="size-5" strokeWidth={2} />
            </Button>
          </DialogClose>

          <div className="flex-1 overflow-y-auto px-6 py-9 max-lg:pt-14 lg:px-10">
            <header className="mb-8 flex flex-col gap-2">
              <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
                {active.label}
              </h2>
              {active.description ? (
                <p className="text-sm leading-5 text-muted-foreground">{active.description}</p>
              ) : null}
            </header>

            {active.id === "roles" ? <RolesPanel /> : null}
            {active.id === "language" ? <LanguagePanel /> : null}
            {active.id === "profile" ? <ProfilePanel /> : null}
            {active.id === "notification-rates" ? <NotificationRatesPanel /> : null}
          </div>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  )
}

function RolesPanel() {
  return <PermissionRolesPane />
}

/**
 * Global per-message rates, keyed by channel and country.
 *
 * Per-country rather than one global number per channel: UAE SMS pricing is the
 * whole reason this screen exists, so a single worldwide SMS rate would be wrong
 * on the first row. Only the UAE row carries demo values — the rest of the world
 * isn't priced yet, and inventing numbers here would read as real pricing.
 *
 * Backed by lib/notifications/hq-store.tsx, so an edit persists and every
 * surface that prices a message — the partner record's Rates section, the
 * /admin/billing table, the rate a merchant sees in their own settings — reads
 * the value set here. A per-merchant override still wins over it.
 * Spec: docs/specs/notifications-sender-id-and-rates.md
 */
function NotificationRatesPanel() {
  const { rates, setRate, reset } = useHqRates()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <SectionHeader>United Arab Emirates</SectionHeader>
        {CHANNELS.map((channel) => (
          <SettingRow
            key={channel}
            label={CHANNEL_LABEL[channel]}
            description={`Billed per message sent. Currently ${formatRate(rates[channel])}.`}
            control={
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">AED</span>
                <Input
                  inputMode="decimal"
                  className="h-9! w-16 rounded-xl px-2.5 text-right"
                  aria-label={`${CHANNEL_LABEL[channel]} rate, United Arab Emirates`}
                  value={String(rates[channel])}
                  onChange={(e) => {
                    const next = Number(e.target.value)
                    if (!Number.isFinite(next) || next < 0) return
                    setRate(channel, next)
                  }}
                />
              </div>
            }
          />
        ))}
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-sm leading-5 text-muted-foreground">
        <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          These are the defaults every partner inherits. A negotiated rate is set on the partner
          record under Notifications, and shows there as an override against the number above.
          Partners see their own rate and consumption, never this screen.
        </span>
      </p>

      {/* No Save button: writes persist as they're typed, so a Save would either
          do nothing or imply the edits above weren't live yet. Reset is the
          action that actually needs a control. */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          radius="full"
          onClick={() => {
            reset()
            toast.success("Rates restored to platform defaults")
          }}
        >
          Restore defaults
        </Button>
      </div>
    </div>
  )
}

type SettingRowProps = {
  label: string
  description?: string
  control: React.ReactNode
}

function SettingRow({ label, description, control }: SettingRowProps) {
  return (
    <div className="flex items-start justify-between gap-6 border-t border-border/40 py-5 first:border-t-0 first:pt-0">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-sm font-medium leading-5 text-foreground">{label}</span>
        {description ? (
          <span className="text-xs leading-4 text-muted-foreground">{description}</span>
        ) : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-2 text-base font-semibold leading-6 text-foreground">{children}</h3>
}

function LanguagePanel() {
  const auth = useAuth()
  const options: { value: "en" | "ar"; label: string }[] = [
    { value: "en", label: "English" },
    { value: "ar", label: "العربية" },
  ]
  return (
    <div className="flex flex-col">
      <SectionHeader>Language & region</SectionHeader>
      <SettingRow
        label="Language"
        description="The language used across the HQ console."
        control={
          <select
            value={auth.locale}
            onChange={(e) => auth.setLocale(e.target.value as "en" | "ar")}
            className="h-9 rounded-lg border border-border/60 bg-background px-3 text-sm font-medium text-foreground"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        }
      />
      <SettingRow
        label="Reading direction"
        description={
          auth.locale === "ar"
            ? "Right-to-left, set automatically by Arabic."
            : "Left-to-right, set automatically by English."
        }
        control={
          <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {auth.locale === "ar" ? "RTL" : "LTR"}
          </span>
        }
      />
    </div>
  )
}

function ProfilePanel() {
  const auth = useAuth()
  const initials = auth.user.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const role = auth.roleCodes[0] ?? "member"

  return (
    <div className="flex flex-col">
      <SectionHeader>Identity</SectionHeader>
      <SettingRow
        label="Avatar"
        description="Pulled from your Auth0 account. Editing isn't available in v0."
        control={
          <span className="flex size-10 items-center justify-center rounded-full border-[1.21px] border-cami-violet-7 bg-cami-violet-8 text-sm font-medium text-white">
            {initials}
          </span>
        }
      />
      <SettingRow
        label="Name"
        control={<span className="text-sm font-medium text-foreground">{auth.user.name}</span>}
      />
      <SettingRow
        label="Email"
        control={<span className="text-sm text-muted-foreground">{auth.user.email}</span>}
      />
      <SettingRow
        label="Role"
        description="Determines what you can see and do."
        control={
          <span className="inline-flex h-6 items-center rounded-md bg-muted px-2 font-mono text-xs font-medium text-foreground">
            {role}
          </span>
        }
      />
    </div>
  )
}
