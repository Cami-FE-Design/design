"use client"

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const options = [
    { value: "light", label: "Light", icon: SunIcon },
    { value: "dark", label: "Dark", icon: MoonIcon },
    { value: "system", label: "System", icon: MonitorIcon },
  ] as const
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
      {options.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          size="sm"
          variant={theme === value ? "default" : "ghost"}
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
