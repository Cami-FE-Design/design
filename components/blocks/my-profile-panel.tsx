"use client"

import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  BuildingIcon,
  CakeIcon,
  FlagIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { EditMyProfileDialog } from "@/components/blocks/edit-my-profile-dialog"
import { KpiCard, KpiGrid } from "@/components/blocks/kpi-card"
import { NotionBreadcrumb } from "@/components/blocks/notion-breadcrumb"
import { SettingsRow } from "@/components/blocks/settings-row"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type CurrentUser, maskEmail, maskPhone, useCurrentUser } from "@/lib/current-user"
import { useDemoBusiness } from "@/lib/demo-business"

// Card footprint shared with the Sales / Payments / Business details panels:
// 16rem+16rem inner grid + gap-x-8 + p-5 padding = 36.5rem (w-146).
const cardClass =
  "flex w-full flex-col gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146 sm:max-w-146"

/**
 * "My profile" panel inside the Pet Business settings dialog (Account group).
 * Two-step flow mirroring the Locations panel: a landing list card for the
 * signed-in user that drills into an inner-page detail (Notion-style
 * breadcrumb back-nav) with the Deals-style header + pill tabs — Overview
 * (appointment KPIs), Details (personal info with masked contact, DSG-63),
 * Workspaces (read-only memberships). Edit is available on both steps and
 * opens the full-screen takeover. Sign-in & security and notification
 * preferences are deferred until the accounts model lands.
 */
export function MyProfilePanel() {
  const { user } = useCurrentUser()
  const { name: businessName } = useDemoBusiness()
  const [view, setView] = useState<"home" | "detail">("home")
  const [editing, setEditing] = useState(false)

  const fullName = `${user.firstName} ${user.lastName}`.trim()
  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() ||
    user.email.charAt(0).toUpperCase()

  return (
    <>
      {view === "home" ? (
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
              My profile
            </h2>
            <p className="text-sm leading-5 text-muted-foreground">
              Your personal account at {businessName}. Click to manage your details.
            </p>
          </header>

          <div className="group flex items-center justify-between gap-4 rounded-2xl border border-border/60 p-4 transition-colors hover:bg-foreground/3 sm:w-fit sm:min-w-146 sm:max-w-146">
            <button
              type="button"
              onClick={() => setView("detail")}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <ProfileAvatar user={user} initials={initials} size="sm" />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-heading text-base font-semibold text-foreground">
                  {fullName}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {user.jobTitle || "Team member"} · {maskEmail(user.email)}
                </span>
              </div>
            </button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              radius="full"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          </div>
        </div>
      ) : (
        <ProfileDetailView
          user={user}
          fullName={fullName}
          initials={initials}
          businessName={businessName}
          onBack={() => setView("home")}
          onEdit={() => setEditing(true)}
        />
      )}

      <EditMyProfileDialog open={editing} onOpenChange={setEditing} />
    </>
  )
}

function ProfileDetailView({
  user,
  fullName,
  initials,
  businessName,
  onBack,
  onEdit,
}: {
  user: CurrentUser
  fullName: string
  initials: string
  businessName: string
  onBack: () => void
  onEdit: () => void
}) {
  const birthday =
    user.birthDay && user.birthMonth
      ? `${user.birthDay} ${user.birthMonth}${user.birthYear ? `, ${user.birthYear}` : ""}`
      : null

  return (
    <div className="flex animate-in flex-col gap-6 duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] slide-in-from-right-12">
      <NotionBreadcrumb
        segments={[{ label: "My profile", icon: UserIcon, onClick: onBack }, { label: fullName }]}
      />

      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <ProfileAvatar user={user} initials={initials} size="lg" />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-heading text-2xl font-semibold leading-8 text-foreground">
                {fullName}
              </h2>
              <Badge variant="secondary" className="font-normal">
                {user.jobTitle || "Team member"}
              </Badge>
            </div>
            <p className="truncate text-sm leading-5 text-muted-foreground">
              {businessName} · {maskEmail(user.email)}
            </p>
          </div>
        </div>
        <Button type="button" variant="secondary" size="sm" radius="full" onClick={onEdit}>
          Edit
        </Button>
      </header>

      <Tabs defaultValue="overview" className="flex flex-col gap-6">
        <TabsList variant="ghost">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="flex flex-col items-start gap-3">
            <KpiGrid className="w-full grid-cols-1 gap-3 sm:w-146 sm:grid-cols-3">
              <KpiCard label="Upcoming" value="12" />
              <KpiCard label="Completed" value="26" />
              <KpiCard label="Sales this week" value="AED 4,620" />
            </KpiGrid>

            {/* Navigation action, not a card setting — lives outside the tiles
                with a trailing arrow to signal it leaves the settings panel. */}
            <Button type="button" variant="secondary" size="sm" radius="full" asChild>
              <Link href="/appointments" className="gap-1.5">
                Open calendar
                <ArrowUpRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <section className={cardClass}>
            <header className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
                  Personal info
                </h3>
                <p className="text-sm leading-5 text-muted-foreground">
                  Your personal details and how we can contact you.
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" radius="full" onClick={onEdit}>
                Edit
              </Button>
            </header>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-[16rem_16rem]">
              <SettingsRow icon={UserIcon} label="Legal name" value={fullName} onAdd={onEdit} />
              <SettingsRow
                icon={PhoneIcon}
                label="Mobile number"
                value={user.phone ? maskPhone(user.phoneCode, user.phone) : null}
                onAdd={onEdit}
              />
              <SettingsRow
                icon={MailIcon}
                label="Email address"
                value={maskEmail(user.email)}
                onAdd={onEdit}
              />
              <SettingsRow
                icon={FlagIcon}
                label="Country"
                value={user.country || null}
                onAdd={onEdit}
              />
              <SettingsRow icon={CakeIcon} label="Birthday" value={birthday} onAdd={onEdit} />
              <SettingsRow
                icon={BriefcaseIcon}
                label="Job title"
                value={user.jobTitle || null}
                onAdd={onEdit}
              />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="workspaces">
          <section className={cardClass}>
            <header className="flex flex-col gap-1">
              <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
                Workspaces
              </h3>
              <p className="text-sm leading-5 text-muted-foreground">
                Businesses you&apos;re a member of on Cami.
              </p>
            </header>
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-[16rem_16rem]">
              <SettingsRow
                icon={BuildingIcon}
                label={businessName}
                value="Owner · Joined Apr 2025"
              />
              <SettingsRow
                icon={BuildingIcon}
                label={`${businessName} · Jumeirah`}
                value="Owner · Joined Apr 2025"
              />
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProfileAvatar({
  user,
  initials,
  size,
}: {
  user: CurrentUser
  initials: string
  size: "sm" | "lg"
}) {
  const fullName = `${user.firstName} ${user.lastName}`.trim()
  return (
    <div
      aria-hidden
      className={
        size === "lg"
          ? "flex size-16 shrink-0 items-center justify-center rounded-full bg-cami-violet-3 font-heading text-xl font-semibold text-cami-violet-11"
          : "flex size-10 shrink-0 items-center justify-center rounded-full bg-cami-violet-3 font-heading text-sm font-semibold text-cami-violet-11"
      }
    >
      {user.avatarSrc ? (
        // biome-ignore lint/performance/noImgElement: avatar URL may be cross-origin and is small
        <img src={user.avatarSrc} alt={fullName} className="size-full rounded-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )
}
