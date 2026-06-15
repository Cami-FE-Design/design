"use client"

import {
  BedIcon,
  BellIcon,
  Building2Icon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleDollarSignIcon,
  CircleUserIcon,
  FlagIcon,
  FolderIcon,
  GlobeIcon,
  HomeIcon,
  LightbulbIcon,
  MailIcon,
  MapPinIcon,
  PackageIcon,
  PencilIcon,
  PercentIcon,
  PhoneIcon,
  PlusIcon,
  ScissorsIcon,
  SettingsIcon,
  SparklesIcon,
  StethoscopeIcon,
  SunIcon,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import {
  MOCK_BOOKINGS,
  MOCK_STAFF,
  type MockBookingStatus,
  type MockServiceCategory,
} from "@/app/appointments/mock"
import { AppointmentBlock } from "@/components/blocks/appointment-block"
import { AppointmentsToolbar } from "@/components/blocks/appointments-toolbar"
import { AvatarStack } from "@/components/blocks/avatar-stack"
import { ClientDetailDialog } from "@/components/blocks/client-detail-dialog"
import { ClientEditSheet } from "@/components/blocks/client-edit-sheet"
import { EmptyState } from "@/components/blocks/empty-state"
import { ImpersonationBanner } from "@/components/blocks/impersonation-banner"
import { KpiCard, KpiGrid } from "@/components/blocks/kpi-card"
import { LinkedEntityChip } from "@/components/blocks/linked-entity-chip"
import {
  MEMBERSHIP_COLORS,
  MembershipsTable,
  MOCK_MEMBERSHIPS,
} from "@/components/blocks/memberships-table"
import { PeopleGrid } from "@/components/blocks/people-grid"
import { PetDetailDialog } from "@/components/blocks/pet-detail-dialog"
import { PetEditSheet } from "@/components/blocks/pet-edit-sheet"
import { SectionCard } from "@/components/blocks/section-card"
import { SectionedSheetShell, type SectionGroup } from "@/components/blocks/sectioned-sheet-shell"
import { CategorySidebar } from "@/components/blocks/service-menu/CategorySidebar"
import { ServiceCardInner } from "@/components/blocks/service-menu/ServiceCard"
import { SettingsRow } from "@/components/blocks/settings-row"
import { FacebookGlyphIcon, InstagramGlyphIcon, XGlyphIcon } from "@/components/blocks/social-icons"
import {
  MOCK_SOLD_MEMBERSHIPS,
  SoldMembershipsTable,
  SoldStatusBadge,
} from "@/components/blocks/sold-memberships"
import { TimelineDate, TimelineRow } from "@/components/blocks/timeline-row"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { RecencyBadge } from "@/components/ui/recency-badge"
import { SearchInput } from "@/components/ui/search-input"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { seedCategories, seedServices } from "@/lib/service-catalog/mock-data"
import { cn } from "@/lib/utils"

type SectionProps = {
  title: string
  description?: string
  children: React.ReactNode
}

function Section({ title, description, children }: SectionProps) {
  return (
    <section className="scroll-mt-20 border-t border-border py-10 first:border-t-0 first:pt-0">
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="text-base font-medium text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-6 py-3">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

const PICKABLE_TYPES = [
  { id: "grooming", label: "Pet grooming", Icon: ScissorsIcon },
  { id: "boarding", label: "Boarding", Icon: HomeIcon },
  { id: "daycare", label: "Daycare", Icon: SunIcon },
  { id: "veterinary", label: "Veterinary", Icon: StethoscopeIcon },
  { id: "sitting", label: "Pet sitting", Icon: BedIcon },
  { id: "wellness", label: "Wellness & spa", Icon: SparklesIcon },
]

export function PlaygroundShowcase() {
  const [checked, setChecked] = useState<boolean | "indeterminate">(true)
  const [switchOn, setSwitchOn] = useState(true)
  const [radio, setRadio] = useState("option-2")
  const [pickedTypes, setPickedTypes] = useState<Set<string>>(
    () => new Set(["grooming", "wellness"]),
  )
  const [segmentedNeutral, setSegmentedNeutral] = useState<"web" | "ios">("web")
  const [segmentedPrimary, setSegmentedPrimary] = useState<"on" | "off">("on")
  const [shellMode, setShellMode] = useState<"add" | "detail">("detail")
  const [shellSection, setShellSection] = useState<string>("overview")
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailHasPets, setDetailHasPets] = useState(true)
  const [petDetailOpen, setPetDetailOpen] = useState(false)
  const [clientEditOpen, setClientEditOpen] = useState(false)
  const [petEditOpen, setPetEditOpen] = useState(false)

  const togglePick = (id: string) => {
    setPickedTypes((curr) => {
      const next = new Set(curr)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Section
        title="Button"
        description="Variants, sizes, with icon, and disabled. Hover and focus are live."
      >
        <Row label="Variant">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
        </Row>
        <Row label="Size">
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra large</Button>
          <Button size="icon" aria-label="Add">
            <PlusIcon />
          </Button>
          <Button size="icon-xl" aria-label="Add">
            <PlusIcon />
          </Button>
        </Row>
        <Row label="Radius">
          <Button>Default (rounded-xl)</Button>
          <Button radius="full">Full (rounded-full)</Button>
          <Button variant="outline" size="icon-lg" radius="full" aria-label="Add">
            <PlusIcon />
          </Button>
        </Row>
        <Row label="With icon">
          <Button>
            <MailIcon /> Email
          </Button>
          <Button variant="outline">
            Options <ChevronDownIcon />
          </Button>
        </Row>
        <Row label="Disabled">
          <Button disabled>Default</Button>
          <Button variant="outline" disabled>
            Outline
          </Button>
          <Button variant="destructive" disabled>
            Destructive
          </Button>
        </Row>
      </Section>

      <Section title="Badge" description="Compact inline labels for status, counts, and tags.">
        <Row label="Variant">
          <Badge>New</Badge>
          <Badge variant="secondary">3</Badge>
          <Badge variant="outline">Beta</Badge>
          <Badge variant="destructive">Error</Badge>
          <Badge variant="primary-soft">Active</Badge>
          <Badge variant="muted">Off</Badge>
        </Row>
        <Row label="Size">
          <Badge size="sm">Small</Badge>
          <Badge size="default">Default</Badge>
          <Badge size="default" variant="primary-soft">
            Default · soft
          </Badge>
        </Row>
      </Section>

      <Section
        title="Avatar"
        description="Person, pet, and business avatars. Photo wins when present; otherwise renders a deterministic fallback (initials, character face, or species icon) on a hashed pastel background."
      >
        <Row label="Size">
          <Avatar size="xs" name="Sarah Johnson" />
          <Avatar size="sm" name="Sarah Johnson" />
          <Avatar size="md" name="Sarah Johnson" />
          <Avatar size="lg" name="Sarah Johnson" />
          <Avatar size="xl" name="Sarah Johnson" />
        </Row>
        <Row label="Initials · hash">
          <Avatar name="Sarah Johnson" />
          <Avatar name="Luke Williams" />
          <Avatar name="Amy Chen" />
          <Avatar name="Maeve Madden" />
          <Avatar name="Violetta Pérez" />
          <Avatar name="Kiren Matharu" />
        </Row>
        <Row label="Character · all faces">
          <Avatar fallback="character" hashSeed="0" />
          <Avatar fallback="character" hashSeed="1" />
          <Avatar fallback="character" hashSeed="2" />
          <Avatar fallback="character" hashSeed="3" />
          <Avatar fallback="character" hashSeed="4" />
          <Avatar fallback="character" hashSeed="5" />
        </Row>
        <Row label="Character · directory">
          <Avatar fallback="character" name="Sarah Johnson" />
          <Avatar fallback="character" name="Luke Williams" />
          <Avatar fallback="character" name="Amy Chen" />
          <Avatar fallback="character" name="Maeve Madden" />
          <Avatar fallback="character" name="Violetta Pérez" />
          <Avatar fallback="character" name="Kiren Matharu" />
        </Row>
        <Row label="Species · pets">
          <Avatar fallback="species" species="dog" hashSeed="bobo" />
          <Avatar fallback="species" species="cat" hashSeed="mochi" />
          <Avatar fallback="species" species="bird" hashSeed="kiwi" />
          <Avatar fallback="species" species="rabbit" hashSeed="pip" />
          <Avatar fallback="species" species="other" hashSeed="nemo" />
        </Row>
        <Row label="Shape · business">
          <Avatar shape="square" name="Sota Salon" />
          <Avatar shape="square" size="lg" name="Sota Salon" />
          <Avatar shape="square" size="xl" name="Sota Salon" />
        </Row>
        <Row label="Photo">
          <Avatar
            size="lg"
            name="Aaliyah Hazari"
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=faces"
            alt="Aaliyah Hazari"
          />
          <Avatar
            size="lg"
            shape="square"
            name="Sota Salon"
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=128&h=128&fit=crop"
            alt="Sota Salon"
          />
        </Row>
        <Row label="With overlay">
          <Avatar size="xl" fallback="character" name="Millie Cassidy">
            <button
              type="button"
              aria-label="Edit avatar"
              className="absolute right-0 bottom-0 inline-flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:text-foreground"
            >
              <PencilIcon className="size-3" />
            </button>
          </Avatar>
        </Row>
      </Section>

      <Section title="Input and Textarea" description="Text inputs with label and error state.">
        <Row label="Default">
          <div className="grid w-full max-w-sm gap-2">
            <Label htmlFor="pg-email">Email</Label>
            <Input id="pg-email" type="email" placeholder="name@example.com" />
          </div>
        </Row>
        <Row label="Disabled">
          <div className="group grid w-full max-w-sm gap-2" data-disabled="true">
            <Label htmlFor="pg-email-disabled">Email</Label>
            <Input id="pg-email-disabled" type="email" placeholder="name@example.com" disabled />
          </div>
        </Row>
        <Row label="Error">
          <div className="group grid w-full max-w-sm gap-2" data-error="true">
            <Label htmlFor="pg-email-error">Email</Label>
            <Input id="pg-email-error" type="email" defaultValue="nope" aria-invalid />
            <p className="text-xs text-destructive">Enter a valid email.</p>
          </div>
        </Row>
        <Row label="Textarea">
          <Textarea className="w-full max-w-sm" placeholder="Notes" />
        </Row>
      </Section>

      <Section title="Checkbox, Radio, Switch" description="Selection controls.">
        <Row label="Checkbox">
          <div className="flex items-center gap-2">
            <Checkbox id="pg-cb-1" checked={checked} onCheckedChange={(v) => setChecked(v)} />
            <Label htmlFor="pg-cb-1">Interactive</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="pg-cb-2" defaultChecked disabled />
            <Label htmlFor="pg-cb-2">Checked, disabled</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="pg-cb-3" disabled />
            <Label htmlFor="pg-cb-3">Unchecked, disabled</Label>
          </div>
        </Row>
        <Row label="Checkbox · lg">
          <div className="flex items-center gap-3">
            <Checkbox id="pg-cb-lg-1" size="lg" defaultChecked />
            <Label htmlFor="pg-cb-lg-1" className="text-base font-medium">
              Can view billing data
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="pg-cb-lg-2" size="lg" />
            <Label htmlFor="pg-cb-lg-2" className="text-base font-medium">
              Can issue refunds
            </Label>
          </div>
        </Row>
        <Row label="Radio">
          <RadioGroup value={radio} onValueChange={setRadio} className="flex gap-4">
            {["option-1", "option-2", "option-3"].map((id) => (
              <div key={id} className="flex items-center gap-2">
                <RadioGroupItem id={id} value={id} />
                <Label htmlFor={id}>{id.replace("-", " ")}</Label>
              </div>
            ))}
          </RadioGroup>
        </Row>
        <Row label="Switch">
          <div className="flex items-center gap-2">
            <Switch id="pg-sw-1" checked={switchOn} onCheckedChange={setSwitchOn} />
            <Label htmlFor="pg-sw-1">Notifications</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="pg-sw-2" defaultChecked disabled />
            <Label htmlFor="pg-sw-2">On, disabled</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="pg-sw-3" disabled />
            <Label htmlFor="pg-sw-3">Off, disabled</Label>
          </div>
        </Row>
      </Section>

      <Section
        title="Search input"
        description="Search field with clearable value. Three sizes for different surfaces."
      >
        <Row label="Default">
          <SearchInput placeholder="Search…" aria-label="Search" />
        </Row>
        <Row label="Large">
          <div className="w-full max-w-md">
            <SearchInput size="lg" placeholder="Search settings…" aria-label="Search settings" />
          </div>
        </Row>
        <Row label="Hero (xl)">
          <div className="w-full max-w-2xl">
            <SearchInput
              size="xl"
              placeholder="Search permissions"
              aria-label="Search permissions"
            />
          </div>
        </Row>
      </Section>

      <Section
        title="Segmented toggle"
        description="Pill toggle with sliding active capsule. Neutral default + primary tone (cami-violet pill on dark track) for switch-style on/off."
      >
        <Row label="Neutral">
          <SegmentedToggle
            value={segmentedNeutral}
            onValueChange={setSegmentedNeutral}
            options={[
              { value: "ios", label: "iOS" },
              { value: "web", label: "Web" },
            ]}
            ariaLabel="Platform"
          />
        </Row>
        <Row label="Primary on/off">
          <SegmentedToggle
            value={segmentedPrimary}
            onValueChange={setSegmentedPrimary}
            options={[
              { value: "off", label: "Off" },
              { value: "on", label: "On", activeTone: "primary" },
            ]}
            ariaLabel="Permission area state"
          />
        </Row>
        <Row label="Disabled">
          <SegmentedToggle
            value="off"
            onValueChange={() => {}}
            disabled
            options={[
              { value: "off", label: "Off" },
              { value: "on", label: "On", activeTone: "primary" },
            ]}
            ariaLabel="Disabled toggle"
          />
        </Row>
      </Section>

      <Section title="Select" description="Single-select dropdown.">
        <Row label="Default">
          <Select defaultValue="weekly">
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Disabled">
          <Select disabled>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">A</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </Section>

      <Section title="Tabs" description="Segmented content switcher with four variants.">
        <div className="flex flex-col gap-6">
          <Row label="default">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="pt-4 text-sm text-muted-foreground">
                Filled segmented control. Use for top-level page tabs.
              </TabsContent>
            </Tabs>
          </Row>
          <Row label="ghost">
            <Tabs defaultValue="all" className="w-full">
              <TabsList variant="ghost">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="pt-4 text-sm text-muted-foreground">
                Pill-shaped, transparent. Use for table toolbars (filter tabs).
              </TabsContent>
            </Tabs>
          </Row>
          <Row label="line">
            <Tabs defaultValue="general" className="w-full">
              <TabsList variant="line">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="pt-4 text-sm text-muted-foreground">
                Underline floats 5px below the tab. Use when tabs sit above whitespace.
              </TabsContent>
            </Tabs>
          </Row>
          <Row label="underline">
            <Tabs defaultValue="general" className="w-full">
              <TabsList variant="underline">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="manage">Manage</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="pt-4 text-sm text-muted-foreground">
                Underline sits at the tab's baseline. Use when the tab row marks a surface seam,
                e.g. between a tinted header zone and a white content zone in a detail dialog.
              </TabsContent>
            </Tabs>
          </Row>
        </div>
      </Section>

      <Section title="Card">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Weekly summary</CardTitle>
            <CardDescription>Your activity for the past seven days.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            42 events, 12 contacts added, 3 pending follow-ups.
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Sectioned sheet shell"
        description="Two-column layout for sectioned add/edit takeovers (FullScreenEditDialog). Vertical sidenav left, scrollable content right. Optional leading slot above the nav for cases where you want identity context (e.g. Edit). Detail surfaces use a different pattern — see the next section."
      >
        <Row label="Leading slot">
          <SegmentedToggle
            value={shellMode}
            onValueChange={(v) => {
              const next = v as "add" | "detail"
              setShellMode(next)
              setShellSection(next === "add" ? "profile" : "profile")
            }}
            options={[
              { value: "add", label: "None (Add)" },
              { value: "detail", label: "Identity (Edit)" },
            ]}
            ariaLabel="Leading slot variant"
          />
        </Row>
        <div className="mt-4 rounded-2xl border border-border/60 bg-muted/30 p-6">
          <SectionedSheetShell
            groups={
              [
                {
                  label: "Personal",
                  items: [
                    { id: "profile", label: "Profile", icon: CircleUserIcon },
                    { id: "addresses", label: "Addresses", icon: MapPinIcon },
                    { id: "emergency", label: "Emergency contacts", icon: PhoneIcon },
                  ],
                },
                {
                  label: "Settings",
                  items: [{ id: "settings", label: "Notifications", icon: SettingsIcon }],
                },
              ] satisfies SectionGroup[]
            }
            activeId={shellSection}
            onActiveChange={setShellSection}
            leading={
              shellMode === "detail" ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-background p-5 text-center">
                  <Avatar size="xl" fallback="character" name="Millie Cassidy" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-base font-semibold">Millie Cassidy</span>
                    <span className="text-sm text-muted-foreground">+971 58 509 9313</span>
                  </div>
                  <div className="flex w-full gap-2">
                    <Button variant="outline" size="sm" radius="full" className="flex-1">
                      Actions
                    </Button>
                    <Button size="sm" radius="full" className="flex-1">
                      Book now
                    </Button>
                  </div>
                </div>
              ) : null
            }
          >
            <div className="flex min-h-[260px] flex-col gap-3 rounded-2xl border border-border/60 bg-background p-6">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Section content
              </span>
              <h3 className="font-heading text-2xl font-semibold capitalize">
                {shellSection.replace(/-/g, " ")}
              </h3>
              <p className="text-sm text-muted-foreground">
                Form fields for this section render here. Save persists; Close discards.
              </p>
            </div>
          </SectionedSheetShell>
        </div>
      </Section>

      <Section
        title="Recency badge"
        description="Recency indicator next to client / pet names. Common labels: 'New' (≤14d since first visit), relative time like '4 weeks' (between), '90+ days' (>90d since last visit)."
      >
        <Row label="Labels">
          <RecencyBadge>New</RecencyBadge>
          <RecencyBadge>4 weeks</RecencyBadge>
          <RecencyBadge>90+ days</RecencyBadge>
        </Row>
        <Row label="Inline with name">
          <div className="flex items-center gap-2">
            <span className="font-medium">Sarah Johnson</span>
            <RecencyBadge>New</RecencyBadge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Luke Williams</span>
            <RecencyBadge>4 weeks</RecencyBadge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Aamena Fatta</span>
            <RecencyBadge>90+ days</RecencyBadge>
          </div>
        </Row>
      </Section>

      <Section
        title="KPI card and grid"
        description="Static metric tiles for Overview-style headers. KpiGrid is 2-col by default; override className to change."
      >
        <div className="max-w-md">
          <KpiGrid>
            <KpiCard
              label="Upcoming"
              value="0"
              info="Count of bookings in the future for this client."
            />
            <KpiCard
              label="Total appts"
              value="4"
              info="Lifetime appointment count, including no-shows and cancellations."
            />
            <KpiCard label="Total sales" value="AED 0" info="Lifetime revenue from this client." />
            <KpiCard label="No-shows" value="0" info="Lifetime count of no-shows." />
          </KpiGrid>
        </div>
      </Section>

      <Section
        title="Section card"
        description="Section panel used inside detail surfaces. Title + optional right-aligned action + body."
      >
        <div className="flex max-w-md flex-col gap-3">
          <SectionCard
            title="Profile"
            action={
              <Button variant="secondary" size="sm" radius="full">
                Edit
              </Button>
            }
          >
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs uppercase text-muted-foreground">Full name</span>
                <span>Millie Cassidy</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs uppercase text-muted-foreground">Phone</span>
                <span>+971 58 509 9313</span>
              </div>
            </div>
          </SectionCard>
          <SectionCard
            title="Notes"
            action={
              <Button variant="secondary" size="sm" radius="full">
                <PlusIcon />
                Add note
              </Button>
            }
          >
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          </SectionCard>
        </div>
      </Section>

      <Section
        title="Avatar stack"
        description="Stacked avatars with overlap + an overflow indicator. Hover any avatar to see the name; the +N chip lists the rest. Used for family / staff / contributor lists where vertical space is tight."
      >
        <Row label="Few (2)">
          <AvatarStack
            items={[
              { id: "millie", name: "Millie Cassidy", fallback: "character", hashSeed: "millie" },
              { id: "tom", name: "Tom Cassidy", fallback: "character", hashSeed: "tom" },
            ]}
          />
        </Row>
        <Row label="At max (3)">
          <AvatarStack
            items={[
              { id: "millie", name: "Millie Cassidy", fallback: "character", hashSeed: "millie" },
              { id: "tom", name: "Tom Cassidy", fallback: "character", hashSeed: "tom" },
              { id: "sarah", name: "Sarah Johnson", fallback: "character", hashSeed: "sarah" },
            ]}
          />
        </Row>
        <Row label="Overflow (12)">
          <AvatarStack
            items={Array.from({ length: 12 }, (_, i) => ({
              id: `person-${i}`,
              name:
                [
                  "Brent J",
                  "Sarah I",
                  "Tara T",
                  "Luke W",
                  "Amy C",
                  "Maeve M",
                  "Violetta P",
                  "Kiren M",
                  "Aaesha A",
                  "Aaishah V",
                  "Aaliyah H",
                  "Aaliyah P",
                ][i] ?? `Person ${i}`,
              fallback: "character",
              hashSeed: `person-${i}`,
            }))}
          />
        </Row>
        <Row label="Sizes">
          <AvatarStack
            size="xs"
            items={[
              { id: "1", name: "Millie", fallback: "character", hashSeed: "1" },
              { id: "2", name: "Tom", fallback: "character", hashSeed: "2" },
              { id: "3", name: "Sarah", fallback: "character", hashSeed: "3" },
              { id: "4", name: "Luke", fallback: "character", hashSeed: "4" },
              { id: "5", name: "Amy", fallback: "character", hashSeed: "5" },
            ]}
          />
          <AvatarStack
            size="sm"
            items={[
              { id: "1", name: "Millie", fallback: "character", hashSeed: "1" },
              { id: "2", name: "Tom", fallback: "character", hashSeed: "2" },
              { id: "3", name: "Sarah", fallback: "character", hashSeed: "3" },
              { id: "4", name: "Luke", fallback: "character", hashSeed: "4" },
              { id: "5", name: "Amy", fallback: "character", hashSeed: "5" },
            ]}
          />
          <AvatarStack
            size="md"
            items={[
              { id: "1", name: "Millie", fallback: "character", hashSeed: "1" },
              { id: "2", name: "Tom", fallback: "character", hashSeed: "2" },
              { id: "3", name: "Sarah", fallback: "character", hashSeed: "3" },
              { id: "4", name: "Luke", fallback: "character", hashSeed: "4" },
              { id: "5", name: "Amy", fallback: "character", hashSeed: "5" },
            ]}
          />
        </Row>
      </Section>

      <Section
        title="Linked entity chip"
        description="Small avatar + name pill, clickable. Used for Owners list on Pet detail and similar navigation chips."
      >
        <Row label="Person">
          <LinkedEntityChip
            name="Millie Cassidy"
            avatar={{ fallback: "character", hashSeed: "millie" }}
          />
          <LinkedEntityChip
            name="Tom Cassidy"
            avatar={{ fallback: "character", hashSeed: "tom" }}
          />
          <LinkedEntityChip
            name="Sarah Johnson"
            avatar={{ fallback: "character", hashSeed: "sarah" }}
          />
        </Row>
        <Row label="Pet">
          <LinkedEntityChip
            name="Bobo"
            avatar={{ fallback: "species", species: "dog", hashSeed: "bobo" }}
          />
          <LinkedEntityChip
            name="Mochi"
            avatar={{ fallback: "species", species: "cat", hashSeed: "mochi" }}
          />
        </Row>
      </Section>

      <Section
        title="Empty state"
        description="Centered placeholder for sections with no data. variant='plain' (default) is the borderless, muted in-section treatment. variant='card' is the full-page listing treatment used by the sales / clients / pets / products / appointments tables when a search or filter returns nothing — dashed card, tilted brand-accent icon, bolder title."
      >
        <div className="grid max-w-3xl gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card">
            <EmptyState icon={FolderIcon} title="Create a new folder to get started organizing." />
          </div>
          <div className="rounded-2xl border border-border/60 bg-card">
            <EmptyState
              icon={CalendarIcon}
              title="No appointments yet."
              description="Bookings will appear here once they're created."
              action={
                <Button variant="secondary" size="sm" radius="full">
                  <PlusIcon />
                  Book appointment
                </Button>
              }
            />
          </div>
        </div>

        {/* card variant — self-framed, so it isn't wrapped in another card */}
        <div className="mt-3 max-w-3xl">
          <EmptyState
            variant="card"
            icon={PackageIcon}
            title="No products match"
            description="Try a different search."
          />
        </div>
      </Section>

      <Section
        title="Timeline row"
        description="Vertical timeline used by Appointments / Visit history. Date / leading slot on the left, thin connector with a small dot, card on the right. Layout inspired by Luma's event list."
      >
        <div className="max-w-lg">
          <ul className="flex flex-col">
            <TimelineRow leading={<TimelineDate dayMonth="May 22" weekday="Friday" />}>
              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
                  <span className="font-semibold text-foreground">10:00am</span>
                  <span className="truncate text-muted-foreground">· Shampooch JVC</span>
                </div>
              </div>
            </TimelineRow>
            <TimelineRow leading={<TimelineDate dayMonth="Apr 8" weekday="Wednesday" />}>
              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
                  <span className="font-semibold text-foreground">2:30pm</span>
                  <span className="truncate text-muted-foreground">· Shampooch JVC</span>
                </div>
              </div>
            </TimelineRow>
            <TimelineRow isLast leading={<TimelineDate dayMonth="Mar 4" weekday="Monday" />}>
              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
                  <span className="font-semibold text-foreground">11:00am</span>
                  <span className="truncate text-muted-foreground">· Shampooch JVC</span>
                </div>
              </div>
            </TimelineRow>
          </ul>
        </div>
      </Section>

      <Section
        title="Client detail dialog"
        description="Centered Dialog modeled on <BusinessDetailDialog>. ~630px wide; sticky header with avatar + name + meta + Book now + Actions + Close; horizontal underline tabs with a 'More' overflow dropdown for less-used sections (Documents, Settings). Skeleton — each tab renders a placeholder; real content arrives per section."
      >
        <Row label="Pets">
          <SegmentedToggle
            value={detailHasPets ? "yes" : "no"}
            onValueChange={(v) => setDetailHasPets(v === "yes")}
            options={[
              { value: "yes", label: "With pets" },
              { value: "no", label: "Without pets" },
            ]}
            ariaLabel="Whether the partner manages pets"
          />
        </Row>
        <Row label="Open">
          <Button onClick={() => setDetailOpen(true)}>Open client detail</Button>
        </Row>
        <ClientDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          client={{
            id: "millie-cassidy-1",
            name: "Millie Cassidy",
            phone: "+971 58 509 9313",
            recencyLabel: "First visit",
          }}
          hasPets={detailHasPets}
          isOwner
          onBookNow={() => toast("Book (stubbed)")}
          onMerge={() => toast("Merge profiles (stubbed)")}
          onDelete={() => toast.error("Delete client (stubbed)")}
        />
      </Section>

      <Section
        title="Pet detail dialog"
        description="Same shell as Client detail. Stacks over the client dialog when opened from inside it. Tabs: Overview · Family · Visit history · Pet details · Documents. Multi-owner aware — chip row in the header. Actions menu has Edit pet details + Delete pet."
      >
        <Row label="Open">
          <Button onClick={() => setPetDetailOpen(true)}>Open pet detail</Button>
        </Row>
        <PetDetailDialog
          open={petDetailOpen}
          onOpenChange={setPetDetailOpen}
          pet={{ id: "bobo", name: "Bobo", species: "dog", breed: "French Bulldog" }}
          owners={[
            { id: "millie-cassidy", name: "Millie Cassidy", phone: "+971 58 509 9313" },
            { id: "tom-cassidy", name: "Tom Cassidy", phone: "+971 50 222 1133" },
          ]}
          isOwner
        />
      </Section>

      <Section
        title="Add / Edit takeovers"
        description="<FullScreenEditDialog> + sectioned sidenav. Quick-create rule: only the first name (client) or name + species (pet) are required. Edit mode pre-populates fields and deep-links to the relevant section."
      >
        <Row label="Add client">
          <Button onClick={() => setClientEditOpen(true)}>Open Add client</Button>
        </Row>
        <Row label="Add pet">
          <Button onClick={() => setPetEditOpen(true)}>Open Add pet</Button>
        </Row>
        <ClientEditSheet open={clientEditOpen} onOpenChange={setClientEditOpen} mode="add" />
        <PetEditSheet open={petEditOpen} onOpenChange={setPetEditOpen} mode="add" />
      </Section>

      <Section
        title="Dialog"
        description="Centered modal. Per cami terminology, Detail surfaces use this; Add / Edit use the full-screen takeover instead."
      >
        <Row label="Basic">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm action</DialogTitle>
                <DialogDescription>
                  This will do the thing you asked. You can undo within ten seconds.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Row>
        <Row label="Destructive confirm">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Delete client</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete this client?</DialogTitle>
                <DialogDescription>
                  Millie Cassidy and her 2 pets will be removed. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button variant="destructive">Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Row>
        <Row label="With form body">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Add note</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a note</DialogTitle>
                <DialogDescription>
                  Private to your business. Visible to all staff.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 py-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dialog-note-title">Title</Label>
                  <Input id="dialog-note-title" placeholder="e.g. Prefers morning slots" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dialog-note-body">Note</Label>
                  <Textarea id="dialog-note-body" placeholder="Add details…" rows={3} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button>Save note</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Row>
        <Row label="Title only">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Minimal dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Heads up</DialogTitle>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>Got it</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Row>
      </Section>

      <Section title="Sheet, Popover, Dropdown, Tooltip">
        <Row label="Sheet">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Quick settings</SheetTitle>
                <SheetDescription>Slide-in panel for secondary navigation.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </Row>
        <Row label="Popover">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <SettingsIcon /> Settings
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 text-sm">Quick settings panel content.</PopoverContent>
          </Popover>
        </Row>
        <Row label="Dropdown">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Actions <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <CheckIcon /> Mark done
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon /> Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Row>
        <Row label="Tooltip">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Info">
                <BellIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
        </Row>
        <Row label="Toast">
          <Button
            variant="outline"
            onClick={() => toast("Event created", { description: "Sunday at 2pm" })}
          >
            Fire toast
          </Button>
        </Row>
      </Section>

      <Section title="Separator">
        <div className="max-w-md">
          <p className="text-sm text-foreground">Above</p>
          <Separator className="my-4" />
          <p className="text-sm text-foreground">Below</p>
        </div>
      </Section>

      <Section
        title="Settings row"
        description="Icon + label/value stack used inside settings summary cards. When the value is null the row collapses into a subtle 'Add {label}' pill."
      >
        <Row label="Filled">
          <div className="flex w-full max-w-md flex-col gap-5">
            <SettingsRow icon={Building2Icon} label="Business name" value="Shampooch JVC" />
            <SettingsRow icon={FlagIcon} label="Country" value="United Arab Emirates" />
            <SettingsRow icon={CircleDollarSignIcon} label="Currency" value="AED" />
            <SettingsRow
              icon={PercentIcon}
              label="Tax calculation"
              value="Retail prices include tax"
            />
          </div>
        </Row>
        <Row label="Empty (Add)">
          <div className="flex w-full max-w-md flex-col gap-5">
            <SettingsRow
              icon={FacebookGlyphIcon}
              label="Facebook"
              value={null}
              onAdd={() => toast("Open editor focused on Facebook")}
            />
            <SettingsRow
              icon={XGlyphIcon}
              label="X (Twitter)"
              value={null}
              onAdd={() => toast("Open editor focused on X")}
            />
            <SettingsRow
              icon={InstagramGlyphIcon}
              label="Instagram"
              value={null}
              onAdd={() => toast("Open editor focused on Instagram")}
            />
            <SettingsRow icon={GlobeIcon} label="Website" value="www.shampooch.ae" />
          </div>
        </Row>
      </Section>

      <Section
        title="Note callout"
        description="Notion-style note pill. Lightbulb on a soft sand background. Used inside edit dialogs to flag side-effects ('Once saved...')."
      >
        <Row label="Default">
          <div className="flex w-full max-w-xl items-start gap-3 rounded-2xl bg-sand-3 px-4 py-3">
            <LightbulbIcon className="mt-0.5 size-4 shrink-0 fill-sand-9 text-sand-11" />
            <p className="text-sm leading-5 text-foreground">
              Once saved, changes will automatically apply to all products and services which are
              already assigned to default taxes
            </p>
          </div>
        </Row>
      </Section>

      <Section
        title="Pickable card grid"
        description="Multi-select cards with icon, label, and a check indicator. Used for picking business types in the Edit business type dialog."
      >
        <Row label="Default">
          <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
            {PICKABLE_TYPES.map(({ id, label, Icon }) => {
              const isSelected = pickedTypes.has(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => togglePick(id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "relative flex flex-col items-start gap-3 rounded-xl border bg-background p-4 text-left transition-colors",
                    isSelected
                      ? "border-transparent bg-cami-violet-3 outline-2 outline-cami-violet-8 -outline-offset-2"
                      : "border-border/60 hover:bg-muted/30",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-2 right-2 inline-flex size-5 items-center justify-center rounded-full",
                      isSelected
                        ? "bg-cami-violet-8 text-white"
                        : "border border-border text-transparent",
                    )}
                  >
                    <CheckIcon className="size-3" />
                  </span>
                  <Icon className="size-6 text-foreground" />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </button>
              )
            })}
          </div>
        </Row>
      </Section>

      <Section
        title="Impersonation banner"
        description="Bottom-anchored pill on the Partner portal during a Cami HQ impersonation session. Yellow active state, tomato expiring/expired states, plus a collapsed toggle that doubles as a re-open affordance."
      >
        <Row label="Active">
          <div className="flex w-full max-w-2xl justify-center rounded-md bg-cami-yellow-9 p-3">
            <ImpersonationBanner
              ownerName="Maz Khan"
              businessName="Shampooch JVC"
              onExit={() => toast.success("Impersonation stopped")}
            />
          </div>
        </Row>
        <Row label="Expiring (5 min)">
          <div className="flex w-full max-w-2xl justify-center rounded-md bg-cami-yellow-9 p-3">
            <ImpersonationBanner
              ownerName="Maz Khan"
              businessName="Shampooch JVC"
              durationSeconds={4 * 60}
              expiringThresholdSeconds={5 * 60}
              onExit={() => toast.success("Impersonation stopped")}
            />
          </div>
        </Row>
        <Row label="Expired (terminal)">
          <div className="flex w-full max-w-2xl justify-center rounded-md bg-cami-yellow-9 p-3">
            <ImpersonationBanner
              ownerName="Maz Khan"
              businessName="Shampooch JVC"
              durationSeconds={0}
              onExit={() => toast.success("Window closed")}
            />
          </div>
        </Row>
        <Row label="Collapsed">
          <div className="flex w-full max-w-2xl justify-center rounded-md bg-cami-yellow-9 p-3">
            <ImpersonationBanner
              ownerName="Maz Khan"
              businessName="Shampooch JVC"
              defaultCollapsed
              onExit={() => toast.success("Impersonation stopped")}
            />
          </div>
        </Row>
      </Section>

      <Section
        title="Appointments — booking block"
        description="Booking card rendered on the People grid. Color carries service category, fill saturation and border style overlay status. All content elements (time, price, name, service, icons) render at every size; truncation handles the squeeze."
      >
        <Row label="Sizes (15/30/60/180 min)">
          {[15, 30, 60, 180].map((min) => (
            <div
              key={min}
              className="relative w-[148px] border border-border/40 bg-muted/20"
              style={{ height: Math.max(28, min * (95 / 60)) }}
            >
              <AppointmentBlock
                booking={{
                  id: `demo-${min}`,
                  staffId: "demo",
                  start: "10:00",
                  durationMin: min,
                  status: "confirmed",
                  serviceCategory: "grooming",
                  serviceName: min < 30 ? "Nails Clip" : "Wash & Blow Dry SM",
                  clientName: "Tom Cassidy",
                  petName: "Luna",
                  petSpecies: "cat",
                  priceMinor: min < 30 ? 3000 : 14000,
                  hasDeposit: min >= 60,
                }}
                top={0}
                height={Math.max(24, min * (95 / 60))}
              />
            </div>
          ))}
        </Row>
        <Row label="Status variants">
          {(
            [
              "booked",
              "confirmed",
              "checked-in",
              "ready-for-pickup",
              "completed",
              "cancelled",
              "no-show",
            ] as MockBookingStatus[]
          ).map((status) => (
            <div
              key={status}
              className="relative h-[95px] w-[148px] border border-border/40 bg-muted/20"
            >
              <AppointmentBlock
                booking={{
                  id: `demo-${status}`,
                  staffId: "demo",
                  start: "10:00",
                  durationMin: 60,
                  status,
                  serviceCategory: "grooming",
                  serviceName: "Full Grooming SM",
                  clientName: "Karen Dougall",
                  petName: "Willow",
                  petSpecies: "dog",
                  priceMinor: 21000,
                }}
                top={0}
                height={95}
              />
            </div>
          ))}
        </Row>
        <Row label="Service categories">
          {(
            [
              { cat: "grooming", svc: "Wash & Blow Dry" },
              { cat: "vet", svc: "Vaccination" },
              { cat: "daycare", svc: "Day Care · 12 pets" },
              { cat: "boarding", svc: "Boarding Stay" },
              { cat: "details", svc: "Nails Clip" },
              { cat: "welcome", svc: "Meet & Greet" },
            ] as Array<{ cat: MockServiceCategory; svc: string }>
          ).map(({ cat, svc }) => (
            <div
              key={cat}
              className="relative h-[95px] w-[148px] border border-border/40 bg-muted/20"
            >
              <AppointmentBlock
                booking={{
                  id: `demo-${cat}`,
                  staffId: "demo",
                  start: "10:00",
                  durationMin: 60,
                  status: "confirmed",
                  serviceCategory: cat,
                  serviceName: svc,
                  clientName: "Frances",
                  petName: "Duke",
                  petSpecies: "dog",
                  priceMinor: 14000,
                }}
                top={0}
                height={95}
              />
            </div>
          ))}
        </Row>
      </Section>

      <Section
        title="Appointments — toolbar and people grid"
        description="Calendar toolbar (Today, date, view mode, filters, new) above an 11-column staff × time grid. Right-side filters are placeholders pending tighter Figma reference."
      >
        <Row label="Toolbar">
          <div className="w-full max-w-5xl rounded-2xl border border-border/60 bg-card">
            <AppointmentsToolbar date="2026-05-11" viewMode="day" />
          </div>
        </Row>
        <Row label="People grid (clipped to 600px)">
          <div className="h-150 w-full">
            <PeopleGrid
              staff={MOCK_STAFF}
              bookings={MOCK_BOOKINGS}
              nowMinutes={(11 - 7) * 60 + 30}
            />
          </div>
        </Row>
      </Section>

      {/* ── Products ─────────────────────────────────────────────────────── */}
      <Section title="Products — empty state">
        <Row label="No products yet">
          <div className="w-full max-w-lg rounded-2xl border border-dashed border-border bg-card">
            <EmptyState
              icon={PackageIcon}
              title="No products yet"
              description="Add your first product to get started"
              action={
                <Button radius="full" className="h-9 px-4">
                  Add product
                </Button>
              }
              className="py-16"
            />
          </div>
        </Row>
      </Section>

      {/* ── Memberships ──────────────────────────────────────────────────── */}
      <Section
        title="Memberships — table & colour picker"
        description="Building blocks for the membership catalog. The full interactive listing + add/edit takeover live at /catalogs/memberships. Prices render in AED."
      >
        <Row label="Listing table">
          <div className="w-full max-w-4xl">
            <MembershipsTable memberships={MOCK_MEMBERSHIPS} onRowClick={() => {}} />
          </div>
        </Row>
        <Row label="Colour customisation">
          {MEMBERSHIP_COLORS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              aria-label={c.id}
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition-transform",
                i === 0
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : "hover:scale-110",
              )}
            >
              <span
                aria-hidden
                className={cn("size-8 rounded-full ring-1 ring-inset ring-border/40", c.className)}
              />
            </button>
          ))}
        </Row>
        <Row label="Sold status">
          <SoldStatusBadge status="active" />
          <SoldStatusBadge status="paused" />
        </Row>
        <Row label="Memberships sold table">
          <div className="w-full max-w-4xl">
            <SoldMembershipsTable rows={MOCK_SOLD_MEMBERSHIPS} onRowClick={() => {}} />
          </div>
        </Row>
      </Section>

      {/* ── Service catalog ──────────────────────────────────────────────── */}
      <Section
        title="Service menu — cards & sidebar"
        description="Presentational building blocks for the catalog screens. Full interactive screens (drag-reorder, add/edit, archive) live at /catalogs/service-menu and /catalogs/categories. Prices render in AED."
      >
        <Row label="Service card, default">
          <div className="w-full max-w-xl">
            <ServiceCardInner
              service={seedServices[0]}
              category={seedCategories.find((c) => c.id === seedServices[0].categoryId)!}
              canManage
              withHandle={false}
              onDelete={() => {}}
              onEdit={() => {}}
            />
          </div>
        </Row>
        <Row label="Service card, archived">
          <div className="w-full max-w-xl">
            <ServiceCardInner
              service={{ ...seedServices[1], isActive: false }}
              category={seedCategories.find((c) => c.id === seedServices[1].categoryId)!}
              canManage
              withHandle={false}
              onDelete={() => {}}
              onUnarchive={() => {}}
            />
          </div>
        </Row>
        <Row label="Service card, dragging">
          <div className="w-full max-w-xl">
            <ServiceCardInner
              service={seedServices[2]}
              category={seedCategories.find((c) => c.id === seedServices[2].categoryId)!}
              dragging
              withHandle={false}
              onDelete={() => {}}
            />
          </div>
        </Row>
        <Row label="Category sidebar">
          <CategorySidebar
            categories={seedCategories.filter((c) => !c.isSystemManaged)}
            selectedId={null}
            counts={seedCategories
              .filter((c) => !c.isSystemManaged)
              .reduce<Record<string, number>>((acc, c) => {
                acc[c.id] = seedServices.filter((s) => s.categoryId === c.id).length
                return acc
              }, {})}
            totalCount={
              seedServices.filter((s) =>
                seedCategories.some((c) => !c.isSystemManaged && c.id === s.categoryId),
              ).length
            }
            onSelect={() => {}}
            onAddCategory={() => {}}
            onAddService={() => {}}
            onDeleteCategory={() => {}}
          />
        </Row>
      </Section>
    </TooltipProvider>
  )
}
