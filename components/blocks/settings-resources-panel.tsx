"use client"

import { CalendarRangeIcon, LayoutGridIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  colorClasses,
  RESOURCE_TYPES,
  RESOURCES,
  type Resource,
  SERVICE_REQUIREMENTS,
} from "@/lib/scheduling-mock"

// Settings-dialog panel for Rooms & spaces (Rooms & Spaces epic). The resource
// *calendar* is a separate routed view (/appointments/resources).
export function SettingsResourcesPanel() {
  const [resources, setResources] = useState<ReadonlyArray<Resource>>(RESOURCES)
  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<string>("Room")
  const [capacity, setCapacity] = useState("1")

  function add() {
    setResources((prev) => [
      ...prev,
      {
        id: `r${prev.length + 1}`,
        name: name || "Untitled resource",
        type: type as Resource["type"],
        capacity: Number(capacity) || 1,
        color: "violet",
        services: [],
      },
    ])
    setName("")
    setType("Room")
    setCapacity("1")
    setAddOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
          Rooms &amp; spaces
        </h2>
        <p className="text-sm leading-5 text-muted-foreground">
          Bookable resources and the services that need them. A slot is only offered when the
          required resource is free.
        </p>
      </header>

      <Tabs defaultValue="resources">
        <div className="mb-4 flex items-center justify-between gap-3">
          <TabsList variant="ghost">
            <TabsTrigger value="resources">
              Resources
              <span className="text-sm font-normal text-muted-foreground">{resources.length}</span>
            </TabsTrigger>
            <TabsTrigger value="requirements">Service requirements</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" radius="full" className="h-8 gap-1.5" asChild>
              <Link href="/appointments/resources">
                <CalendarRangeIcon className="size-4" />
                Calendar
              </Link>
            </Button>
            <Button
              onClick={() => setAddOpen(true)}
              size="sm"
              radius="full"
              className="h-8 gap-1 px-3"
            >
              <PlusIcon className="size-4" />
              Add
            </Button>
          </div>
        </div>

        <TabsContent value="resources">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Capacity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((r) => {
                const c = colorClasses(r.color)
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className={`size-2.5 rounded-full ${c.dot}`} />
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm font-medium text-foreground">{r.name}</span>
                          {r.services.length ? (
                            <span className="text-xs text-muted-foreground">
                              {r.services.join(" · ")}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.type}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-foreground">
                      {r.capacity === 1 ? "1 at a time" : `${r.capacity} concurrent`}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="requirements">
          <p className="mb-3 text-sm text-muted-foreground">
            Set the resource each service needs. Booking enforces it automatically.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Requires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SERVICE_REQUIREMENTS.map((req) => (
                <TableRow key={req.service}>
                  <TableCell className="text-sm font-medium text-foreground">
                    {req.service}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-muted-foreground">
                    {req.durationMinutes} min
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                      <LayoutGridIcon className="size-3.5 text-muted-foreground" />
                      {req.requires}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <FullScreenEditDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add resource"
        subtitle="A room, station, or piece of equipment that bookings occupy"
        onSave={add}
        saveLabel="Add resource"
        contentClassName="max-w-xl"
      >
        <div className="flex flex-col gap-5">
          <div className="group flex flex-col gap-1.5">
            <Label htmlFor="res-name">Name</Label>
            <Input
              id="res-name"
              placeholder="Grooming Bay 3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="group flex flex-col gap-1.5">
              <Label htmlFor="res-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="res-type" className="h-12 w-full rounded-2xl bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="group flex flex-col gap-1.5">
              <Label htmlFor="res-cap">Concurrent capacity</Label>
              <Input
                id="res-cap"
                inputMode="numeric"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Capacity 1 means one appointment at a time. Higher capacity allows concurrent bookings
            (e.g. a daycare hall).
          </p>
        </div>
      </FullScreenEditDialog>
    </div>
  )
}
