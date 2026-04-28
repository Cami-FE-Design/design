"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AuthCard } from "@/components/blocks/auth-card"
import { AuthLayout } from "@/components/blocks/auth-layout"
import { AppleIcon, FacebookIcon, GoogleIcon } from "@/components/blocks/social-icons"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const signInSchema = z.object({
  email: z.string().email({ message: "Enter a valid email." }),
})

type SignInValues = z.infer<typeof signInSchema>

export default function SignInPage() {
  const form = useForm<SignInValues>({
    // @ts-ignore -- @hookform/resolvers 5.2 bundles zod 4.0 types; we have 4.3, version-tag mismatch only
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "" },
  })

  function onSubmit(values: SignInValues) {
    console.log("Continue:", values)
  }

  return (
    <AuthLayout>
      <AuthCard title="Cami for business" description="Sign in or create an account.">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
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
        <div className="flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            OR
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            size="xl"
            radius="full"
            className="relative w-full"
            onClick={() => console.log("Continue with Google")}
          >
            <GoogleIcon className="absolute left-5 size-5" />
            Continue with Google
          </Button>
          <Button
            variant="outline"
            size="xl"
            radius="full"
            className="relative w-full"
            onClick={() => console.log("Continue with Apple")}
          >
            <AppleIcon className="absolute left-5 size-5" />
            Continue with Apple
          </Button>
          <Button
            variant="outline"
            size="xl"
            radius="full"
            className="relative w-full"
            onClick={() => console.log("Continue with Facebook")}
          >
            <FacebookIcon className="absolute left-5 size-5" />
            Continue with Facebook
          </Button>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
