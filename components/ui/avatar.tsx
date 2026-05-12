"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { BirdIcon, CatIcon, DogIcon, PawPrintIcon, RabbitIcon } from "lucide-react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import type * as React from "react"

import { cn } from "@/lib/utils"

// Soft pastel bg + high-contrast fg pairs from cami brand scales.
// Index is selected deterministically from a hash of the seed.
const PALETTE = [
  { bg: "bg-cami-violet-3", fg: "text-cami-violet-11" },
  { bg: "bg-cami-green-3", fg: "text-cami-green-11" },
  { bg: "bg-cami-sage-3", fg: "text-cami-sage-11" },
  { bg: "bg-cami-yellow-3", fg: "text-cami-yellow-11" },
  { bg: "bg-cami-pink-3", fg: "text-cami-pink-11" },
  { bg: "bg-cami-gray-3", fg: "text-cami-gray-11" },
] as const

// djb2 — small, deterministic, no deps.
function hashString(str: string): number {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) + h + str.charCodeAt(i)
  }
  return Math.abs(h | 0)
}

function pickPalette(seed: string) {
  return PALETTE[hashString(seed) % PALETTE.length]
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]![0]!.toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

// 6 line-art face variants. SVGs use currentColor; consumer sets text color.
// All draw inside a 24x24 viewBox; features fill ~50% of viewBox vertically and
// ~45% horizontally for Mixpanel-style proportions.
const FACE_STROKE = "1.75"
const SMILE = "M7 14c1.5 3 8.5 3 10 0"
const FACES: Array<(props: { className?: string }) => React.ReactElement> = [
  // 0 — peaceful (closed-arc eyes, smile)
  ({ className }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={FACE_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="presentation"
    >
      <path d="M7 9.5c1-1.5 2.5-1.5 3.5 0" />
      <path d="M13.5 9.5c1-1.5 2.5-1.5 3.5 0" />
      <path d={SMILE} />
    </svg>
  ),
  // 1 — open eyes (vertical), smile
  ({ className }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={FACE_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="presentation"
    >
      <path d="M9 9.5v1.5" />
      <path d="M15 9.5v1.5" />
      <path d={SMILE} />
    </svg>
  ),
  // 2 — freckles, smile
  ({ className }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={FACE_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="presentation"
    >
      <path d="M9 9.5v1.5" />
      <path d="M15 9.5v1.5" />
      <path d={SMILE} />
      <circle cx="6" cy="12.5" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="5.4" cy="13.7" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12.5" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="18.6" cy="13.7" r="0.55" fill="currentColor" stroke="none" />
    </svg>
  ),
  // 3 — side-eye (horizontal dashes), smile
  ({ className }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={FACE_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="presentation"
    >
      <path d="M8 10h1.5" />
      <path d="M14.5 10h1.5" />
      <path d={SMILE} />
    </svg>
  ),
  // 4 — raised brow, smile
  ({ className }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={FACE_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="presentation"
    >
      <path d="M9 9.5v1.5" />
      <path d="M15 9.5v1.5" />
      <path d="M13.8 7l2.2-.5" />
      <path d={SMILE} />
    </svg>
  ),
  // 5 — happy smile-shape eyes
  ({ className }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={FACE_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="presentation"
    >
      <path d="M7 10c1 1.5 2.5 1.5 3.5 0" />
      <path d="M13.5 10c1 1.5 2.5 1.5 3.5 0" />
      <path d={SMILE} />
    </svg>
  ),
]

const SPECIES_ICON = {
  dog: DogIcon,
  cat: CatIcon,
  bird: BirdIcon,
  rabbit: RabbitIcon,
  other: PawPrintIcon,
} as const

export type AvatarSpecies = keyof typeof SPECIES_ICON
export type AvatarFallbackVariant = "initials" | "character" | "species"
export type AvatarShape = "circle" | "square"

const avatarVariants = cva(
  // ring-2 ring-background creates a halo that's invisible on a white page but
  // separates the avatar from any colored / muted surface it sits on.
  "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden ring-2 ring-background",
  {
    variants: {
      size: {
        xs: "size-5 text-[9px]",
        sm: "size-7 text-[11px]",
        md: "size-9 text-xs",
        lg: "size-12 text-sm",
        xl: "size-16 text-base",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-xl",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
    },
  },
)

type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>["size"]>

// Character faces tightly fill the circle (~70-90% of container).
// Larger sizes use a higher ratio because the face SVG has padding inside
// its 24x24 viewBox — bumping the inner size keeps the features feeling
// proportional rather than floating inside a big empty rim.
const characterSizeClass: Record<AvatarSize, string> = {
  xs: "size-4",
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
  xl: "size-14",
}

// Species icons (Lucide) need a little breathing room around the glyph;
// bumped from 50-60% toward 65-75% to feel more like the character avatars.
const speciesSizeClass: Record<AvatarSize, string> = {
  xs: "size-3.5",
  sm: "size-5",
  md: "size-6",
  lg: "size-8",
  xl: "size-10",
}

type AvatarProps = {
  src?: string
  alt?: string
  /** Used for initials and as the deterministic hash seed. */
  name?: string
  /** Override the hash seed (e.g. stable user ID). Falls back to `name`. */
  hashSeed?: string
  shape?: AvatarShape
  fallback?: AvatarFallbackVariant
  species?: AvatarSpecies
  size?: AvatarSize
  className?: string
  /** Optional overlay slot — e.g. edit pencil, status dot. Positioned bottom-right by default. */
  children?: React.ReactNode
}

function Avatar({
  src,
  alt,
  name,
  hashSeed,
  shape = "circle",
  fallback = "initials",
  species = "other",
  size = "md",
  className,
  children,
}: AvatarProps) {
  const seed = hashSeed ?? name ?? ""
  const palette = pickPalette(seed)

  return (
    <span data-slot="avatar-wrapper" className="relative inline-flex">
      <AvatarPrimitive.Root
        data-slot="avatar"
        data-shape={shape}
        data-fallback={fallback}
        className={cn(avatarVariants({ size, shape }), palette.bg, palette.fg, className)}
      >
        {src ? (
          <AvatarPrimitive.Image
            data-slot="avatar-image"
            src={src}
            alt={alt ?? name ?? ""}
            className="size-full object-cover"
          />
        ) : null}
        <AvatarPrimitive.Fallback
          data-slot="avatar-fallback"
          // Delay zero so the fallback paints immediately when src is absent or fails.
          delayMs={0}
          className="flex size-full items-center justify-center"
        >
          {fallback === "initials" ? (
            <span className="font-bold leading-none -translate-y-px">
              {getInitials(name ?? "")}
            </span>
          ) : fallback === "character" ? (
            <CharacterFace seed={seed} className={characterSizeClass[size]} />
          ) : (
            <SpeciesIcon species={species} className={speciesSizeClass[size]} />
          )}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {children}
    </span>
  )
}

function CharacterFace({ seed, className }: { seed: string; className?: string }) {
  const Face = FACES[hashString(seed) % FACES.length]!
  return <Face className={className} />
}

function SpeciesIcon({ species, className }: { species: AvatarSpecies; className?: string }) {
  const Icon = SPECIES_ICON[species]
  return <Icon className={className} aria-hidden />
}

export { Avatar, avatarVariants }
