"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { AdminSettingsDialog } from "@/components/blocks/admin-settings-dialog"

/**
 * URL-driven settings dialog. `?settings=<categoryId>` opens the dialog with
 * that category active; clearing the param closes it. Sidebar / link triggers
 * just push the param — single source of truth, no local state to sync.
 */
export function AdminSettingsController() {
  const params = useSearchParams()
  const pathname = usePathname() ?? "/"
  const router = useRouter()
  const settingsId = params.get("settings")
  const open = !!settingsId

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) return
      const newParams = new URLSearchParams(params.toString())
      newParams.delete("settings")
      const qs = newParams.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [params, pathname, router],
  )

  return (
    <AdminSettingsDialog
      open={open}
      onOpenChange={handleOpenChange}
      defaultCategoryId={settingsId ?? "roles"}
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
