"use client"

import { ArrowUpIcon, CircleUserIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type CurrentUser, useCurrentUser } from "@/lib/current-user"
import { cn } from "@/lib/utils"

// Match Input's h-12 / rounded-2xl / bg-input. Same pattern used by
// business-profile-form.tsx so Select triggers don't look shorter than
// adjacent inputs.
const triggerOverride = "data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium"

const countries = ["United Arab Emirates", "Saudi Arabia", "Kuwait", "Qatar", "United Kingdom"]

const phoneCodes = ["+971", "+966", "+965", "+974", "+44", "+1"]

const days = Array.from({ length: 31 }, (_, i) => String(i + 1))
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

type EditMyProfileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Self-edit takeover for the signed-in user's personal details. Opens on top
 * of the Settings dialog (My profile panel) and mirrors the Business details
 * edit dialog: plain sections with labelled fields, Close/Save pills in the
 * header. Saving writes the mock current-user store, so the topbar avatar and
 * name update live.
 */
export function EditMyProfileDialog({ open, onOpenChange }: EditMyProfileDialogProps) {
  const { user, updateUser } = useCurrentUser()
  const [draft, setDraft] = useState<CurrentUser>(user)

  // Re-seed the draft from the store every time the dialog opens, so a
  // cancelled edit doesn't leak stale values into the next session.
  useEffect(() => {
    if (open) setDraft(user)
  }, [open, user])

  const set = (patch: Partial<CurrentUser>) => setDraft((d) => ({ ...d, ...patch }))

  const initials =
    `${draft.firstName.trim().charAt(0)}${draft.lastName.trim().charAt(0)}`.toUpperCase()
  const canSave =
    draft.firstName.trim().length > 0 &&
    draft.lastName.trim().length > 0 &&
    /.+@.+\..+/.test(draft.email.trim())

  function handleSave() {
    updateUser(draft)
    toast.success("Profile updated")
    onOpenChange(false)
  }

  return (
    <FullScreenEditDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit profile"
      subtitle="Update your personal details and how we can contact you."
      saveDisabled={!canSave}
      onSave={handleSave}
      contentClassName="max-w-2xl"
    >
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
            Profile
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            Your name and photo as they appear across Cami.
          </p>
        </div>
        <div className="flex w-full max-w-md flex-col gap-6">
          <AvatarUploader initials={initials} />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
            <Field label="First name">
              <Input
                autoComplete="given-name"
                value={draft.firstName}
                onChange={(e) => set({ firstName: e.target.value })}
              />
            </Field>
            <Field label="Last name">
              <Input
                autoComplete="family-name"
                value={draft.lastName}
                onChange={(e) => set({ lastName: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Job title">
            <Input
              placeholder="e.g. Owner"
              value={draft.jobTitle}
              onChange={(e) => set({ jobTitle: e.target.value })}
            />
          </Field>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium leading-5 text-foreground">Birthday</span>
            <div className="flex gap-2">
              <Select value={draft.birthDay} onValueChange={(v) => set({ birthDay: v })}>
                <SelectTrigger className={cn(triggerOverride, "w-20")}>
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={draft.birthMonth} onValueChange={(v) => set({ birthMonth: v })}>
                <SelectTrigger className={cn(triggerOverride, "flex-1")}>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Year"
                maxLength={4}
                className="w-24"
                value={draft.birthYear}
                onChange={(e) => set({ birthYear: e.target.value })}
              />
            </div>
          </div>
        </div>
      </section>

      <hr className="border-border/40" />

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
            Contact
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            How we reach you about your account. Not visible to clients.
          </p>
        </div>
        <div className="flex w-full max-w-md flex-col gap-6">
          <Field label="Email address">
            <Input
              type="email"
              autoComplete="email"
              value={draft.email}
              onChange={(e) => set({ email: e.target.value })}
            />
          </Field>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium leading-5 text-foreground">Mobile number</span>
            <div className="flex w-full items-center gap-2">
              <Select value={draft.phoneCode} onValueChange={(v) => set({ phoneCode: v })}>
                <SelectTrigger className={cn(triggerOverride, "w-24 shrink-0")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {phoneCodes.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                className="min-w-0 flex-1"
                value={draft.phone}
                onChange={(e) => set({ phone: e.target.value })}
              />
            </div>
          </div>
          <Field label="Country">
            <Select value={draft.country} onValueChange={(v) => set({ country: v })}>
              <SelectTrigger className={triggerOverride}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </section>
    </FullScreenEditDialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: control is passed via children; static analysis can't see through
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium leading-5 text-foreground">{label}</span>
      {children}
    </label>
  )
}

function AvatarUploader({ initials }: { initials: string }) {
  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <div
          aria-hidden
          className="flex size-24 items-center justify-center rounded-full bg-cami-violet-3 font-heading text-2xl font-semibold text-cami-violet-11"
        >
          {initials || <CircleUserIcon className="size-10 text-cami-violet-9" strokeWidth={1.25} />}
        </div>
        <button
          type="button"
          aria-label="Upload photo"
          className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-md ring-2 ring-background transition-colors hover:bg-foreground/90"
        >
          <ArrowUpIcon className="size-4" strokeWidth={2.25} />
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        Your photo shows on the calendar and in the topbar.
      </p>
    </div>
  )
}
