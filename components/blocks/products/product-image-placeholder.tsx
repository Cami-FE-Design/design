import { PackageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const TINTS = [
  "bg-tomato-3 text-tomato-11",
  "bg-blue-3 text-blue-11",
  "bg-pink-3 text-pink-11",
  "bg-lime-3 text-lime-11",
  "bg-gold-3 text-gold-11",
] as const

function hashSeed(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function ProductImagePlaceholder({ seed, className }: { seed: string; className?: string }) {
  const tint = TINTS[hashSeed(seed) % TINTS.length]
  return (
    <div
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center rounded-xl", tint, className)}
    >
      <PackageIcon className="size-1/2" strokeWidth={1.5} />
    </div>
  )
}
