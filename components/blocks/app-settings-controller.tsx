"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { AppSettingsDialog } from "@/components/blocks/app-settings-dialog"

/**
 * URL-driven settings dialog for the Pet Business portal. `?settings=<categoryId>`
 * opens the dialog with that category active; clearing the param closes it.
 * Mirrors AdminSettingsController on the HQ side.
 */
export function AppSettingsController() {
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
    <AppSettingsDialog
      open={open}
      onOpenChange={handleOpenChange}
      defaultCategoryId={settingsId ?? "profile"}
    />
  )
}

export function appSettingsHref(pathname: string, categoryId = "profile"): string {
  return `${pathname}?settings=${categoryId}`
}
