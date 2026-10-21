import { describe, expect, it } from "vitest"

import {
  DEFAULT_TEAM_SELECTION,
  rotaDay,
  scheduledMemberIds,
  teamSelectionLabel,
  visibleMemberIds,
} from "@/lib/team/calendar-team"
import { membersAt } from "@/lib/team/shifts"
import { ROSTER_BLOCKS, ROSTER_LEAVES, ROSTER_MEMBERS, ROSTER_SHIFTS } from "@/lib/team/shifts-mock"

/**
 * BUG-21. Scheduled team reads the rota for the branch and day in view, so it
 * changes with the day rather than freezing a list of names.
 */

const rota = { shifts: ROSTER_SHIFTS, leaves: ROSTER_LEAVES, blocks: ROSTER_BLOCKS }
const JVC = "shampooch-jvc"
const jvcTeam = membersAt(ROSTER_MEMBERS, JVC)

describe("scheduled team", () => {
  it("maps a date to the rota's day", () => {
    expect(rotaDay("2026-05-13")).toBe("wed")
    expect(rotaDay("2026-05-17")).toBe("sun")
  })

  it("leaves out somebody working at another branch that day", () => {
    // Lena works Jumeirah only on Wednesdays.
    expect(scheduledMemberIds(jvcTeam, rota, JVC, "wed").has("lena-petrov")).toBe(false)
  })

  it("keeps somebody in on a split day at this branch", () => {
    expect(scheduledMemberIds(jvcTeam, rota, JVC, "tue").has("lena-petrov")).toBe(true)
  })

  it("leaves out somebody on a full-day leave, shifts or not", () => {
    expect(scheduledMemberIds(jvcTeam, rota, JVC, "thu").has("lena-petrov")).toBe(false)
  })

  it("changes with the day instead of keeping yesterday's people", () => {
    const tue = scheduledMemberIds(jvcTeam, rota, JVC, "tue")
    const wed = scheduledMemberIds(jvcTeam, rota, JVC, "wed")
    const selection = { mode: "scheduled" } as const
    expect(visibleMemberIds(selection, jvcTeam, tue)).toEqual(tue)
    expect(visibleMemberIds(selection, jvcTeam, wed)).toEqual(wed)
    expect(tue).not.toEqual(wed)
  })
})

describe("team button label", () => {
  it("keeps the built labels and names Scheduled team", () => {
    expect(teamSelectionLabel({ mode: "all" }, jvcTeam, new Set())).toBe("All team")
    expect(teamSelectionLabel({ mode: "scheduled" }, jvcTeam, new Set(["tala-odeh"]))).toBe(
      "Scheduled team",
    )
    expect(
      teamSelectionLabel({ mode: "custom", ids: new Set(["priya-nair"]) }, jvcTeam, new Set()),
    ).toBe("Priya Nair")
    expect(
      teamSelectionLabel(
        { mode: "custom", ids: new Set(["priya-nair", "tala-odeh"]) },
        jvcTeam,
        new Set(),
      ),
    ).toBe("2 members")
  })
})

describe("opening the calendar", () => {
  it("opens on Scheduled team", () => {
    expect(DEFAULT_TEAM_SELECTION).toEqual({ mode: "scheduled" })
  })

  it("falls back to All team on a day nobody is scheduled", () => {
    const nobody = new Set<string>()
    expect(visibleMemberIds(DEFAULT_TEAM_SELECTION, jvcTeam, nobody).size).toBe(jvcTeam.length)
    expect(teamSelectionLabel(DEFAULT_TEAM_SELECTION, jvcTeam, nobody)).toBe("All team")
  })
})
