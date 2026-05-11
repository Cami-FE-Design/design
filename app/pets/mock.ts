import type { AvatarSpecies } from "@/components/ui/avatar"

export type MockPetOwner = {
  id: string
  name: string
  phone?: string
}

export type MockPet = {
  id: string
  name: string
  species: AvatarSpecies
  breed: string
  weight?: string
  owners: MockPetOwner[]
  /** Owner id that drives the family avatar color. Defaults to first owner. */
  familySeed?: string
  /** ISO date string, or undefined if never visited. */
  lastVisitDate?: string
  totalVisits: number
  createdAt: string
}

export const MOCK_PETS: MockPet[] = [
  {
    id: "bobo",
    name: "Bobo",
    species: "dog",
    breed: "French Bulldog",
    weight: "10 lbs",
    owners: [
      { id: "millie-cassidy", name: "Millie Cassidy", phone: "+971 58 509 9313" },
      { id: "tom-cassidy", name: "Tom Cassidy", phone: "+971 50 222 1133" },
    ],
    familySeed: "millie-cassidy",
    lastVisitDate: "2026-04-08",
    totalVisits: 12,
    createdAt: "2025-08-22",
  },
  {
    id: "mochi",
    name: "Mochi",
    species: "cat",
    breed: "Domestic Shorthair",
    weight: "8 lbs",
    owners: [{ id: "millie-cassidy", name: "Millie Cassidy", phone: "+971 58 509 9313" }],
    lastVisitDate: "2026-03-04",
    totalVisits: 6,
    createdAt: "2025-10-11",
  },
  {
    id: "kiwi",
    name: "Kiwi",
    species: "bird",
    breed: "Cockatiel",
    owners: [{ id: "millie-cassidy", name: "Millie Cassidy", phone: "+971 58 509 9313" }],
    lastVisitDate: "2026-02-12",
    totalVisits: 3,
    createdAt: "2025-12-02",
  },
  {
    id: "biscuit",
    name: "Biscuit",
    species: "dog",
    breed: "Poodle",
    owners: [{ id: "kirsty-dingomal", name: "Kirsty Dingomal", phone: "+44 7508 219989" }],
    lastVisitDate: "2026-05-02",
    totalVisits: 8,
    createdAt: "2025-11-14",
  },
  {
    id: "pepper",
    name: "Pepper",
    species: "rabbit",
    breed: "Holland Lop",
    owners: [{ id: "grace-kent", name: "Grace Kent", phone: "+971 58 566 5998" }],
    lastVisitDate: "2026-04-22",
    totalVisits: 4,
    createdAt: "2026-01-18",
  },
  {
    id: "ralph",
    name: "Ralph",
    species: "dog",
    breed: "Labrador",
    weight: "62 lbs",
    owners: [{ id: "lisa-lyons-wilson", name: "Lisa Lyons Wilson", phone: "+971 54 265 9265" }],
    lastVisitDate: "2026-05-05",
    totalVisits: 11,
    createdAt: "2025-09-08",
  },
  {
    id: "tofu",
    name: "Tofu",
    species: "cat",
    breed: "Domestic Longhair",
    owners: [{ id: "amy", name: "Amy" }],
    lastVisitDate: "2026-03-30",
    totalVisits: 5,
    createdAt: "2025-12-22",
  },
  {
    id: "muffin",
    name: "Muffin",
    species: "cat",
    breed: "Persian",
    owners: [{ id: "amy", name: "Amy" }],
    familySeed: "amy",
    lastVisitDate: "2026-03-30",
    totalVisits: 5,
    createdAt: "2025-12-22",
  },
  {
    id: "shadow",
    name: "Shadow",
    species: "dog",
    breed: "German Shepherd",
    weight: "78 lbs",
    owners: [{ id: "luke", name: "Luke", phone: "+971 52 155 0516" }],
    lastVisitDate: "2026-04-15",
    totalVisits: 14,
    createdAt: "2025-07-30",
  },
  {
    id: "rocky",
    name: "Rocky",
    species: "dog",
    breed: "Bulldog",
    weight: "54 lbs",
    owners: [{ id: "luke", name: "Luke", phone: "+971 52 155 0516" }],
    familySeed: "luke",
    lastVisitDate: "2026-04-15",
    totalVisits: 9,
    createdAt: "2025-09-12",
  },
  {
    id: "mango",
    name: "Mango",
    species: "bird",
    breed: "Conure",
    owners: [{ id: "luke", name: "Luke", phone: "+971 52 155 0516" }],
    familySeed: "luke",
    totalVisits: 0,
    createdAt: "2026-05-01",
  },
  {
    id: "olive",
    name: "Olive",
    species: "rabbit",
    breed: "Mini Rex",
    owners: [{ id: "evie-lelliott", name: "Evie Lelliott", phone: "+44 7464 931681" }],
    lastVisitDate: "2026-04-28",
    totalVisits: 6,
    createdAt: "2025-11-02",
  },
  {
    id: "duke",
    name: "Duke",
    species: "dog",
    breed: "Beagle",
    weight: "28 lbs",
    owners: [{ id: "frances", name: "Frances", phone: "+971 58 597 2103" }],
    lastVisitDate: "2026-03-18",
    totalVisits: 7,
    createdAt: "2025-10-25",
  },
  {
    id: "pickle",
    name: "Pickle",
    species: "cat",
    breed: "Scottish Fold",
    owners: [{ id: "karen-dougall", name: "Karen Dougall", phone: "+971 54 433 3592" }],
    lastVisitDate: "2026-04-05",
    totalVisits: 4,
    createdAt: "2025-12-08",
  },
  {
    id: "willow",
    name: "Willow",
    species: "dog",
    breed: "Goldendoodle",
    weight: "48 lbs",
    owners: [{ id: "karen-dougall", name: "Karen Dougall", phone: "+971 54 433 3592" }],
    familySeed: "karen-dougall",
    lastVisitDate: "2026-05-01",
    totalVisits: 10,
    createdAt: "2025-08-30",
  },
]

const SPECIES_LABEL: Record<AvatarSpecies, string> = {
  dog: "Dog",
  cat: "Cat",
  bird: "Bird",
  rabbit: "Rabbit",
  other: "Other",
}

export function speciesLabel(species: AvatarSpecies): string {
  return SPECIES_LABEL[species]
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
}

export function formatRelative(iso?: string): string {
  if (!iso) return "Never"
  const date = new Date(iso)
  const now = new Date("2026-05-11")
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return formatDate(iso)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}
