"use client"

import {
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  MailIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

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

export function PlaygroundShowcase() {
  const [checked, setChecked] = useState<boolean | "indeterminate">(true)
  const [switchOn, setSwitchOn] = useState(true)
  const [radio, setRadio] = useState("option-2")

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

      <Section title="Tabs" description="Segmented content switcher.">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-4 text-sm text-muted-foreground">
            Overview content.
          </TabsContent>
          <TabsContent value="activity" className="pt-4 text-sm text-muted-foreground">
            Activity content.
          </TabsContent>
          <TabsContent value="settings" className="pt-4 text-sm text-muted-foreground">
            Settings content.
          </TabsContent>
        </Tabs>
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
    </TooltipProvider>
  )
}
