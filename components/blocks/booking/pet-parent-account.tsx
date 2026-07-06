"use client"

import { CalendarIcon, ChevronRightIcon, PawPrintIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { PublicTopGradient } from "@/components/blocks/public-top-gradient"
import { CamiWordmark } from "@/components/brand/cami-wordmark"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OtpInput } from "@/components/ui/otp-input"
import { RETURNING_PETS } from "@/lib/booking"
import { cn } from "@/lib/utils"

// Passwordless pet-parent account (E3-6). One identity across every Cami
// business. Entry is mobile → one-time code (new numbers get an account created
// automatically — no separate sign-up). Same Luma column as the booking flow.

type Stage = "request" | "verify" | "home"

const PARENT = {
  firstName: "Michelle",
  name: "Michelle You",
  phone: "+971 50 123 4567",
  email: "michelle@ce-creates.com",
}

const UPCOMING = {
  businessSlug: "shampooch-jvc",
  businessName: "Shampooch",
  serviceName: "Full groom",
  when: "Wed 1 Jul · 10:00am",
  ref: "CAMI-4821",
}

export function PetParentAccount() {
  const [stage, setStage] = useState<Stage>("request")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")

  return (
    <main className="relative flex min-h-dvh flex-col bg-background">
      <PublicTopGradient />
      <div className="relative mx-auto flex w-full max-w-[460px] flex-1 flex-col px-5 py-10">
        {/* Cami wordmark */}
        <div className="mb-10">
          <CamiWordmark height={20} />
        </div>

        {stage === "request" ? (
          <RequestStage phone={phone} onPhone={setPhone} onSubmit={() => setStage("verify")} />
        ) : stage === "verify" ? (
          <VerifyStage
            phone={phone}
            code={code}
            onCode={setCode}
            onVerified={() => setStage("home")}
            onBack={() => setStage("request")}
          />
        ) : (
          <HomeStage onSignOut={() => setStage("request")} />
        )}
      </div>
    </main>
  )
}

// ─── Request ──────────────────────────────────────────────────────────────────

function RequestStage({
  phone,
  onPhone,
  onSubmit,
}: {
  phone: string
  onPhone: (v: string) => void
  onSubmit: () => void
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6 flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Your bookings, all in one place
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your mobile and we&apos;ll text you a code. New here? We&apos;ll set you up
          automatically.
        </p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (phone.trim()) onSubmit()
        }}
      >
        <div className="group flex flex-col gap-1.5">
          <Label htmlFor="acct-phone">Mobile number</Label>
          <Input
            id="acct-phone"
            inputMode="tel"
            placeholder="+971 50 123 4567"
            value={phone}
            onChange={(e) => onPhone(e.target.value)}
          />
        </div>
        <Button type="submit" radius="full" size="lg" className="w-full" disabled={!phone.trim()}>
          Send me a code
        </Button>
      </form>

      <p className="mt-auto pt-8 text-center text-xs text-muted-foreground">
        By continuing you agree to Cami&apos;s{" "}
        <span className="font-medium text-cami-violet-11">terms</span> and{" "}
        <span className="font-medium text-cami-violet-11">privacy policy</span>.
      </p>
    </div>
  )
}

// ─── Verify ───────────────────────────────────────────────────────────────────

function VerifyStage({
  phone,
  code,
  onCode,
  onVerified,
  onBack,
}: {
  phone: string
  code: string
  onCode: (v: string) => void
  onVerified: () => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6 flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Enter your code</h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{phone || "your phone"}</span>.
        </p>
      </div>

      <OtpInput value={code} onValueChange={onCode} ariaLabel="Verification code" />

      <Button
        radius="full"
        size="lg"
        className="mt-6 w-full"
        disabled={code.length < 6}
        onClick={onVerified}
      >
        Verify
      </Button>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
        <span>Didn&apos;t get it?</span>
        <button type="button" className="link font-medium text-cami-violet-11">
          Resend
        </button>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="link mx-auto mt-auto w-fit pt-8 text-sm font-medium text-muted-foreground"
      >
        Use a different number
      </button>
    </div>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────────

function HomeStage({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Hi {PARENT.firstName}
      </h1>

      {/* Upcoming */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Upcoming
        </h2>
        <Link
          href={`/${UPCOMING.businessSlug}/booking/${UPCOMING.ref}`}
          className="flex items-center gap-3 rounded-2xl border border-border/60 p-4 transition-colors hover:bg-muted/40"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cami-violet-3 text-cami-violet-11">
            <CalendarIcon className="size-5" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-foreground">
              {UPCOMING.serviceName} · {UPCOMING.businessName}
            </span>
            <span className="text-xs text-muted-foreground">{UPCOMING.when}</span>
          </span>
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      </section>

      {/* Pets */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Your pets
        </h2>
        <div className="flex flex-col gap-2">
          {RETURNING_PETS.map((pet) => (
            <div
              key={pet.id}
              className="flex items-center gap-3 rounded-2xl border border-border/60 p-3"
            >
              <Avatar size="md" fallback="species" species={pet.species} name={pet.name} />
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate text-sm font-medium text-foreground">{pet.name}</span>
                <span className="truncate text-xs text-muted-foreground">{pet.breed}</span>
              </span>
            </div>
          ))}
          <button
            type="button"
            className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PawPrintIcon className="size-4" />
            </span>
            Add a pet
          </button>
        </div>
      </section>

      {/* Profile */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Your details
        </h2>
        <div className="flex flex-col divide-y divide-border/60 rounded-2xl border border-border/60 px-4">
          <ProfileRow label="Name" value={PARENT.name} />
          <ProfileRow label="Mobile" value={PARENT.phone} />
          <ProfileRow label="Email" value={PARENT.email} />
        </div>
      </section>

      <button
        type="button"
        onClick={onSignOut}
        className={cn("link mx-auto w-fit pt-2 text-sm font-medium text-muted-foreground")}
      >
        Sign out
      </button>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}
