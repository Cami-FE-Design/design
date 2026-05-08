export type WeekDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export const WEEK_DAYS: ReadonlyArray<{ id: WeekDay; short: string; long: string }> = [
  { id: "mon", short: "Mon", long: "Monday" },
  { id: "tue", short: "Tue", long: "Tuesday" },
  { id: "wed", short: "Wed", long: "Wednesday" },
  { id: "thu", short: "Thu", long: "Thursday" },
  { id: "fri", short: "Fri", long: "Friday" },
  { id: "sat", short: "Sat", long: "Saturday" },
  { id: "sun", short: "Sun", long: "Sunday" },
]

export type DaySchedule = { closed: true } | { closed: false; open: string; close: string }

export type WeekSchedule = Record<WeekDay, DaySchedule>

export type PublicService = {
  id: string
  name: string
  description: string
  durationMinutes: number
  priceAed: number
}

export type HeroFeatureAccent = "yellow" | "violet" | "sage" | "pink"

export type HeroFeature = {
  id: string
  eyebrow: string
  title: string
  accent: HeroFeatureAccent
}

export type PublicBusiness = {
  businessName: string
  displayName: string
  slug: string
  logoUrl?: string
  shortDescription?: string
  longDescription?: string
  street: string
  city: string
  emirate: string
  phone: string
  email: string
  categories: ReadonlyArray<string>
  isLive: boolean
  heroEyebrow: string
  heroHeadline: string
  heroHeadlineAccent: string
  heroSubhead: string
  trustBadges: ReadonlyArray<{ id: string; label: string; icon: TrustBadgeIcon }>
  heroFeatures: ReadonlyArray<HeroFeature>
  services: ReadonlyArray<PublicService>
  hours: WeekSchedule
  mapEmbedUrl?: string
  coverUrl?: string
}

export type TrustBadgeIcon = "shield" | "sparkles" | "clock" | "star"

const closed: DaySchedule = { closed: true }
const standardDay: DaySchedule = { closed: false, open: "09:00", close: "19:00" }
const weekendDay: DaySchedule = { closed: false, open: "10:00", close: "18:00" }

const SHAMPOOCH: PublicBusiness = {
  businessName: "Shampooch JVC",
  displayName: "Shampooch",
  slug: "shampooch-jvc",
  logoUrl: "",
  shortDescription: "Boutique grooming for dogs and cats, in the heart of JVC.",
  longDescription:
    "Shampooch JVC is a boutique pet grooming salon offering full-service baths, cuts, and pampering. Our team works with dogs and cats of every size and temperament, and we keep appointments small to give every pet our full attention.",
  street: "Al Ghozlan 4, Jumeirah Village Circle",
  city: "Dubai",
  emirate: "Dubai",
  phone: "+971 50 123 4567",
  email: "hello@shampooch.ae",
  categories: ["grooming", "daycare"],
  isLive: true,
  heroEyebrow: "Trusted pet care",
  heroHeadline: "Premium care for",
  heroHeadlineAccent: "furry friends.",
  heroSubhead:
    "Grooming, wellness, and boarding, with easy online booking and a team that treats your pet like family.",
  trustBadges: [
    { id: "certified", label: "Safe, certified care", icon: "shield" },
    { id: "clean", label: "Clean facility, clear updates", icon: "sparkles" },
    { id: "fast", label: "Booking in under a minute", icon: "clock" },
    { id: "loved", label: "Loved by pet parents", icon: "star" },
  ],
  heroFeatures: [
    { id: "daycare", eyebrow: "Playtime with structure", title: "Daycare", accent: "yellow" },
    { id: "grooming", eyebrow: "Full bath and trim", title: "Grooming", accent: "violet" },
    { id: "boarding", eyebrow: "Overnight stays", title: "Boarding", accent: "sage" },
  ],
  services: [
    {
      id: "bath-small",
      name: "Bath and brush, small dog",
      description: "Shampoo, blow dry, ear clean, nail trim. Up to 10kg.",
      durationMinutes: 60,
      priceAed: 120,
    },
    {
      id: "bath-large",
      name: "Bath and brush, large dog",
      description: "Shampoo, blow dry, ear clean, nail trim. 25kg and above.",
      durationMinutes: 90,
      priceAed: 180,
    },
    {
      id: "full-groom",
      name: "Full groom",
      description: "Bath, hand-scissor cut, paw pads, sanitary trim.",
      durationMinutes: 120,
      priceAed: 260,
    },
    {
      id: "cat-groom",
      name: "Cat grooming",
      description: "Bath, blow dry, sanitary trim. Specialty handling for nervous cats.",
      durationMinutes: 75,
      priceAed: 200,
    },
    {
      id: "daycare-day",
      name: "Daycare, full day",
      description: "Drop-off from 8am, pickup by 7pm. Includes two play sessions.",
      durationMinutes: 660,
      priceAed: 140,
    },
  ],
  hours: {
    mon: standardDay,
    tue: standardDay,
    wed: standardDay,
    thu: standardDay,
    fri: weekendDay,
    sat: weekendDay,
    sun: closed,
  },
  coverUrl:
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1600&q=80",
}

const PURRPALACE: PublicBusiness = {
  businessName: "Purr Palace",
  displayName: "Purr Palace",
  slug: "purr-palace",
  logoUrl: "",
  shortDescription: "Cat-only boarding and daycare in Al Quoz.",
  longDescription:
    "A calm, cat-only environment. No dogs, no shared rooms, no stress. Each guest gets a private suite with a window and quiet hours overnight.",
  street: "Warehouse 14, Al Quoz Industrial 3",
  city: "Dubai",
  emirate: "Dubai",
  phone: "+971 4 555 0199",
  email: "stay@purrpalace.ae",
  categories: ["boarding", "daycare"],
  isLive: true,
  heroEyebrow: "Cats only",
  heroHeadline: "A calm stay for",
  heroHeadlineAccent: "every cat.",
  heroSubhead:
    "Private suites, quiet hours, and one team that knows cats. Book a tour or reserve a stay.",
  trustBadges: [
    { id: "private", label: "Private suites only", icon: "shield" },
    { id: "quiet", label: "Quiet hours overnight", icon: "sparkles" },
    { id: "fast", label: "Booking in under a minute", icon: "clock" },
    { id: "loved", label: "Cat-parent approved", icon: "star" },
  ],
  heroFeatures: [
    { id: "boarding", eyebrow: "Overnight stays", title: "Boarding", accent: "violet" },
    { id: "daycare", eyebrow: "Drop in for the day", title: "Daycare", accent: "sage" },
  ],
  services: [
    {
      id: "stay-standard",
      name: "Standard suite, per night",
      description: "Single private suite with window. Includes two daily check-ins.",
      durationMinutes: 1440,
      priceAed: 180,
    },
    {
      id: "stay-deluxe",
      name: "Deluxe suite, per night",
      description: "Larger private suite with cat tree and view. Includes daily play time.",
      durationMinutes: 1440,
      priceAed: 260,
    },
    {
      id: "daycare",
      name: "Daycare, per day",
      description: "Drop-off from 8am, pickup by 7pm.",
      durationMinutes: 660,
      priceAed: 110,
    },
  ],
  hours: {
    mon: standardDay,
    tue: standardDay,
    wed: standardDay,
    thu: standardDay,
    fri: weekendDay,
    sat: weekendDay,
    sun: weekendDay,
  },
  coverUrl:
    "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=1600&q=80",
}

const NOT_LIVE_PREVIEW: PublicBusiness = {
  ...SHAMPOOCH,
  slug: "draft-business",
  displayName: "Draft Business",
  isLive: false,
}

const businesses: ReadonlyMap<string, PublicBusiness> = new Map([
  [SHAMPOOCH.slug, SHAMPOOCH],
  [PURRPALACE.slug, PURRPALACE],
  [NOT_LIVE_PREVIEW.slug, NOT_LIVE_PREVIEW],
])

export function getPublicBusiness(slug: string): PublicBusiness | undefined {
  return businesses.get(slug)
}

export function listPublicBusinessSlugs(): ReadonlyArray<string> {
  return Array.from(businesses.keys()).filter((slug) => businesses.get(slug)?.isLive)
}

export function getDaySchedule(hours: WeekSchedule, day: WeekDay): DaySchedule {
  return hours[day]
}

export function getDayIdFromDate(date: Date): WeekDay {
  const order: WeekDay[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
  return order[date.getDay()]
}

export function isOpenNow(hours: WeekSchedule, now: Date): boolean {
  const day = getDayIdFromDate(now)
  const schedule = hours[day]
  if (schedule.closed) return false
  const minutes = now.getHours() * 60 + now.getMinutes()
  const [openH, openM] = schedule.open.split(":").map(Number)
  const [closeH, closeM] = schedule.close.split(":").map(Number)
  return minutes >= openH * 60 + openM && minutes < closeH * 60 + closeM
}

export function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(":")
  const h = Number(hStr)
  const m = Number(mStr)
  const suffix = h >= 12 ? "pm" : "am"
  const display = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${display}${suffix}` : `${display}:${mStr}${suffix}`
}

export function formatDayHours(schedule: DaySchedule): string {
  if (schedule.closed) return "Closed"
  return `${formatTime12h(schedule.open)} – ${formatTime12h(schedule.close)}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return h === 1 ? "1 hr" : `${h} hrs`
  return `${h}h ${m}m`
}

export function formatPriceAed(value: number): string {
  return `AED ${value.toLocaleString("en-AE")}`
}
