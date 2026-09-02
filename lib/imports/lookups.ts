// The lists an import creates in the account, as one model for all three
// entities (DSG-80 / DSG-84).
//
// Products create brands, categories and suppliers; clients create client tags
// and referral sources; pets create those two plus six of their own. The screen
// treatment is identical, so the entity supplies groups and the shared panel
// renders them — the client screen used to hand-roll its own card, which is how
// "We'll also add 13 new brands and 14 new categories" and "We'll also add 27
// things to your account" ended up on two screens of the same wizard.

import type { ClientImportPreview, PetImportPreview } from "./client-pet-types"
import type { ProductImportPreview } from "./types"

export type LookupGroup = {
  /** Row heading — "Brands", "Client tags". */
  label: string
  /** For the summary line — "13 new brands". */
  singular: string
  plural: string
  names: string[]
}

/** `13 new brands and 14 new categories`. Empty when nothing is created. */
export function describeNewLists(groups: LookupGroup[]): string {
  const parts = groups
    .filter((g) => g.names.length > 0)
    .map((g) => `${g.names.length} new ${g.names.length === 1 ? g.singular : g.plural}`)

  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0]
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`
}

export function productLookupGroups(preview: ProductImportPreview): LookupGroup[] {
  const l = preview.lookupsToCreate
  return [
    { label: "Brands", singular: "brand", plural: "brands", names: l.brands },
    { label: "Categories", singular: "category", plural: "categories", names: l.categories },
    { label: "Suppliers", singular: "supplier", plural: "suppliers", names: l.suppliers },
  ].filter((g) => g.names.length > 0)
}

export function clientPetLookupGroups(
  preview: ClientImportPreview | PetImportPreview,
): LookupGroup[] {
  const l = preview.lookupsToCreate
  const groups: LookupGroup[] = [
    { label: "Client tags", singular: "client tag", plural: "client tags", names: l.clientTags },
    {
      label: "Referral sources",
      singular: "referral source",
      plural: "referral sources",
      names: l.sources,
    },
  ]

  if ("species" in l) {
    groups.push(
      { label: "Species", singular: "species", plural: "species", names: l.species },
      { label: "Breeds", singular: "breed", plural: "breeds", names: l.breeds },
      { label: "Coat types", singular: "coat type", plural: "coat types", names: l.coatTypes },
      { label: "Colours", singular: "colour", plural: "colours", names: l.appearances },
      {
        label: "Reproductive statuses",
        singular: "reproductive status",
        plural: "reproductive statuses",
        names: l.reproductiveStatuses,
      },
      { label: "Pet tags", singular: "pet tag", plural: "pet tags", names: l.petTags },
    )
  }

  return groups.filter((g) => g.names.length > 0)
}
