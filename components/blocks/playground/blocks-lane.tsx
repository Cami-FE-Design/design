"use client"

import {
  BanknoteIcon,
  BedIcon,
  Building2Icon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleUserIcon,
  FlagIcon,
  FolderIcon,
  GlobeIcon,
  HomeIcon,
  LightbulbIcon,
  MapPinIcon,
  PercentIcon,
  PhoneIcon,
  PlusIcon,
  ScissorsIcon,
  SettingsIcon,
  SparklesIcon,
  StethoscopeIcon,
  SunIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import {
  FacebookGlyphIcon,
  InstagramGlyphIcon,
  XGlyphIcon,
} from "@/components/blocks/auth/social-icons"
import { Lane, Row, Section } from "@/components/blocks/playground/kit"
import { SettingsCard } from "@/components/blocks/settings/settings-panel"
import { SettingsRow } from "@/components/blocks/settings/settings-row"
import { AddressSearchField } from "@/components/blocks/shared/address-search-field"
import { AvatarStack } from "@/components/blocks/shared/avatar-stack"
import { EmptyState } from "@/components/blocks/shared/empty-state"
import { InlineNotice } from "@/components/blocks/shared/inline-notice"
import { KpiCard, KpiGrid } from "@/components/blocks/shared/kpi-card"
import { LinkedEntityChip } from "@/components/blocks/shared/linked-entity-chip"
import { PageHeader } from "@/components/blocks/shared/page-header"
import { PdfViewer } from "@/components/blocks/shared/pdf-viewer-lazy"
import { SectionCard } from "@/components/blocks/shared/section-card"
import {
  SectionedSheetShell,
  type SectionGroup,
} from "@/components/blocks/shared/sectioned-sheet-shell"
import { TimelineDate, TimelineRow } from "@/components/blocks/shared/timeline-row"
import {
  SignatureDialog,
  SignaturePreview,
  type SignatureResult,
} from "@/components/blocks/sign/signature-dialog"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RecencyBadge } from "@/components/ui/recency-badge"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import { Switch } from "@/components/ui/switch"
import { type AddressParts, addressToLines, EMPTY_ADDRESS } from "@/lib/address"
import { buildConsentPdfUrl } from "@/lib/mock-pdf"
import { DEMO_BILLING_DETAILS } from "@/lib/money/billing-details"
import { cn } from "@/lib/utils"

const PICKABLE_TYPES = [
  { id: "grooming", label: "Pet grooming", Icon: ScissorsIcon },
  { id: "boarding", label: "Boarding", Icon: HomeIcon },
  { id: "daycare", label: "Daycare", Icon: SunIcon },
  { id: "veterinary", label: "Veterinary", Icon: StethoscopeIcon },
  { id: "sitting", label: "Pet sitting", Icon: BedIcon },
  { id: "wellness", label: "Wellness & spa", Icon: SparklesIcon },
]

/** The address field on its own, so both entry routes are visible at once. */
function AddressSearchFieldDemo({ initial = EMPTY_ADDRESS }: { initial?: AddressParts }) {
  const [parts, setParts] = useState<AddressParts>(initial)
  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-border/60 bg-sand-2 p-4">
      <AddressSearchField value={parts} onChange={setParts} />
      <div className="flex flex-col gap-0.5 rounded-xl bg-cami-sage-2 p-3">
        <p className="text-sm font-medium text-foreground">On the document</p>
        {addressToLines(parts).length > 0 ? (
          addressToLines(parts).map((line) => (
            <p key={line} className="text-sm leading-5 text-muted-foreground">
              {line}
            </p>
          ))
        ) : (
          <p className="text-sm leading-5 text-muted-foreground">Nothing yet.</p>
        )}
      </div>
    </div>
  )
}

/** Billing details at one state. Open Edit to read the forward-only note. */

export function BlocksLane() {
  const [pickedTypes, setPickedTypes] = useState<Set<string>>(
    () => new Set(["grooming", "wellness"]),
  )
  const [shellMode, setShellMode] = useState<"add" | "detail">("detail")
  const [shellSection, setShellSection] = useState<string>("overview")
  const [signatureOpen, setSignatureOpen] = useState(false)
  const [signatureResult, setSignatureResult] = useState<SignatureResult | null>(null)
  const [demoPdfUrl, setDemoPdfUrl] = useState<string | null>(null)
  useEffect(() => {
    let built: string | null = null
    buildConsentPdfUrl("Grooming consent form", [
      "I confirm that the information I have provided about my pet is accurate and complete.",
      "I consent to my pet being handled, bathed and groomed by the team, and understand that a muzzle or other safe restraint may be used if my pet becomes anxious.",
      "I release the staff and the business from liability for any accidental injury or stress to my pet that may occur despite reasonable and professional care.",
    ]).then((url) => {
      built = url
      setDemoPdfUrl(url)
    })
    return () => {
      if (built) URL.revokeObjectURL(built)
    }
  }, [])

  const togglePick = (id: string) => {
    setPickedTypes((curr) => {
      const next = new Set(curr)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Lane
      id="blocks"
      label="Building blocks"
      blurb="Presentational blocks assembled from the primitives, shared across screens."
    >
      <Section
        title="Empty state"
        description="Centered placeholder for sections with no data. variant='plain' (default) is the borderless, muted in-section treatment. variant='card' wraps the same light line-icon and muted title in a dashed self-framed card — the full-page listing look used by the sales / clients / pets / products / appointments tables when a search or filter returns nothing."
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
        title="Page header"
        description="The title row of a listing page, passed to AppShell or AdminShell as header. Title, one line of description (a count, or what the page is for) and an actions group kept together on the right."
      >
        <Row label="With actions" align="start">
          <PageHeader
            title="Clients"
            description="16 clients"
            actions={
              <>
                <Button variant="outline" radius="full">
                  Options
                  <ChevronDownIcon className="size-3.5" />
                </Button>
                <Button radius="full">
                  <PlusIcon />
                  Add client
                </Button>
              </>
            }
          />
        </Row>
        <Row label="With badge" align="start">
          <PageHeader
            title="Reporting and analytics"
            badge={
              <Badge variant="secondary" size="md">
                26
              </Badge>
            }
            description="Access all of your Cami reports."
          />
        </Row>
        <Row label="Title only" align="start">
          <PageHeader title="Packages" />
        </Row>
      </Section>
      <Section
        title="Inline notice"
        description="A tinted box with an icon and one short message, for settings panels, dialogs and card footnotes. No accent border. Anything with a title or buttons is built in place."
      >
        <Row label="Warning" align="start">
          <div className="w-full max-w-xl">
            <InlineNotice tone="warning">
              No Google review link set, so the review line won&apos;t send.
            </InlineNotice>
          </div>
        </Row>
        <Row label="Info" align="start">
          <div className="w-full max-w-xl">
            <InlineNotice>
              WhatsApp templates have to be approved by Meta before they can send.
            </InlineNotice>
          </div>
        </Row>
        <Row label="Muted" align="start">
          <div className="w-full max-w-xl">
            <InlineNotice tone="muted">These are the defaults every partner inherits.</InlineNotice>
          </div>
        </Row>
        <Row label="Footnote (sm)" align="start">
          <div className="flex w-full max-w-xl flex-col gap-2">
            <InlineNotice tone="warning" size="sm">
              You have view-only access to terminals. Ask an HQ admin for edit rights.
            </InlineNotice>
            <InlineNotice tone="muted" size="sm">
              Changing a rate never re-prices past payments.
            </InlineNotice>
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

        {/* Leading-less variant: no date gutter (grouped under a month header
          instead), used by the gift-card activity timeline. A lone row still
          shows the connector so it reads as a timeline. */}
        <div className="max-w-lg">
          <p className="mb-2 text-sm text-muted-foreground">May</p>
          <ul className="flex flex-col">
            <TimelineRow isLast>
              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <span className="font-semibold text-foreground">Gift card purchased</span>
                <p className="text-xs text-muted-foreground">Yesterday at 3:33pm by Maz Khan</p>
              </div>
            </TimelineRow>
          </ul>
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
        title="Settings card"
        description="The card every settings panel is built from: one 146 (584px) footprint from sm up, so a column of cards shares one edge. className sets the inner gap or a row layout, never the width."
      >
        <Row label="Default" align="start">
          <SettingsCard>
            <h3 className="font-heading text-base font-semibold">Business details</h3>
            <SettingsRow icon={Building2Icon} label="Business name" value="Shampooch JVC" />
            <SettingsRow icon={FlagIcon} label="Country" value="United Arab Emirates" />
          </SettingsCard>
        </Row>
        <Row label="Row layout" align="start">
          <SettingsCard className="flex-row items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Deposits</span>
              <span className="text-sm text-muted-foreground">Ask for a deposit at booking.</span>
            </div>
            <Switch defaultChecked aria-label="Deposits" />
          </SettingsCard>
        </Row>
      </Section>
      <Section
        title="Settings row"
        description="Icon + label/value stack used inside settings summary cards. When the value is null the row collapses into a subtle 'Add {label}' pill."
      >
        <Row label="Filled">
          <div className="flex w-full max-w-md flex-col gap-5">
            <SettingsRow icon={Building2Icon} label="Business name" value="Shampooch JVC" />
            <SettingsRow icon={FlagIcon} label="Country" value="United Arab Emirates" />
            <SettingsRow icon={BanknoteIcon} label="Currency" value="AED" />
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
        title="Address search field"
        description="Search first, structured fields second — picking a place fills the grid, which stays editable because the trade licence is what has to match, not the places result. Manual entry is the first row of the dropdown, not a fallback reached by failing. A picked place stores its placeId and coordinates; edit the text afterwards and the line under the field drops them (PRD-144)."
      >
        <Row label="Empty — search only">
          <AddressSearchFieldDemo />
        </Row>
        <Row label="Prefilled — fields already open">
          <AddressSearchFieldDemo initial={DEMO_BILLING_DETAILS.address} />
        </Row>
      </Section>
      <Section
        title="Add a signature dialog"
        description="Standalone signature-capture modal: full name + Title, a Type / Draw segmented toggle — Type renders the scripted preview + Signature ID, Draw is a pointer canvas pad with Clear. Sign is disabled until valid. The public signer flow (/sign) now captures the signature inline in its split layout rather than in this modal; kept here for reuse elsewhere."
      >
        <Row label="Open">
          <Button onClick={() => setSignatureOpen(true)}>Add a signature</Button>
        </Row>
        {signatureResult ? (
          <Row label="Captured">
            <SignaturePreview
              businessName="Shampooch"
              fullName={signatureResult.fullName}
              signatureId={signatureResult.signatureId}
              drawingDataUrl={signatureResult.drawingDataUrl}
            />
          </Row>
        ) : null}
        <SignatureDialog
          open={signatureOpen}
          onOpenChange={setSignatureOpen}
          businessName="Shampooch"
          defaultFullName="Michelle You"
          onSign={setSignatureResult}
        />
      </Section>
      <Section
        lazy
        title="PDF viewer"
        description="<PdfViewer> renders PDFs on a canvas (react-pdf / pdf.js) inside our own themed scrolling container — no native viewer chrome. Pages fit the container width; a floating dark toolbar carries zoom (50–250%) and page navigation, tracked as you scroll. Client-only. Used by /sign, the operator 'View form' layout and Files → Preview."
      >
        <Row label="Document">
          <div className="w-full max-w-xl">
            {demoPdfUrl ? (
              <PdfViewer file={demoPdfUrl} />
            ) : (
              <div className="flex h-60 items-center justify-center rounded-2xl border border-border/60 bg-muted/30 text-sm text-muted-foreground">
                Preparing document…
              </div>
            )}
          </div>
        </Row>
      </Section>
    </Lane>
  )
}
