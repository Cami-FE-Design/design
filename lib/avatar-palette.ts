// Soft pastel bg + high-contrast fg pairs from the cami brand scales.
// Index is selected deterministically from a hash of the seed (name/id).
// Mirrors the palette in cami-design's `components/ui/avatar.tsx`.

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

export function getAvatarPalette(seed: string) {
  return PALETTE[hashString(seed) % PALETTE.length]
}

/** Returns a combined Tailwind classname string ("bg-... text-...") for an avatar. */
export function getAvatarClasses(seed: string): string {
  const { bg, fg } = getAvatarPalette(seed)
  return `${bg} ${fg}`
}
