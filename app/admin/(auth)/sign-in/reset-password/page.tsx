"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckIcon, LoaderCircleIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AuthCard } from "@/components/blocks/auth-card"
import { HqAuthLayout } from "@/components/blocks/hq-auth-layout"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { PasswordInput } from "@/components/ui/password-input"
import { cn } from "@/lib/utils"

type Rule = { id: string; label: string; test: (v: string) => boolean }

const PASSWORD_RULES: Rule[] = [
  { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { id: "lower", label: "A lowercase letter", test: (v) => /[a-z]/.test(v) },
  { id: "upper", label: "An uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { id: "digit", label: "A number", test: (v) => /\d/.test(v) },
  { id: "symbol", label: "A symbol (!?@#…)", test: (v) => /[^A-Za-z0-9]/.test(v) },
]

const resetSchema = z
  .object({
    password: z
      .string()
      .refine((v) => PASSWORD_RULES.every((r) => r.test(v)), { message: "Password is too weak." }),
    confirm: z.string().min(1, { message: "Please confirm your new password." }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match.",
    path: ["confirm"],
  })

type ResetValues = z.infer<typeof resetSchema>

type Phase = "preflight" | "form" | "submitting"

function PreflightState() {
  return (
    <HqAuthLayout>
      <div className="flex w-full max-w-md flex-col items-center gap-4 px-6 py-12 text-center">
        <LoaderCircleIcon
          aria-hidden
          className="size-7 animate-spin text-muted-foreground"
          style={{ animationDuration: "900ms" }}
        />
        <p className="text-base font-medium text-foreground">Validating link…</p>
        <p className="text-sm text-muted-foreground">This will only take a moment.</p>
      </div>
    </HqAuthLayout>
  )
}

function HqResetPasswordContent() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token")
  const [phase, setPhase] = useState<Phase>("preflight")
  const [email, setEmail] = useState<string>("")

  const form = useForm<ResetValues>({
    // @ts-ignore -- @hookform/resolvers 5.2 bundles zod 4.0 types; we have 4.3, version-tag mismatch only
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirm: "" },
    mode: "onChange",
  })

  // Preflight: simulate POST /admin/auth/validate-reset-token.
  useEffect(() => {
    if (!token) {
      router.replace("/admin/sign-in/reset-password-error?reason=invalid")
      return
    }

    const timeout = setTimeout(() => {
      // Demo behavior: tokens "expired" or "used" route to error; others succeed.
      if (token === "expired" || token === "used") {
        router.replace(`/admin/sign-in/reset-password-error?reason=${token}`)
        return
      }
      setEmail("you@getcami.com")
      setPhase("form")
    }, 600)

    return () => clearTimeout(timeout)
  }, [token, router])

  function handleSubmit(_values: ResetValues) {
    setPhase("submitting")
    // Simulate POST /admin/auth/reset-password → 204.
    setTimeout(() => {
      router.replace(`/admin/sign-in?email=${encodeURIComponent(email)}&reset=success`)
    }, 700)
  }

  if (phase === "preflight") return <PreflightState />

  const password = form.watch("password")

  return (
    <HqAuthLayout>
      <AuthCard
        title="Welcome to Cami. Let's create a new password"
        description={
          <>
            Set a new password for <strong className="font-medium text-foreground">{email}</strong>.
          </>
        }
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Choose a strong password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <PolicyHints value={password} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Re-enter your new password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                size="xl"
                radius="full"
                className="w-full"
                disabled={!form.formState.isValid || phase === "submitting"}
              >
                {phase === "submitting" ? (
                  <>
                    <LoaderCircleIcon className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save new password"
                )}
              </Button>
              <Link
                href="/admin/sign-in"
                className="link self-center text-sm font-medium text-muted-foreground"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        </Form>
      </AuthCard>
    </HqAuthLayout>
  )
}

function PolicyHints({ value }: { value: string }) {
  return (
    <ul className="flex flex-col gap-1.5 pt-1" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(value)
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-2 text-xs leading-4",
              passed ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full border",
                passed
                  ? "border-transparent bg-foreground text-background"
                  : "border-border bg-transparent text-muted-foreground",
              )}
            >
              {passed ? <CheckIcon className="size-3" /> : <XIcon className="size-2.5" />}
            </span>
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}

export default function HqResetPasswordPage() {
  return (
    <Suspense fallback={<PreflightState />}>
      <HqResetPasswordContent />
    </Suspense>
  )
}
