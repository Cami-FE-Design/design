"use client"

import { AlertTriangleIcon, LockIcon, type LucideIcon, ShieldOffIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { AuthCard } from "@/components/blocks/auth-card"
import { HqAuthLayout } from "@/components/blocks/hq-auth-layout"
import { Button } from "@/components/ui/button"

type Reason = "not_allowlisted" | "locked" | "generic"

type ReasonContent = {
  title: string
  description: React.ReactNode
  Icon: LucideIcon
  primary: { label: string; href: string }
}

const REASONS: Record<Reason, ReasonContent> = {
  not_allowlisted: {
    title: "Your account isn't on the allowlist",
    description:
      "Your credentials are valid, but this email isn't approved for Cami HQ access yet. Contact engineering to request access.",
    Icon: ShieldOffIcon,
    primary: { label: "Sign in with another account", href: "/admin/sign-in" },
  },
  locked: {
    title: "Account temporarily locked",
    description:
      "Too many failed sign-in attempts. For your security, we've paused this account. Try again in a few minutes or reset your password.",
    Icon: LockIcon,
    primary: { label: "Reset your password", href: "/admin/sign-in/forgot-password" },
  },
  generic: {
    title: "We couldn't sign you in",
    description:
      "Something went wrong on our side. Try again, or contact engineering if the problem continues.",
    Icon: AlertTriangleIcon,
    primary: { label: "Try again", href: "/admin/sign-in" },
  },
}

function isReason(value: string | null): value is Reason {
  return value !== null && value in REASONS
}

function ReasonIcon({ Icon }: { Icon: LucideIcon }) {
  return (
    <div className="flex size-14 items-center justify-center rounded-full bg-tomato-3 text-tomato-11">
      <Icon className="size-6" />
    </div>
  )
}

function HqSignInErrorContent() {
  const params = useSearchParams()
  const raw = params.get("reason")
  const reason: Reason = isReason(raw) ? raw : "generic"
  const { title, description, Icon, primary } = REASONS[reason]

  return (
    <HqAuthLayout>
      <AuthCard
        icon={<ReasonIcon Icon={Icon} />}
        title={title}
        description={description}
        footer={
          <>
            Need help? Contact{" "}
            <a href="mailto:maaz@getcami.io" className="link text-foreground">
              maaz@getcami.io
            </a>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Button asChild size="xl" radius="full" className="w-full">
            <Link href={primary.href}>{primary.label}</Link>
          </Button>
          {primary.href !== "/admin/sign-in" ? (
            <Link
              href="/admin/sign-in"
              className="link self-center text-sm font-medium text-muted-foreground"
            >
              Back to sign in
            </Link>
          ) : null}
        </div>
      </AuthCard>
    </HqAuthLayout>
  )
}

export default function HqSignInErrorPage() {
  return (
    <Suspense
      fallback={
        <HqAuthLayout>
          <AuthCard title="Loading…">
            <div className="h-32" aria-hidden />
          </AuthCard>
        </HqAuthLayout>
      }
    >
      <HqSignInErrorContent />
    </Suspense>
  )
}
