"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { AccessDeniedCard } from "@/components/blocks/access-denied-card"

export default function AccessDeniedPage() {
  const router = useRouter()
  const params = useSearchParams()
  const intendedUrl = params.get("from") ?? undefined

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-cami-sage-4 px-4 py-12">
      <AccessDeniedCard
        intendedUrl={intendedUrl}
        onBackToDashboard={() => router.push("/admin")}
        onSignOut={() => router.push("/sign-in")}
      />
    </main>
  )
}
