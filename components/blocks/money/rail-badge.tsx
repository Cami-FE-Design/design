"use client"

// Which rail a figure came from — DSG-73, G3.
//
// One component, because the money drawer and the account summary both show it
// and they were drifting: the drawer marked the rail, the summary marked the
// custodian its own title line already named, and both used the flat grey
// `secondary` chip, which reads as a disabled control rather than a category.
//
// It marks the RAIL, never the custodian. The card's heading already says who
// holds the money ("Held by Cami"); repeating that in a chip beside it adds
// nothing. What the heading cannot say is which money — online or the card
// machine — and with two custodians that is the fact worth carrying (G3).

import { GlobeIcon, MonitorSmartphoneIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { CamiPayRail } from "@/lib/money/types"

const RAIL: Record<CamiPayRail, { label: string; icon: typeof GlobeIcon }> = {
  // A globe, not the bank building both rails used to share — the money is
  // online, the bank is where it ends up.
  online: { label: "Online", icon: GlobeIcon },
  // The same icon Terminals uses for a card machine, so one device reads the
  // same wherever it appears.
  terminal: { label: "Card machine", icon: MonitorSmartphoneIcon },
}

export function RailBadge({ rail }: { rail: CamiPayRail }) {
  const { label, icon: Icon } = RAIL[rail]
  return (
    // Tone-on-tone rather than grey: this is a category, and a grey chip on a
    // healthy card looks like something switched off.
    <Badge variant="primary-soft">
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
