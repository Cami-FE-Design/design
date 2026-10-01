import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { MOCK_SERVICE_CATALOG } from "@/app/appointments/mock"
import { EditServicePanel } from "@/components/blocks/edit-service-panel"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LocationsProvider } from "@/lib/locations/store"

// Reception's half of SCR-10. Lena Petrov works JVC mornings and Jumeirah
// afternoons, so a JVC booking at 3pm is the clash DW2.4 blocks — and the
// refusal names where she is and until when, because reception is the person
// who has to say "she is at Jumeirah until six". A booking she fits stays as
// it was, and so does a panel with no branch.

// A Tuesday.
const DATE = "2026-10-06"

function panel(startTime: string, staffName: string, locationId?: string) {
  return render(
    <LocationsProvider persist={false}>
      <TooltipProvider>
        <EditServicePanel
          service={{ uid: "s1", catalog: MOCK_SERVICE_CATALOG[0]!, startTime, staffName }}
          onBack={vi.fn()}
          onApply={vi.fn()}
          onDelete={vi.fn()}
          onChangeService={vi.fn()}
          locationId={locationId}
          date={DATE}
        />
      </TooltipProvider>
    </LocationsProvider>,
  )
}

const update = () => screen.getByRole("button", { name: "Update" }) as HTMLButtonElement

describe("a team member who cannot be at this branch is refused, with the reason", () => {
  it("names the other branch and its hours when they are working there", () => {
    panel("15:00", "Lena Petrov", "shampooch-jvc")
    expect(screen.getByRole("alert").textContent).toBe(
      "Lena Petrov is at Shampooch Jumeirah 2pm–6pm. Pick another time or team member.",
    )
    expect(update().disabled).toBe(true)
  })

  it("says they do not work here, a different sentence from a clash", () => {
    panel("11:00", "Marco Rossi", "shampooch-jvc")
    expect(screen.getByRole("alert").textContent).toBe(
      "Marco Rossi doesn’t work at Shampooch JVC. Pick someone who does.",
    )
    expect(update().disabled).toBe(true)
  })

  it("lets the booking through when they are rostered here then", () => {
    panel("11:00", "Lena Petrov", "shampooch-jvc")
    expect(screen.queryByRole("alert")).toBeNull()
    expect(update().disabled).toBe(false)
  })

  it("reads as before when no branch is given", () => {
    panel("15:00", "Lena Petrov")
    expect(screen.queryByRole("alert")).toBeNull()
    expect(update().disabled).toBe(false)
  })
})
