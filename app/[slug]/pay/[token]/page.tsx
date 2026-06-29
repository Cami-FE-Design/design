import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CheckoutFlow } from "@/components/blocks/checkout/checkout-flow"
import { resolveSale } from "@/components/blocks/checkout/mock"
import { getPublicBusiness } from "@/lib/public-business"

type Params = Promise<{ slug: string; token: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const business = getPublicBusiness(slug)
  const title = business ? `Pay ${business.displayName}` : "Payment"
  return {
    title,
    robots: { index: false, follow: false },
  }
}

export default async function PayPage({ params }: { params: Params }) {
  const { slug, token } = await params
  const business = getPublicBusiness(slug)

  if (!business) {
    notFound()
  }

  const sale = resolveSale(token)

  return <CheckoutFlow business={business} sale={sale} />
}
