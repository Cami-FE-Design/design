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

const inviteSchema = z
  .object({
    password: z.string().min(8, { message: "Use at least 8 characters." }),
    confirm: z.string().min(1, { message: "Please confirm your password." }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match.",
    path: ["confirm"],
  })

type InviteValues = z.infer<typeof inviteSchema>

const firstName = "Sara"
const inviterName = "Maz"
const businessName = "Shampooch JVC"
const role = "Reception"
const email = "sara@getcami.io"

export default function SignInAcceptInvitePage() {
  const [done, setDone] = useState(false)

  const form = useForm<InviteValues>({
    // @ts-ignore -- @hookform/resolvers 5.2 bundles zod 4.0 types; we have 4.3, version-tag mismatch only
    resolver: zodResolver(inviteSchema),
    defaultValues: { password: "", confirm: "" },
  })

  function onSubmit(_values: InviteValues) {
    console.log("Accept invite for:", email)
    setDone(true)
  }

  if (done) {
    return (
      <AuthLayout>
        <AuthCard
          title={`You're in, ${firstName}`}
          description={
            <>
              Your account is ready. Welcome to{" "}
              <strong className="font-medium text-foreground">{businessName}</strong>.
            </>
          }
        >
          <Button asChild size="xl" radius="full" className="w-full">
            <Link href="/">Go to your dashboard</Link>
          </Button>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard
        title={`Join ${businessName} on Cami`}
        description={
          <>
            <strong className="font-medium text-foreground">{inviterName}</strong> invited you to
            join as {role}. Create a password for{" "}
            <strong className="font-medium text-foreground">{email}</strong> to accept the invite.
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
                  <FormLabel>Create a password</FormLabel>
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
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="xl" radius="full" className="w-full">
              Accept invite
            </Button>
          </form>
        </Form>
      </AuthCard>
    </AuthLayout>
  )
}
