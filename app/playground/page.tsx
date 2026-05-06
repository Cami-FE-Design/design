import type { Metadata } from "next"
import { PlaygroundShowcase } from "@/components/blocks/playground-showcase"
import { ThemeToggle } from "@/components/blocks/theme-toggle"

export const metadata: Metadata = {
  title: "Playground",
  description: "Cami design system component states",
}

export default function PlaygroundPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-10 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Cami playground</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Every installed primitive in its non-interactive states. Hover, focus, and keyboard
            states are live on the real components below, interact to see them.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <PlaygroundShowcase />
    </main>
  )
}
