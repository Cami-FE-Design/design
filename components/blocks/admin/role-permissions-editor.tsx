"use client"

import {
  BarChart3Icon,
  CreditCardIcon,
  HeadsetIcon,
  type LucideIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldCheckIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchInput } from "@/components/ui/search-input"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import {
  HQ_PERMISSION_AREAS,
  type HqPermissionArea,
  isAreaActive,
  listAreaCodes,
} from "@/lib/hq-permissions-catalog"
import { cn } from "@/lib/utils"

const AREA_ICONS: Record<HqPermissionArea["icon"], LucideIcon> = {
  store: StoreIcon,
  "credit-card": CreditCardIcon,
  headset: HeadsetIcon,
  scroll: ScrollTextIcon,
  "bar-chart": BarChart3Icon,
  users: UsersIcon,
  shield: ShieldCheckIcon,
  settings: SettingsIcon,
}

const COPY = {
  en: {
    search: "Search permissions",
    permissionAreas: "Permission area",
    active: "Active",
    off: "Off",
    on: "On",
    enableArea: "Enable this area",
    disableArea: "Disable this area",
    noResults: "No permissions match your search.",
  },
  ar: {
    search: "ابحث في الأذونات",
    permissionAreas: "مجال الأذونات",
    active: "مفعّل",
    off: "متوقف",
    on: "تشغيل",
    enableArea: "تفعيل هذا المجال",
    disableArea: "تعطيل هذا المجال",
    noResults: "لا توجد أذونات مطابقة.",
  },
}

type RolePermissionsEditorProps = {
  /**
   * Codes currently granted. The editor manages its own state on top of this
   * via `onChange`; the parent decides when to persist (Save button).
   */
  permissionCodes: ReadonlySet<string>
  onChange: (next: Set<string>) => void
  locale?: "en" | "ar"
}

export function RolePermissionsEditor({
  permissionCodes,
  onChange,
  locale = "en",
}: RolePermissionsEditorProps) {
  const t = COPY[locale]
  const [query, setQuery] = useState("")
  const [activeAreaId, setActiveAreaId] = useState<string>(HQ_PERMISSION_AREAS[0].id)

  const q = query.trim().toLowerCase()
  const matchesQuery = useCallback(
    (area: HqPermissionArea): boolean => {
      if (!q) return true
      if (area.name[locale].toLowerCase().includes(q)) return true
      return area.sections.some(
        (s) =>
          s.title[locale].toLowerCase().includes(q) ||
          s.actions.some(
            (a) => a.label[locale].toLowerCase().includes(q) || a.code.toLowerCase().includes(q),
          ),
      )
    },
    [q, locale],
  )

  const visibleAreas = useMemo(() => HQ_PERMISSION_AREAS.filter(matchesQuery), [matchesQuery])

  const activeArea =
    visibleAreas.find((a) => a.id === activeAreaId) ?? visibleAreas[0] ?? HQ_PERMISSION_AREAS[0]

  const setCode = useCallback(
    (code: string, on: boolean) => {
      const next = new Set(permissionCodes)
      if (on) next.add(code)
      else next.delete(code)
      onChange(next)
    },
    [permissionCodes, onChange],
  )

  const toggleArea = useCallback(
    (area: HqPermissionArea, on: boolean) => {
      const next = new Set(permissionCodes)
      const codes = listAreaCodes(area)
      if (on) for (const c of codes) next.add(c)
      else for (const c of codes) next.delete(c)
      onChange(next)
    },
    [permissionCodes, onChange],
  )

  if (visibleAreas.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <SearchInput
          placeholder={t.search}
          aria-label={t.search}
          defaultValue={query}
          onValueChange={setQuery}
          size="xl"
        />
        <p className="rounded-2xl border border-dashed border-border bg-background py-12 text-center text-sm text-muted-foreground">
          {t.noResults}
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <SearchInput
        placeholder={t.search}
        aria-label={t.search}
        defaultValue={query}
        onValueChange={setQuery}
        size="xl"
      />

      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <aside aria-label={t.permissionAreas} className="flex min-w-0 flex-col gap-1">
          <ul className="flex flex-col gap-1">
            {visibleAreas.map((area) => {
              const Icon = AREA_ICONS[area.icon]
              const active = isAreaActive(permissionCodes, area)
              const selected = area.id === activeArea.id
              return (
                <li key={area.id}>
                  <button
                    type="button"
                    onClick={() => setActiveAreaId(area.id)}
                    aria-current={selected ? "page" : undefined}
                    className={cn(
                      "group flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition-colors",
                      selected
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-muted/50",
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                    <span className="flex-1 truncate font-medium">{area.name[locale]}</span>
                    <span
                      aria-hidden
                      data-active={active || undefined}
                      className="size-2 shrink-0 rounded-full bg-muted-foreground/30 data-active:bg-cami-violet-9"
                    />
                    <span className="sr-only">{active ? t.active : t.off}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        <section
          key={activeArea.id}
          data-slot="role-permissions-detail"
          className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border/60 bg-background p-5"
        >
          <header className="flex min-w-0 items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <h3 className="min-w-0 truncate font-heading text-2xl font-semibold leading-9 text-foreground">
                {activeArea.name[locale]}
              </h3>
              <p className="text-sm leading-5 text-muted-foreground">
                {activeArea.summary[locale]}
              </p>
            </div>
            <SegmentedToggle
              value={isAreaActive(permissionCodes, activeArea) ? "on" : "off"}
              onValueChange={(v) => toggleArea(activeArea, v === "on")}
              options={[
                { value: "off", label: t.off },
                { value: "on", label: t.on, activeTone: "primary" },
              ]}
              ariaLabel={isAreaActive(permissionCodes, activeArea) ? t.disableArea : t.enableArea}
            />
          </header>

          <div className="-mx-5 h-px bg-border/60" aria-hidden />

          <div className="flex flex-col gap-5">
            {activeArea.sections.map((section) => {
              const sectionMatches = q
                ? section.title[locale].toLowerCase().includes(q) ||
                  section.actions.some(
                    (a) =>
                      a.label[locale].toLowerCase().includes(q) || a.code.toLowerCase().includes(q),
                  )
                : true
              if (!sectionMatches) return null
              return (
                <div key={section.id} className="flex flex-col gap-3">
                  <h4 className="font-heading text-base font-semibold leading-6 text-foreground">
                    {section.title[locale]}
                  </h4>
                  <ul className="flex flex-col gap-2.5">
                    {section.actions.map((action) => {
                      const checked = permissionCodes.has(action.code)
                      const labelMatchesQuery =
                        !q ||
                        action.label[locale].toLowerCase().includes(q) ||
                        action.code.toLowerCase().includes(q) ||
                        section.title[locale].toLowerCase().includes(q)
                      if (!labelMatchesQuery) return null
                      return (
                        <li key={action.code} className="flex items-center gap-3">
                          <Checkbox
                            id={`perm-${action.code}`}
                            size="lg"
                            checked={checked}
                            onCheckedChange={(v) => setCode(action.code, v === true)}
                          />
                          <label
                            htmlFor={`perm-${action.code}`}
                            className="cursor-pointer text-base font-medium leading-6 text-foreground"
                          >
                            {action.label[locale]}
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
