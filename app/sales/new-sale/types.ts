// Domain + cart types for the "Add to cart" point-of-sale flow (PRO-395).
//
// All money is stored in minor units (fils) and back-calculated for the
// VAT breakdown at render time — see `money()` / `breakdown()` in ./mock.

export type ServiceCategoryId = string
export type ProductCategoryId = string

export type CatalogClient = {
  id: string
  name: string
  phone?: string
  email?: string
  /** Photo wins over the character-avatar fallback when present. */
  photoUrl?: string
  /** Relationship tags shown on the Tip-step client card, e.g. "High spender". */
  tags?: string[]
}

export type ServiceCategory = {
  id: ServiceCategoryId
  label: string
  /** Left-bar accent class in the picker list, e.g. `bg-cami-violet-9`. */
  accent: string
}

export type ServiceItem = {
  id: string
  categoryId: ServiceCategoryId
  name: string
  durationMin: number
  /** Tax-inclusive unit price in fils. */
  priceMinor: number
}

export type ProductCategory = {
  id: ProductCategoryId
  label: string
  /** Display count, e.g. "99+" — large catalogs are not materialised. */
  count: string
}

export type ProductItem = {
  id: string
  categoryId: ProductCategoryId
  name: string
  /** e.g. "300ml" — appended under the product name. */
  size?: string
  /** Tax-inclusive unit price in fils. */
  priceMinor: number
}

export type Staff = {
  id: string
  name: string
}

/** A single service line snapshotted off a source appointment. */
export type AppointmentLine = {
  serviceId: string
  name: string
  durationMin: number
  staffName: string
  priceMinor: number
  /** Non-blocking warnings, e.g. "Team member doesn't provide this service". */
  warnings?: string[]
}

export type AppointmentPetSpecies = "dog" | "cat" | "bird" | "rabbit" | "other"

export type AppointmentPet = {
  name: string
  /** "French Bulldog · 10 lbs" — rendered as the subtitle. */
  breed?: string
  weight?: string
  species?: AppointmentPetSpecies
}

export type AppointmentItem = {
  id: string
  clientId: string
  clientName: string
  /** Start time, "9:00am". */
  start: string
  /** End time, "11:00am". */
  end: string
  /** Venue label shown in the appointment card header. */
  location?: string
  /** Booking status label, e.g. "Booked". */
  status?: string
  /** Pet subject — shown instead of the client on with-pets businesses. */
  pet?: AppointmentPet
  lines: AppointmentLine[]
}

/**
 * A gift card being sold in the cart. `valueMinor` is the face value loaded onto
 * the card; `priceMinor` is what the client pays (they can differ via a
 * discount). Sold gift cards stay inactive until the sale is fully paid.
 */
export type GiftCardDraft = {
  /** Face value loaded onto the card, in fils. */
  valueMinor: number
  /** What the client pays for the card, in fils. */
  priceMinor: number
  /** Expiration period label, e.g. "1 year" or "Never". */
  expiration: string
  /** Issue a specific code rather than an auto-generated one. */
  useCustomCode: boolean
  /** Custom code, used only when `useCustomCode` is set. */
  customCode: string
  /** Not added to the purchasing client's wallet, so it can be gifted on. */
  isGift: boolean
  /** Email the purchasing client their code + redemption instructions. */
  sendEmail: boolean
  /** Team member the sale is attributed to. */
  staffName: string
}

/**
 * A line in the cart. Duplicates of the same source stack as separate lines so
 * each can carry its own staff / quantity (ticket: "Duplicate items").
 */
export type CartLine = {
  /** Unique per line instance — never the source id. */
  uid: string
  kind: "service" | "product" | "gift-card"
  name: string
  /** Tax-inclusive unit price in fils. For gift cards, the price paid. */
  priceMinor: number
  /** Services only. */
  durationMin?: number
  /** Services only — bookable staff name, "Any" by default. */
  staffName?: string
  /** Products only — adjustable with +/-. */
  qty: number
  sourceId: string
  /** Service category id — drives the left accent colour. */
  categoryId?: string
  /** Non-blocking warnings shown as pills under the line. */
  warnings?: string[]
  /** Set when this line was snapshotted from an appointment — one appointment per cart. */
  apptId?: string
  /** Gift-card payload — present only when `kind === "gift-card"`. */
  giftCard?: GiftCardDraft
}

/** Who the cart is for. */
export type ClientAttachment =
  | { type: "none" }
  | { type: "walk-in" }
  | { type: "client"; client: CatalogClient }

/** Which drilldown the left picker is showing. "root" = the category grid. */
export type PickerView = "root" | "appointments" | "services" | "products" | "gift-cards" | "search"
