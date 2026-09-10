import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  PublicBookingFlowLive,
  PublicChainPickerLive,
} from "@/components/blocks/public-branch-live"
import { PublicCover } from "@/components/blocks/public-cover"
import { PublicFooter } from "@/components/blocks/public-footer"
import { PublicTopGradient } from "@/components/blocks/public-top-gradient"
import { branchAsBusiness, listPublicPageSlugs, resolvePublicView } from "@/lib/public-business"

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  // Business slugs as well as branch slugs: /{businessSlug}/book is a real URL
  // people type and share, and it resolves to the picker rather than to
  // nothing.
  return listPublicPageSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const view = resolvePublicView(slug)
  if (!view) {
    return { title: "Page not found", robots: { index: false, follow: false } }
  }
  const name =
    view.kind === "branch"
      ? branchAsBusiness(view.business, view.branch).displayName
      : view.business.displayName
  return {
    title: `Book · ${name}`,
    description: `Book an appointment at ${name}.`,
    robots: { index: false, follow: false },
  }
}

export default async function BookingPage({ params }: { params: Params }) {
  const { slug } = await params
  const view = resolvePublicView(slug)

  if (!view) {
    notFound()
  }

  /**
   * A booking always happens at one branch (R11) — but "no such page" was the
   * wrong way to say so. This URL used to 404, and the 404 told a client the
   * business "may have moved, changed names, or is not yet open for bookings",
   * none of which is true: the chain exists, they simply have not said which
   * branch.
   *
   * So the missing answer is asked for, and the intent is kept: the rows go
   * straight into that branch's flow rather than to its page, because someone
   * at `/{business}/book` has already said what they want to do. Redirecting
   * to the chain page would have dropped that and made them press Book now a
   * second time.
   */
  if (view.kind === "picker") {
    return (
      <main className="relative flex flex-1 justify-center bg-background px-5 py-8 sm:py-12">
        <PublicTopGradient />
        <div className="relative flex w-full max-w-[560px] flex-col gap-8">
          <PublicCover business={view.business} />
          <PublicChainPickerLive business={view.business} branches={view.branches} intent="book" />
          <PublicFooter />
        </div>
      </main>
    )
  }

  // Resolved on the client so the prices are the branch's own, not the
  // business default. See the wrapper's note.
  return <PublicBookingFlowLive business={view.business} branch={view.branch} />
}
