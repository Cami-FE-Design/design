"use client"

import { CircleAlertIcon, LinkIcon, type LucideIcon, TimerOffIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { AuthCard } from "@/components/blocks/auth-card"
import { HqAuthLayout } from "@/components/blocks/hq-auth-layout"
import { Button } from "@/components/ui/button"

type Reason = "expired" | "used" | "invalid"

type ReasonContent = {
  title: string
  description: React.ReactNode
  Icon: LucideIcon
}

const REASONS: Record<Reason, ReasonContent> = {
  expired: {
    title: "This reset link has expired",
    description:
      "Reset links are valid for 30 minutes. Request a new one and try again — you'll be back in within a minute.",
    Icon: TimerOffIcon,
  },
  used: {
    title: "This reset link has already been used",
    description:
      "Each link works only once. If you didn't reset your password, request a new link to continue.",
    Icon: LinkIcon,
  },
  invalid: {
    title: "This reset link doesn't look right",
    description:
      "The link is missing or malformed. Make sure you opened the most recent email, or request a new link.",
    Icon: CircleAlertIcon,
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

function HqResetPasswordErrorContent() {
  const params = useSearchParams()
  const raw = params.get("reason")
  const reason: Reason = isReason(raw) ? raw : "invalid"
  const { title, description, Icon } = REASONS[reason]

  return (
    <HqAuthLayout>
      <AuthCard
        icon={<ReasonIcon Icon={Icon} />}
        title={title}
        description={description}
        footer={
          <>
            Still stuck? Contact{" "}
            <a href="mailto:maaz@getcami.io" className="link text-foreground">
              maaz@getcami.io
            </a>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Button asChild size="xl" radius="full" className="w-full">
            <Link href="/admin/sign-in/forgot-password">Request a new link</Link>
          </Button>
          <Link
            href="/admin/sign-in"
            className="link self-center text-sm font-medium text-muted-foreground"
          >
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    </HqAuthLayout>
  )
}

export default function HqResetPasswordErrorPage() {
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
      <HqResetPasswordErrorContent />
    </Suspense>
  )
}
