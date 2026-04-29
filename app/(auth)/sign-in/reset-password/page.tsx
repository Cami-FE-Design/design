"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AuthCard } from "@/components/blocks/auth-card"
import { AuthLayout } from "@/components/blocks/auth-layout"
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

const resetSchema = z
  .object({
    password: z.string().min(8, { message: "Use at least 8 characters." }),
    confirm: z.string().min(1, { message: "Please confirm your new password." }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match.",
    path: ["confirm"],
  })

type ResetValues = z.infer<typeof resetSchema>

const email = "maaz@getcami.io"

export default function SignInResetPasswordPage() {
  const [done, setDone] = useState(false)

  const form = useForm<ResetValues>({
    // @ts-ignore -- @hookform/resolvers 5.2 bundles zod 4.0 types; we have 4.3, version-tag mismatch only
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirm: "" },
  })

  function onSubmit(_values: ResetValues) {
    console.log("Reset password for:", email)
    setDone(true)
  }

  if (done) {
    return (
      <AuthLayout>
        <AuthCard
          title="Password reset"
          description={
            <>
              Your password has been changed for{" "}
              <strong className="font-medium text-foreground">{email}</strong>. You can now sign in
              with your new password.
            </>
          }
        >
          <Button asChild size="xl" radius="full" className="w-full">
            <Link href="/sign-in">Continue to sign in</Link>
          </Button>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome to Cami. Let's create a new password"
        description={
          <>
            Set a new password for <strong className="font-medium text-foreground">{email}</strong>.
          </>
        }
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
            <div className="flex flex-col gap-4">
              <Button type="submit" size="xl" radius="full" className="w-full">
                Save new password
              </Button>
              <Link
                href="/sign-in"
                className="link self-center text-sm font-medium text-muted-foreground"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        </Form>
      </AuthCard>
    </AuthLayout>
  )
}
