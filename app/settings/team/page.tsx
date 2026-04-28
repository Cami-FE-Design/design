"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDownIcon, SlidersHorizontalIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AppShell } from "@/components/blocks/app-shell"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SearchInput } from "@/components/ui/search-input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const businessName = "Shampooch JVC"

type Permission = "High" | "Medium" | "Low"
type MemberStatus = "active" | "pending"

type Member = {
  id: string
  name: string | null
  title?: string
  email: string
  phone?: string
  permission: Permission
  status: MemberStatus
  initials: string
}

const initialMembers: Member[] = [
  {
    id: "m_owner",
    name: "Maz Khan",
    title: "Manager",
    email: "maaz@getcami.io",
    phone: "+971 50 963 6445",
    permission: "High",
    status: "active",
    initials: "MK",
  },
  {
    id: "m_sara",
    name: "Sara Park",
    title: "Groomer",
    email: "sara@getcami.io",
    phone: "+971 54 402 0718",
    permission: "Medium",
    status: "active",
    initials: "SP",
  },
  {
    id: "m_beth",
    name: "Beth Carter",
    title: "Stylist",
    email: "beth@getcami.io",
    phone: "+971 55 218 9043",
    permission: "Medium",
    status: "active",
    initials: "BC",
  },
  {
    id: "m_ahmed",
    name: null,
    email: "ahmed@getcami.io",
    permission: "Low",
    status: "pending",
    initials: "A",
  },
]

const inviteSchema = z.object({
  email: z.string().email({ message: "Enter a valid email." }),
})

type InviteValues = z.infer<typeof inviteSchema>

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
  selected,
  onToggleSelect,
  onEditRoles,
  onEditServices,
  onEditSchedule,
  onResendInvitation,
  onRemove,
}: {
  member: Member
  selected: boolean
  onToggleSelect: (id: string, value: boolean) => void
  onEditRoles: (id: string) => void
  onEditServices: (id: string) => void
  onEditSchedule: (id: string) => void
  onResendInvitation: (id: string) => void
  onRemove: (id: string) => void
}) {
  const isPending = member.status === "pending"
  const isLocked = member.id === "m_owner"

  return (
    <TableRow data-state={selected ? "selected" : undefined}>
      <TableCell className="w-10 pr-0">
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onToggleSelect(member.id, v === true)}
          aria-label={`Select ${member.name ?? member.email}`}
        />
      </TableCell>
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
            {member.title ? (
              <span className="truncate text-sm text-muted-foreground">{member.title}</span>
            ) : null}
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
      <TableCell className="text-sm text-foreground">{member.permission}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              aria-label={`Actions for ${member.name ?? member.email}`}
              disabled={isLocked}
            >
              Action
              <ChevronDownIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEditRoles(member.id)}>
              Edit Roles & Permissions
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEditServices(member.id)}>
              Edit Services
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEditSchedule(member.id)}>
              Edit Schedule
            </DropdownMenuItem>
            {isPending ? (
              <DropdownMenuItem onSelect={() => onResendInvitation(member.id)}>
                Resend invitation
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem variant="destructive" onSelect={() => onRemove(member.id)}>
              Remove from business
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

function InviteSheet({
  open,
  onOpenChange,
  onInvite,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (email: string) => void
}) {
  const form = useForm<InviteValues>({
    // @ts-ignore -- @hookform/resolvers 5.2 bundles zod 4.0 types; we have 4.3, version-tag mismatch only
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "" },
  })

  function onSubmit(values: InviteValues) {
    onInvite(values.email)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset()
        onOpenChange(next)
      }}
    >
      <SheetContent side="right" className="data-[side=right]:max-w-md">
        <SheetHeader>
          <SheetTitle>Invite a Reception user</SheetTitle>
          <SheetDescription>
            They'll get an email to set their password and join {businessName}.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 px-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="teammate@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="px-0 pt-2">
              <Button type="submit" size="xl" radius="full" className="w-full">
                Send invite
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

function MemberTable({
  members,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEditRoles,
  onEditServices,
  onEditSchedule,
  onResendInvitation,
  onRemove,
}: {
  members: Member[]
  selectedIds: Set<string>
  onToggleSelect: (id: string, value: boolean) => void
  onToggleSelectAll: (ids: string[], value: boolean) => void
  onEditRoles: (id: string) => void
  onEditServices: (id: string) => void
  onEditSchedule: (id: string) => void
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
  const allSelected = members.every((m) => selectedIds.has(m.id))
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10 pr-0">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(v) =>
                onToggleSelectAll(
                  members.map((m) => m.id),
                  v === true,
                )
              }
              aria-label={allSelected ? "Deselect all members" : "Select all members"}
            />
          </TableHead>
          <TableHead>Member</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Permission</TableHead>
          <TableHead className="w-12 sr-only">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <MemberTableRow
            key={member.id}
            member={member}
            selected={selectedIds.has(member.id)}
            onToggleSelect={onToggleSelect}
            onEditRoles={onEditRoles}
            onEditServices={onEditServices}
            onEditSchedule={onEditSchedule}
            onResendInvitation={onResendInvitation}
            onRemove={onRemove}
          />
        ))}
      </TableBody>
    </Table>
  )
}

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const activeMembers = members.filter((m) => m.status === "active")
  const pendingMembers = members.filter((m) => m.status === "pending")

  function handleToggleSelect(id: string, value: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (value) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function handleToggleSelectAll(ids: string[], value: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const id of ids) {
        if (value) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }

  function handleInvite(email: string) {
    const initials = email.charAt(0).toUpperCase()
    setMembers((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}`,
        name: null,
        email,
        permission: "Low",
        status: "pending",
        initials,
      },
    ])
  }

  function handleEditRoles(id: string) {
    console.log("Edit roles & permissions:", id)
  }

  function handleEditServices(id: string) {
    console.log("Edit services:", id)
  }

  function handleEditSchedule(id: string) {
    console.log("Edit schedule:", id)
  }

  function handleResendInvitation(id: string) {
    console.log("Resend invitation:", id)
  }

  function handleRemove(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <AppShell
      header={
        <div className="flex w-full max-w-3xl flex-col gap-1">
          <h1 className="text-2xl leading-8 font-medium text-foreground">Team members</h1>
          <p className="text-sm text-muted-foreground">Manage who has access to {businessName}</p>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Tabs defaultValue="members">
          <TableToolbar
            tabs={
              <TabsList variant="ghost">
                <TabsTrigger value="members">
                  Members
                  <span className="text-sm font-normal text-muted-foreground">
                    {members.length}
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
                <SearchInput placeholder="Search team members" aria-label="Search team members" />
                <Button variant="outline" aria-label="Filter" className="size-8 rounded-full">
                  <SlidersHorizontalIcon className="size-4" />
                </Button>
                <Button
                  onClick={() => setInviteOpen(true)}
                  size="sm"
                  radius="full"
                  className="h-8 px-3"
                >
                  Add
                </Button>
              </>
            }
          />
          <TabsContent value="members">
            <MemberTable
              members={members}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onEditRoles={handleEditRoles}
              onEditServices={handleEditServices}
              onEditSchedule={handleEditSchedule}
              onResendInvitation={handleResendInvitation}
              onRemove={handleRemove}
            />
          </TabsContent>
          <TabsContent value="active">
            <MemberTable
              members={activeMembers}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onEditRoles={handleEditRoles}
              onEditServices={handleEditServices}
              onEditSchedule={handleEditSchedule}
              onResendInvitation={handleResendInvitation}
              onRemove={handleRemove}
            />
          </TabsContent>
          <TabsContent value="pending">
            <MemberTable
              members={pendingMembers}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onEditRoles={handleEditRoles}
              onEditServices={handleEditServices}
              onEditSchedule={handleEditSchedule}
              onResendInvitation={handleResendInvitation}
              onRemove={handleRemove}
            />
          </TabsContent>
        </Tabs>
      </div>
      <InviteSheet open={inviteOpen} onOpenChange={setInviteOpen} onInvite={handleInvite} />
    </AppShell>
  )
}
