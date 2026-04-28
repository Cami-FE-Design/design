"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AuthCard } from "@/components/blocks/auth-card"
import { AuthLayout } from "@/components/blocks/auth-layout"
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
import { PasswordInput } from "@/components/ui/password-input"

const passwordSchema = z.object({
  password: z.string().min(1, { message: "This field is required" }),
})

type PasswordValues = z.infer<typeof passwordSchema>

const firstName = "Maz"
const email = "maaz@getcami.io"

export default function SignInPasswordPage() {
  const [rememberMe, setRememberMe] = useState(true)

  const form = useForm<PasswordValues>({
    // @ts-ignore -- @hookform/resolvers 5.2 bundles zod 4.0 types; we have 4.3, version-tag mismatch only
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  })

  function onSubmit(values: PasswordValues) {
    console.log("Log in:", { ...values, rememberMe })
  }

  return (
    <AuthLayout>
      <AuthCard
        title={`Welcome back to your business account, ${firstName}`}
        description={
          <>
            Enter your password to log in as{" "}
            <strong className="font-medium text-foreground">{email}</strong>
          </>
        }
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Enter a password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(v === true)}
                />
                <label
                  htmlFor="remember-me"
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
                href="/sign-in/forgot-password"
                className="link self-center text-sm font-medium text-muted-foreground"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </Form>
      </AuthCard>
    </AuthLayout>
  )
}
