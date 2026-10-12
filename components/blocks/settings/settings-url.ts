"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

// The settings dialog in both products is driven by the URL: `?settings=<id>`
// opens it on that category, and clearing the param closes it. Triggers only
// push the param, so there is no local open state to keep in sync.

/** For the dialog's controller: whether it is open, on which category, and how to close it. */
export function useSettingsParam() {
  const params = useSearchParams()
  const pathname = usePathname() ?? "/"
  const router = useRouter()
  const categoryId = params.get("settings")

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (next) return
      const nextParams = new URLSearchParams(params.toString())
      nextParams.delete("settings")
      const qs = nextParams.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [params, pathname, router],
  )

  return { open: Boolean(categoryId), categoryId, onOpenChange }
}

/** For a trigger (sidebar, drawer, menu): open settings on a category, keeping the page's other params. */
export function useOpenSettings() {
  const router = useRouter()
  const pathname = usePathname() ?? "/"
  return useCallback(
    (categoryId: string) => {
      const search = typeof window !== "undefined" ? window.location.search : ""
      const next = new URLSearchParams(search)
      next.set("settings", categoryId)
      router.push(`${pathname}?${next.toString()}`)
    },
    [pathname, router],
  )
}
