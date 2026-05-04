import type * as React from "react"
import { cn } from "@/lib/utils"

type CamiMarkProps = React.ComponentProps<"svg"> & {
  /** Pixel size of the square. Default 20 to match the existing brand pill. */
  size?: number
}

/**
 * Cami logomark. Yellow rounded square (cami-yellow-3) with the violet C glyph
 * (cami-violet-9). Brand colors are intentionally hardcoded so the mark looks
 * the same across light/dark and across the cami-sage / sand backgrounds.
 */
export function CamiMark({ size = 20, className, ...props }: CamiMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect width="32" height="32" rx="4" fill="#F8F96C" />
      <path
        d="M24.2767 5.0225C25.7998 5.21705 26.9771 6.51783 26.9773 8.09458C26.9773 9.6715 25.7999 10.9725 24.2767 11.1671V11.1879H23.3953L18.0472 11.1858H15.9847C12.5469 11.1858 10.7525 12.6769 10.7525 16.0754C10.7526 19.4739 12.5469 20.9645 15.9847 20.9645L18.0472 20.9633H23.3945L23.3957 20.9645H24.2419V20.9743C25.765 21.1643 26.9424 22.4344 26.9425 23.9742C26.9425 25.5141 25.7651 26.7841 24.2419 26.9741V27H15.9847C9.18536 27 5.02271 23.1429 5.02271 16.038C5.02282 8.93319 9.18545 5 15.9847 5H24.2767V5.0225Z"
        fill="#362A82"
      />
    </svg>
  )
}
