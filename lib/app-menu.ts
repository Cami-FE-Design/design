import {
  BookOpenIcon,
  CalendarIcon,
  ContactIcon,
  HeadsetIcon,
  HomeIcon,
  type LucideIcon,
  MessageSquareMoreIcon,
  ReceiptIcon,
  Settings2Icon,
  SprayCanIcon,
  UsersIcon,
} from "lucide-react"

export type SubmenuItem = {
  label: string
}

export type MenuItem = {
  icon: LucideIcon
  label: string
  hasUpdate?: boolean
  notificationCount?: number
  children?: SubmenuItem[]
}

export const topMenu: MenuItem[] = [
  { icon: HomeIcon, label: "Home" },
  {
    icon: CalendarIcon,
    label: "Schedules",
    children: [{ label: "Calendar" }, { label: "Availability" }],
  },
  {
    icon: ContactIcon,
    label: "Clients",
    children: [{ label: "All clients" }, { label: "Groups" }],
  },
  {
    icon: MessageSquareMoreIcon,
    label: "Messages",
    hasUpdate: true,
    notificationCount: 8,
    children: [
      { label: "Inbox" },
      { label: "Outbound" },
      { label: "Reminder Log" },
      { label: "Photos" },
      { label: "Campaigns" },
    ],
  },
  {
    icon: ReceiptIcon,
    label: "Sales",
    children: [{ label: "Invoices" }, { label: "Reports" }],
  },
  {
    icon: BookOpenIcon,
    label: "Catalogs",
    children: [{ label: "Services" }, { label: "Packages" }],
  },
  {
    icon: SprayCanIcon,
    label: "Products",
    children: [{ label: "Inventory" }, { label: "Vendors" }],
  },
  {
    icon: UsersIcon,
    label: "Team",
    children: [{ label: "Members" }, { label: "Roles" }],
  },
]

export const bottomMenu: MenuItem[] = [
  { icon: HeadsetIcon, label: "Support" },
  { icon: Settings2Icon, label: "Settings" },
]
