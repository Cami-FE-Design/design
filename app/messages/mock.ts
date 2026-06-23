import type { AvatarSpecies } from "@/components/ui/avatar"

// ─── Messages / Inbox mock data ───────────────────────────────────────────────
// Seeds the WhatsApp inbox prototype. WhatsApp-only in v0. SLA timer = the 24h
// WhatsApp customer-service window (seeded static, not live-ticking). All AI /
// automation surfaces are visual stubs here — see docs/specs/messages-inbox.md.

export type FunnelStatus = "new-inquiry" | "engaged" | "quoted" | "scheduled" | "closed"
export type ConversationState = "open" | "closed"

export const FUNNEL_META: Record<FunnelStatus, { label: string; dot: string; pill: string }> = {
  "new-inquiry": {
    label: "New Inquiry",
    dot: "bg-blue-9",
    pill: "bg-blue-3 text-blue-11",
  },
  engaged: {
    label: "Engaged",
    dot: "bg-cami-yellow-9",
    pill: "bg-cami-yellow-3 text-cami-yellow-11",
  },
  quoted: {
    label: "Quoted",
    dot: "bg-cami-violet-9",
    pill: "bg-cami-violet-3 text-cami-violet-11",
  },
  scheduled: {
    label: "Scheduled",
    dot: "bg-cami-sage-9",
    pill: "bg-cami-sage-3 text-cami-sage-11",
  },
  closed: {
    label: "Closed",
    dot: "bg-cami-gray-8",
    pill: "bg-cami-gray-3 text-cami-gray-11",
  },
}

export type PetContext = {
  name: string
  species: AvatarSpecies
  breed: string
  /** Care note surfaced in the client panel — temperament, handling, health. */
  careNote?: string
}

export type ClientContext = {
  id: string
  name: string
  phone: string
  email?: string
  whatsappPreferred?: boolean
  funnel: FunnelStatus
  clientType: "new" | "repeat"
  /** "Mar 2025" etc. — when they became a client. */
  since?: string
  activity: {
    lastVisit?: string
    visits: number
    avgTicketMinor: number
    lifetimeMinor: number
  }
  pets: PetContext[]
  tags: string[]
  internalNotes?: string
}

type ThreadItemBase = {
  /** Day-group label, e.g. "Friday, Jun 19" / "Yesterday" / "Today". A date
   *  separator renders whenever this changes between consecutive items. */
  day?: string
}

export type ThreadItem = ThreadItemBase &
  (
    | { kind: "message"; dir: "in" | "out"; body: string; at: string; author?: string }
    | {
        kind: "booking-request"
        petName: string
        petBreed: string
        service: string
        requestedAt: string
        status: "pending" | "confirmed" | "rejected"
        at: string
      }
    | { kind: "system"; body: string; at: string }
  )

export type Conversation = {
  id: string
  client: ClientContext
  preview: string
  /** Relative label seed, e.g. "30m", "2h". */
  lastAt: string
  unread: boolean
  state: ConversationState
  funnel: FunnelStatus
  /** Senior staff a conversation was escalated to. */
  escalatedTo?: string
  /** Owning staff; undefined = Unassigned. */
  assignee?: string
  /** Minutes left in the WhatsApp 24h service window. Drives the SLA chip color. */
  slaRemainingMin: number
  messages: ThreadItem[]
}

/** Minutes → "23h 57m remaining" / "3h 12m remaining" / "48m remaining". */
export function formatSla(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h <= 0) return `${m}m remaining`
  return `${h}h ${m}m remaining`
}

/** Short SLA label for the dense list row, e.g. "23h" / "48m". */
export function formatSlaShort(minutes: number): string {
  const h = Math.floor(minutes / 60)
  return h >= 1 ? `${h}h` : `${minutes}m`
}

/** Color key for the SLA chip: amber under 4h, red under 1h. */
export function slaTone(minutes: number): "ok" | "warn" | "urgent" {
  if (minutes < 60) return "urgent"
  if (minutes < 240) return "warn"
  return "ok"
}

const SARAH: ClientContext = {
  id: "sarah-mansour",
  name: "Sarah Mansour",
  phone: "+201001234567",
  email: "sarah.m@example.com",
  whatsappPreferred: true,
  funnel: "engaged",
  clientType: "repeat",
  since: "Mar 2025",
  activity: { lastVisit: "Jun 15", visits: 14, avgTicketMinor: 42000, lifetimeMinor: 588000 },
  pets: [
    {
      name: "Max",
      species: "dog",
      breed: "Golden Retriever",
      careNote: "Friendly, loves treats. Mild hip dysplasia — no jumping.",
    },
    {
      name: "Luna",
      species: "cat",
      breed: "Persian",
      careNote: "Shy with strangers. Needs daily brushing.",
    },
  ],
  tags: ["VIP", "Grooming"],
}

function simpleClient(
  id: string,
  name: string,
  phone: string,
  funnel: FunnelStatus,
  pets: PetContext[],
  overrides: Partial<ClientContext> = {},
): ClientContext {
  return {
    id,
    name,
    phone,
    funnel,
    clientType: "new",
    activity: { visits: 0, avgTicketMinor: 0, lifetimeMinor: 0 },
    pets,
    tags: [],
    ...overrides,
  }
}

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c-tarek",
    client: simpleClient("tarek-younis", "Tarek Younis", "+201112223334", "scheduled", [
      { name: "Rex", species: "dog", breed: "Beagle" },
    ]),
    preview: "@Sarah Hassan can you take this one?",
    lastAt: "30m",
    unread: false,
    state: "closed",
    funnel: "scheduled",
    escalatedTo: "Kristine",
    assignee: "Kristine",
    slaRemainingMin: 0,
    messages: [
      { kind: "message", dir: "in", body: "Hi, is my Saturday slot still on?", at: "9:02 AM" },
      { kind: "system", body: "Conversation escalated to Kristine", at: "9:05 AM" },
    ],
  },
  {
    id: "c-salma",
    client: simpleClient("salma-tarek", "Salma Tarek", "+201223334445", "new-inquiry", [
      { name: "Toby", species: "dog", breed: "Poodle" },
    ]),
    preview: "Hi can you book Toby in for a nail trim?",
    lastAt: "1m",
    unread: true,
    state: "open",
    funnel: "new-inquiry",
    slaRemainingMin: 1380,
    messages: [
      {
        kind: "message",
        dir: "in",
        body: "Hi can you book Toby in for a nail trim?",
        at: "10:48 AM",
      },
    ],
  },
  {
    id: "c-sarah",
    client: SARAH,
    preview: "Hi! Is Max okay? I haven't heard back…",
    lastAt: "2m",
    unread: false,
    state: "open",
    funnel: "engaged",
    slaRemainingMin: 1437,
    messages: [
      {
        kind: "message",
        dir: "in",
        body: "Hi! I'd like to book a Full Grooming for Max.",
        at: "10:21 AM",
        day: "Friday, Jun 19",
      },
      {
        kind: "booking-request",
        petName: "Max",
        petBreed: "Golden Retriever",
        service: "Full Grooming",
        requestedAt: "Wed, Jun 24, 8:21 PM",
        status: "pending",
        at: "10:21 AM",
        day: "Friday, Jun 19",
      },
      {
        kind: "message",
        dir: "in",
        body: "Also can you make sure he has water during the visit? He gets thirsty fast.",
        at: "10:21 AM",
        day: "Saturday, Jun 20",
      },
      {
        kind: "system",
        body: "Reminder sent: Max · Full Grooming · Tomorrow",
        at: "4:21 AM",
        day: "Yesterday",
      },
      {
        kind: "message",
        dir: "in",
        body: "Just checking — should I bring his vaccination records?",
        at: "5:21 AM",
        day: "Today",
      },
    ],
  },
  {
    id: "c-hossam",
    client: simpleClient("hossam-adly", "Hossam Adly", "+201334445556", "new-inquiry", [
      { name: "Biscuit", species: "dog", breed: "Corgi" },
    ]),
    preview: "Hi! Looking for a place that does…",
    lastAt: "4m",
    unread: true,
    state: "open",
    funnel: "new-inquiry",
    slaRemainingMin: 1380,
    messages: [
      {
        kind: "message",
        dir: "in",
        body: "Hi! Looking for a place that does mobile grooming.",
        at: "10:40 AM",
      },
    ],
  },
  {
    id: "c-ahmed",
    client: simpleClient("ahmed-rashad", "Ahmed Rashad", "+201445556667", "quoted", [
      { name: "Rocky", species: "dog", breed: "Boxer" },
    ]),
    preview: "Booking request: Rocky · Boarding…",
    lastAt: "12m",
    unread: true,
    state: "open",
    funnel: "quoted",
    slaRemainingMin: 1380,
    messages: [
      { kind: "message", dir: "in", body: "Can I board Rocky next week?", at: "10:32 AM" },
      {
        kind: "booking-request",
        petName: "Rocky",
        petBreed: "Boxer",
        service: "Boarding · 3 nights",
        requestedAt: "Mon, Jun 29, 9:00 AM",
        status: "pending",
        at: "10:33 AM",
      },
    ],
  },
  {
    id: "c-fady",
    client: simpleClient("fady-nabil", "Fady Nabil", "+201556667778", "new-inquiry", [
      { name: "Pepper", species: "cat", breed: "Domestic Shorthair" },
    ]),
    preview: "Hello, my cat Pepper needs a…",
    lastAt: "24m",
    unread: true,
    state: "open",
    funnel: "new-inquiry",
    slaRemainingMin: 1380,
    messages: [
      {
        kind: "message",
        dir: "in",
        body: "Hello, my cat Pepper needs a wash and de-shed.",
        at: "10:20 AM",
      },
    ],
  },
  {
    id: "c-mariam",
    client: simpleClient("mariam-saleh", "Mariam Saleh", "+201667778889", "new-inquiry", [
      { name: "Coco", species: "dog", breed: "Maltese" },
    ]),
    preview: "Hi! Do you do mobile grooming or onl…",
    lastAt: "1h",
    unread: true,
    state: "open",
    funnel: "new-inquiry",
    slaRemainingMin: 1320,
    messages: [
      {
        kind: "message",
        dir: "in",
        body: "Hi! Do you do mobile grooming or only in-salon?",
        at: "9:48 AM",
      },
    ],
  },
  {
    id: "c-reem",
    client: simpleClient("reem-hosny", "Reem Hosny", "+201778889990", "engaged", [
      { name: "Ziggy", species: "dog", breed: "Maltese" },
    ]),
    preview: "Hi, my Maltese Ziggy is super matted…",
    lastAt: "3h",
    unread: false,
    state: "open",
    funnel: "engaged",
    slaRemainingMin: 180,
    messages: [
      {
        kind: "message",
        dir: "in",
        body: "Hi, my Maltese Ziggy is super matted, can you help?",
        at: "7:50 AM",
      },
      {
        kind: "message",
        dir: "out",
        body: "Of course! We can do a de-matting session. When works for you?",
        at: "8:10 AM",
        author: "Michelle",
      },
    ],
  },
]
