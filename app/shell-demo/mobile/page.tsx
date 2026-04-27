import type { Metadata } from "next"
import { AppShell } from "@/components/blocks/app-shell"

export const metadata: Metadata = {
  title: "Shell demo — Mobile",
  description: "Mobile breakpoint application shell preview",
}

export default function ShellDemoMobilePage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted p-6">
      <div className="h-[844px] w-[390px] overflow-hidden rounded-[40px] border border-border bg-background shadow-2xl">
        <AppShell breakpoint="mobile" />
      </div>
    </div>
  )
}
