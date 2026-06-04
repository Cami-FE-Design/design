import { Avatar } from "@/components/ui/avatar"
import { CLIENTS, HAS_PETS } from "./mock"
import type { AppointmentItem } from "./types"

/**
 * The subject row of an appointment card. On with-pets businesses it shows the
 * pet (species avatar + "breed · weight"); on without-pets businesses it shows
 * the client (character avatar + phone). Matches Figma 2664-23775 / 2686-23931.
 */
export function AppointmentSubject({ appt }: { appt: AppointmentItem }) {
  if (HAS_PETS && appt.pet) {
    const { name, breed, weight, species } = appt.pet
    const subtitle = [breed, weight].filter(Boolean).join(" · ")
    return (
      <div className="flex min-w-0 items-center gap-2">
        <Avatar
          name={name}
          hashSeed={appt.id}
          fallback="species"
          species={species ?? "other"}
          size="sm"
        />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-medium text-foreground text-sm">{name}</span>
          {subtitle ? (
            <span className="truncate text-muted-foreground text-xs">{subtitle}</span>
          ) : null}
        </div>
      </div>
    )
  }

  const phone = CLIENTS.find((c) => c.id === appt.clientId)?.phone
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar name={appt.clientName} hashSeed={appt.clientId} fallback="character" size="sm" />
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-medium text-foreground text-sm">{appt.clientName}</span>
        {phone ? <span className="truncate text-muted-foreground text-xs">{phone}</span> : null}
      </div>
    </div>
  )
}
