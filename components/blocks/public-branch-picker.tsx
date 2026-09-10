import { ChevronRightIcon, MapPinIcon } from "lucide-react"
import Link from "next/link"
import type { WeekSchedule } from "@/lib/locations/hours"
import { type LocationContact, locationContact, locationHours } from "@/lib/locations/mock"
import {
  formatDayHours,
  getDayIdFromDate,
  isOpenNow,
  type PublicBranch,
  type PublicBusiness,
} from "@/lib/public-business"

/**
 * SCR-08 · The branch picker on a chain's public page (R15, GB3.1).
 *
 * A chain has one page that asks where, and N branch links that do not. This
 * is the first; the second is `/{branchSlug}`, which skips it because the
 * client already stated the branch by following that link (GB3.2). Neither
 * path guesses, which is R11 satisfied two ways rather than once.
 *
 * ## Location first, and why
 *
 * Entry order was left open for design to settle with the booking page (PRD
 * §16, BRD open decisions). This picks **location first**, for three reasons:
 *
 * 1. Price, duration and whether a service exists at all are per branch (R06).
 *    Service first means listing a union across branches and showing a price
 *    that is a range or simply wrong until a branch is chosen.
 * 2. The client who already knows what they want has a better door: the
 *    branch's own link, which is what a branch actually shares. So this page's
 *    job is the *undecided* client, and what they are undecided about is where.
 * 3. A chain's demand is geographic. Noor picks the branch near her, then
 *    picks a service — not the reverse.
 *
 * Service-first is a later additive, not a blocker: a "find a service" entry
 * that then narrows to the branches offering it. It needs per-branch
 * availability to be real first, otherwise it lists branches that cannot take
 * the booking.
 *
 * ## Only published branches appear
 *
 * A suspended branch's booking page is hidden (SU1.5) and an archived one takes
 * no writes (R12), so neither is listed — not greyed out, not "unavailable".
 * Offering a client a place they cannot book is worse than not mentioning it.
 */
export function PublicBranchPicker({
  business,
  branches,
  now = new Date(),
  intent = "view",
  hoursFor = locationHours,
  contactFor = locationContact,
}: {
  business: PublicBusiness
  branches: ReadonlyArray<PublicBranch>
  /** Injectable so the demo and any test can pin "open now". */
  now?: Date
  /**
   * Where a branch's hours come from. Defaults to the seed, which is all a
   * server render has; the chain page passes the store's resolver so a row
   * shows the hours an operator has actually saved.
   */
  hoursFor?: (branchId: string) => WeekSchedule | undefined
  /**
   * Where a branch's name and street come from. Same default and same reason as
   * `hoursFor`: the seed for a server render, the store for a client one, so a
   * row shows the address an operator has actually saved.
   */
  contactFor?: (branchId: string) => LocationContact | undefined
  /**
   * What the client came to do. `book` sends each row straight into that
   * branch's booking flow instead of its page — a client who arrived at
   * `/{business}/book` has already said they want to book, and making them
   * pass through the branch page to press Book now again drops that.
   */
  intent?: "view" | "book"
}) {
  return (
    <section id="locations" aria-labelledby="locations-heading" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 id="locations-heading" className="text-base font-semibold text-foreground">
          {intent === "book" ? "Choose a location to book" : "Choose a location"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {business.displayName} has {branches.length} locations. Each one has its own team, hours
          and prices.{intent === "book" ? " Pick the one you want to book at." : ""}
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {branches.map((branch) => {
          // Resolved from the branch's own record, like the branch page does —
          // so the hours a client compares are the hours an operator set.
          const contact = contactFor(branch.id)
          const branchName = branch.name ?? contact?.name ?? ""
          const street = branch.street ?? contact?.street
          const hours = branch.hours ?? hoursFor(branch.id)
          const today = hours ? formatDayHours(hours[getDayIdFromDate(now)]) : null
          const open = hours ? isOpenNow(hours, now) : false
          return (
            <li key={branch.slug}>
              <Link
                href={intent === "book" ? `/${branch.slug}/book` : `/${branch.slug}`}
                className="group flex items-center gap-3 rounded-2xl border border-border/60 p-4 transition-colors hover:bg-foreground/[0.03]"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                  <MapPinIcon className="size-4" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-foreground group-hover:text-cami-violet-9">
                    {business.displayName} {branchName}
                  </span>
                  {street ? (
                    <span className="truncate text-xs text-muted-foreground">{street}</span>
                  ) : null}
                  <span className="text-xs text-muted-foreground">
                    {/* Today's hours, not the week: a client choosing a branch
                        now is asking whether they can go now. */}
                    {open ? (
                      <span className="font-medium text-cami-green-11">Open now</span>
                    ) : (
                      <span>Closed now</span>
                    )}
                    {today ? (
                      <>
                        <span aria-hidden> · </span>
                        <span>{today}</span>
                      </>
                    ) : null}
                  </span>
                </span>
                <ChevronRightIcon
                  className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
                  aria-hidden
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
