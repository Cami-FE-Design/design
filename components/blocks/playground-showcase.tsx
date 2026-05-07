"use client"

import {
  BedIcon,
  BellIcon,
  Building2Icon,
  CheckIcon,
  ChevronDownIcon,
  CircleDollarSignIcon,
  FlagIcon,
  GlobeIcon,
  HomeIcon,
  LightbulbIcon,
  MailIcon,
  PercentIcon,
  PlusIcon,
  ScissorsIcon,
  SettingsIcon,
  SparklesIcon,
  StethoscopeIcon,
  SunIcon,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { ImpersonationBanner } from "@/components/blocks/impersonation-banner"
import { SettingsRow } from "@/components/blocks/settings-row"
import { FacebookGlyphIcon, InstagramGlyphIcon, XGlyphIcon } from "@/components/blocks/social-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
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

      <Section title="Dialog, Sheet, Popover, Dropdown, Tooltip">
        <Row label="Dialog">
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
                <Button variant="ghost">Cancel</Button>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Row>
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
    </TooltipProvider>
  )
}
