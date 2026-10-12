import { formatSessionsRemaining } from "@/lib/packages/allocate"

/**
 * What is left on the package that just paid for this line.
 *
 * The built product's chip (DZ-260 replaced a static "Included in membership"
 * with it), and the reason it counts rather than asserting: a client asking
 * "how many have I got left" is asking at the counter, on the line they are
 * paying for, and a chip that says only "included" sends reception to another
 * screen to answer it.
 *
 * Drawn in the package's own colour so two packages on one cart are told apart
 * without reading either. The colour is the package's, not a status colour —
 * nothing here is a warning.
 */
export function SessionsRemainingChip({
  colour,
  sessionsRemaining,
  sessionsTotal,
}: {
  colour: string
  sessionsRemaining: number | null
  sessionsTotal: number | null
}) {
  return (
    <span
      className="mt-1 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        border: `1px solid ${colour}`,
        backgroundColor: `${colour}26`,
        color: colour,
      }}
    >
      {formatSessionsRemaining({ sessionsRemaining, sessionsTotal })}
    </span>
  )
}
