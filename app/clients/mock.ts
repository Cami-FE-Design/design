import type { AvatarSpecies } from "@/components/ui/avatar"

export type MockPet = {
  id: string
  name: string
  species: AvatarSpecies
}

export type MockClient = {
  id: string
  name: string
  email?: string
  phone?: string
  /** Photo URL when available; otherwise the character avatar is hashed off id. */
  photoUrl?: string
  pets: MockPet[]
  salesAed: number
  createdAt: string
  /** Tag IDs from `TAG_LIBRARY`. */
  tags?: string[]
}

export const MOCK_CLIENTS: MockClient[] = [
  {
    id: "millie-cassidy",
    name: "Millie Cassidy",
    email: "millie@example.com",
    phone: "+971 58 509 9313",
    pets: [
      { id: "bobo", name: "Bobo", species: "dog" },
      { id: "mochi", name: "Mochi", species: "cat" },
      { id: "kiwi", name: "Kiwi", species: "bird" },
    ],
    salesAed: 1840,
    createdAt: "2026-04-22",
    tags: ["client-vip", "client-loyal"],
  },
  {
    id: "kirsty-dingomal",
    name: "Kirsty Dingomal",
    email: "kirsty.dingomal@hotmail.co.uk",
    phone: "+44 7508 219989",
    pets: [{ id: "biscuit", name: "Biscuit", species: "dog" }],
    salesAed: 0,
    createdAt: "2026-05-10",
  },
  {
    id: "tom-cassidy",
    name: "Tom Cassidy",
    phone: "+971 50 222 1133",
    pets: [
      { id: "bobo", name: "Bobo", species: "dog" },
      { id: "luna", name: "Luna", species: "cat" },
    ],
    salesAed: 320,
    createdAt: "2026-04-22",
  },
  {
    id: "charmaine-hayes",
    name: "Charmaine Hayes",
    email: "charmaine_hayes@icloud.com",
    phone: "+44 7960 969062",
    pets: [],
    salesAed: 0,
    createdAt: "2026-05-10",
  },
  {
    id: "grace-kent",
    name: "Grace Kent",
    phone: "+971 58 566 5998",
    pets: [{ id: "pepper", name: "Pepper", species: "rabbit" }],
    salesAed: 280,
    createdAt: "2026-05-10",
  },
  {
    id: "test-michelle",
    name: "test michelle",
    pets: [],
    salesAed: 0,
    createdAt: "2026-05-10",
  },
  {
    id: "lisa-lyons-wilson",
    name: "Lisa Lyons Wilson",
    email: "lisalyonswilson@gmail.com",
    phone: "+971 54 265 9265",
    pets: [{ id: "ralph", name: "Ralph", species: "dog" }],
    salesAed: 1240,
    createdAt: "2026-05-09",
    tags: ["client-loyal", "client-tipper"],
  },
  {
    id: "amy",
    name: "Amy",
    pets: [
      { id: "tofu", name: "Tofu", species: "cat" },
      { id: "muffin", name: "Muffin", species: "cat" },
    ],
    salesAed: 100,
    createdAt: "2026-05-08",
  },
  {
    id: "nadia-martinez",
    name: "Nadia Martinez",
    email: "nadiamartinezheredia@gmail.com",
    phone: "+971 52 115 6075",
    pets: [],
    salesAed: 0,
    createdAt: "2026-05-07",
  },
  {
    id: "luke",
    name: "Luke",
    phone: "+971 52 155 0516",
    pets: [
      { id: "shadow", name: "Shadow", species: "dog" },
      { id: "rocky", name: "Rocky", species: "dog" },
      { id: "mango", name: "Mango", species: "bird" },
      { id: "ginger", name: "Ginger", species: "cat" },
    ],
    salesAed: 2480,
    createdAt: "2026-05-06",
  },
  {
    id: "violetta",
    name: "Violetta",
    phone: "+971 52 155 0516",
    pets: [],
    salesAed: 0,
    createdAt: "2026-05-05",
  },
  {
    id: "evie-lelliott",
    name: "Evie Lelliott",
    email: "evie_lelliott@hotmail.co.uk",
    phone: "+44 7464 931681",
    pets: [{ id: "olive", name: "Olive", species: "rabbit" }],
    salesAed: 540,
    createdAt: "2026-05-04",
  },
  {
    id: "jamielee-haggerty",
    name: "Jamielee Haggerty",
    phone: "+971 58 550 6552",
    pets: [],
    salesAed: 0,
    createdAt: "2026-05-03",
  },
  {
    id: "frances",
    name: "Frances",
    phone: "+971 58 597 2103",
    pets: [{ id: "duke", name: "Duke", species: "dog" }],
    salesAed: 1400,
    createdAt: "2026-05-02",
    tags: ["client-walk-in"],
  },
  {
    id: "karen-dougall",
    name: "Karen Dougall",
    phone: "+971 54 433 3592",
    pets: [
      { id: "pickle", name: "Pickle", species: "cat" },
      { id: "willow", name: "Willow", species: "dog" },
    ],
    salesAed: 3013,
    createdAt: "2026-05-01",
    tags: ["client-vip", "client-tipper"],
  },
]

export function formatAed(value: number): string {
  if (value === 0) return "AED 0"
  return `AED ${value.toLocaleString("en-US")}`
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
}
