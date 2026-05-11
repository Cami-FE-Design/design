import {
  BookOpenIcon,
  CalendarIcon,
  ContactIcon,
  HeadsetIcon,
  HomeIcon,
  type LucideIcon,
  MessageSquareMoreIcon,
  ReceiptIcon,
  SettingsIcon,
  SprayCanIcon,
  UsersIcon,
} from "lucide-react"

export type SubmenuItem = {
  label: string
  href?: string
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
    children: [{ label: "Appointments" }, { label: "Boarding" }, { label: "Day Care" }],
  },
  {
    icon: ContactIcon,
    label: "Clients",
    children: [
      { label: "Pets", href: "/pets" },
      { label: "Pet Parents", href: "/clients" },
    ],
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
    children: [
      { label: "Daily Summary" },
      { label: "Appointments" },
      { label: "Invoices" },
      { label: "Payments" },
    ],
  },
  {
    icon: BookOpenIcon,
    label: "Catalogs",
    children: [{ label: "Service Menu" }, { label: "Categories" }, { label: "Packages" }],
  },
  {
    icon: SprayCanIcon,
    label: "Products",
    children: [{ label: "Products" }, { label: "Suppliers" }],
  },
  {
    icon: UsersIcon,
    label: "Team",
    children: [{ label: "Team Members" }, { label: "Scheduled Shifts" }],
  },
]

export const bottomMenu: MenuItem[] = [
  { icon: HeadsetIcon, label: "Support" },
  { icon: SettingsIcon, label: "Settings" },
]
