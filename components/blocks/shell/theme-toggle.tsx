"use client"

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

const OPTIONS = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Until mount, theme is unknown on the server. Render all buttons as ghost
  // so server and first-client HTML match, then activate the right one.
  const activeTheme = mounted ? theme : undefined

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          size="sm"
          variant={activeTheme === value ? "default" : "ghost"}
          onClick={() => setTheme(value)}
          aria-label={`Switch to ${label} theme`}
        >
          <Icon className="size-4" />
          <span className="sr-only sm:not-sr-only">{label}</span>
        </Button>
      ))}
    </div>
  )
}
