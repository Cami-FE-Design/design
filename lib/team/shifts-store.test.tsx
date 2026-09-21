import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { crossBranchClashes } from "@/lib/team/shifts"
import {
  NINE_BRANCH_SHIFTS,
  ROSTER_LEAVES,
  ROSTER_MEMBERS,
  ROSTER_SHIFTS,
} from "@/lib/team/shifts-mock"
import { RotaProvider, useRota } from "@/lib/team/shifts-store"

const JVC = "shampooch-jvc"
const JUMEIRAH = "shampooch-jumeirah"

// `persist: false` throughout: these are the rules, not the storage, and a test
// that wrote to localStorage would leak between cases.
function wrapper({ children }: { children: ReactNode }) {
  return (
    <RotaProvider
      persist={false}
      initialShifts={ROSTER_SHIFTS}
      initialLeaves={ROSTER_LEAVES}
      members={ROSTER_MEMBERS}
    >
      {children}
    </RotaProvider>
  )
}

const windowsAt = (
  shifts: ReadonlyArray<{ memberId: string; locationId: string; day: string; start: string }>,
  memberId: string,
  locationId: string,
  day: string,
) =>
  shifts
    .filter((s) => s.memberId === memberId && s.locationId === locationId && s.day === day)
    .map((s) => s.start)
    .sort()

describe("setDay", () => {
  it("writes to one branch and leaves the other alone", () => {
    // Lena works JVC 09:00–13:00 and Jumeirah 15:00–20:00 on the same Tuesday.
    const { result } = renderHook(() => useRota(), { wrapper })

    act(() => {
      result.current.setDay("lena", JVC, "tue", [{ start: "10:00", end: "12:00" }])
    })

    expect(windowsAt(result.current.shifts, "lena", JVC, "tue")).toEqual(["10:00"])
    // The branch she was not edited at keeps its evening untouched — collapsing
    // the two is how a split-branch day disappears.
    expect(windowsAt(result.current.shifts, "lena", JUMEIRAH, "tue")).toEqual(["15:00"])
  })

  it("clears a day when given no windows, without touching the rest of the week", () => {
    const { result } = renderHook(() => useRota(), { wrapper })

    act(() => {
      result.current.setDay("mariam", JVC, "thu", [])
    })

    expect(windowsAt(result.current.shifts, "mariam", JVC, "thu")).toEqual([])
    expect(windowsAt(result.current.shifts, "mariam", JVC, "wed")).toEqual(["09:00"])
  })
})

describe("clearMemberWeek", () => {
  it("clears this branch only, for a person who works two", () => {
    const { result } = renderHook(() => useRota(), { wrapper })

    act(() => {
      result.current.clearMemberWeek("lena", JVC)
    })

    expect(
      result.current.shifts.filter((s) => s.memberId === "lena" && s.locationId === JVC),
    ).toEqual([])
    // Still rostered where she was not cleared. A label reading "delete all
    // shifts" would have promised otherwise, which is why the menu names the
    // branch.
    expect(
      result.current.shifts.filter((s) => s.memberId === "lena" && s.locationId === JUMEIRAH)
        .length,
    ).toBeGreaterThan(0)
  })

  it("never touches another person", () => {
    const { result } = renderHook(() => useRota(), { wrapper })
    const sara = ROSTER_SHIFTS.filter((s) => s.memberId === "sara").length

    act(() => {
      result.current.clearMemberWeek("lena", JVC)
    })

    expect(result.current.shifts.filter((s) => s.memberId === "sara")).toHaveLength(sara)
  })
})

describe("addLeave", () => {
  it("holds the branch it was entered at, and only that one (DW2.2)", () => {
    const { result } = renderHook(() => useRota(), { wrapper })

    act(() => {
      result.current.addLeave({
        memberId: "sara",
        locationId: JVC,
        type: "Annual leave",
        day: "mon",
        start: "00:00",
        end: "23:30",
        fullDay: true,
      })
    })

    const added = result.current.leaves.filter((l) => l.memberId === "sara" && l.day === "mon")
    expect(added).toHaveLength(1)
    // Provenance, not scope. The leave reaches every branch Sara works; the
    // field records which one entered it, and that is still worth storing.
    expect(added[0]?.locationId).toBe(JVC)
  })

  it("removes by id", () => {
    const { result } = renderHook(() => useRota(), { wrapper })
    const first = result.current.leaves[0]!

    act(() => {
      result.current.removeLeave(first.id)
    })

    expect(result.current.leaves.find((l) => l.id === first.id)).toBeUndefined()
  })
})

describe("setWeek", () => {
  it("replaces only the days the pattern names, at one branch", () => {
    const { result } = renderHook(() => useRota(), { wrapper })

    act(() => {
      result.current.setWeek("omar", JUMEIRAH, [
        { day: "mon", windows: [{ start: "11:00", end: "19:00" }] },
      ])
    })

    expect(windowsAt(result.current.shifts, "omar", JUMEIRAH, "mon")).toEqual(["11:00"])
    // Tuesday's split shift is not in the pattern and survives it.
    expect(windowsAt(result.current.shifts, "omar", JUMEIRAH, "tue")).toEqual(["09:00", "16:00"])
  })
})

describe("reset", () => {
  it("puts the seeded week back", () => {
    const { result } = renderHook(() => useRota(), { wrapper })

    act(() => {
      result.current.clearMemberWeek("lena", JVC)
    })
    expect(result.current.edited).toBe(true)

    act(() => {
      result.current.reset()
    })

    expect(result.current.shifts).toHaveLength(ROSTER_SHIFTS.length)
    expect(result.current.leaves).toHaveLength(ROSTER_LEAVES.length)
    expect(result.current.edited).toBe(false)
  })
})

describe("without a provider", () => {
  it("reads the seed and offers no writes", () => {
    const { result } = renderHook(() => useRota())
    expect(result.current.canEdit).toBe(false)
    // The same estate the provider seeds, so a grid rendered without one reads
    // what it would on the route rather than a smaller world of its own.
    expect(result.current.shifts).toHaveLength(NINE_BRANCH_SHIFTS.length)
    expect(result.current.shifts.length).toBeGreaterThan(ROSTER_SHIFTS.length)
  })
})

describe("what a grant lets you see of another branch", () => {
  it("keeps a clash out of sight when only one of the two branches is granted", () => {
    // Sara is rostered at JVC and Jumeirah over the same Wednesday hours. The
    // grid computes clashes over the shifts a grant reaches, so a manager who
    // holds one branch is never shown the other's rota — and is never blocked
    // by a shift they could not have opened.
    const visible = ROSTER_SHIFTS.filter((s) => s.locationId === JVC)
    expect(crossBranchClashes(visible)).toEqual([])

    const both = ROSTER_SHIFTS.filter((s) => s.locationId === JVC || s.locationId === JUMEIRAH)
    expect(crossBranchClashes(both)).toHaveLength(1)
  })
})

describe("what the time-off form collects", () => {
  it("stores the note, the sign-off and whether it repeats", () => {
    const { result } = renderHook(() => useRota(), { wrapper })

    act(() => {
      result.current.addLeave({
        memberId: "mariam",
        locationId: JVC,
        type: "Training",
        day: "fri",
        start: "09:00",
        end: "12:00",
        fullDay: false,
        repeats: true,
        approved: false,
        note: "Colour course",
      })
    })

    const added = result.current.leaves.find((l) => l.memberId === "mariam")
    // Every control on the form changes something. One that did not would be
    // the dead affordance this screen already had once, in the nav.
    expect(added).toMatchObject({ repeats: true, approved: false, note: "Colour course" })
  })
})
