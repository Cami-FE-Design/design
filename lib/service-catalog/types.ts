import { z } from "zod"

export const APPOINTMENT_COLORS = [
  { label: "Blue", value: "blue", hex: "#93c5fd" },
  { label: "Purple", value: "purple", hex: "#c4b5fd" },
  { label: "Pink", value: "pink", hex: "#f9a8d4" },
  { label: "Red", value: "red", hex: "#fca5a5" },
  { label: "Orange", value: "orange", hex: "#fdba74" },
  { label: "Yellow", value: "yellow", hex: "#fde047" },
  { label: "Green", value: "green", hex: "#86efac" },
  { label: "Teal", value: "teal", hex: "#5eead4" },
] as const

export type AppointmentColorValue = (typeof APPOINTMENT_COLORS)[number]["value"]

export const ServiceCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  description: z.string().optional(),
  order: z.number(),
  parentId: z.string().nullable().default(null),
  isSystemManaged: z.boolean().default(false),
  slug: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  servicesCount: z.number().default(0),
  merchantId: z.string().optional().nullable(),
})

export type ServiceCategory = z.infer<typeof ServiceCategorySchema>

export const AddCategoryInputSchema = z.object({
  name: z.string().min(1, "Category name is required").max(255),
  color: z.string().default("blue"),
  description: z.string().max(255).optional(),
})

export type AddCategoryInput = z.infer<typeof AddCategoryInputSchema>

/**
 * Maps UI price-type keys → the value the backend expects.
 *   "Fixed"  → sent as "Fixed"
 *   "From"   → sent as "Variable"  (starting-from / variable price)
 *   "Free"   → sent as "Fixed" at price 0  (backend has no "Free" type)
 */
export const PRICE_TYPE_MAP = {
  Fixed: "Fixed",
  From: "Variable",
  Free: "Fixed",
} as const satisfies Record<string, string>

export type PriceType = keyof typeof PRICE_TYPE_MAP

/** Ordered array used for Zod enums and Select item rendering. */
export const PRICE_TYPES = Object.keys(PRICE_TYPE_MAP) as [PriceType, ...PriceType[]]

/** Convert a UI PriceType to the API value. */
export function priceTypeToApi(ui: PriceType): string {
  return PRICE_TYPE_MAP[ui]
}

/** Convert an API priceType + price back to the UI PriceType. */
export function priceTypeFromApi(raw: string | null | undefined, price: number): PriceType {
  if (raw === "Variable") return "From"
  if (price === 0) return "Free"
  return "Fixed"
}

// ── Extra time ─────────────────────────────────────────────────────────────

export const EXTRA_TIME_TYPES = ["processing", "blocked", "extra-servicing"] as const
export type ExtraTimeType = (typeof EXTRA_TIME_TYPES)[number]

export const EXTRA_TIME_META: Record<ExtraTimeType, { label: string; description: string }> = {
  processing: {
    label: "Processing time",
    description:
      "Team member becomes available during processing time. Included in durations shown to clients.",
  },
  blocked: {
    label: "Blocked time",
    description:
      "Team member remains occupied during blocked time. Excluded from durations shown to clients.",
  },
  "extra-servicing": {
    label: "Extra servicing time",
    description:
      "Team member remains occupied during servicing time. Included in durations shown to clients.",
  },
}

export const ExtraTimeSegmentSchema = z.object({
  id: z.string(),
  type: z.enum(EXTRA_TIME_TYPES),
  durationMin: z.number().int().min(5).default(10),
})
export type ExtraTimeSegment = z.infer<typeof ExtraTimeSegmentSchema>

export const DURATION_OPTIONS = [
  { id: 15, value: "15 min" },
  { id: 30, value: "30 min" },
  { id: 45, value: "45 min" },
  { id: 60, value: "1 hr" },
  { id: 75, value: "1 hr 15 min" },
  { id: 90, value: "1 hr 30 min" },
  { id: 105, value: "1 hr 45 min" },
  { id: 120, value: "2 hr" },
  { id: 150, value: "2 hr 30 min" },
  { id: 180, value: "3 hr" },
  { id: 210, value: "3 hr 30 min" },
  { id: 240, value: "4 hr" },
] as const

export type DurationOption = (typeof DURATION_OPTIONS)[number]

/** Format any minute value to a human-readable string (e.g. 75 → "1 hr 15 min"). */
export function formatDurationMin(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min`
  if (m === 0) return h === 1 ? "1 hr" : `${h} hr`
  return `${h} hr ${m} min`
}

export const ServiceVariantUiSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  priceType: z.enum(PRICE_TYPES).default("Fixed"),
  price: z.number().min(0),
  duration: z.number().int().min(0),
  sortOrder: z.number().default(0),
  extraTimes: z.array(ExtraTimeSegmentSchema).default([]),
})

export type ServiceVariantUi = z.infer<typeof ServiceVariantUiSchema>

/**
 * A service bundled inside a combo. Only the identity is carried — the row on
 * the service card needs a count and, on hover, the names; price and duration
 * come from the combo itself.
 */
export const ComboComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type ComboComponent = z.infer<typeof ComboComponentSchema>

/**
 * Combos sit in the same list as single services (the backend returns both
 * from the services endpoint), so the row has to say which it is. Absent means
 * "standard" — only combos ever set this.
 */
export const SERVICE_TYPES = ["standard", "combo"] as const
export type ServiceType = (typeof SERVICE_TYPES)[number]

/**
 * How a combo's components are scheduled when it is booked: back-to-back, or
 * all at once by different team members. Booking has to honour it — a parallel
 * combo whose components are queued in sequence books the wrong slot.
 */
export const COMBO_SCHEDULE_TYPES = ["sequence", "parallel"] as const
export type ComboScheduleType = (typeof COMBO_SCHEDULE_TYPES)[number]

/**
 * How a combo is priced. Unlike a service's PriceType this is about the
 * relationship to the components: charge what they cost ("service"), a flat
 * retail price, a percentage off the sum, or nothing at all. Stored so the
 * builder can be reopened on the same choice rather than guessing it back out
 * of the total.
 */
export const COMBO_PRICE_TYPES = ["service", "custom", "percentage", "free"] as const
export type ComboPriceType = (typeof COMBO_PRICE_TYPES)[number]

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  serviceType: z.enum(SERVICE_TYPES).optional(),
  /** Populated only for `serviceType: "combo"` — the services it bundles. */
  components: z.array(ComboComponentSchema).optional(),
  /** Combos only — how the components are laid out on the calendar. */
  scheduleType: z.enum(COMBO_SCHEDULE_TYPES).optional(),
  /** Combos only — which pricing rule produced `price`. */
  comboPriceType: z.enum(COMBO_PRICE_TYPES).optional(),
  /** Combos only — the percentage off, when `comboPriceType` is "percentage". */
  comboDiscountPercent: z.number().min(0).max(100).optional(),
  categoryId: z.string(),
  categoryName: z.string().nullable().optional(),
  description: z.string().optional(),
  priceType: z.enum(PRICE_TYPES),
  price: z.number().min(0),
  duration: z.number().int().min(0),
  order: z.number(),
  teamMemberIds: z.array(z.string()),
  imageDataUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  variants: z.array(ServiceVariantUiSchema).default([]),
  extraTimes: z.array(ExtraTimeSegmentSchema).default([]),
})

export type Service = z.infer<typeof ServiceSchema>

export const ServiceVariantInputSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, "Variant name is required").max(50),
    description: z.string().max(200).optional(),
    priceType: z.enum(PRICE_TYPES).default("Fixed"),
    price: z
      .number()
      .refine(Number.isFinite, { message: "Price must be a finite number" })
      .min(0)
      .default(0),
    duration: z.number().int().min(0).default(60),
    sortOrder: z.number().int().min(0).default(0),
    extraTimes: z.array(ExtraTimeSegmentSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.priceType !== "Free" && data.price <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Price is required",
        path: ["price"],
      })
    }
  })

export type ServiceVariantInput = z.infer<typeof ServiceVariantInputSchema>

export const AddServiceInputSchema = z
  .object({
    name: z.string().min(1, "Service name is required").max(255),
    categoryId: z.string().min(1, "Category is required"),
    description: z.string().max(1000).optional(),
    priceType: z.enum(PRICE_TYPES).default("Fixed"),
    price: z
      .number()
      .refine(Number.isFinite, { message: "Price must be a finite number" })
      .min(0)
      .default(0),
    duration: z.number().int().min(0).default(60),
    teamMemberIds: z.array(z.string()).default([]),
    sku: z.string().max(20).optional(),
    requirePatchTest: z.boolean().default(false),
    aftercareInstructions: z.boolean().default(false),
    reminderToRebook: z.boolean().default(false),
    costOfService: z
      .number()
      .refine(Number.isFinite, { message: "Price must be a finite number" })
      .min(0)
      .optional(),
    // Base64 data URLs are a stopgap (H4) — max 10 MB file → ~13.4 MB base64.
    // Replace with signed-URL upload when the backend endpoint ships.
    imageDataUrl: z.string().max(14_000_000, "Image too large — use a file under 10 MB").optional(),
    sortOrder: z.number().int().min(0).optional(),
    variants: z.array(ServiceVariantInputSchema).default([]),
    extraTimes: z.array(ExtraTimeSegmentSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.priceType !== "Free" && data.price <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Price is required",
        path: ["price"],
      })
    }
  })

export type AddServiceInput = z.infer<typeof AddServiceInputSchema>

/**
 * What the combo builder submits. A combo is stored as a service with
 * `serviceType: "combo"` — same list, same card — so this is deliberately the
 * subset of a service that a bundle actually has: no variants, no extra time,
 * and a price/duration already resolved from its components and price type.
 */
export const AddComboInputSchema = z.object({
  name: z.string().min(1, "Combo name is required").max(255),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().max(1000).optional(),
  priceType: z.enum(PRICE_TYPES).default("Fixed"),
  price: z.number().min(0).default(0),
  duration: z.number().int().min(0).default(0),
  components: z.array(ComboComponentSchema).min(1, "Add at least one service"),
  scheduleType: z.enum(COMBO_SCHEDULE_TYPES).default("sequence"),
  comboPriceType: z.enum(COMBO_PRICE_TYPES).default("service"),
  comboDiscountPercent: z.number().min(0).max(100).optional(),
})

export type AddComboInput = z.infer<typeof AddComboInputSchema>

// ── API response shapes ────────────────────────────────────────────────────
// These mirror the backend DTOs exactly. Adapter functions in the service
// layer map them to the UI-facing ServiceCategory / Service types above.

const ApiPaginationMetaSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export const ApiCategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  isSystemManaged: z.boolean(),
  merchantId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  servicesCount: z.number().default(0),
  isActive: z.boolean().default(true),
})

export type ApiCategory = z.infer<typeof ApiCategorySchema>

const ApiExtraTimeSchema = z.object({
  type: z.enum(EXTRA_TIME_TYPES),
  durationMin: z.number().int().min(0),
})

export const ApiServiceVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  priceType: z.string().nullable().optional(),
  price: z.string(),
  durationMin: z.number().optional(),
  blockedTimeMin: z.number().optional(),
  extraServicingTimeMin: z.number().optional(),
  processingTimeMin: z.number().optional(),
  sortOrder: z.number().default(0),
  extraTimes: z.array(ApiExtraTimeSchema).default([]),
})

export type ApiServiceVariant = z.infer<typeof ApiServiceVariantSchema>

export const ApiServiceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  serviceType: z.enum(SERVICE_TYPES).optional(),
  components: z.array(ComboComponentSchema).optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  price: z.string(),
  priceType: z.string().nullable().optional(),
  currencyId: z.string().nullable().optional(),
  costOfService: z.union([z.string(), z.number()]).nullable().optional(),
  sku: z.string().nullable().optional(),
  requirePatchTest: z.boolean().optional(),
  aftercareInstructions: z.boolean().optional(),
  reminderToRebook: z.boolean().optional(),
  duration: z.number().optional(),
  durationMin: z.number().optional(),
  blockedTimeMin: z.number().optional(),
  extraServicingTimeMin: z.number().optional(),
  processingTimeMin: z.number().optional(),
  categoryId: z.string().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  merchantId: z.string().nullable().optional(),
  teamMembers: z.array(z.object({ id: z.string() }).passthrough()).optional(),
  variants: z.array(ApiServiceVariantSchema).default([]).optional(),
  extraTimes: z.array(ApiExtraTimeSchema).default([]),
})

export type ApiService = z.infer<typeof ApiServiceSchema>

const apiEnvelope = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    statusCode: z.number(),
    message: z.string().optional(),
    requestId: z.string().optional(),
    timestamp: z.string().optional(),
    data: dataSchema,
  })

const ApiCursorPageSchema = z.object({
  items: z.array(ApiCategorySchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})

export type ApiCursorPage = z.infer<typeof ApiCursorPageSchema>

export const ApiCategoryListEnvelopeSchema = apiEnvelope(ApiCursorPageSchema)

export const ApiCategoryEnvelopeSchema = apiEnvelope(ApiCategorySchema)

// The create-category endpoint returns a raw DB row (not the list shape).
// Fields differ from ApiCategorySchema: uses `uuid` for the stable UUID,
// `nameEn`/`descriptionEn` are not echoed back.
export const ApiCreateCategoryResponseSchema = apiEnvelope(
  z.object({
    id: z.string(),
    merchantId: z.string().nullable().optional(),
    parentId: z.string().nullable().optional(),
    isSystemManaged: z.boolean(),
    slug: z.string(),
    icon: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    sortOrder: z.number().default(0),
    isActive: z.boolean().default(true),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  }),
)
export type ApiCreateCategoryResponse = z.infer<typeof ApiCreateCategoryResponseSchema>

export const ApiServiceListEnvelopeSchema = apiEnvelope(
  z.object({
    items: z.array(ApiServiceSchema),
    nextCursor: z.string().nullable().optional(),
    hasMore: z.boolean().optional(),
    meta: ApiPaginationMetaSchema.optional(),
  }),
)

export const ApiServiceEnvelopeSchema = apiEnvelope(ApiServiceSchema)

export const ApiServiceTeamMemberSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  name: z.string(),
  jobTitle: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
})

export const ApiServiceDetailSchema = ApiServiceSchema.extend({
  teamMembers: z.array(ApiServiceTeamMemberSchema).default([]).optional(),
  variants: z.array(ApiServiceVariantSchema).default([]).optional(),
})

export type ApiServiceDetail = z.infer<typeof ApiServiceDetailSchema>

export const ApiServiceDetailEnvelopeSchema = apiEnvelope(ApiServiceDetailSchema)
