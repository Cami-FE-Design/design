"use client"

import { AdminSettingsDialog } from "@/components/blocks/admin/admin-settings-dialog"
import { useSettingsParam } from "@/components/blocks/settings/settings-url"

/**
 * URL-driven settings dialog. `?settings=<categoryId>` opens the dialog with
 * that category active; clearing the param closes it. Sidebar / link triggers
 * just push the param — single source of truth, no local state to sync.
 */
export function AdminSettingsController() {
  const { open, categoryId, onOpenChange } = useSettingsParam()
  return (
    <AdminSettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      defaultCategoryId={categoryId ?? "roles"}
    />
  )
}

/**
 * Build a URL that opens the settings dialog with the given category. Useful
 * for `/screens` and other cross-page links.
 */
export function settingsHref(pathname: string, categoryId = "roles"): string {
  return `${pathname}?settings=${categoryId}`
}
