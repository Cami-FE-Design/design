"use client"

import { useSettingsParam } from "@/components/blocks/settings/settings-url"
import { AppSettingsDialog } from "@/components/blocks/shell/app-settings-dialog"

/**
 * URL-driven settings dialog for the Pet Business portal. `?settings=<categoryId>`
 * opens the dialog with that category active; clearing the param closes it.
 * Mirrors AdminSettingsController on the HQ side.
 */
export function AppSettingsController() {
  const { open, categoryId, onOpenChange } = useSettingsParam()
  return (
    <AppSettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      defaultCategoryId={categoryId ?? "profile"}
    />
  )
}

export function appSettingsHref(pathname: string, categoryId = "profile"): string {
  return `${pathname}?settings=${categoryId}`
}
