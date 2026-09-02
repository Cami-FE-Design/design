"use client"

// A client or pet row, and the name-match resolution inside it (DSG-84).
//
// The shipped version shows candidate cards labelled with a name and a phone,
// directly under a row that also shows a name and a phone — with nothing saying
// which is which. Maaz's report was exactly this: *"especially Jihad name being
// a duplicate is confusing and I do not understand the logic here."* Both sides
// are labelled here, what matched is stated, and each choice says what it will
// do before it is made.
//
// The third option is drawn but disabled. The confirm call accepts only
// `approve` or `skip`, so "add as a new person" needs a backend change — it is
// on screen because the review has to decide whether to ask for it, and hiding
// it would hide the gap.

import { ChevronDownIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { ClientImportRow, PetImportRow } from "@/lib/imports/client-pet-types"
import { CLIENT_PET_STATUS_COPY } from "@/lib/imports/copy"
import { primaryBlockingIssue } from "@/lib/imports/issues"
import type { RowOverride } from "@/lib/imports/types"
import { cn } from "@/lib/utils"

export const CLIENT_GRID = "3rem 8.5rem minmax(0,1fr) minmax(0,1.1fr) 2.5rem"
export const PET_GRID = "3rem 8.5rem minmax(0,1fr) minmax(0,0.9fr) minmax(0,1.1fr) 2.5rem"

const STATUS = CLIENT_PET_STATUS_COPY

const fullName = (first?: string | null, last?: string | null) =>
  [first, last].filter(Boolean).join(" ") || "No name"

type Props = {
  row: ClientImportRow | PetImportRow
  entity: "clients" | "pets"
  expanded: boolean
  onToggleExpand: () => void
  override: RowOverride
  onOverrideChange: (next: RowOverride) => void
}

export function ClientReviewRow({
  row,
  entity,
  expanded,
  onToggleExpand,
  override,
  onOverrideChange,
}: Props) {
  const pet = "pet" in row ? row.pet : null
  const isReview = row.status === "review"
  const isReject = row.status === "reject"
  const candidates = row.client.nameCandidates ?? []
  const rescuable = isReject && (row.duplicateConflictFields?.length ?? 0) > 0
  const rescued = override.importWithoutDuplicate === true

  // A resolved row is no longer waiting on anyone, so its badge must stop
  // saying so — the products work hit the same bug with a rescued reject.
  const resolvedTo = override.nameMatch
  const status =
    resolvedTo === "approve"
      ? STATUS.update
      : resolvedTo === "skip"
        ? STATUS.skip
        : rescued
          ? STATUS.create
          : STATUS[row.status]

  const detail = isReject
    ? (primaryBlockingIssue(row)?.rowLabel ?? "Can't import")
    : isReview && !resolvedTo
      ? "Same first name as someone you have"
      : resolvedTo === "approve"
        ? "You picked an existing person"
        : resolvedTo === "skip"
          ? "You left this row out"
          : ""

  const sentences = [...(row.errors ?? []), ...(row.warnings ?? [])]
  const hasDetails = sentences.length > 0

  return (
    <div className="border-b border-border/40">
      <div
        className="grid items-center gap-3 px-3 py-2.5 text-sm"
        style={{ gridTemplateColumns: entity === "pets" ? PET_GRID : CLIENT_GRID }}
      >
        <span className="text-xs tabular-nums text-muted-foreground">{row.rowNumber}</span>

        <Badge variant={status.variant} size="md" className="justify-start">
          {status.label}
        </Badge>

        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">
            {fullName(row.client.firstName, row.client.lastName)}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {row.client.phoneE164 ?? "No phone"}
          </span>
        </div>

        {entity === "pets" && (
          <div className="flex min-w-0 flex-col">
            <span className="truncate">{pet?.name ?? "—"}</span>
            <span className="truncate text-xs text-muted-foreground">
              {pet?.speciesName ?? "No species"}
            </span>
          </div>
        )}

        <span
          className={cn(
            "text-sm leading-5",
            isReject && !rescued ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {detail}
        </span>

        {hasDetails ? (
          <button
            type="button"
            aria-label={expanded ? "Hide details" : "Details"}
            aria-expanded={expanded}
            onClick={onToggleExpand}
            className="flex size-7 cursor-pointer items-center justify-center justify-self-end rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronDownIcon
              className={cn("size-4 transition-transform", expanded && "rotate-180")}
            />
          </button>
        ) : (
          <span />
        )}
      </div>

      {/* Name matching. Both sides labelled, and each choice states its effect. */}
      {isReview && candidates.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-sand-6 bg-sand-2 px-3 py-3.5">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">Is this someone you already have?</p>
            <p className="text-sm text-muted-foreground">
              Matched on the first name only — this row has no email, and its phone number is not
              one you have on file.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <div className="flex flex-col gap-1.5 rounded-xl border border-sand-7 bg-background p-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                In your file
              </span>
              <span className="text-sm font-medium text-foreground">
                {fullName(row.client.firstName, row.client.lastName)}
              </span>
              <span className="text-sm text-muted-foreground">
                {row.client.phoneE164 ?? "No phone"}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Already in Cami
              </span>
              <div className="flex flex-col gap-2">
                {candidates.map((c) => {
                  const picked =
                    override.nameMatch === "approve" && override.matchCustomerId === c.customerUuid
                  return (
                    <button
                      key={c.customerUuid}
                      type="button"
                      onClick={() =>
                        onOverrideChange({
                          ...override,
                          nameMatch: "approve",
                          matchCustomerId: c.customerUuid,
                        })
                      }
                      className={cn(
                        "flex cursor-pointer flex-col items-start gap-0.5 rounded-xl border p-3 text-start transition-colors",
                        picked
                          ? "border-cami-violet-8 bg-cami-violet-2"
                          : "border-sand-7 bg-background hover:border-sand-8",
                      )}
                    >
                      <span className="text-sm font-medium text-foreground">
                        {fullName(c.firstName, c.lastName)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {c.phoneE164 ?? c.email ?? "No phone or email"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {picked
                          ? "This row will update this person"
                          : "Use this row to update this person"}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onOverrideChange({ ...override, nameMatch: "skip", matchCustomerId: undefined })
              }
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                override.nameMatch === "skip"
                  ? "border-foreground bg-muted text-foreground"
                  : "border-sand-7 text-muted-foreground hover:border-sand-8 hover:text-foreground",
              )}
            >
              Not any of these — leave the row out
            </button>
            {/* Drawn, not offered: the confirm call has no value for it yet. */}
            <span
              title="Needs a backend change — see DSG-84"
              className="cursor-not-allowed rounded-full border border-dashed border-sand-7 px-3 py-1.5 text-xs text-muted-foreground/60"
            >
              Not any of these — add as a new person
            </span>
          </div>
        </div>
      )}

      {/* A duplicate phone can be imported without it, as a product's barcode can. */}
      {rescuable && (
        <label
          htmlFor={`rescue-${row.rowNumber}`}
          className="flex cursor-pointer items-center gap-2 px-3 pb-3 text-sm text-muted-foreground"
        >
          <Switch
            id={`rescue-${row.rowNumber}`}
            checked={rescued}
            onCheckedChange={(v) => onOverrideChange({ ...override, importWithoutDuplicate: v })}
          />
          Add them without a phone number — you can add one later
        </label>
      )}

      {expanded && sentences.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-sand-6 bg-sand-2 px-3 py-3.5">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            What the checker reported
          </span>
          <ul className="flex flex-col gap-1.5">
            {(row.errors ?? []).map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm leading-5 text-foreground">
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive"
                />
                {s}
              </li>
            ))}
            {(row.warnings ?? []).map((s) => (
              <li
                key={s}
                className="flex items-start gap-2 text-sm leading-5 text-muted-foreground"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cami-yellow-11"
                />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
