"use client"

import {
  BedIcon,
  CheckIcon,
  FootprintsIcon,
  GraduationCapIcon,
  HomeIcon,
  LayoutGridIcon,
  ScissorsIcon,
  SparklesIcon,
  StethoscopeIcon,
  SunIcon,
} from "lucide-react"
import { useState } from "react"
import { SetupCard, SetupLayout } from "@/components/blocks/setup-shell"
import { cn } from "@/lib/utils"

type BusinessType = {
  id: string
  label: string
  Icon: typeof ScissorsIcon
}

const types: BusinessType[] = [
  { id: "grooming", label: "Pet grooming", Icon: ScissorsIcon },
  { id: "boarding", label: "Boarding", Icon: HomeIcon },
  { id: "daycare", label: "Daycare", Icon: SunIcon },
  { id: "training", label: "Training", Icon: GraduationCapIcon },
  { id: "veterinary", label: "Veterinary", Icon: StethoscopeIcon },
  { id: "walking", label: "Dog walking", Icon: FootprintsIcon },
  { id: "sitting", label: "Pet sitting", Icon: BedIcon },
  { id: "wellness", label: "Wellness & spa", Icon: SparklesIcon },
  { id: "other", label: "Other", Icon: LayoutGridIcon },
]

export default function SetupTypePage() {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setSelected((curr) => {
      const next = new Set(curr)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <SetupLayout stepIndex={2} prevHref="/setup/about">
      <SetupCard
        title="What does your business offer?"
        description="Pick all that apply. We'll use this to suggest service templates and shape your booking page."
        ctaHref="/setup/location"
        className="lg:grid-cols-[2fr_3fr]"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {types.map(({ id, label, Icon }) => {
            const isSelected = selected.has(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                aria-pressed={isSelected}
                className={cn(
                  "relative flex flex-col items-start gap-3 rounded-xl border border-sand-6 bg-background p-4 text-left transition-colors",
                  isSelected
                    ? "border-transparent bg-cami-gray-2 outline-2 outline-cami-gray-8 -outline-offset-2"
                    : "hover:bg-sand-2",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-2 right-2 inline-flex size-5 items-center justify-center rounded-full",
                    isSelected
                      ? "bg-cami-gray-8 text-white"
                      : "border border-sand-7 text-transparent",
                  )}
                >
                  <CheckIcon className="size-3" />
                </span>
                <Icon className="size-6 text-foreground" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </button>
            )
          })}
        </div>
      </SetupCard>
    </SetupLayout>
  )
}
