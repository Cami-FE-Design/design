"use client"

import { AlertTriangleIcon, CalendarIcon, MapPinIcon, RotateCwIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { EmptyState } from "@/components/blocks/shared/empty-state"
import { Avatar, type AvatarSpecies } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  type ClientSummaryHistory,
  readClientSummaryHistory,
  type SummaryVisit,
} from "@/lib/client-summary/mock"
import { formatMoneyWhole } from "@/lib/money/format"
import type { PetNoteCategoryId } from "@/lib/pet-notes"
import { cn } from "@/lib/utils"

// `ClientSummary` (FND-4): a display-only client view owned by the customer
// side. A host passes what it already has as initial data and the card reads
// the rest. It imports nothing from its hosts and computes no business rule.

type Lang = "en" | "ar"

/** What a host already holds, painted before anything loads (FND-4). */
export type ClientSummaryInitial = {
  customerId: string
  name: string
  /** Already formatted for display. */
  phone: string
  pets: { name: string; species: AvatarSpecies; breed: string }[]
  lastService: { name: string; at: string } | null
  archived: boolean
  /** Set when the client's home location is another one. */
  homeLocation: string | null
}

const COPY = {
  en: {
    archived: "Archived",
    atLocation: (loc: string) => `Client at ${loc}`,
    pets: "Pets",
    petNoteLabels: {
      allergies: "Allergies",
      behavior: "Behavior",
      medical: "Medical",
      handling: "Handling",
      "grooming-sensitivity": "Grooming sensitivity",
      other: "Other",
    } satisfies Record<PetNoteCategoryId, string>,
    viewProfile: "View profile",
    upcoming: "Upcoming",
    appointments: "Last visits",
    notes: "Client notes",
    noAppointments: "No appointments yet",
    visitsError: "Couldn't load visits",
    retry: "Try again",
    today: "Today",
    tomorrow: "Tomorrow",
    yesterday: "Yesterday",
    inDays: (n: number) => `In ${n} days`,
    inWeeks: (n: number) => (n === 1 ? "In 1 week" : `In ${n} weeks`),
    daysAgo: (n: number) => `${n} days ago`,
    weeksAgo: (n: number) => (n === 1 ? "1 week ago" : `${n} weeks ago`),
    monthsAgo: (n: number) => (n === 1 ? "1 month ago" : `${n} months ago`),
  },
  ar: {
    archived: "مؤرشف",
    atLocation: (loc: string) => `عميل في ${loc}`,
    pets: "الحيوانات الأليفة",
    petNoteLabels: {
      allergies: "الحساسية",
      behavior: "السلوك",
      medical: "حالة طبية",
      handling: "طريقة التعامل",
      "grooming-sensitivity": "حساسية العناية",
      other: "أخرى",
    } satisfies Record<PetNoteCategoryId, string>,
    viewProfile: "عرض الملف",
    upcoming: "القادمة",
    appointments: "آخر الزيارات",
    notes: "ملاحظات العميل",
    noAppointments: "لا توجد مواعيد بعد",
    visitsError: "تعذّر تحميل الزيارات",
    retry: "حاول مرة أخرى",
    today: "اليوم",
    tomorrow: "غدًا",
    yesterday: "أمس",
    inDays: (n: number) => `بعد ${n} أيام`,
    inWeeks: (n: number) => (n === 1 ? "بعد أسبوع" : `بعد ${n} أسابيع`),
    daysAgo: (n: number) => `قبل ${n} أيام`,
    weeksAgo: (n: number) => (n === 1 ? "قبل أسبوع" : `قبل ${n} أسابيع`),
    monthsAgo: (n: number) => (n === 1 ? "قبل شهر" : `قبل ${n} أشهر`),
  },
} as const
type Copy = (typeof COPY)[Lang]

const DAY = 24 * 60 * 60 * 1000
/** p95 budget for the visits read (FND-2), and a slow read for the demo. */
const LATENCY_MS = 450
const SLOW_MS = 3000

type HistoryState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; history: ClientSummaryHistory }

function useHistory(customerId: string, now: number, simulate: "slow" | "error" | undefined) {
  const [state, setState] = useState<HistoryState>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)
  // biome-ignore lint/correctness/useExhaustiveDependencies: `now` ticks; read again only on a new client or retry
  useEffect(() => {
    setState({ status: "loading" })
    const id = window.setTimeout(
      () => {
        if (simulate === "error" && attempt === 0) return setState({ status: "error" })
        setState({ status: "ready", history: readClientSummaryHistory(customerId, now) })
      },
      simulate === "slow" ? SLOW_MS : LATENCY_MS,
    )
    return () => window.clearTimeout(id)
  }, [customerId, simulate, attempt])
  return { state, retry: () => setAttempt((a) => a + 1) }
}

function relativeDay(iso: string, now: number, copy: Copy) {
  const days = Math.round((Date.parse(iso) - now) / DAY)
  if (days === 0) return copy.today
  if (days === 1) return copy.tomorrow
  if (days === -1) return copy.yesterday
  if (days > 0) return days < 7 ? copy.inDays(days) : copy.inWeeks(Math.round(days / 7))
  const ago = -days
  if (ago < 14) return copy.daysAgo(ago)
  if (ago < 63) return copy.weeksAgo(Math.round(ago / 7))
  return copy.monthsAgo(Math.round(ago / 30))
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 p-4">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  )
}

function Card({ children, busy }: { children: React.ReactNode; busy?: boolean }) {
  return (
    <div
      className="flex flex-col rounded-2xl border border-border/60 bg-card [&>*]:px-4"
      aria-busy={busy || undefined}
    >
      {children}
    </div>
  )
}

/** Team members get initials, never the client character face. */
function StaffAvatar({ name }: { name: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span role="img" aria-label={name} className="inline-flex shrink-0">
          <Avatar size="xs" fallback="initials" name={name} hashSeed={name} />
        </span>
      </TooltipTrigger>
      <TooltipContent>{name}</TooltipContent>
    </Tooltip>
  )
}

/** "Tomorrow · 25 Sept", "5 weeks ago · 21 Aug": one color, one line. */
function DayLabel({
  iso,
  now,
  copy,
  shortDate,
}: {
  iso: string
  now: number
  copy: Copy
  shortDate: (iso: string) => string
}) {
  return (
    <span className="text-xs font-medium text-muted-foreground">
      {relativeDay(iso, now, copy)} · {shortDate(iso)}
    </span>
  )
}

function VisitGroup({
  visit,
  now,
  copy,
  shortDate,
}: {
  visit: SummaryVisit
  now: number
  copy: Copy
  shortDate: (iso: string) => string
}) {
  return (
    <div className="flex flex-col gap-2 py-3">
      <DayLabel iso={visit.at} now={now} copy={copy} shortDate={shortDate} />
      <ul className="flex flex-col gap-2">
        {visit.lines.map((l, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: lines have no id and never reorder
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="flex h-5 items-center">
              <StaffAvatar name={l.staffName} />
            </span>
            {/* A long service name wraps, then clamps; the price keeps its column. */}
            <span className="line-clamp-2 min-w-0 flex-1 text-foreground" title={l.service}>
              {l.service}
            </span>
            <bdi dir="ltr" className="shrink-0 tabular-nums text-foreground">
              {formatMoneyWhole(l.amountMinor)}
            </bdi>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ClientSummary({
  initial,
  hasPets,
  now,
  lang = "en",
  timeZone,
  simulate,
  onViewProfile,
  className,
}: {
  /** The host opens the full profile. Without it the pill is absent, never dead. */
  onViewProfile?: () => void
  /** A host that paints the grey itself (the inbox pane's scroll area) passes bg-transparent. */
  className?: string
  initial: ClientSummaryInitial
  /** The merchant has the pet module. Pets show only with it and a pet (FND-4). */
  hasPets: boolean
  now: number
  lang?: Lang
  timeZone?: string
  /** Prototype only: make the visits read slow, or fail once. */
  simulate?: "slow" | "error"
}) {
  const copy = COPY[lang]
  const { state, retry } = useHistory(initial.customerId, now, simulate)
  const locale = lang === "ar" ? "ar-AE" : "en-GB"
  // "24 May", day first as elsewhere in the app
  const shortDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone }).format(
      new Date(iso),
    )
  // "6 Oct, 8:29am"
  const dayTime = (iso: string) => {
    const day = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      timeZone,
    }).format(new Date(iso))
    const time = new Intl.DateTimeFormat(lang === "ar" ? "ar-AE" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
    }).format(new Date(iso))
    return `${day}, ${lang === "ar" ? time : time.replace(" ", "").toLowerCase()}`
  }

  const ready = state.status === "ready" ? state.history : null
  const hasPetNotes = initial.pets.some((p) => (ready?.petNotes[p.name]?.length ?? 0) > 0)

  // A client with a pet leads with it. No pet, no section.
  const pets =
    hasPets && initial.pets.length > 0 ? (
      <Section title={copy.pets}>
        {/* Pet notes travel with the animal, so they sit under their pet,
              never in Client notes. With none, the pets stay pills. */}
        {hasPetNotes ? (
          <Card>
            {initial.pets.map((pet) => {
              const notes = ready?.petNotes[pet.name] ?? []
              return (
                <div key={pet.name} className="flex flex-col gap-2 py-3">
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <Avatar size="sm" fallback="species" species={pet.species} />
                    <span>
                      {pet.name}
                      <span className="text-muted-foreground"> · {pet.breed}</span>
                    </span>
                  </span>
                  {notes.length > 0 ? (
                    <dl className="flex flex-col gap-2 ps-9">
                      {notes.map((n) => (
                        <div key={n.category} className="flex flex-col gap-0.5">
                          <dt className="text-xs font-medium text-muted-foreground">
                            {copy.petNoteLabels[n.category]}
                          </dt>
                          <dd className="text-sm text-foreground">{n.detail}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </div>
              )
            })}
          </Card>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {initial.pets.map((pet) => (
              <li
                key={pet.name}
                className="flex items-center gap-2 rounded-full border border-border/60 bg-card py-1 ps-1 pe-3"
              >
                <Avatar size="sm" fallback="species" species={pet.species} />
                <span className="text-sm text-foreground">
                  {pet.name}
                  <span className="text-muted-foreground"> · {pet.breed}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    ) : null

  return (
    <div className={cn("flex min-h-full shrink-0 grow flex-col bg-muted/40", className)}>
      {/* Painted from initial data: who they are. */}
      <div className="flex items-center gap-3 px-4 py-4">
        <Avatar size="lg" fallback="character" name={initial.name} hashSeed={initial.customerId} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-lg font-semibold leading-tight text-foreground">
            {initial.name}
          </span>
          <bdi dir="ltr" className="text-sm text-muted-foreground">
            {initial.phone}
          </bdi>
          {initial.archived || initial.homeLocation ? (
            <span className="mt-1 flex flex-wrap gap-1">
              {initial.archived ? (
                <span className="rounded-full bg-cami-gray-3 px-2 py-0.5 text-[11px] font-medium text-cami-gray-11">
                  {copy.archived}
                </span>
              ) : null}
              {initial.homeLocation ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-cami-violet-3 px-2 py-0.5 text-[11px] font-medium text-cami-violet-11">
                  <MapPinIcon className="size-3" aria-hidden />
                  {copy.atLocation(initial.homeLocation)}
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
        {/* Same pill as the appointment sheet's client row. */}
        {onViewProfile ? (
          <Button
            type="button"
            variant="outline"
            radius="full"
            className="shrink-0"
            onClick={onViewProfile}
          >
            {copy.viewProfile}
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col divide-y divide-border/60 border-t border-border/60">
        {pets}
        {/* Booked and not yet happened, soonest first. Left out when none. */}
        {ready && ready.upcoming.length > 0 ? (
          <Section title={copy.upcoming}>
            <Card>
              {ready.upcoming.map((v) => (
                <VisitGroup key={v.id} visit={v} now={now} copy={copy} shortDate={shortDate} />
              ))}
            </Card>
          </Section>
        ) : null}

        {/* The last three completed (IX-C6 row 2). A first booking with no past
            visit shows Upcoming alone; no appointments at all is the empty state. */}
        {ready && ready.visits.length === 0 && ready.upcoming.length > 0 ? null : (
          <Section title={copy.appointments}>
            <Card busy={state.status === "loading"}>
              {ready && ready.visits.length === 0 ? (
                <EmptyState icon={CalendarIcon} title={copy.noAppointments} className="py-8" />
              ) : ready ? (
                ready.visits.map((v) => (
                  <VisitGroup key={v.id} visit={v} now={now} copy={copy} shortDate={shortDate} />
                ))
              ) : (
                <>
                  {/* The last service paints with the chat; the rest fills in. */}
                  {initial.lastService ? (
                    <div className="flex flex-col gap-2 py-3">
                      <DayLabel
                        iso={initial.lastService.at}
                        now={now}
                        copy={copy}
                        shortDate={shortDate}
                      />
                      <span className="flex items-center gap-2 text-sm text-foreground">
                        {state.status === "loading" ? (
                          <Skeleton className="size-5 rounded-full" />
                        ) : null}
                        {initial.lastService.name}
                      </span>
                    </div>
                  ) : null}
                  {state.status === "loading" ? (
                    <div className="flex flex-col gap-2 py-3">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3 py-3">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertTriangleIcon className="size-4 shrink-0" aria-hidden />
                        {copy.visitsError}
                      </span>
                      <Button variant="ghost" size="xs" radius="full" onClick={retry}>
                        <RotateCwIcon aria-hidden />
                        {copy.retry}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card>
          </Section>
        )}

        {ready && ready.notes.length > 0 ? (
          <Section title={copy.notes}>
            <Card>
              {ready.notes.map((n) => (
                <div key={n.id} className="flex flex-col gap-1 py-3">
                  <p className="text-sm text-foreground">{n.body}</p>
                  <span className="text-xs text-muted-foreground">
                    {n.authorName} · {dayTime(n.at)}
                  </span>
                </div>
              ))}
            </Card>
          </Section>
        ) : null}
      </div>
    </div>
  )
}
