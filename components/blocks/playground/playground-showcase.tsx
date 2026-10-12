"use client"

import { BlocksLane } from "@/components/blocks/playground/blocks-lane"
import { BusinessLane } from "@/components/blocks/playground/business-lane"
import { DetailViewsLane } from "@/components/blocks/playground/detail-views-lane"
import { HqLane } from "@/components/blocks/playground/hq-lane"
import { PrimitivesLane } from "@/components/blocks/playground/primitives-lane"
import { TooltipProvider } from "@/components/ui/tooltip"

// /playground, one file per lane. A new section goes in the lane it belongs
// to; the sidebar and search pick it up from its <Section> on their own.
export function PlaygroundShowcase() {
  return (
    <TooltipProvider delayDuration={100}>
      <PrimitivesLane />
      <BlocksLane />
      <DetailViewsLane />
      <BusinessLane />
      <HqLane />
    </TooltipProvider>
  )
}
