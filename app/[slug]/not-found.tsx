import Link from "next/link"
import { PublicTopGradient } from "@/components/blocks/public-top-gradient"
import { Button } from "@/components/ui/button"

export default function PublicBusinessNotFound() {
  return (
    <main className="relative flex flex-1 items-center justify-center bg-background px-6 py-24">
      <PublicTopGradient />
      <div className="relative flex max-w-md flex-col items-center gap-6 text-center">
        <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          404
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          We couldn&apos;t find this page
        </h1>
        <p className="text-base text-muted-foreground">
          The business you are looking for may have moved, changed names, or is not yet open for
          bookings on Cami.
        </p>
        <Button asChild radius="full">
          <Link href="https://cami.app">Visit Cami</Link>
        </Button>
      </div>
    </main>
  )
}
