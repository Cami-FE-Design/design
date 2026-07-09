"use client"

import {
  Building2Icon,
  ChevronLeftIcon,
  FolderIcon,
  GlobeIcon,
  type LucideIcon,
  MapPinIcon,
  TagIcon,
  UserIcon,
  XIcon,
} from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useEffect, useState } from "react"
import { BusinessProfileForm } from "@/components/blocks/business-profile-form"
import { FilesSection } from "@/components/blocks/documents-files-card"
import { LocationForm } from "@/components/blocks/location-form"
import { SalesSettings } from "@/components/blocks/sales-settings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type SettingsCategory = {
  id: string
  label: string
  description?: string
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
        description: "Your Cami identity. Profile editing isn't in v0.",
        icon: UserIcon,
        wip: true,
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        id: "business-details",
        label: "Business details",
        description: "Legal entity, currency, tax, default languages, and external links.",
        icon: Building2Icon,
      },
      {
        id: "locations",
        label: "Locations",
        description: "Where you operate. Each location has its own address, contact, and hours.",
        icon: MapPinIcon,
      },
      {
        id: "language",
        label: "Language & region",
        description: "Switching locale flips the entire portal direction.",
        icon: GlobeIcon,
        wip: true,
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        id: "sales",
        label: "Sales",
        description: "Payment methods and gift cards for checkout.",
        icon: TagIcon,
      },
    ],
  },
  {
    label: "Forms",
    items: [
      {
        id: "forms",
        label: "Form templates",
        description:
          "Reusable form templates. Documents added here are the only ones available to send to clients and pets for signature.",
        icon: FolderIcon,
      },
    ],
  },
]

const ALL_CATEGORIES: SettingsCategory[] = GROUPS.flatMap((g) => g.items)

type AppSettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCategoryId?: string
}

export function AppSettingsDialog({
  open,
  onOpenChange,
  defaultCategoryId = "profile",
}: AppSettingsDialogProps) {
  const [activeId, setActiveId] = useState(defaultCategoryId)
  const [mobileView, setMobileView] = useState<"rail" | "content">("rail")
  const active = ALL_CATEGORIES.find((c) => c.id === activeId) ?? ALL_CATEGORIES[0]

  useEffect(() => {
    if (open) setMobileView("rail")
  }, [open])

  useEffect(() => {
    if (open) setActiveId(defaultCategoryId)
  }, [open, defaultCategoryId])

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
          Pet Business portal settings, organized by category.
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
                        {Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" /> : null}
                        <span className="truncate">{item.label}</span>
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
            {active.id === "profile" ? <ProfilePanel /> : null}
            {active.id === "business-details" ? <BusinessProfilePanel /> : null}
            {active.id === "locations" ? <LocationsPanel /> : null}
            {active.id === "language" ? <LanguagePanel /> : null}
            {active.id === "forms" ? <FilesPanel /> : null}
            {active.id === "sales" ? <SalesSettings /> : null}
          </div>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  )
}

function ProfilePanel() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
          My profile
        </h2>
        <p className="text-sm leading-5 text-muted-foreground">
          Your Cami identity. Profile editing isn't in v0.
        </p>
      </header>
      <p className="text-sm leading-5 text-muted-foreground">
        Profile editing for the Pet Business owner isn't built yet. Coming with E2-2 follow-on.
      </p>
    </div>
  )
}

function BusinessProfilePanel() {
  return <BusinessProfileForm />
}

function LanguagePanel() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
          Language &amp; region
        </h2>
        <p className="text-sm leading-5 text-muted-foreground">
          Switching locale flips the entire portal direction.
        </p>
      </header>
      <p className="text-sm leading-5 text-muted-foreground">
        Locale switcher isn't wired for the Pet Business portal yet. Coming with the i18n pass.
      </p>
    </div>
  )
}

function LocationsPanel() {
  return <LocationForm />
}

function FilesPanel() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
          Form templates
        </h2>
        <p className="text-sm leading-5 text-muted-foreground">
          Reusable forms you can send to clients and pets for signature. Uploads made on a profile
          stay personal to that profile and won&apos;t appear here.
        </p>
      </header>
      <FilesSection variant="settings" />
    </div>
  )
}
