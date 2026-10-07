import {
  CalendarClockIcon,
  CalendarXIcon,
  EyeOffIcon,
  type LucideIcon,
  MapPinIcon,
  PlayIcon,
  ThumbsUpIcon,
} from "lucide-react"
import type { MockBookingStatus } from "@/app/appointments/mock"

// One vocabulary for a booking's status. The appointments list, global search,
// the detail and edit sheets and the calendar popover each kept their own copy
// of these names and colours; one place means they can't disagree.

export const BOOKING_STATUS_LABEL: Record<MockBookingStatus, string> = {
  booked: "Booked",
  confirmed: "Confirmed",
  "checked-in": "Arrived",
  "ready-for-pickup": "Started",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No-show",
}

export type BookingStatusTone = { fill: string; text: string; subText: string }

/**
 * List and sheet tint. Pastel step-5/6 fills with dark text on passive and
 * active states, lime/9 for "Started", tomato/8 for the no-show's destructive
 * weight. The calendar block and popover keep their own louder theme.
 */
export const BOOKING_STATUS_TONE: Record<MockBookingStatus, BookingStatusTone> = {
  booked: { fill: "bg-blue-5", text: "text-blue-12", subText: "text-blue-12/70" },
  confirmed: { fill: "bg-lime-5", text: "text-lime-12", subText: "text-lime-12/70" },
  "checked-in": { fill: "bg-lime-3", text: "text-lime-12", subText: "text-lime-12/70" },
  "ready-for-pickup": { fill: "bg-lime-9", text: "text-lime-12", subText: "text-lime-12/70" },
  completed: { fill: "bg-cami-gray-6", text: "text-cami-gray-12", subText: "text-cami-gray-12/70" },
  cancelled: { fill: "bg-olive-5", text: "text-olive-12", subText: "text-olive-12/70" },
  "no-show": { fill: "bg-tomato-8", text: "text-tomato-12", subText: "text-tomato-12/70" },
}

/** The status as a badge in a list row: its name and its tint. */
export function bookingStatusBadge(status: MockBookingStatus): {
  label: string
  className: string
} {
  const tone = BOOKING_STATUS_TONE[status]
  return { label: BOOKING_STATUS_LABEL[status], className: `${tone.fill} ${tone.text}` }
}

export type BookingStatusOption = {
  value: MockBookingStatus
  label: string
  Icon: LucideIcon
  destructive?: boolean
}

/** The status menu on the detail and edit sheets, in menu order. */
export const BOOKING_STATUS_OPTIONS: BookingStatusOption[] = [
  { value: "booked", label: BOOKING_STATUS_LABEL.booked, Icon: CalendarClockIcon },
  { value: "confirmed", label: BOOKING_STATUS_LABEL.confirmed, Icon: ThumbsUpIcon },
  { value: "checked-in", label: BOOKING_STATUS_LABEL["checked-in"], Icon: MapPinIcon },
  { value: "ready-for-pickup", label: BOOKING_STATUS_LABEL["ready-for-pickup"], Icon: PlayIcon },
  { value: "no-show", label: BOOKING_STATUS_LABEL["no-show"], Icon: EyeOffIcon, destructive: true },
  {
    value: "cancelled",
    label: BOOKING_STATUS_LABEL.cancelled,
    Icon: CalendarXIcon,
    destructive: true,
  },
]
