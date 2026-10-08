import { ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type AuthMarketingPanelProps = {
  className?: string
  imageSrc?: string
  imageAlt?: string
}

export function AuthMarketingPanel({
  className,
  imageSrc,
  imageAlt = "",
}: AuthMarketingPanelProps) {
  return (
    <aside
      data-slot="auth-marketing-panel"
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl bg-cami-violet-8",
        className,
      )}
    >
      {imageSrc ? (
        // biome-ignore lint/performance/noImgElement: hero image, may be cross-origin
        <img src={imageSrc} alt={imageAlt} className="absolute inset-0 size-full object-cover" />
      ) : (
        <ImageIcon aria-hidden className="size-12 text-white/60" />
      )}
    </aside>
  )
}
