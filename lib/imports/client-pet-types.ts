// Client and pet bulk-import types — a faithful mirror of the production
// payloads in cami-business (`src/types/client-import.ts`, `src/types/pet-import.ts`),
// reduced to the fields the UI reads. Plain types rather than zod schemas: this
// repo has no backend, so nothing is ever parsed.
//
// Two entities, one shape family. A pet import also creates and updates owners,
// so a pet row *is* a client row with a nullable pet block layered on. That is
// why production renders both through one `ClientPetPreviewRow` — but the two
// previews are not interchangeable: clients report seven counts and create two
// lists, pets report eleven and create eight, and only pets carry a second
// identity per row.
//
// Pets are an account-level feature (`pets_enabled` → `hasPets`). An account
// without it has no pet import at all, and its client import is handed a
// pet-free template. See docs/specs/pets-feature-flag.md.

import type { FieldChanges } from "./types"

/**
 * Client and pet row statuses. Note `review` where products have `flag` — a
 * name-only match the operator has to resolve, which products have no
 * equivalent of.
 */
export type ClientPetRowStatus =
  | "create"
  | "update"
  | "noop"
  /** Matched on name alone. The operator picks a candidate or skips the row. */
  | "review"
  /** Left out by the chosen import mode. */
  | "skip"
  | "reject"

/**
 * How the backend matched the row. `CLIENT_ID`, `PHONE` and `EMAIL` are
 * confident matches applied without asking; `NAME_REVIEW` is a name-only match
 * that needs the operator; `NEW_RECORD` is nobody it recognises.
 *
 * Worth noting for DSG-84's open decision: `NEW_RECORD` exists in this enum, so
 * the backend already models "this is a different person" — but the confirm call
 * has no override that reaches it. The operator can only merge or skip.
 */
export type ClientMatchedBy = "CLIENT_ID" | "PHONE" | "EMAIL" | "NAME_REVIEW" | "NEW_RECORD" | null

/** An existing customer offered as a match for a `review` row. */
export type NameCandidate = {
  customerUuid: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phoneE164?: string | null
}

/** Row-level rejection codes. Only two exist, and both can reach the screen raw
 *  when the backend sends no accompanying sentence — see `issues.ts`. */
export type ClientPetErrorCode = "ERR_MISSING_REQUIRED" | "ERR_INVALID_PHONE"

/** Row-level advisory codes. `FLAG_*` are legacy; the authoritative flagged set
 *  is `flaggedChanges` / `pet.flagged`. */
export type ClientPetWarningCode =
  | "WARN_MISSING_EMAIL"
  | "WARN_INTRAFILE_CLIENT_CONFLICT"
  | "WARN_INTRAFILE_CONFLICT"
  | "FLAG_DOB_CHANGE"
  | "FLAG_MICROCHIP_CHANGE"
  | "FLAG_SPECIES_CHANGE"

/** The owner half of a row. Present on both client and pet imports. */
export type ClientBlock = {
  phoneE164: string | null
  firstName: string | null
  lastName: string | null
  matchedBy: ClientMatchedBy
  matchedCustomerUuid: string | null
  /** Applied automatically on confirm — read-only. */
  fieldChanges?: FieldChanges
  /** Withheld until the operator approves each field. */
  flaggedChanges?: FieldChanges
  /** Present when status is `review` — the existing customers to choose between. */
  nameCandidates?: NameCandidate[]
}

/** The pet half of a row. Pet imports only, and nullable even there. */
export type PetBlock = {
  name: string | null
  speciesName: string | null
  /** The pet's own outcome, which can differ from the owner's. */
  action: ClientPetRowStatus
  matchedPetUuid: string | null
  fieldChanges?: FieldChanges
  flagged?: {
    dob?: { from: unknown; to: unknown }
    microchip?: { from: unknown; to: unknown }
    species?: { from: unknown; to: unknown }
  }
}

export type ClientImportRow = {
  rowNumber: number
  status: ClientPetRowStatus
  /** Sent when the backend has no sentence to offer. Rendered raw today. */
  errorCode?: ClientPetErrorCode | string
  /** Rejection reasons as full sentences, owned by the backend. */
  errors?: string[]
  warnings?: (ClientPetWarningCode | string)[]
  /**
   * Present on a reject caused by an in-file duplicate phone or email belonging
   * to a different person — the row is operator-rescuable, as a product's
   * duplicate barcode is.
   */
  duplicateConflictFields?: ("phone" | "email")[]
  client: ClientBlock
}

/** A pet row is a client row with a pet layered on. */
export type PetImportRow = ClientImportRow & {
  pet?: PetBlock | null
}

/** Counts shared by both previews. */
type SharedCounts = {
  rowCount: number
  normalizedCount: number
  rejectedCount: number
  intraFileConflicts: number
  clientsToCreate: number
  clientsToUpdate: number
  clientsNoChange: number
  clientsToReview: number
  skippedByMode: number
}

/**
 * A client import creates only two lists in the account. It never creates pet
 * lists, whatever the pet feature is set to.
 */
export type ClientLookupsToCreate = {
  clientTags: string[]
  sources: string[]
}

/** A pet import can create eight — the two above plus six pet lists. */
export type PetLookupsToCreate = ClientLookupsToCreate & {
  species: string[]
  breeds: string[]
  coatTypes: string[]
  /** The API's name for colours. */
  appearances: string[]
  reproductiveStatuses: string[]
  petTags: string[]
}

export type ClientImportPreview = SharedCounts & {
  importMode: "UPSERT" | "CREATE_ONLY" | "UPDATE_ONLY"
  lookupsToCreate: ClientLookupsToCreate
  rows: ClientImportRow[]
}

export type PetImportPreview = SharedCounts & {
  importMode: "UPSERT" | "CREATE_ONLY" | "UPDATE_ONLY"
  /** Pet-side counts, on top of the owner counts above. */
  petsToCreate: number
  petsToUpdate: number
  petsNoChange: number
  /** Pets whose owner could not be resolved, created on their own. */
  standalonePets: number
  flaggedCount: number
  lookupsToCreate: PetLookupsToCreate
  rows: PetImportRow[]
}

/** The apply job's result summary for a client import. */
export type ClientApplySummary = {
  clientsCreated: number
  clientsUpdated: number
  clientsSkipped: number
  skippedByMode: number
  /** Rows the operator resolved by skipping a name match. */
  skippedNameReview: number
  rejectedCount: number
  failed: number
  tagsCreated: number
  sourcesCreated: number
}

/** A pet import's summary adds the pet side and the six pet lists. */
export type PetApplySummary = ClientApplySummary & {
  petsCreated: number
  petsUpdated: number
  petsSkipped: number
  standalonePetsCreated: number
  speciesCreated: number
  breedsCreated: number
  coatTypesCreated: number
  appearancesCreated: number
  reproductiveStatusesCreated: number
  petTagsCreated: number
}

/**
 * How the operator resolved a `review` row.
 *
 * `approve` + a customer id merges the row into that customer. `skip` means the
 * row is not imported at all — there is no third value, so two different people
 * who share a name can only be merged or dropped. That gap is DSG-84's open
 * decision, and adding a third value is a backend change.
 */
export type NameMatchResolution = "approve" | "skip"
