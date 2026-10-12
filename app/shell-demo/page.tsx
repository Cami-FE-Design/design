import type { Metadata } from "next"
import { AppShell } from "@/components/blocks/shell/app-shell"

export const metadata: Metadata = {
  title: "Shell demo",
  description: "Application shell preview",
}

export default function ShellDemoPage() {
  return <AppShell />
}
