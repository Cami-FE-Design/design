"use client"

import Link from "next/link"
import { useState } from "react"
import { AuthCard } from "@/components/blocks/auth-card"
import { AuthLayout } from "@/components/blocks/auth-layout"
import { Button } from "@/components/ui/button"

const firstName = "Maz"
const email = "maaz@getcami.io"

export default function SignInForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  function handleReset() {
    console.log("Send reset link to:", email)
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout>
        <AuthCard
          backHref="/sign-in/password"
          title="Check your email"
          description={
            <>
              An email is on its way to{" "}
              <strong className="font-medium text-foreground">{email}</strong> with instructions to
              reset your password.
            </>
          }
        >
          <Button asChild size="xl" radius="full" className="w-full">
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard
        backHref="/sign-in/password"
        title={`Forgot your business account password, ${firstName}?`}
        description={
          <>
            We'll send you a secure link to create a new password to{" "}
            <strong className="font-medium text-foreground">{email}</strong>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Button type="button" size="xl" radius="full" className="w-full" onClick={handleReset}>
            Reset password
          </Button>
          <Link
            href="/sign-in"
            className="link self-center text-sm font-medium text-muted-foreground"
          >
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
