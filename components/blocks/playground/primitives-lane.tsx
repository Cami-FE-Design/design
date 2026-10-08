"use client"

import {
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  MailIcon,
  PencilIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { RailBadge } from "@/components/blocks/money/rail-badge"
import { Lane, Row, Section } from "@/components/blocks/playground/kit"
import { PhoneField } from "@/components/blocks/shared/phone-field"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function PrimitivesLane() {
  const [checked, setChecked] = useState<boolean | "indeterminate">(true)
  const [phoneCode, setPhoneCode] = useState("+971")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [switchOn, setSwitchOn] = useState(true)
  const [radio, setRadio] = useState("option-2")
  const [segmentedNeutral, setSegmentedNeutral] = useState<"web" | "ios">("web")
  const [segmentedPrimary, setSegmentedPrimary] = useState<"on" | "off">("on")

  return (
    <Lane
      id="primitives"
      label="Primitives"
      blurb="The installed ui/ components in every state. Hover, focus and keyboard are live."
    >
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
          {/* The two tone-on-tone status variants. `success` was added for
            DSG-75's "Verified": before it, anything confirmed-good fell back
            to the flat grey `secondary`, which reads as switched off — and
            the green was being hand-rolled at the call site instead. */}
          <Badge variant="warning">Needs attention</Badge>
          <Badge variant="success">Verified</Badge>
        </Row>
        <Row label="Money surfaces">
          {/* One mark for one fact (DSG-73, G3): the RAIL always rides in a
            chip, the custodian is always named in words beside it. */}
          <RailBadge rail="online" />
          <RailBadge rail="terminal" />
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
        <Row label="Phone field">
          <div className="w-full max-w-sm">
            <PhoneField
              id="pg-phone"
              label="Mobile number"
              code={phoneCode}
              number={phoneNumber}
              onCodeChange={setPhoneCode}
              onNumberChange={setPhoneNumber}
            />
          </div>
        </Row>
        <Row label="Phone · verified">
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <PhoneField
              id="pg-phone-locked"
              label="Mobile number"
              code="+971"
              number="50 123 4567"
              onCodeChange={() => undefined}
              onNumberChange={() => undefined}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Verified. We send your confirmation and reminders here on Email / SMS / WhatsApp.
            </p>
          </div>
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
      <Section title="Separator">
        <div className="max-w-md">
          <p className="text-sm text-foreground">Above</p>
          <Separator className="my-4" />
          <p className="text-sm text-foreground">Below</p>
        </div>
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
    </Lane>
  )
}
