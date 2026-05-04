"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { AuthCard } from "@/components/blocks/auth-card"
import { HqAuthLayout } from "@/components/blocks/hq-auth-layout"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email." }),
})
const passwordSchema = z.object({
  password: z.string().min(1, { message: "Enter your password." }),
})

type EmailValues = z.infer<typeof emailSchema>
type PasswordValues = z.infer<typeof passwordSchema>

function HqSignInContent() {
  const params = useSearchParams()
  const initialEmail = params.get("email") ?? ""
  const [step, setStep] = useState<"email" | "password">(initialEmail ? "password" : "email")
  const [email, setEmail] = useState(initialEmail)
  const [rememberMe, setRememberMe] = useState(true)

  // Show success toast after a successful password reset.
  useEffect(() => {
    if (params.get("reset") === "success") {
      toast.success("Password updated. Sign in to continue.")
    }
  }, [params])

  const emailForm = useForm<EmailValues>({
    // @ts-ignore -- @hookform/resolvers 5.2 bundles zod 4.0 types; we have 4.3, version-tag mismatch only
    resolver: zodResolver(emailSchema),
    defaultValues: { email: initialEmail },
  })

  const passwordForm = useForm<PasswordValues>({
    // @ts-ignore -- @hookform/resolvers 5.2 bundles zod 4.0 types; we have 4.3, version-tag mismatch only
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  })

  function handleEmailSubmit(values: EmailValues) {
    setEmail(values.email)
    setStep("password")
  }

  function handlePasswordSubmit(values: PasswordValues) {
    console.log("login:", { email, password: values.password, rememberMe })
  }

  function handleBack() {
    setStep("email")
    passwordForm.reset()
  }

  if (step === "email") {
    return (
      <HqAuthLayout>
        <AuthCard
          title="Sign in to Cami HQ"
          description="Enter your Cami HQ email to continue."
          footer={
            <>
              Need access? Contact{" "}
              <a href="mailto:maaz@getcami.io" className="link text-foreground">
                maaz@getcami.io
              </a>
            </>
          }
        >
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@getcami.com"
                        autoComplete="email"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="xl" radius="full" className="w-full">
                Continue
              </Button>
            </form>
          </Form>
        </AuthCard>
      </HqAuthLayout>
    )
  }

  return (
    <HqAuthLayout>
      <AuthCard
        onBack={handleBack}
        backLabel="Use a different email"
        title="Welcome back to Cami HQ"
        description={
          <>
            Enter your password to sign in as{" "}
            <strong className="font-medium text-foreground">{email}</strong>
          </>
        }
      >
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-3">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hq-remember-me"
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(v === true)}
                />
                <label
                  htmlFor="hq-remember-me"
                  className="cursor-pointer text-sm font-medium text-foreground"
                >
                  Keep me signed in on this device
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Button type="submit" size="xl" radius="full" className="w-full">
                Sign in
              </Button>
              <Link
                href={{ pathname: "/admin/sign-in/forgot-password", query: { email } }}
                className="link self-center text-sm font-medium text-muted-foreground"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </Form>
      </AuthCard>
    </HqAuthLayout>
  )
}

export default function HqSignInPage() {
  return (
    <Suspense
      fallback={
        <HqAuthLayout>
          <AuthCard title="Sign in to Cami HQ">
            <div className="h-32" aria-hidden />
          </AuthCard>
        </HqAuthLayout>
      }
    >
      <HqSignInContent />
    </Suspense>
  )
}
