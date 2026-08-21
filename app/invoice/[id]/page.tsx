import type { Metadata } from "next"
import { InvoiceLinkView } from "./invoice-link-view"

type Params = Promise<{ id: string }>

export const metadata: Metadata = {
  title: "Invoice",
  // A customer-facing financial document must never be indexed, same as the
  // payment link at /[slug]/pay/[token].
  robots: { index: false, follow: false },
}

export default async function InvoicePage({ params }: { params: Params }) {
  const { id } = await params
  return <InvoiceLinkView id={id} />
}
