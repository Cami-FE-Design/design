"use client"

import { ChevronDownIcon, PlusIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
  AddTeamMemberDialog,
  type AddTeamMemberValues,
} from "@/components/blocks/add-team-member-dialog"
import { AppShell } from "@/components/blocks/app-shell"
import { AddTimeOffDialog } from "@/components/blocks/shifts/add-time-off-dialog"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import { TeamAccessDialog } from "@/components/blocks/team-access-dialog"
import { TeamMemberDetailDialog } from "@/components/blocks/team-member-detail-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "@/components/ui/search-input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDemoBusiness } from "@/lib/demo-business"
import { type LocationGrants, useLocations } from "@/lib/locations/store"
import { TEAM_MEMBERS, type TeamMember } from "@/lib/team/mock"
import { roleById } from "@/lib/team/roles"
import { RotaProvider, useRota } from "@/lib/team/shifts-store"
import { cn } from "@/lib/utils"

// The roster's own type, not a local copy of it: `roleId` and
// `locationGrants` (R04) were added to lib/team/mock.ts, and a duplicate here
// would silently drop them.
type Member = TeamMember
type MemberStatus = TeamMember["status"]

/**
 * A grant, in the fewest words that stay accurate.
 *
 * "All locations" and a count are different claims: the first includes branches
 * added later, the second does not (R04). And "No access" is said rather than
 * shown as a blank, because an empty grant is a decision with a consequence,
 * never an unset field (R24).
 */
function MemberLocations({ grants }: { grants: LocationGrants }) {
  const { locationName } = useLocations()
  if (grants === "all") return <span>All locations</span>
  if (grants.length === 0) {
    return <span className="text-muted-foreground">No access</span>
  }
  if (grants.length === 1) return <span>{locationName(grants[0])}</span>
  return <span>{grants.length} locations</span>
}

function MemberAvatar({ initials, status }: { initials: string; status: MemberStatus }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium",
        status === "pending"
          ? "border border-dashed border-border bg-muted text-muted-foreground"
          : "border-[1.21px] border-cami-violet-7 bg-cami-violet-8 text-white",
      )}
    >
      {initials}
    </span>
  )
}

function MemberTableRow({
  member,
  onOpen,
  onEditProfile,
  onEditRoles,
  onEditServices,
  onEditSchedule,
  onAddTimeOff,
  onResendInvitation,
  onRemove,
}: {
  member: Member
  onOpen: (id: string) => void
  onEditProfile: (id: string) => void
  onEditRoles: (id: string) => void
  onEditServices: (id: string) => void
  onEditSchedule: (id: string) => void
  onAddTimeOff: (id: string) => void
  onResendInvitation: (id: string) => void
  onRemove: (id: string) => void
}) {
  const isPending = member.status === "pending"
  const isLocked = member.id === "m_owner"

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => onOpen(member.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(member.id)
      }}
      tabIndex={0}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <MemberAvatar initials={member.initials} status={member.status} />
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-foreground">
                {member.name ?? member.email}
              </span>
              {isPending ? <Badge variant="secondary">Pending</Badge> : null}
            </div>
            {/* No job title here. The Role column two across says "Owner",
                and a job title reading "Manager" under the same name looks
                like the same field disagreeing with itself — the seed has
                exactly that pair. The title belongs on the profile, which is
                where the built table leaves it too. */}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm text-foreground">{member.email}</span>
          {member.phone ? (
            <span className="truncate text-sm text-muted-foreground">{member.phone}</span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="text-foreground text-sm">
        <span className="flex items-center gap-2">
          {roleById(member.roleId)?.name ?? member.roleId}
          {isLocked ? <Badge variant="secondary">Owner</Badge> : null}
        </span>
      </TableCell>
      <TableCell className="text-sm text-foreground">
        <MemberLocations grants={member.locationGrants} />
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              aria-label={`Actions for ${member.name ?? member.email}`}
            >
              Action
              <ChevronDownIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-auto min-w-fit whitespace-nowrap">
            <DropdownMenuItem onSelect={() => onEditProfile(member.id)}>
              Edit Profile
            </DropdownMenuItem>
            {/* An owner's role and grant are immutable, for everyone
                including themselves — an owner holds the estate by definition,
                and a "named set" owner is a contradiction (R04). */}
            {isLocked ? null : (
              <DropdownMenuItem onSelect={() => onEditRoles(member.id)}>
                Edit Roles & Permissions
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => onEditServices(member.id)}>
              Edit Services
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEditSchedule(member.id)}>
              Edit Schedule
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAddTimeOff(member.id)}>
              Add Time Off
            </DropdownMenuItem>
            {isPending ? (
              <DropdownMenuItem onSelect={() => onResendInvitation(member.id)}>
                Resend invitation
              </DropdownMenuItem>
            ) : null}
            {isLocked ? null : (
              <DropdownMenuItem variant="destructive" onSelect={() => onRemove(member.id)}>
                Remove from business
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

function MemberTable({
  members,
  onOpen,
  onEditProfile,
  onEditRoles,
  onEditServices,
  onEditSchedule,
  onAddTimeOff,
  onResendInvitation,
  onRemove,
}: {
  members: Member[]
  onOpen: (id: string) => void
  onEditProfile: (id: string) => void
  onEditRoles: (id: string) => void
  onEditServices: (id: string) => void
  onEditSchedule: (id: string) => void
  onAddTimeOff: (id: string) => void
  onResendInvitation: (id: string) => void
  onRemove: (id: string) => void
}) {
  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
        No one here yet.
      </div>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Locations</TableHead>
          {/* The cell stays in the layout; only its label is hidden.
              `sr-only` on the <th> itself takes it out of flow, so the header
              rule stopped before the Action column and that column had no
              width of its own. */}
          <TableHead className="w-28">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <MemberTableRow
            key={member.id}
            member={member}
            onOpen={onOpen}
            onEditProfile={onEditProfile}
            onEditRoles={onEditRoles}
            onEditServices={onEditServices}
            onEditSchedule={onEditSchedule}
            onAddTimeOff={onAddTimeOff}
            onResendInvitation={onResendInvitation}
            onRemove={onRemove}
          />
        ))}
      </TableBody>
    </Table>
  )
}

export default function TeamSettingsPage() {
  const router = useRouter()
  const { locationName } = useLocations()
  const { name: businessName } = useDemoBusiness()
  const [members, setMembers] = useState<Member[]>(TEAM_MEMBERS)
  const [addOpen, setAddOpen] = useState(false)
  const [query, setQuery] = useState("")
  // Opened from elsewhere — the scheduled-shifts row menu links here with the
  // member on the URL, because "View team member" that lands you on a list of
  // everyone is a link that did not go anywhere.
  const memberParam = useSearchParams()?.get("member") ?? null
  const [viewMemberId, setViewMemberId] = useState<string | null>(memberParam)
  const [openedFor, setOpenedFor] = useState(memberParam)
  if (memberParam !== openedFor) {
    setOpenedFor(memberParam)
    setViewMemberId(memberParam)
  }
  const [accessMemberId, setAccessMemberId] = useState<string | null>(null)
  const [editMemberId, setEditMemberId] = useState<string | null>(null)
  const [editSection, setEditSection] = useState<"profile" | "services">("profile")
  const [timeOffMemberId, setTimeOffMemberId] = useState<string | null>(null)
  const timeOffMember = members.find((m) => m.id === timeOffMemberId) ?? null
  const editMember = members.find((m) => m.id === editMemberId) ?? null

  // Name, email and the branches they work — a chain's team list is searched
  // for "who is at Marina" as often as for a person.
  const q = query.trim().toLowerCase()
  const visible = q
    ? members.filter((m) => {
        const grants =
          m.locationGrants === "all"
            ? "all locations"
            : m.locationGrants.map((id) => locationName(id)).join(" ")
        return `${m.name ?? ""} ${m.email} ${grants}`.toLowerCase().includes(q)
      })
    : members
  const activeMembers = visible.filter((m) => m.status === "active")
  const pendingMembers = visible.filter((m) => m.status === "pending")
  const viewMember = members.find((m) => m.id === viewMemberId) ?? null

  function handleAddMember(values: AddTeamMemberValues) {
    const fullName = `${values.firstName} ${values.lastName}`.trim()
    const initials = `${values.firstName.charAt(0)}${values.lastName.charAt(0)}`.toUpperCase()
    setMembers((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}`,
        name: fullName || null,
        title: values.jobTitle || undefined,
        email: values.email,
        phone: values.phone ? `${values.phoneCode} ${values.phone}` : undefined,
        status: "pending",
        initials,
        roleId: values.roleId,
        locationGrants: values.assignedLocationIds,
      },
    ])
  }

  function handleEditProfile(id: string) {
    // One form for creating and for changing, so the sections cannot drift —
    // and so "Works at", where the estate lives, is edited in the same place
    // it is first chosen (R05).
    setEditMemberId(id)
    setViewMemberId(null)
  }

  function handleEditRoles(id: string) {
    setAccessMemberId(id)
  }

  function handleSaveAccess(memberId: string, roleId: string, grants: LocationGrants) {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, roleId, locationGrants: grants } : m)),
    )
  }

  function handleEditServices(id: string) {
    // Services are a section of the same form, not a surface of their own —
    // and the form opens on that section, because finding it is the work the
    // menu item exists to save.
    setEditSection("services")
    setEditMemberId(id)
    setViewMemberId(null)
  }

  function handleEditSchedule(_id?: string) {
    // A schedule is per branch (DW2.2), so editing one means opening the week
    // at a branch — a screen, not a field on this dialog. The member is not
    // passed on: the grid is the branch's, and dropping into it filtered to one
    // person would hide the clash the screen exists to show.
    setViewMemberId(null)
    router.push("/team/scheduled-shifts")
  }

  function handleResendInvitation(id: string) {
    // Said, because nothing else on screen changes. An action that looks
    // identical before and after reads as a button that did not work, and this
    // one is pressed exactly when somebody is unsure the first went out.
    const member = members.find((m) => m.id === id)
    toast.success(`Invitation resent to ${member?.email ?? "them"}`)
  }

  function handleRemove(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <AppShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl font-medium leading-8 text-foreground">Team members</h1>
            <p className="text-sm text-muted-foreground">Manage who has access to {businessName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button radius="full" onClick={() => setAddOpen(true)}>
              <PlusIcon />
              Add member
            </Button>
          </div>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Tabs defaultValue="members">
          <TableToolbar
            tabs={
              <TabsList variant="ghost">
                <TabsTrigger value="members">
                  Members
                  <span className="font-normal text-muted-foreground text-sm">
                    {visible.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active
                  <span className="text-sm font-normal text-muted-foreground">
                    {activeMembers.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending
                  <span className="text-sm font-normal text-muted-foreground">
                    {pendingMembers.length}
                  </span>
                </TabsTrigger>
              </TabsList>
            }
            actions={
              <>
                {/* Search that searches. It was rendered with no handler, so
                    typing did nothing — and so was a Filters button with no
                    filters behind it. Both looked like working controls. */}
                <SearchInput
                  className="h-9! w-72"
                  placeholder="Search team members"
                  aria-label="Search team members"
                  onValueChange={setQuery}
                />
              </>
            }
          />
          <TabsContent value="members">
            <MemberTable
              members={visible}
              onOpen={setViewMemberId}
              onEditProfile={handleEditProfile}
              onEditRoles={handleEditRoles}
              onEditServices={handleEditServices}
              onEditSchedule={() => handleEditSchedule()}
              onAddTimeOff={setTimeOffMemberId}
              onResendInvitation={handleResendInvitation}
              onRemove={handleRemove}
            />
          </TabsContent>
          <TabsContent value="active">
            <MemberTable
              members={activeMembers}
              onOpen={setViewMemberId}
              onEditProfile={handleEditProfile}
              onEditRoles={handleEditRoles}
              onEditServices={handleEditServices}
              onEditSchedule={() => handleEditSchedule()}
              onAddTimeOff={setTimeOffMemberId}
              onResendInvitation={handleResendInvitation}
              onRemove={handleRemove}
            />
          </TabsContent>
          <TabsContent value="pending">
            <MemberTable
              members={pendingMembers}
              onOpen={setViewMemberId}
              onEditProfile={handleEditProfile}
              onEditRoles={handleEditRoles}
              onEditServices={handleEditServices}
              onEditSchedule={() => handleEditSchedule()}
              onAddTimeOff={setTimeOffMemberId}
              onResendInvitation={handleResendInvitation}
              onRemove={handleRemove}
            />
          </TabsContent>
        </Tabs>
      </div>
      <AddTeamMemberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAddMember}
        businessName={businessName}
      />
      {timeOffMember ? (
        <RotaProvider>
          <TeamTimeOff member={timeOffMember} onClose={() => setTimeOffMemberId(null)} />
        </RotaProvider>
      ) : null}

      {editMember ? (
        <AddTeamMemberDialog
          open
          onOpenChange={(next) => {
            if (!next) setEditMemberId(null)
          }}
          businessName={businessName}
          initialSection={editSection}
          editing={{
            name: editMember.name ?? editMember.email,
            firstName: (editMember.name ?? "").split(" ")[0] ?? "",
            lastName: (editMember.name ?? "").split(" ").slice(1).join(" "),
            email: editMember.email,
            jobTitle: editMember.title ?? "",
            roleId: editMember.roleId,
            assignedLocationIds:
              editMember.locationGrants === "all" ? [] : editMember.locationGrants,
          }}
          onAdd={(values) => {
            setMembers((prev) =>
              prev.map((m) =>
                m.id === editMember.id
                  ? {
                      ...m,
                      name: `${values.firstName} ${values.lastName}`.trim() || m.name,
                      title: values.jobTitle || undefined,
                      email: values.email,
                      roleId: values.roleId,
                      // An owner holds the estate, so their grant is not a
                      // list and must not be flattened into one (R04).
                      locationGrants:
                        values.roleId === "owner" ? "all" : values.assignedLocationIds,
                    }
                  : m,
              ),
            )
            setEditMemberId(null)
          }}
        />
      ) : null}
      {viewMember ? (
        <TeamMemberDetailDialog
          open
          onOpenChange={(next) => {
            if (!next) setViewMemberId(null)
          }}
          member={viewMember}
          isLocked={viewMember.id === "m_owner"}
          onEditProfile={() => handleEditProfile(viewMember.id)}
          onEditRoles={() => handleEditRoles(viewMember.id)}
          onEditServices={() => handleEditServices(viewMember.id)}
          onEditSchedule={() => handleEditSchedule()}
          onResendInvitation={() => handleResendInvitation(viewMember.id)}
          onRemove={() => {
            handleRemove(viewMember.id)
            setViewMemberId(null)
          }}
        />
      ) : null}
      {/* SCR-03. Reachable from the row's Action menu and from the member
          detail dialog, because "who reaches what" is a question an owner asks
          from wherever they happen to be looking at a person. */}
      <TeamAccessDialog
        open={accessMemberId !== null}
        onOpenChange={(next) => {
          if (!next) setAccessMemberId(null)
        }}
        member={members.find((m) => m.id === accessMemberId) ?? null}
        onSave={handleSaveAccess}
      />
    </AppShell>
  )
}

/**
 * Time off, opened from the team list rather than from a branch's week.
 *
 * The dialog needs a branch (DW2.2) and there is none in view here, so it is
 * asked for — limited to the branches this person is granted, because time off
 * somewhere they do not work is a record nobody can act on. Wrapped in its own
 * `RotaProvider` so the write lands in the same store the schedule reads.
 */
function TeamTimeOff({ member, onClose }: { member: Member; onClose: () => void }) {
  const { granted, byId } = useLocations()
  const { addLeave } = useRota()
  const choices =
    member.locationGrants === "all"
      ? granted
      : granted.filter((l) => member.locationGrants.includes(l.id))

  return (
    <AddTimeOffDialog
      open
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      members={[{ id: member.id, name: member.name ?? member.email }]}
      defaultMemberId={member.id}
      locationId={choices[0]?.id ?? ""}
      locationName={choices[0]?.name ?? ""}
      locationChoices={choices.map((l) => ({ id: l.id, name: l.name }))}
      alsoWorksAt={(_id) => choices.slice(1).map((l) => byId(l.id)?.location.district || l.name)}
      onAdd={(leave) => {
        addLeave(leave)
        onClose()
      }}
    />
  )
}
