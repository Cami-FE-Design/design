import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PublicAbout } from "@/components/blocks/public-about"
import { PublicBookingCard } from "@/components/blocks/public-booking-card"
import { PublicCover } from "@/components/blocks/public-cover"
import { PublicFooter } from "@/components/blocks/public-footer"
import { PublicHours } from "@/components/blocks/public-hours"
import { PublicLocation } from "@/components/blocks/public-location"
import { PublicServices } from "@/components/blocks/public-services"
import { PublicTopGradient } from "@/components/blocks/public-top-gradient"
import { getPublicBusiness, listPublicBusinessSlugs } from "@/lib/public-business"

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return listPublicBusinessSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const business = getPublicBusiness(slug)
  if (!business || !business.isLive) {
    return {
      title: "Page not found",
      robots: { index: false, follow: false },
    }
  }

  const title = `${business.displayName} · Book online`
  const description = business.shortDescription || business.longDescription?.slice(0, 160) || ""

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://cami.app/${business.slug}`,
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
  const business = getPublicBusiness(slug)

  if (!business || !business.isLive) {
    notFound()
  }

  return (
    <main className="relative flex flex-1 justify-center bg-background px-5 py-8 sm:py-12">
      <PublicTopGradient />
      <div className="relative w-full max-w-[560px] lg:max-w-[960px]">
        <div
          className="grid grid-cols-1 gap-8 [grid-template-areas:'cover'_'card'_'about'_'services'_'location'_'hours'] lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-12 lg:[grid-template-areas:'cover_card'_'about_card'_'services_card'_'location_card'_'hours_card']"
        >
          <div className="[grid-area:cover]">
            <PublicCover business={business} />
          </div>
          <div className="[grid-area:card] lg:sticky lg:top-12 lg:self-start">
            <PublicBookingCard business={business} />
          </div>
          <div className="[grid-area:about]">
            <PublicAbout business={business} />
          </div>
          <div className="[grid-area:services]">
            <PublicServices business={business} />
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
