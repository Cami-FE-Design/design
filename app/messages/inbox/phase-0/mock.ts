import type { AvatarSpecies } from "@/components/ui/avatar"

// ─── Inbox CRM, Phase 0 — prototype data (ENG3-33 / T1) ───────────────────────
// Shaped on the draft schema in cami-docs-v1 `inbox-crm-phase-0/code-design.md`
// so every field on screen maps to a column the backend can provide — that
// mapping is the T1 contract proposal. Names are the camelCase of the columns:
//   inbox_conversation  → phoneE164, customer (nullable), lastMessageAt, lastInboundAt
//   inbox_message       → direction, sentFromPhoneApp, sentByStaffName (sent_by_staff_id
//                         resolved to a display name), origin, body, templateCode,
//                         deliveryState, retryCount, failureCode, providerSentAt
//   inbox_message_media → kind (from mime_type), status (synced / phone_only / rejected)
//
// Time is anchored to one fixed instant so server and client render the same
// labels; the screen advances a clock from it once mounted.

/** 24 Sep 2026, 14:30 in Dubai. */
export const DEMO_NOW = Date.UTC(2026, 8, 24, 10, 30)
export const SALON_TIME_ZONE = "Asia/Dubai"
/** The signed-in staff member — the reception persona in the stories. */
export const CURRENT_STAFF = "Queenie"

export type Direction = "inbound" | "outbound"
export type DeliveryState = "pending" | "sent" | "failed"
/** `history_import` is the P11 seed shape: no staff name, ever. */
export type MessageOrigin = "live" | "history_import"
export type MediaKind = "image" | "video" | "file"
export type MediaStatus = "synced" | "phone_only" | "rejected"

export type InboxMedia = {
  publicId: string
  kind: MediaKind
  mimeType: string
  fileName?: string
  byteSize?: number
  status: MediaStatus
  /** Seed for the drawn placeholder standing in for the stored file. */
  tone?: number
  /** A file picked from this computer, shown from the browser until it uploads. */
  previewUrl?: string
}

export type InboxMessage = {
  publicId: string
  direction: Direction
  origin: MessageOrigin
  /** IX-A1-AC5. Outbound, but not typed in Cami. */
  sentFromPhoneApp: boolean
  /** IX-A1-AC4. Null is the honest value for imported history and phone-app echoes. */
  sentByStaffName: string | null
  body: string | null
  templateCode: string | null
  deliveryState: DeliveryState
  retryCount: number
  failureCode: string | null
  /** Orders the thread. ISO, UTC. */
  providerSentAt: string
  media?: InboxMedia[]
}

export type InboxPet = { name: string; species: AvatarSpecies; breed: string }

/** What the thread read carries for a matched client, so it paints with the
 *  messages (contract.md, latency — "two responses"). */
export type InboxCustomer = {
  publicId: string
  firstName: string
  lastName: string | null
  pets: InboxPet[]
  lastService: { name: string; at: string } | null
  /** Where a template's booking blanks are filled from (IX-A4 row 2). */
  nextBooking: { service: string; at: string } | null
}

/** INV-08: every link between a chat and a client is kept, with who and when.
 *  `auto_linked` is P6 — a number matching exactly one client on arrival,
 *  recorded with Cami as the actor so a later re-match shows what it replaced. */
export type IdentityEventKind = "auto_linked" | "matched" | "rematched" | "created"

export type IdentityEvent = {
  publicId: string
  kind: IdentityEventKind
  actorName: string
  at: string
  customerName: string
  /** Set on a re-match: the client it replaced. */
  previousCustomerName?: string
}

export type InboxConversation = {
  publicId: string
  phoneE164: string
  /** Nullable, and load-bearing — null is the unmatched state. */
  customer: InboxCustomer | null
  lastMessageAt: string
  /** When the client last wrote — shown beside the countdown (IX-A2 evidence). */
  lastInboundAt: string | null
  /** The one source of the free-text window (contract.md, decided 2026-09-23):
   *  24 h after `lastInboundAt`, computed by Cami — or the moment WhatsApp
   *  rejected a send as outside the window, which is final. Null until the client
   *  first writes. The composer counts down to this and nothing else. */
  windowClosesAt: string | null
  unreadCount: number
  /** Oldest first. The screen pages through it newest-first (keyset). */
  messages: InboxMessage[]
  /** Link history, oldest first. Shown in the thread as lines, never lost. */
  events: IdentityEvent[]
}

// ─── Builders ─────────────────────────────────────────────────────────────────

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
export const WINDOW_MS = 24 * HOUR

/** The window closes 24 h after the client's last message. */
export const windowFrom = (lastInboundIso: string) =>
  new Date(Date.parse(lastInboundIso) + WINDOW_MS).toISOString()

const at = (msAgo: number) => new Date(DEMO_NOW - msAgo).toISOString()
const ahead = (ms: number) => new Date(DEMO_NOW + ms).toISOString()

let seq = 0
const nextId = (prefix: string) => `${prefix}-${(++seq).toString(36).padStart(4, "0")}`

type MsgInput = {
  ago: number
  body?: string | null
  staff?: string | null
  phoneApp?: boolean
  origin?: MessageOrigin
  template?: string | null
  state?: DeliveryState
  retryCount?: number
  failureCode?: string | null
  media?: Omit<InboxMedia, "publicId">[]
}

function inbound(i: MsgInput): InboxMessage {
  return build("inbound", i)
}
function outbound(i: MsgInput): InboxMessage {
  return build("outbound", i)
}
function build(direction: Direction, i: MsgInput): InboxMessage {
  return {
    publicId: nextId("msg"),
    direction,
    origin: i.origin ?? "live",
    sentFromPhoneApp: i.phoneApp ?? false,
    sentByStaffName:
      direction === "outbound" && !i.phoneApp && i.origin !== "history_import"
        ? (i.staff ?? CURRENT_STAFF)
        : null,
    body: i.body ?? null,
    templateCode: i.template ?? null,
    deliveryState: direction === "inbound" ? "sent" : (i.state ?? "sent"),
    retryCount: i.retryCount ?? 0,
    failureCode: i.failureCode ?? null,
    providerSentAt: at(i.ago),
    media: i.media?.map((m) => ({ ...m, publicId: nextId("med") })),
  }
}

function conversation(
  c: Omit<
    InboxConversation,
    "lastMessageAt" | "lastInboundAt" | "windowClosesAt" | "publicId" | "events"
  > & {
    id: string
  },
): InboxConversation {
  const { id, ...rest } = c
  const sorted = [...rest.messages].sort((a, b) => a.providerSentAt.localeCompare(b.providerSentAt))
  const lastInbound = [...sorted].reverse().find((m) => m.direction === "inbound")
  return {
    ...rest,
    publicId: id,
    messages: sorted,
    lastMessageAt: sorted[sorted.length - 1]!.providerSentAt,
    lastInboundAt: lastInbound?.providerSentAt ?? null,
    windowClosesAt: lastInbound ? windowFrom(lastInbound.providerSentAt) : null,
    // Seeded matched chats were linked on arrival (P6), by Cami.
    events: rest.customer
      ? [
          {
            publicId: nextId("evt"),
            kind: "auto_linked",
            actorName: "Cami",
            at: sorted[0]!.providerSentAt,
            customerName: [rest.customer.firstName, rest.customer.lastName]
              .filter(Boolean)
              .join(" "),
          },
        ]
      : [],
  }
}

// Deterministic pseudo-random, so the six-month seed is the same on every load.
function lcg(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

/** Six months of history, shaped like the P11 import, then two weeks of live
 *  traffic — the IX-A1 long-history edge case and the IX-A6 phone-only media. */
function longHistory(): InboxMessage[] {
  const rand = lcg(42)
  const asks = [
    "Hi, can I book for this week?",
    "Is Thursday afternoon free?",
    "Thank you so much!",
    "Running 10 minutes late, sorry",
    "Can we move to Saturday?",
    "Do you have anything after 5?",
    "Perfect, see you then",
    "How much is the full package?",
  ]
  const replies = [
    "Hi! Yes, we have 3pm or 4:30pm.",
    "Booked you in 👍",
    "No problem, see you soon.",
    "It's 280 AED for the full package.",
    "Saturday 11am works — shall I lock it in?",
    "We can do 5:15pm.",
  ]
  const out: InboxMessage[] = []
  // Imported history: ~180 days ago up to 15 days ago.
  for (let dayAgo = 180; dayAgo > 15; dayAgo -= 3 + Math.floor(rand() * 6)) {
    const base = dayAgo * DAY - (9 + Math.floor(rand() * 8)) * HOUR
    const turns = 2 + Math.floor(rand() * 4)
    for (let t = 0; t < turns; t++) {
      const ago = base - t * (4 + Math.floor(rand() * 40)) * MINUTE
      const fromClient = t % 2 === 0
      // Media older than two weeks at connect stays on the phone (P12).
      const media =
        rand() < 0.12
          ? [
              {
                kind: (rand() < 0.75 ? "image" : "video") as MediaKind,
                mimeType: "image/jpeg",
                status: "phone_only" as MediaStatus,
              },
            ]
          : undefined
      const body =
        media && rand() < 0.5
          ? null
          : fromClient
            ? asks[Math.floor(rand() * asks.length)]!
            : replies[Math.floor(rand() * replies.length)]!
      out.push(
        fromClient
          ? inbound({ ago, body, origin: "history_import", media })
          : outbound({ ago, body, origin: "history_import", media }),
      )
    }
  }
  // Live, the last two weeks.
  out.push(
    inbound({ ago: 9 * DAY + 3 * HOUR, body: "Hi, is Leo due for his next visit soon?" }),
    // Answered on the phone app — arrives as an echo, outbound, no staff name (IX-A1 row 5, P14).
    outbound({
      ago: 9 * DAY + 2 * HOUR,
      body: "Hi Omar! Yes, he's due next week. Tuesday 4pm?",
      phoneApp: true,
    }),
    inbound({ ago: 9 * DAY + 1 * HOUR, body: "Tuesday works" }),
    outbound({
      ago: 9 * DAY + 50 * MINUTE,
      body: "Done — Tuesday 30 Sep at 4pm. See you then!",
      staff: "Aisha",
    }),
    inbound({
      ago: 26 * HOUR,
      body: "This is the cut I'd like this time",
      media: [{ kind: "image", mimeType: "image/jpeg", status: "synced", tone: 2 }],
    }),
    outbound({ ago: 25 * HOUR, body: "Love it — we'll do exactly that 😊" }),
    inbound({
      ago: 25 * HOUR - 3 * MINUTE,
      body: null,
      media: [
        { kind: "video", mimeType: "video/mp4", status: "synced", tone: 1, byteSize: 4_200_000 },
      ],
    }),
    inbound({ ago: 3 * HOUR + 12 * MINUTE, body: "Could we make it 5pm instead of 4 on Tuesday?" }),
  )
  return out
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

export function buildConversations(): InboxConversation[] {
  seq = 0
  return [
    conversation({
      id: "layla",
      phoneE164: "+971501234501",
      unreadCount: 2,
      customer: {
        publicId: "cus-layla",
        firstName: "Layla",
        lastName: "Haddad",
        pets: [{ name: "Coco", species: "dog", breed: "Toy poodle" }],
        lastService: { name: "Full groom", at: at(34 * DAY) },
        nextBooking: null,
      },
      messages: [
        inbound({ ago: 2 * DAY + 5 * HOUR, body: "Hi! Do you have any slots this Friday?" }),
        outbound({
          ago: 2 * DAY + 4 * HOUR,
          body: "Hi Layla! Friday we have 10am or 2pm.",
          staff: "Aisha",
        }),
        inbound({
          ago: 2 * DAY + 4 * HOUR - 20 * MINUTE,
          body: "Let me check and come back to you",
        }),
        outbound({
          ago: 1 * DAY + 2 * HOUR,
          body: "Just checking in — shall I hold 2pm Friday for you?",
        }),
        inbound({ ago: 48 * MINUTE, body: "Sorry for the delay!" }),
        inbound({ ago: 46 * MINUTE, body: "2pm Friday is perfect, please book it" }),
      ],
    }),
    conversation({
      id: "unmatched-saturday",
      phoneE164: "+971554471209",
      unreadCount: 1,
      customer: null,
      messages: [
        inbound({
          ago: 23 * MINUTE,
          body: null,
          media: [{ kind: "image", mimeType: "image/jpeg", status: "synced", tone: 0 }],
        }),
        inbound({ ago: 22 * MINUTE, body: "Hello, do you have anything this Saturday morning?" }),
      ],
    }),
    conversation({
      id: "omar",
      phoneE164: "+971507788120",
      unreadCount: 1,
      customer: {
        publicId: "cus-omar",
        firstName: "Omar",
        lastName: "Khalil",
        pets: [{ name: "Leo", species: "cat", breed: "British shorthair" }],
        lastService: { name: "Bath & tidy", at: at(27 * DAY) },
        nextBooking: { service: "Bath & tidy", at: ahead(6 * DAY - 22 * HOUR) },
      },
      messages: longHistory(),
    }),
    conversation({
      id: "unmatched-fatima",
      phoneE164: "+971528830044",
      unreadCount: 0,
      customer: null,
      messages: [
        inbound({
          ago: 5 * HOUR,
          body: "Hi, this is Fatima — a friend recommended you. Do you do first visits for puppies?",
        }),
        outbound({
          ago: 4 * HOUR + 40 * MINUTE,
          body: "Hi Fatima, welcome! Yes we do — how old is your puppy?",
        }),
        outbound({
          ago: 4 * HOUR + 39 * MINUTE,
          body: "Here's our welcome pack with prices and what to bring.",
          media: [
            {
              kind: "file",
              mimeType: "application/pdf",
              fileName: "Welcome pack.pdf",
              byteSize: 1_240_000,
              status: "synced",
            },
          ],
        }),
      ],
    }),
    conversation({
      id: "sara",
      phoneE164: "+971509913377",
      unreadCount: 0,
      customer: {
        publicId: "cus-sara",
        firstName: "Sara",
        lastName: "Nasser",
        pets: [{ name: "Milo", species: "dog", breed: "Cavapoo" }],
        lastService: { name: "Puppy intro groom", at: at(12 * DAY) },
        nextBooking: { service: "Puppy intro groom", at: ahead(19 * HOUR + 30 * MINUTE) },
      },
      messages: [
        inbound({ ago: 30 * HOUR, body: "Can I bring Milo in a bit earlier tomorrow?" }),
        outbound({
          ago: 29 * HOUR + 30 * MINUTE,
          body: "Let me check with the team and get back to you.",
        }),
      ],
    }),
    conversation({
      id: "noura",
      phoneE164: "+971561200987",
      unreadCount: 0,
      customer: {
        publicId: "cus-noura",
        firstName: "Noura",
        lastName: "Saeed",
        pets: [],
        lastService: { name: "Nail trim", at: at(60 * DAY) },
        nextBooking: { service: "Nail trim", at: ahead(3 * HOUR + 30 * MINUTE) },
      },
      messages: [
        inbound({ ago: 2 * HOUR, body: "Is the 6pm still on for today?" }),
        outbound({
          ago: 1 * HOUR + 55 * MINUTE,
          body: "Yes! See you at 6pm 😊",
          state: "failed",
          failureCode: "PROVIDER_REJECTED",
        }),
      ],
    }),
    conversation({
      // The window closes about two minutes after the page opens — start typing
      // to see IX-A2's "window closes while I am typing".
      id: "maryam",
      phoneE164: "+971502228814",
      unreadCount: 0,
      customer: {
        publicId: "cus-maryam",
        firstName: "Maryam",
        lastName: "Aziz",
        pets: [{ name: "Simba", species: "cat", breed: "Maine coon" }],
        lastService: { name: "De-shed treatment", at: at(45 * DAY) },
        nextBooking: null,
      },
      messages: [
        inbound({
          ago: 24 * HOUR - 2 * MINUTE,
          body: "Do you have a waiting list for the de-shed treatment?",
        }),
        outbound({
          ago: 23 * HOUR,
          body: "We do! Let me check who's free and message you back.",
          staff: "Aisha",
        }),
      ],
    }),
    conversation({
      id: "unmatched-closed",
      phoneE164: "+971585550132",
      unreadCount: 0,
      customer: null,
      messages: [
        inbound({ ago: 2 * DAY + 3 * HOUR, body: "Hi, what are your prices for a full groom?" }),
      ],
    }),
    conversation({
      // Unmatched, window closed, and on no client record: the only chat where
      // Add can ask for a name with the window shut (IX-C4 row 4, P10).
      id: "unmatched-quiet",
      phoneE164: "+971567890011",
      unreadCount: 0,
      customer: null,
      messages: [inbound({ ago: 30 * HOUR, body: "Hi, are you open on Fridays?" })],
    }),
    conversation({
      id: "huda",
      phoneE164: "+971503344556",
      unreadCount: 0,
      customer: {
        publicId: "cus-huda",
        firstName: "Huda",
        lastName: "Rahman",
        pets: [
          { name: "Bella", species: "dog", breed: "Shih tzu" },
          { name: "Max", species: "dog", breed: "Maltese" },
        ],
        lastService: { name: "Full groom", at: at(20 * DAY) },
        nextBooking: { service: "Full groom", at: ahead(4 * DAY) },
      },
      // Mum and daughter on one number: one chat. The person is chosen at booking (IX-F1, S1).
      messages: [
        inbound({
          ago: 3 * DAY + 2 * HOUR,
          body: "Hi it's Huda, booking for my mum this time — she'll bring Bella",
        }),
        outbound({ ago: 3 * DAY + 1 * HOUR, body: "Of course! Monday 11am?", staff: "Aisha" }),
        inbound({ ago: 3 * DAY, body: "Perfect thanks" }),
      ],
    }),
  ]
}

// ─── Templates ────────────────────────────────────────────────────────────────
// Placeholders until FND-5b records the approved test templates (IX-A4,
// "Approved test templates" — still empty). The blanks are the ones IX-A4 names:
// the client's name and the booking details, filled from the record.

export type TemplateBlank = "first_name" | "service" | "booking_date" | "booking_time"

export type InboxTemplate = {
  code: string
  name: string
  language: "en"
  body: string
}

export const INBOX_TEMPLATES: readonly InboxTemplate[] = [
  {
    code: "reply_followup",
    name: "Follow-up reply",
    language: "en",
    body: "Hi {{first_name}}, thanks for your message. We're here now — reply to this message and we'll pick up where we left off.",
  },
  {
    code: "booking_details",
    name: "Booking details",
    language: "en",
    body: "Hi {{first_name}}, a note about your {{service}} on {{booking_date}} at {{booking_time}}. Reply to this message if anything needs to change.",
  },
  {
    code: "ask_name",
    name: "Ask for a name",
    language: "en",
    body: "Hi! Thanks for getting in touch. Could you tell us your name so we can help?",
  },
]

// ─── The customer module, as the inbox sees it ────────────────────────────────
// The inbox keeps no client list of its own (design.md, "linking, not owning").
// These stand in for the customer module's search, its client record, and the
// second read ClientSummary makes for visits (contract.md, latency).

export type DirectoryClient = InboxCustomer & {
  phoneE164: string | null
  email: string | null
  archived: boolean
  /** The client's home location when it is not this one — business-wide, still matchable. */
  homeLocation: string | null
}

const client = (
  c: Omit<DirectoryClient, "pets" | "archived" | "homeLocation" | "lastService" | "nextBooking"> &
    Partial<DirectoryClient>,
): DirectoryClient => ({
  pets: [],
  archived: false,
  homeLocation: null,
  lastService: null,
  nextBooking: null,
  ...c,
})

/** Every client the search can find. Built once from the seeded chats plus the
 *  clients the IX-C3 edge cases need. */
export function buildDirectory(conversations: InboxConversation[]): DirectoryClient[] {
  const fromChats = conversations.flatMap((c) =>
    c.customer
      ? [
          client({
            ...c.customer,
            phoneE164: c.phoneE164,
            email: `${c.customer.firstName.toLowerCase()}@example.com`,
          }),
        ]
      : [],
  )
  return [
    ...fromChats,
    // Two Fatimas — a name search shows both. One has no phone (saved on match),
    // the other a different one (Replace or Keep).
    client({
      publicId: "cus-fatima-noor",
      firstName: "Fatima",
      lastName: "Noor",
      phoneE164: null,
      email: "fatima.noor@example.com",
      pets: [{ name: "Luna", species: "dog", breed: "Golden retriever puppy" }],
    }),
    client({
      publicId: "cus-fatima-hashimi",
      firstName: "Fatima",
      lastName: "Al Hashimi",
      phoneE164: "+971501119900",
      email: "f.hashimi@example.com",
      pets: [{ name: "Oreo", species: "cat", breed: "Ragdoll" }],
      lastService: { name: "Bath & tidy", at: at(90 * DAY) },
    }),
    // Archived: matchable, shown as archived (IX-C3 edge case, INV-02).
    client({
      publicId: "cus-ahmed",
      firstName: "Ahmed",
      lastName: "Saleh",
      phoneE164: "+971552223344",
      email: null,
      archived: true,
      pets: [{ name: "Rocky", species: "dog", breed: "Beagle" }],
      lastService: { name: "Full groom", at: at(400 * DAY) },
    }),
    // A client from another location: business-wide, match allowed.
    client({
      publicId: "cus-rana",
      firstName: "Rana",
      lastName: "Haddad",
      phoneE164: "+971507001234",
      email: "rana@example.com",
      homeLocation: "Shampooch JLT",
      pets: [{ name: "Nala", species: "cat", breed: "Siamese" }],
      lastService: { name: "Nail trim", at: at(15 * DAY) },
    }),
    // The same number on two records — why that chat stayed unmatched (P6).
    // "Show both, I pick." Merge is LATER.
    client({
      publicId: "cus-khalid",
      firstName: "Khalid",
      lastName: "Omar",
      phoneE164: "+971585550132",
      email: "khalid.omar@example.com",
      pets: [{ name: "Buddy", species: "dog", breed: "Labrador" }],
      lastService: { name: "Full groom", at: at(40 * DAY) },
    }),
    client({
      publicId: "cus-khalid-2",
      firstName: "Khalid",
      lastName: "O.",
      phoneE164: "+971585550132",
      email: null,
      lastService: { name: "Bath & tidy", at: at(300 * DAY) },
    }),
  ]
}

/** Customer search: name, phone, email — and pet, which IX-C3's backend adds. */
export function searchDirectory(directory: DirectoryClient[], query: string): DirectoryClient[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const digits = q.replace(/\D/g, "")
  return directory.filter(
    (c) =>
      `${c.firstName} ${c.lastName ?? ""}`.toLowerCase().includes(q) ||
      (digits.length >= 3 && (c.phoneE164 ?? "").includes(digits)) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      c.pets.some((p) => p.name.toLowerCase().includes(q)),
  )
}

export function clientsOnNumber(directory: DirectoryClient[], phoneE164: string) {
  return directory.filter((c) => c.phoneE164 === phoneE164)
}

export type Visit = {
  publicId: string
  service: string
  staffName: string
  at: string
  /** AED, integer minor units (fils). */
  amountMinor: number
}

export type ClientNote = { publicId: string; body: string; authorName: string; at: string }

/** The second read — last three visits — and notes, per client. */
export const CLIENT_HISTORY: Record<string, { visits: Visit[]; notes: ClientNote[] }> = {
  "cus-layla": {
    visits: [
      {
        publicId: "v1",
        service: "Full groom",
        staffName: "Aisha",
        at: at(34 * DAY),
        amountMinor: 28_000,
      },
      {
        publicId: "v2",
        service: "Nail trim",
        staffName: "Queenie",
        at: at(62 * DAY),
        amountMinor: 6_000,
      },
      {
        publicId: "v3",
        service: "Full groom",
        staffName: "Aisha",
        at: at(90 * DAY),
        amountMinor: 28_000,
      },
    ],
    notes: [
      {
        publicId: "n1",
        body: "Coco gets anxious with the dryer — hand-dry, low heat.",
        authorName: "Aisha",
        at: at(34 * DAY),
      },
    ],
  },
  "cus-omar": {
    visits: [
      {
        publicId: "v4",
        service: "Bath & tidy",
        staffName: "Mona",
        at: at(27 * DAY),
        amountMinor: 18_000,
      },
      {
        publicId: "v5",
        service: "Bath & tidy",
        staffName: "Mona",
        at: at(55 * DAY),
        amountMinor: 18_000,
      },
      {
        publicId: "v6",
        service: "De-shed treatment",
        staffName: "Aisha",
        at: at(84 * DAY),
        amountMinor: 22_000,
      },
    ],
    notes: [],
  },
  "cus-sara": {
    visits: [
      {
        publicId: "v7",
        service: "Puppy intro groom",
        staffName: "Queenie",
        at: at(12 * DAY),
        amountMinor: 15_000,
      },
    ],
    notes: [
      { publicId: "n2", body: "Prefers morning slots.", authorName: "Queenie", at: at(12 * DAY) },
    ],
  },
  "cus-noura": {
    visits: [
      {
        publicId: "v8",
        service: "Nail trim",
        staffName: "Mona",
        at: at(60 * DAY),
        amountMinor: 6_000,
      },
      {
        publicId: "v9",
        service: "Nail trim",
        staffName: "Mona",
        at: at(95 * DAY),
        amountMinor: 6_000,
      },
    ],
    notes: [],
  },
  "cus-huda": {
    visits: [
      {
        publicId: "v10",
        service: "Full groom",
        staffName: "Aisha",
        at: at(20 * DAY),
        amountMinor: 52_000,
      },
      {
        publicId: "v11",
        service: "Full groom",
        staffName: "Aisha",
        at: at(48 * DAY),
        amountMinor: 52_000,
      },
      {
        publicId: "v12",
        service: "Bath & tidy",
        staffName: "Queenie",
        at: at(77 * DAY),
        amountMinor: 30_000,
      },
    ],
    notes: [
      {
        publicId: "n3",
        body: "Two dogs on one account — Bella (mum's) and Max (Huda's). Ask which one when booking.",
        authorName: "Queenie",
        at: at(20 * DAY),
      },
    ],
  },
  "cus-maryam": {
    visits: [
      {
        publicId: "v13",
        service: "De-shed treatment",
        staffName: "Mona",
        at: at(45 * DAY),
        amountMinor: 22_000,
      },
    ],
    notes: [],
  },
  "cus-fatima-hashimi": {
    visits: [
      {
        publicId: "v14",
        service: "Bath & tidy",
        staffName: "Queenie",
        at: at(90 * DAY),
        amountMinor: 18_000,
      },
    ],
    notes: [],
  },
  "cus-ahmed": {
    visits: [
      {
        publicId: "v15",
        service: "Full groom",
        staffName: "Aisha",
        at: at(400 * DAY),
        amountMinor: 25_000,
      },
    ],
    notes: [],
  },
  "cus-rana": {
    visits: [
      {
        publicId: "v16",
        service: "Nail trim",
        staffName: "Mona",
        at: at(15 * DAY),
        amountMinor: 6_000,
      },
    ],
    notes: [],
  },
  "cus-khalid": {
    visits: [
      {
        publicId: "v17",
        service: "Full groom",
        staffName: "Aisha",
        at: at(40 * DAY),
        amountMinor: 30_000,
      },
    ],
    notes: [],
  },
  "cus-khalid-2": {
    visits: [
      {
        publicId: "v18",
        service: "Bath & tidy",
        staffName: "Queenie",
        at: at(300 * DAY),
        amountMinor: 18_000,
      },
    ],
    notes: [],
  },
}

// ─── What WhatsApp accepts (IX-A6, "file type WhatsApp rejects") ──────────────
// The Cloud API's media rules, as the send is checked before it goes. A file
// outside them is blocked at send with the reason, never silently dropped.

const MB = 1024 * 1024
export const MEDIA_RULES: { kind: MediaKind; mimes: RegExp; maxBytes: number }[] = [
  { kind: "image", mimes: /^image\/(jpeg|png)$/, maxBytes: 5 * MB },
  { kind: "video", mimes: /^video\/(mp4|3gpp)$/, maxBytes: 16 * MB },
  {
    kind: "file",
    mimes:
      /^(application\/pdf|text\/plain|application\/(msword|vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation)|vnd\.ms-(excel|powerpoint)))$/,
    maxBytes: 100 * MB,
  },
]

export type MediaCheck =
  | { ok: true; kind: MediaKind }
  | { ok: false; reason: "type" | "size"; kind: MediaKind | null; maxBytes?: number }

export function checkMedia(file: { type: string; size: number }): MediaCheck {
  const rule = MEDIA_RULES.find((r) => r.mimes.test(file.type))
  if (!rule) return { ok: false, reason: "type", kind: null }
  if (file.size > rule.maxBytes)
    return { ok: false, reason: "size", kind: rule.kind, maxBytes: rule.maxBytes }
  return { ok: true, kind: rule.kind }
}
