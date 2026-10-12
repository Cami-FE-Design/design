import type { HeroFeatureAccent, PublicBusiness } from "@/lib/public-business"
import { cn } from "@/lib/utils"

const featureAccent: Record<HeroFeatureAccent, string> = {
  yellow: "bg-cami-yellow-9",
  violet: "bg-cami-violet-9",
  sage: "bg-cami-sage-9",
  pink: "bg-pink-9",
}

export function PublicCover({ business }: { business: PublicBusiness }) {
  const cover = business.heroFeatures[0]
  const fallbackBg = cover ? featureAccent[cover.accent] : "bg-muted"

  return (
    <div
      className={cn("aspect-square w-full overflow-hidden rounded-2xl lg:aspect-[5/3]", fallbackBg)}
    >
      {business.coverUrl && (
        // biome-ignore lint/performance/noImgElement: V0 mock, swap to next/image when image upload is wired
        <img
          src={business.coverUrl}
          alt={business.displayName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      )}
    </div>
  )
}
