import type { PublicBusiness } from "@/lib/public-business"

export function PublicAbout({ business }: { business: PublicBusiness }) {
  if (!business.longDescription) return null

  return (
    <section aria-labelledby="about-heading" className="flex flex-col gap-3">
      <h2 id="about-heading" className="text-base font-semibold text-foreground">
        About
      </h2>
      <p className="text-sm leading-6 whitespace-pre-line text-muted-foreground">
        {business.longDescription}
      </p>
    </section>
  )
}
