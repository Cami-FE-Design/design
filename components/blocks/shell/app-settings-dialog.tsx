"use client"

import {
  BellIcon,
  Building2Icon,
  CirclePercentIcon,
  CreditCardIcon,
  FolderIcon,
  GlobeIcon,
  MapPinIcon,
  MessageCircleIcon,
  MessageSquareTextIcon,
  PaletteIcon,
  TagIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react"
import { FilesSection } from "@/components/blocks/clients/documents-files-card"
import { DealsPage } from "@/components/blocks/deals/deals-page"
import { BillingSettingsPanel } from "@/components/blocks/money/billing-settings-panel"
import { PaymentsSettingsPanel } from "@/components/blocks/payment-policy/payments-settings-panel"
import { BusinessProfileForm } from "@/components/blocks/settings/business-profile-form"
import { CommsTemplatesPanel } from "@/components/blocks/settings/comms-templates-panel"
import { CustomerCardSettingsPanel } from "@/components/blocks/settings/customer-card-settings-panel"
import { LocationForm } from "@/components/blocks/settings/location-form"
import { MyProfilePanel } from "@/components/blocks/settings/my-profile-panel"
import { NotificationsSettingsPanel } from "@/components/blocks/settings/notifications-settings-panel"
import { SalesSettings } from "@/components/blocks/settings/sales-settings"
import {
  SettingsDialogFrame,
  type SettingsGroup,
} from "@/components/blocks/settings/settings-dialog-frame"
import { SettingsPanel } from "@/components/blocks/settings/settings-panel"
import { WhatsAppNumbersPanel } from "@/components/blocks/settings/whatsapp-numbers-panel"

const GROUPS: SettingsGroup[] = [
  {
    label: "Account",
    items: [
      {
        id: "profile",
        label: "My profile",
        description: "Your personal details, sign-in security, and preferences.",
        icon: UserIcon,
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        id: "business-details",
        label: "Business details",
        description: "Legal entity, currency, tax, default languages, and external links.",
        icon: Building2Icon,
      },
      // Next to Business details, not under Messaging, and named for what it
      // is. Messaging is about messages — whether one sends, and what it says.
      // This is a page, reached from a message the way the booking page is. And
      // the palette set here now themes the messages too, so filing it as
      // "Customer card" described a fraction of what it does.
      {
        id: "branding",
        label: "Branding",
        description: "The palette clients see, on their card and in your messages.",
        icon: PaletteIcon,
      },
      {
        id: "locations",
        label: "Locations",
        description: "Where you operate. Each location has its own address, contact, and hours.",
        icon: MapPinIcon,
      },
      {
        id: "language",
        label: "Language & region",
        description: "Switching locale flips the entire portal direction.",
        icon: GlobeIcon,
        wip: true,
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        id: "sales",
        label: "Sales",
        description: "Gift cards for checkout.",
        icon: TagIcon,
      },
    ],
  },
  // Where the dev repo mounts it (`AppSettingsDialog`, groups.marketing): a
  // settings tab, not a Catalogs route.
  {
    label: "Marketing",
    items: [
      {
        id: "deals",
        label: "Deals",
        description: "Set up and manage the deals you offer to your clients.",
        icon: CirclePercentIcon,
      },
    ],
  },
  // Own top-level section, not a Sales sub-item — mirrors Fresha's Workspace
  // settings where Payments stands alone.
  {
    label: "Payments",
    items: [
      {
        id: "payments",
        label: "Payments",
        description: "Payment policy and payment methods for bookings and checkout.",
        icon: CreditCardIcon,
      },
    ],
  },
  // Its own section, not a Payments sub-item. Payments is how clients pay the
  // merchant; Billing is the merchant's own legal identity and their money with
  // Cami. Mirrors the benchmark, where the two are separate cards.
  {
    label: "Billing",
    items: [
      {
        id: "billing",
        label: "Billing",
        description: "Legal details, payout account, and what Cami charged you.",
        icon: WalletIcon,
      },
    ],
  },
  // Own top-level section, like Payments — messaging is what a merchant is billed
  // per message for, so it isn't a sub-item of Business details.
  //
  // Group is "Messaging", not "Notifications", because it now holds two items
  // and one of them was called Notifications too. A single-item group repeating
  // its own name is just a section divider — Sales, Payments and Billing all do
  // it harmlessly. With two items the group name has to be the thing they share,
  // and "Notifications › Notifications" said nothing about how that item differed
  // from its sibling. Messaging is that umbrella: one half decides whether a
  // message sends, the other what it says.
  //
  // The item's `id` stays `notifications`, so every deep link, /screens entry and
  // the Reminders→templates hand-off keep working, and the panel's own heading
  // still matches the item label.
  {
    label: "Messaging",
    items: [
      {
        id: "notifications",
        label: "Notifications",
        description: "Sender ID, which reminders send, and what they cost.",
        icon: BellIcon,
      },
      // Sibling of Notifications, not a tab inside it: that panel already
      // carries Settings and Log, and a 7-event list with a full-screen editor
      // is a destination rather than a tab. Notifications decides whether a
      // message sends; this decides what it says.
      {
        id: "comms-templates",
        label: "Communication templates",
        description: "The wording of every automated email and WhatsApp message.",
        icon: MessageSquareTextIcon,
      },
      // Which number a message arrives on is what decides the branch (R21), so
      // it sits with Messaging rather than with Locations — an owner setting
      // numbers up is thinking about the channel, not about addresses.
      {
        id: "whatsapp-numbers",
        label: "WhatsApp numbers",
        description: "The number each location answers on, and its migration.",
        icon: MessageCircleIcon,
      },
    ],
  },
  {
    label: "Forms",
    items: [
      {
        id: "forms",
        label: "Form templates",
        description:
          "Reusable form templates. Documents added here are the only ones available to send to clients and pets for signature.",
        icon: FolderIcon,
      },
    ],
  },
]

type AppSettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCategoryId?: string
}

export function AppSettingsDialog({
  open,
  onOpenChange,
  defaultCategoryId = "profile",
}: AppSettingsDialogProps) {
  return (
    <SettingsDialogFrame
      open={open}
      onOpenChange={onOpenChange}
      groups={GROUPS}
      defaultCategoryId={defaultCategoryId}
      ariaDescription="Pet Business portal settings, organized by category."
      // Deals carries its own padding, as it does in the dev repo, because its
      // detail view runs a full-bleed header rule.
      isUnpadded={(category) => category.id === "deals"}
    >
      {(active) => (
        <>
          {active.id === "profile" ? <MyProfilePanel /> : null}
          {active.id === "business-details" ? <BusinessProfilePanel /> : null}
          {active.id === "locations" ? <LocationsPanel /> : null}
          {active.id === "language" ? <LanguagePanel /> : null}
          {active.id === "forms" ? <FilesPanel /> : null}
          {active.id === "sales" ? <SalesSettings /> : null}
          {active.id === "deals" ? <DealsPage /> : null}
          {active.id === "payments" ? <PaymentsSettingsPanel /> : null}
          {active.id === "billing" ? <BillingSettingsPanel /> : null}
          {active.id === "notifications" ? <NotificationsSettingsPanel /> : null}
          {active.id === "comms-templates" ? <CommsTemplatesPanel /> : null}
          {active.id === "whatsapp-numbers" ? <WhatsAppNumbersPanel /> : null}
          {active.id === "branding" ? <CustomerCardSettingsPanel /> : null}
        </>
      )}
    </SettingsDialogFrame>
  )
}

function BusinessProfilePanel() {
  return <BusinessProfileForm />
}

function LanguagePanel() {
  return (
    <SettingsPanel
      header={
        <header className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
            Language &amp; region
          </h2>
          <p className="text-sm leading-5 text-muted-foreground">
            Switching locale flips the entire portal direction.
          </p>
        </header>
      }
    >
      <p className="text-sm leading-5 text-muted-foreground">
        Locale switcher isn't wired for the Pet Business portal yet. Coming with the i18n pass.
      </p>
    </SettingsPanel>
  )
}

function LocationsPanel() {
  return <LocationForm />
}

function FilesPanel() {
  return (
    <SettingsPanel
      header={
        <header className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
            Form templates
          </h2>
          {/* The only panel blurb long enough to wrap, so it needs the cap the
              one-line headers get for free: same w-146 footprint as the card
              below it, otherwise the text runs a full column wider than the
              thing it describes. */}
          <p className="max-w-146 text-sm leading-5 text-muted-foreground">
            Reusable forms you can send to clients and pets for signature. Uploads made on a profile
            stay personal to that profile and won&apos;t appear here.
          </p>
        </header>
      }
    >
      <FilesSection variant="settings" />
    </SettingsPanel>
  )
}
