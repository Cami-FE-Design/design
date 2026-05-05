import { redirect } from "next/navigation"

export default async function BusinessSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/admin/businesses?business=${encodeURIComponent(slug)}`)
}
