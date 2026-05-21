"use client"

import type * as React from "react"

import {
  COLUMN_HEADER_HEIGHT,
  DAY_END_HOUR,
  DAY_START_HOUR,
  MIN_COLUMN_WIDTH,
  type MockBooking,
  type MockStaff,
  minutesFromDayStart,
  PX_PER_MIN,
  TIME_AXIS_WIDTH,
} from "@/app/appointments/mock"
import { AppointmentBlockPopover } from "@/components/blocks/appointment-popover"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type PeopleGridProps = {
  staff: MockStaff[]
  bookings: MockBooking[]
  /** Minutes from day start. Set to null to hide the line (e.g. viewing past day). */
  nowMinutes?: number | null
  hasPets?: boolean
  className?: string
}

export function PeopleGrid({
  staff,
  bookings,
  nowMinutes = null,
  hasPets = true,
  className,
}: PeopleGridProps) {
  const totalHours = DAY_END_HOUR - DAY_START_HOUR
  const totalMinutes = totalHours * 60
  const bodyHeight = totalMinutes * PX_PER_MIN
  const hourLabels = Array.from({ length: totalHours + 1 }, (_, i) => DAY_START_HOUR + i)
  const bookingsByStaff = groupByStaff(bookings)

  return (
    <div
      data-slot="people-grid"
      className={cn(
        "relative isolate flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card",
        className,
      )}
    >
      <PeopleGridHeader staff={staff} />
      <div className="relative flex-1 overflow-auto">
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `${TIME_AXIS_WIDTH}px repeat(${staff.length}, minmax(${MIN_COLUMN_WIDTH}px, 1fr))`,
            height: bodyHeight,
          }}
        >
          <TimeAxis hours={hourLabels} />
          {staff.map((member) => (
            <StaffColumn
              key={member.id}
              member={member}
              bookings={bookingsByStaff.get(member.id) ?? []}
              hasPets={hasPets}
            />
          ))}
          {nowMinutes != null && nowMinutes >= 0 && nowMinutes <= totalMinutes ? (
            <NowLine minutes={nowMinutes} columns={staff.length} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

function PeopleGridHeader({ staff }: { staff: MockStaff[] }) {
  return (
    <div
      data-slot="people-grid-header"
      className="grid border-b border-border/60 bg-card"
      style={{
        gridTemplateColumns: `${TIME_AXIS_WIDTH}px repeat(${staff.length}, minmax(${MIN_COLUMN_WIDTH}px, 1fr))`,
        height: COLUMN_HEADER_HEIGHT,
      }}
    >
      <div aria-hidden />
      {staff.map((member) => (
        <div
          key={member.id}
          data-slot="staff-column-header"
          className="flex flex-col items-center justify-center gap-1.5 border-l border-border/40 px-2"
        >
          <Avatar name={member.name} src={member.photoUrl} fallback="character" size="lg" />
          <div className="min-w-0 text-center">
            <div className="truncate text-[12px] font-semibold leading-tight">{member.name}</div>
            <div className="truncate text-[10px] leading-tight text-muted-foreground">
              {member.role}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TimeAxis({ hours }: { hours: number[] }) {
  return (
    <div
      data-slot="time-axis"
      className="relative border-r border-border/60 bg-card"
      style={{ gridColumn: 1 }}
    >
      {hours.slice(0, -1).map((hour, i) => (
        <div
          key={hour}
          className="absolute right-0 left-0 -translate-y-1/2 px-1 text-right text-[10px] font-medium tabular-nums text-muted-foreground"
          style={{ top: i * 60 * PX_PER_MIN }}
        >
          {formatHourLabel(hour)}
        </div>
      ))}
    </div>
  )
}

type StaffColumnProps = {
  member: MockStaff
  bookings: MockBooking[]
  hasPets: boolean
}

function StaffColumn({ member: _member, bookings, hasPets }: StaffColumnProps) {
  return (
    <div data-slot="staff-column" className="relative border-l border-border/40">
      <ColumnGridLines />
      {bookings.map((booking) => {
        const minutes = minutesFromDayStart(booking.start)
        return (
          <AppointmentBlockPopover
            key={booking.id}
            booking={booking}
            top={minutes * PX_PER_MIN}
            height={booking.durationMin * PX_PER_MIN}
            hasPets={hasPets}
          />
        )
      })}
    </div>
  )
}

function ColumnGridLines() {
  const totalHours = DAY_END_HOUR - DAY_START_HOUR
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: totalHours }, (_, i) => {
        const hour = DAY_START_HOUR + i + 1
        return (
          <div
            key={`hour-${hour}`}
            className="absolute right-0 left-0 border-t border-border/30"
            style={{ top: (i + 1) * 60 * PX_PER_MIN }}
          />
        )
      })}
    </div>
  )
}

function NowLine({ minutes, columns }: { minutes: number; columns: number }) {
  return (
    <div
      data-slot="now-line"
      className="pointer-events-none absolute right-0 left-0 z-10 flex items-center"
      style={{
        top: minutes * PX_PER_MIN,
        gridColumn: `1 / span ${columns + 1}`,
      }}
    >
      <span
        className="-translate-y-1/2 inline-flex items-center rounded-sm bg-cami-pink-9 px-1 font-mono text-[10px] font-semibold tabular-nums text-cami-pink-1 leading-none"
        style={{ width: TIME_AXIS_WIDTH - 4, marginLeft: 2 }}
      >
        {formatNow(minutes)}
      </span>
      <div className="h-px flex-1 bg-cami-pink-9" />
    </div>
  )
}

function groupByStaff(bookings: MockBooking[]): Map<string, MockBooking[]> {
  const map = new Map<string, MockBooking[]>()
  for (const b of bookings) {
    const arr = map.get(b.staffId) ?? []
    arr.push(b)
    map.set(b.staffId, arr)
  }
  return map
}

function formatHourLabel(hour: number): string {
  if (hour === 0) return "12 AM"
  if (hour === 12) return "12 PM"
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}

function formatNow(minutes: number): string {
  const h = DAY_START_HOUR + Math.floor(minutes / 60)
  const m = minutes % 60
  const hh = h % 12 === 0 ? 12 : h % 12
  return `${hh}:${m.toString().padStart(2, "0")}`
}
