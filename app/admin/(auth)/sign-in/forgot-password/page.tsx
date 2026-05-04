"use client"

import { LoaderCircleIcon, MailCheckIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { AuthCard } from "@/components/blocks/auth-card"
import { HqAuthLayout } from "@/components/blocks/hq-auth-layout"
import { Button } from "@/components/ui/button"

type Status = "idle" | "submitting" | "sent"

function HqForgotPasswordContent() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get("email") ?? ""
  const [status, setStatus] = useState<Status>("idle")

  // Direct URL navigation without an email → bounce back to sign-in.
  useEffect(() => {
    if (!email) router.replace("/admin/sign-in")
  }, [email, router])

  if (!email) return null

  function handleReset() {
    setStatus("submitting")
    // Simulate POST /admin/auth/forgot-password — always succeeds (no enumeration).
    setTimeout(() => setStatus("sent"), 700)
  }

  if (status === "sent") {
    return (
      <HqAuthLayout>
        <AuthCard
          icon={
            <div className="flex size-14 items-center justify-center rounded-full bg-sand-3 text-foreground">
              <MailCheckIcon className="size-6" />
            </div>
          }
          title="Check your email"
          description={
            <>
              If an account exists for{" "}
              <strong className="font-medium text-foreground">{email}</strong>, we've sent a link to
              reset your password. The link expires in 30 minutes.
            </>
          }
        >
          <Button asChild size="xl" radius="full" className="w-full">
            <Link href={{ pathname: "/admin/sign-in", query: { email } }}>Back to sign in</Link>
          </Button>
        </AuthCard>
      </HqAuthLayout>
    )
  }

  return (
    <HqAuthLayout>
      <AuthCard
        backHref={`/admin/sign-in?email=${encodeURIComponent(email)}`}
        title="Forgot your Cami HQ password?"
        description={
          <>
            We'll send a secure link to create a new password to{" "}
            <strong className="font-medium text-foreground">{email}</strong>.
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Button
            type="button"
            size="xl"
            radius="full"
            className="w-full"
            disabled={status === "submitting"}
            onClick={handleReset}
          >
            {status === "submitting" ? (
              <>
                <LoaderCircleIcon className="size-4 animate-spin" />
                Sending link…
              </>
            ) : (
              "Reset password"
            )}
          </Button>
          <Link
            href={{ pathname: "/admin/sign-in", query: { email } }}
            className="link self-center text-sm font-medium text-muted-foreground"
          >
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    </HqAuthLayout>
  )
}

export default function HqForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <HqAuthLayout>
          <AuthCard title="Forgot your Cami HQ password?">
            <div className="h-32" aria-hidden />
          </AuthCard>
        </HqAuthLayout>
      }
    >
      <HqForgotPasswordContent />
    </Suspense>
  )
}
