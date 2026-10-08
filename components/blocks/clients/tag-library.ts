import {
  HeartPulseIcon,
  type LucideIcon,
  ScissorsIcon,
  SmileIcon,
  TagIcon,
  UserIcon,
} from "lucide-react"

export type TagCategory = "behavior" | "health" | "service" | "client" | "general"

export const TAG_CATEGORY_ICON: Record<TagCategory, LucideIcon> = {
  behavior: SmileIcon,
  health: HeartPulseIcon,
  service: ScissorsIcon,
  client: UserIcon,
  general: TagIcon,
}

export type TagColor = "violet" | "pink" | "yellow" | "green" | "sage" | "blue" | "tomato" | "gray"

export type TagDef = {
  id: string
  code: string
  label: string
  color: TagColor
  category: TagCategory
}

export const TAG_CATEGORY_LABELS: Record<TagCategory, string> = {
  behavior: "Behavior",
  health: "Health",
  service: "Service",
  client: "Client",
  general: "General",
}

export const TAG_COLOR_CLASS: Record<TagColor, string> = {
  violet: "bg-cami-violet-3 text-cami-violet-11",
  pink: "bg-cami-pink-3 text-cami-pink-11",
  yellow: "bg-cami-yellow-3 text-cami-yellow-11",
  green: "bg-cami-green-3 text-cami-green-11",
  sage: "bg-cami-sage-3 text-cami-sage-11",
  blue: "bg-blue-3 text-blue-11",
  tomato: "bg-tomato-3 text-tomato-11",
  gray: "bg-gray-4 text-gray-12",
}

// Colors carry meaning across the library:
//   tomato = danger / severe risk
//   yellow = caution
//   green  = positive
//   blue   = medical info / cadence
//   violet = premium / signature service
//   sage   = soft neutral / gentler tools
//   gray   = chronic / informational
//   pink   = skin / product-related

export const TAG_LIBRARY: TagDef[] = [
  // Behavior
  { id: "behavior-friendly", code: "Fri", label: "Friendly", color: "green", category: "behavior" },
  {
    id: "behavior-energetic",
    code: "Ene",
    label: "Energetic",
    color: "green",
    category: "behavior",
  },
  { id: "behavior-shy", code: "Shy", label: "Shy", color: "sage", category: "behavior" },
  { id: "behavior-fearful", code: "Fea", label: "Fearful", color: "yellow", category: "behavior" },
  { id: "behavior-nervous", code: "Ner", label: "Nervous", color: "yellow", category: "behavior" },
  { id: "behavior-anxious", code: "Anx", label: "Anxious", color: "yellow", category: "behavior" },
  { id: "behavior-barker", code: "Bar", label: "Barker", color: "yellow", category: "behavior" },
  { id: "behavior-noisy", code: "Noi", label: "Noisy", color: "yellow", category: "behavior" },
  { id: "behavior-biter", code: "Bit", label: "Biter", color: "tomato", category: "behavior" },
  {
    id: "behavior-aggressive",
    code: "Agg",
    label: "Aggressive",
    color: "tomato",
    category: "behavior",
  },

  // Health
  { id: "health-red-flag", code: "Red", label: "Red flag", color: "tomato", category: "health" },
  { id: "health-heart", code: "Hrt", label: "Heart problems", color: "tomato", category: "health" },
  { id: "health-allergies", code: "All", label: "Allergies", color: "pink", category: "health" },
  {
    id: "health-skin-sensitive",
    code: "Ski",
    label: "Skin sensitive",
    color: "pink",
    category: "health",
  },
  {
    id: "health-vaccine-expired",
    code: "Vac",
    label: "Vaccine expired",
    color: "yellow",
    category: "health",
  },
  {
    id: "health-ear-infection",
    code: "Ear",
    label: "Ear infection",
    color: "yellow",
    category: "health",
  },
  {
    id: "health-tooth-decay",
    code: "Too",
    label: "Tooth decay",
    color: "blue",
    category: "health",
  },
  { id: "health-medication", code: "Med", label: "Medication", color: "blue", category: "health" },
  { id: "health-arthritis", code: "Art", label: "Arthritis", color: "gray", category: "health" },
  { id: "health-senior", code: "Sen", label: "Senior pet", color: "gray", category: "health" },
  { id: "health-blind", code: "Bli", label: "Blind", color: "gray", category: "health" },
  { id: "health-deaf", code: "Dea", label: "Deaf", color: "gray", category: "health" },
  {
    id: "health-anal-gland",
    code: "Ana",
    label: "Anal gland issue",
    color: "gray",
    category: "health",
  },

  // Service (grooming)
  { id: "service-4f", code: "4f", label: "#4f blade", color: "violet", category: "service" },
  { id: "service-5f", code: "5f", label: "#5f blade", color: "violet", category: "service" },
  { id: "service-7f", code: "7f", label: "#7f blade", color: "violet", category: "service" },
  { id: "service-10", code: "10", label: "10 blade", color: "violet", category: "service" },
  { id: "service-5c", code: "5C", label: "5C", color: "violet", category: "service" },
  {
    id: "service-1ca",
    code: "1CA",
    label: "1 comb attachment",
    color: "sage",
    category: "service",
  },
  {
    id: "service-2ca",
    code: "2CA",
    label: "2 comb attachment",
    color: "sage",
    category: "service",
  },
  {
    id: "service-3ca",
    code: "3CA",
    label: "3 comb attachment",
    color: "sage",
    category: "service",
  },
  { id: "service-2w", code: "2W", label: "2 weekers", color: "blue", category: "service" },
  { id: "service-4w", code: "4W", label: "4 weekers", color: "blue", category: "service" },
  {
    id: "service-shampoo",
    code: "Sha",
    label: "Special shampoo",
    color: "pink",
    category: "service",
  },
  { id: "service-matted", code: "Mat", label: "Matted", color: "tomato", category: "service" },

  // Client (recency signals like First visit / Lapsed are handled by RecencyBadge, not tags)
  { id: "client-vip", code: "VIP", label: "VIP", color: "violet", category: "client" },
  { id: "client-loyal", code: "Loy", label: "Loyal", color: "violet", category: "client" },
  { id: "client-tipper", code: "Tip", label: "Great tipper", color: "green", category: "client" },
  { id: "client-walk-in", code: "WI", label: "Walk-in", color: "sage", category: "client" },

  // General
  { id: "general-heavy", code: "Hvy", label: "Heavy", color: "gray", category: "general" },
  { id: "general-cologne", code: "Col", label: "Cologne", color: "pink", category: "general" },
]
