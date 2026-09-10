import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PublicAbout } from "@/components/blocks/public-about"
import { PublicBookingCard } from "@/components/blocks/public-booking-card"
import { PublicBranchPicker } from "@/components/blocks/public-branch-picker"
import { PublicCover } from "@/components/blocks/public-cover"
import { PublicFooter } from "@/components/blocks/public-footer"
import { PublicHours } from "@/components/blocks/public-hours"
import { PublicLocation } from "@/components/blocks/public-location"
import { PublicServices } from "@/components/blocks/public-services"
import { PublicTopGradient } from "@/components/blocks/public-top-gradient"
import { branchAsBusiness, listPublicPageSlugs, resolvePublicView } from "@/lib/public-business"
import { publicMenuForLocation } from "@/lib/public-offering"

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  // Every branch's own page, plus a chain's business page — two entry paths,
  // both static (R15).
  return listPublicPageSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const view = resolvePublicView(slug)
  if (!view) {
    return {
      title: "Page not found",
      robots: { index: false, follow: false },
    }
  }

  // Resolved through branchAsBusiness rather than composed here, so the naming
  // rule lives in one place — including the part that leaves a single-site
  // business alone. Composing it separately titled Purr Palace's only page
  // "Purr Palace Al Quoz".
  const business =
    view.kind === "branch" ? branchAsBusiness(view.business, view.branch) : view.business
  const name = business.displayName
  const title = `${name} · Book online`
  const description = business.shortDescription || business.longDescription?.slice(0, 160) || ""

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://cami.app/${slug}`,
      siteName: "Cami",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function PublicBusinessPage({ params }: { params: Params }) {
  const { slug } = await params
  const view = resolvePublicView(slug)

  if (!view) {
    notFound()
  }

  /**
   * A chain's business page cannot show services, hours or an address, because
   * it does not have one of each — it has N (R15). So it asks where first, and
   * everything branch-shaped moves to the branch page.
   *
   * A branch page renders exactly what a single-site page always did, with the
   * branch's address, hours and menu resolved in. That is why the sections
   * below never learned about branches.
   */
  if (view.kind === "picker") {
    return (
      <main className="relative flex flex-1 justify-center bg-background px-5 py-8 sm:py-12">
        <PublicTopGradient />
        <div className="relative flex w-full max-w-[560px] flex-col gap-8">
          <PublicCover business={view.business} />
          <PublicBranchPicker business={view.business} branches={view.branches} />
          <PublicAbout business={view.business} />
          <PublicFooter />
        </div>
      </main>
    )
  }

  const business = branchAsBusiness(view.business, view.branch)
  // A client who followed a branch link and wants the other branch had no way
  // out of this page — the picker is only reachable from the chain URL they
  // never saw. One line, and only for a chain: a single-site business has
  // nowhere to go and should not be told it has.
  const siblingBranches = view.business.branches.filter(
    (b) => b.isPublished && b.slug !== view.branch.slug,
  )

  return (
    <main className="relative flex flex-1 justify-center bg-background px-5 py-8 sm:py-12">
      <PublicTopGradient />
      <div className="relative w-full max-w-[560px] lg:max-w-[960px]">
        <div className="grid grid-cols-1 gap-8 [grid-template-areas:'cover'_'card'_'about'_'services'_'location'_'hours'] lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-12 lg:[grid-template-areas:'cover_card'_'about_card'_'services_card'_'location_card'_'hours_card']">
          <div className="[grid-area:cover] flex flex-col gap-3">
            <PublicCover business={business} />
            {siblingBranches.length > 0 ? (
              <Link
                href={`/${view.business.slug}`}
                className="self-start text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {siblingBranches.length === 1
                  ? `${view.business.displayName} has another location`
                  : `${view.business.displayName} has ${siblingBranches.length} other locations`}
              </Link>
            ) : null}
          </div>
          <div className="[grid-area:card] lg:sticky lg:top-12 lg:self-start">
            <PublicBookingCard business={business} />
          </div>
          <div className="[grid-area:about]">
            <PublicAbout business={business} />
          </div>
          <div className="[grid-area:services]">
            {/* Grouped by category for a branch of the chain, so the price list
                reads the same way the booking flow does. */}
            <PublicServices
              business={business}
              groups={view.branch.services ? undefined : publicMenuForLocation(view.branch.id)}
            />
          </div>
          <div className="[grid-area:location]">
            <PublicLocation business={business} />
          </div>
          <div className="[grid-area:hours]">
            <PublicHours business={business} />
          </div>
        </div>
        <PublicFooter />
      </div>
    </main>
  )
}
