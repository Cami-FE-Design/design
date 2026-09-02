// Mock previews for the client and pet import (DSG-84).
//
// Shaped from the two reported failures, but with invented names and phone
// numbers — the real files are live account data and stay out of the repo.
// Three facts from them drive these scenarios:
//   · Last Name is empty in every row, and it is mandatory, so it is the cause
//     that blocks a whole file.
//   · Email is empty too, so a phone is the only confident match and a name
//     match is the fallback — which makes name matching common, not rare.
//   · A pet import creates few species (Cat, Dog, Other) but many breeds.
//
// Deterministic by construction: no Math.random, no Date.now.

import type {
  ClientImportPreview,
  ClientImportRow,
  ClientPetRowStatus,
  NameCandidate,
  PetImportPreview,
  PetImportRow,
} from "./client-pet-types"

// ─── Backend sentences, as they arrive ───────────────────────────────────────

const ERR_LAST_NAME = "Last Name is required."
const ERR_INVALID_PHONE = "Phone could not be read as a valid number."
const ERR_SPECIES_REQUIRED = "Species is required for every pet."
const ERR_DUPLICATE_PHONE =
  "Phone duplicates another row in this file that refers to a different person."
const WARN_MISSING_EMAIL = "No email — this client cannot receive email notifications."
const WARN_INTRAFILE_CLIENT = "Another row in this file refers to the same client."

/** A row whose only identifier is a first name. The file's normal case. */
const FIRST_NAMES = [
  "Ahmed",
  "Ali",
  "Aisha",
  "Mohammed",
  "Fatima",
  "Omar",
  "Layla",
  "Yousef",
  "Mariam",
  "Khalid",
  "Noor",
  "Hassan",
  "Sara",
  "Bilal",
  "Huda",
  "Tariq",
  "Amira",
  "Rashid",
  "Salma",
  "Faisal",
]

const PET_NAMES = [
  "Simba",
  "Luna",
  "Coco",
  "Mishmish",
  "Bella",
  "Oreo",
  "Kiki",
  "Teddy",
  "Mocha",
  "Snowy",
  "Milo",
  "Zola",
]

/** Only three species in the reported file, so the list stays short. */
const SPECIES = ["Cat", "Dog", "Other"] as const
const BREEDS = [
  "Persian",
  "Maltese",
  "Shih Tzu",
  "Pomeranian",
  "Golden Retriever",
  "Husky",
  "Poodle",
  "Havanese",
]

const PHONE_BASE = 971500000000

const phoneFor = (index: number) => `+${PHONE_BASE + 1000 + index * 7}`

/** A client row that will import cleanly. */
function clientRow(rowNumber: number, index: number): ClientImportRow {
  return {
    rowNumber,
    status: "create",
    warnings: [WARN_MISSING_EMAIL],
    client: {
      phoneE164: phoneFor(index),
      firstName: FIRST_NAMES[index % FIRST_NAMES.length],
      lastName: null,
      matchedBy: "NEW_RECORD",
      matchedCustomerUuid: null,
    },
  }
}

/** A row blocked because the mandatory Last Name is empty. */
function missingLastNameRow(rowNumber: number, index: number): ClientImportRow {
  return {
    rowNumber,
    status: "reject",
    errors: [ERR_LAST_NAME],
    warnings: [WARN_MISSING_EMAIL],
    client: {
      phoneE164: phoneFor(index),
      firstName: FIRST_NAMES[index % FIRST_NAMES.length],
      lastName: null,
      matchedBy: null,
      matchedCustomerUuid: null,
    },
  }
}

/**
 * A row matched on first name alone. Two candidates, both plausible, neither
 * confirmable — which is the interaction this ticket exists to redesign.
 */
function nameMatchRow(
  rowNumber: number,
  index: number,
  candidates: NameCandidate[],
): ClientImportRow {
  return {
    rowNumber,
    status: "review",
    warnings: [WARN_MISSING_EMAIL],
    client: {
      phoneE164: phoneFor(index),
      firstName: FIRST_NAMES[index % FIRST_NAMES.length],
      lastName: null,
      matchedBy: "NAME_REVIEW",
      matchedCustomerUuid: null,
      nameCandidates: candidates,
    },
  }
}

const candidatesFor = (name: string, index: number): NameCandidate[] => [
  {
    customerUuid: `cust-${index}-a`,
    firstName: name,
    lastName: null,
    phoneE164: `+${PHONE_BASE + 500 + index}`,
  },
  {
    customerUuid: `cust-${index}-b`,
    firstName: name,
    lastName: null,
    email: `${name.toLowerCase()}@example.ae`,
  },
]

// ─── Aya's client import: 100 rows, 79 arrive, 21 need her ───────────────────

function buildAyaClientPreview(): ClientImportPreview {
  const rows: ClientImportRow[] = []
  const blockedAt = new Set([4, 9, 13, 18, 24, 29, 33, 38, 44, 49, 53, 58, 64, 69, 73, 78, 84, 89])
  const reviewAt = new Set([11, 61])

  for (let index = 0; index < 100; index += 1) {
    const rowNumber = index + 2
    if (reviewAt.has(index)) {
      rows.push(
        nameMatchRow(
          rowNumber,
          index,
          candidatesFor(FIRST_NAMES[index % FIRST_NAMES.length], index),
        ),
      )
    } else if (blockedAt.has(index)) {
      rows.push(missingLastNameRow(rowNumber, index))
    } else {
      rows.push(clientRow(rowNumber, index))
    }
  }

  // Two rows share a phone with a different name on it — the second would
  // otherwise overwrite the first person's record.
  rows[7] = {
    ...rows[7],
    status: "reject",
    errors: [ERR_DUPLICATE_PHONE],
    duplicateConflictFields: ["phone"],
  }
  rows[8] = { ...rows[8], warnings: [WARN_MISSING_EMAIL, WARN_INTRAFILE_CLIENT] }

  const count = (s: ClientPetRowStatus) => rows.filter((r) => r.status === s).length

  return {
    importMode: "UPSERT",
    rowCount: rows.length,
    normalizedCount: count("create") + count("update"),
    rejectedCount: count("reject"),
    intraFileConflicts: 1,
    clientsToCreate: count("create"),
    clientsToUpdate: count("update"),
    clientsNoChange: count("noop"),
    clientsToReview: count("review"),
    skippedByMode: count("skip"),
    lookupsToCreate: { clientTags: ["List 4"], sources: [] },
    rows,
  }
}

// ─── The same import on an account with the pet feature off ─────────────────
// Identical shape. It exists so the screen is never designed around pet lists
// an account like this cannot have.

function buildClientNoPetsPreview(): ClientImportPreview {
  const base = buildAyaClientPreview()
  return { ...base, lookupsToCreate: { clientTags: [], sources: ["Walk-in"] } }
}

// ─── Maaz's pet import: 873 rows, 42 blocked, 2 name matches ────────────────

function buildMaazPetPreview(): PetImportPreview {
  const rows: PetImportRow[] = []
  const total = 873
  // 42 blocked, spread through the file rather than clustered.
  const blocked = new Set(Array.from({ length: 42 }, (_, n) => 3 + n * 20))
  const review = new Set([64, 860])
  const noSpecies = new Set([210, 640])

  for (let index = 0; index < total; index += 1) {
    const rowNumber = index + 2
    const species = SPECIES[index % SPECIES.length]
    const petBlock = {
      name: PET_NAMES[index % PET_NAMES.length],
      speciesName: species,
      action: "create" as ClientPetRowStatus,
      matchedPetUuid: null,
    }

    if (review.has(index)) {
      rows.push({
        ...nameMatchRow(
          rowNumber,
          index,
          candidatesFor(FIRST_NAMES[index % FIRST_NAMES.length], index),
        ),
        pet: petBlock,
      })
      continue
    }

    if (noSpecies.has(index)) {
      rows.push({
        ...missingLastNameRow(rowNumber, index),
        errors: [ERR_SPECIES_REQUIRED],
        pet: { ...petBlock, speciesName: null, action: "reject" },
      })
      continue
    }

    if (blocked.has(index)) {
      rows.push({ ...missingLastNameRow(rowNumber, index), pet: { ...petBlock, action: "reject" } })
      continue
    }

    rows.push({ ...clientRow(rowNumber, index), pet: petBlock })
  }

  // One row's phone cannot be read at all.
  rows[120] = {
    ...rows[120],
    status: "reject",
    errors: [ERR_INVALID_PHONE],
  }

  const count = (s: ClientPetRowStatus) => rows.filter((r) => r.status === s).length
  const petsCreating = rows.filter(
    (r) => r.pet?.action === "create" && (r.status === "create" || r.status === "update"),
  ).length

  return {
    importMode: "UPSERT",
    rowCount: rows.length,
    normalizedCount: count("create"),
    rejectedCount: count("reject"),
    intraFileConflicts: 2,
    clientsToCreate: count("create"),
    clientsToUpdate: 0,
    clientsNoChange: 0,
    clientsToReview: count("review"),
    skippedByMode: 0,
    petsToCreate: petsCreating,
    petsToUpdate: 0,
    petsNoChange: 0,
    standalonePets: 0,
    flaggedCount: 0,
    lookupsToCreate: {
      clientTags: ["List 4"],
      sources: [],
      species: [...SPECIES],
      breeds: BREEDS,
      coatTypes: [],
      appearances: [],
      reproductiveStatuses: [],
      petTags: ["Grooming", "Enquiry", "New Client"],
    },
    rows,
  }
}

// ─── A file that is mostly name matches ─────────────────────────────────────
// The reported file produced two, because the account was nearly empty. A
// migration into a populated account produces many, and the design has to hold
// at that volume — that is the ticket's open decision.

function buildManyNameMatchesPreview(): ClientImportPreview {
  const rows: ClientImportRow[] = []
  for (let index = 0; index < 24; index += 1) {
    const rowNumber = index + 2
    rows.push(
      index % 3 === 0
        ? clientRow(rowNumber, index)
        : nameMatchRow(
            rowNumber,
            index,
            candidatesFor(FIRST_NAMES[index % FIRST_NAMES.length], index),
          ),
    )
  }
  const count = (s: ClientPetRowStatus) => rows.filter((r) => r.status === s).length
  return {
    importMode: "UPSERT",
    rowCount: rows.length,
    normalizedCount: count("create"),
    rejectedCount: 0,
    intraFileConflicts: 0,
    clientsToCreate: count("create"),
    clientsToUpdate: 0,
    clientsNoChange: 0,
    clientsToReview: count("review"),
    skippedByMode: 0,
    lookupsToCreate: { clientTags: [], sources: [] },
    rows,
  }
}

// ─── Registry ───────────────────────────────────────────────────────────────

export type ClientPetScenarioId =
  | "aya-clients"
  | "client-no-pets"
  | "maaz-pets"
  | "many-name-matches"

export type ClientPetScenario = {
  id: ClientPetScenarioId
  entity: "clients" | "pets"
  label: string
  note: string
  /** Whether the account has the pet feature on. */
  hasPets: boolean
  preview: ClientImportPreview | PetImportPreview
}

export const CLIENT_PET_SCENARIOS: ClientPetScenario[] = [
  {
    id: "aya-clients",
    entity: "clients",
    label: "Aya's client import (the reported case)",
    note: "100 rows · 79 arrive · 18 blocked for a missing last name · 1 duplicate phone · 2 name matches.",
    hasPets: true,
    preview: buildAyaClientPreview(),
  },
  {
    id: "client-no-pets",
    entity: "clients",
    label: "Client import, pet feature off",
    note: "The same file on an account without pets. Nothing pet-related may appear anywhere on this screen.",
    hasPets: false,
    preview: buildClientNoPetsPreview(),
  },
  {
    id: "maaz-pets",
    entity: "pets",
    label: "Maaz's pet import (the reported case)",
    note: "873 rows · 826 arrive · 45 blocked · 2 name matches. Eleven counts, and eight lists created in the account.",
    hasPets: true,
    preview: buildMaazPetPreview(),
  },
  {
    id: "many-name-matches",
    entity: "clients",
    label: "Mostly name matches",
    note: "16 of 24 rows matched an existing customer on first name alone — the volume the reported file would have produced in a populated account.",
    hasPets: true,
    preview: buildManyNameMatchesPreview(),
  },
]

export const DEFAULT_CLIENT_PET_SCENARIO: ClientPetScenarioId = "aya-clients"

export function getClientPetScenario(id: ClientPetScenarioId): ClientPetScenario {
  return CLIENT_PET_SCENARIOS.find((s) => s.id === id) ?? CLIENT_PET_SCENARIOS[0]
}
