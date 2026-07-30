"use client"

import { Dialog as DialogPrimitive } from "radix-ui"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { OtpInput } from "@/components/ui/otp-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { isEmailTaken, isPhoneTaken, maskPhone, useCurrentUser } from "@/lib/current-user"
import { cn } from "@/lib/utils"

// Match Input's h-12 / rounded-2xl / bg-input. Same pattern used by
// business-profile-form.tsx so Select triggers don't look shorter than
// adjacent inputs.
const triggerOverride = "data-[size=default]:h-12 w-full rounded-2xl bg-input px-4 font-medium"

const phoneCodes = ["+971", "+966", "+965", "+974", "+44", "+1"]

type EditMyProfileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Edit takeover for the signed-in user's contact details (DSG-63). Opens on
 * top of the Settings dialog (Personal info panel) in the shared settings
 * form idiom: plain sections with labelled max-w-md fields, Close/Save pills.
 * Name saves directly; a changed email is parked as a pending change awaiting
 * its confirmation link, and a changed mobile number opens the OTP dialog.
 * Values already used by another team member are rejected inline.
 */
export function EditMyProfileDialog({ open, onOpenChange }: EditMyProfileDialogProps) {
  const { user, pending, requestEmailChange, requestPhoneChange, updateUser } = useCurrentUser()
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [email, setEmail] = useState(user.email)
  const [phoneCode, setPhoneCode] = useState(user.phoneCode)
  const [phone, setPhone] = useState(user.phone)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [otpOpen, setOtpOpen] = useState(false)

  // Re-seed the form from the store every time the dialog opens, so a
  // cancelled edit doesn't leak stale values into the next session.
  useEffect(() => {
    if (open) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setEmail(user.email)
      setPhoneCode(user.phoneCode)
      setPhone(user.phone)
      setEmailError(null)
      setPhoneError(null)
    }
  }, [open, user])

  const canSave =
    firstName.trim().length > 0 && lastName.trim().length > 0 && /.+@.+\..+/.test(email.trim())

  function handleSave() {
    const nextEmail = email.trim()
    const nextPhone = phone.trim()
    const emailChanged = nextEmail !== user.email
    const phoneChanged = nextPhone !== user.phone || phoneCode !== user.phoneCode

    // DSG-63: block values already used by someone else before starting a change.
    if (emailChanged && isEmailTaken(nextEmail)) {
      setEmailError("This email is already in use on Cami. Try another one.")
      return
    }
    if (phoneChanged && nextPhone && isPhoneTaken(phoneCode, nextPhone)) {
      setPhoneError("This mobile number is already in use on Cami. Try another one.")
      return
    }

    // The name applies immediately; email/phone go through verification.
    updateUser({ firstName: firstName.trim(), lastName: lastName.trim() })

    if (emailChanged) {
      requestEmailChange(nextEmail)
      toast.success(`Confirmation link sent to ${nextEmail}`)
    }
    if (phoneChanged && nextPhone) {
      requestPhoneChange(phoneCode, nextPhone)
      onOpenChange(false)
      setOtpOpen(true)
      return
    }
    if (!emailChanged) toast.success("Personal info updated")
    onOpenChange(false)
  }

  return (
    <>
      <FullScreenEditDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Edit personal info"
        subtitle="Update your personal details and how we can contact you."
        saveDisabled={!canSave}
        onSave={handleSave}
        contentClassName="max-w-2xl"
      >
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
              Legal name
            </h3>
            <p className="text-sm leading-5 text-muted-foreground">
              Your name as it appears on receipts and messages to clients.
            </p>
          </div>
          <div className="grid w-full max-w-md grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
            <Field label="First name">
              <Input
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Field>
            <Field label="Last name">
              <Input
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Field>
          </div>
        </section>

        <hr className="border-border/40" />

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
              Contact
            </h3>
            <p className="text-sm leading-5 text-muted-foreground">
              Changing your email or mobile number requires verification — we&apos;ll email you a
              confirmation link, or text a code to a new number. Your current details stay active
              until you confirm.
            </p>
          </div>
          <div className="flex w-full max-w-md flex-col gap-6">
            <Field label="Email address">
              <Input
                type="email"
                autoComplete="email"
                aria-invalid={emailError ? true : undefined}
                value={email}
                onChange={(e) => {
                  setEmailError(null)
                  setEmail(e.target.value)
                }}
              />
              {emailError ? (
                <span role="alert" className="text-sm leading-5 text-destructive">
                  {emailError}
                </span>
              ) : pending.email ? (
                <span className="text-sm leading-5 text-muted-foreground">
                  Change to {pending.email} pending — confirm via the link we emailed you.
                </span>
              ) : null}
            </Field>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium leading-5 text-foreground">Mobile number</span>
              <div className="flex w-full items-center gap-2">
                <Select value={phoneCode} onValueChange={setPhoneCode}>
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
                  aria-invalid={phoneError ? true : undefined}
                  className="min-w-0 flex-1"
                  value={phone}
                  onChange={(e) => {
                    setPhoneError(null)
                    setPhone(e.target.value)
                  }}
                />
              </div>
              {phoneError ? (
                <span role="alert" className="text-sm leading-5 text-destructive">
                  {phoneError}
                </span>
              ) : pending.phone ? (
                <span className="text-sm leading-5 text-muted-foreground">
                  Change to {pending.phone.code} {pending.phone.number} pending — enter the code we
                  texted you.
                </span>
              ) : null}
            </div>
          </div>
        </section>
      </FullScreenEditDialog>

      <VerifyPhoneDialog open={otpOpen} onOpenChange={setOtpOpen} />
    </>
  )
}

/**
 * OTP entry for a pending mobile-number change (DSG-63 story 3). Verify
 * applies the pending number; "Cancel change" discards it; closing keeps the
 * change pending — the Contact card offers "Verify now" to resume.
 */
export function VerifyPhoneDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { pending, confirmPhoneChange, cancelPhoneChange } = useCurrentUser()
  const [code, setCode] = useState("")

  useEffect(() => {
    if (open) setCode("")
  }, [open])

  const target = pending.phone ? maskPhone(pending.phone.code, pending.phone.number) : null
  const canVerify = code.replace(/\D/g, "").length === 6

  function handleVerify() {
    confirmPhoneChange()
    toast.success("Mobile number updated")
    onOpenChange(false)
  }

  function handleCancelChange() {
    cancelPhoneChange()
    toast("Mobile number change cancelled")
    onOpenChange(false)
  }

  // Layout mirrors the pet-parent sign-in verify stage (pet-parent-account.tsx):
  // heading + target line, OTP boxes, full-width Verify, centered links below.
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-6">
        <div className="flex flex-col gap-1.5">
          <DialogTitle>Enter your code</DialogTitle>
          <DialogDescription>
            We texted a 6-digit code to{" "}
            <span className="font-medium text-foreground">{target ?? "your new number"}</span>. Your
            current number stays active until you verify.
          </DialogDescription>
        </div>

        <OtpInput value={code} onValueChange={setCode} ariaLabel="Mobile verification code" />

        <Button
          type="button"
          radius="full"
          size="lg"
          className="w-full"
          disabled={!canVerify}
          onClick={handleVerify}
        >
          Verify
        </Button>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>Didn&apos;t get it?</span>
            <button
              type="button"
              className="link font-medium text-cami-violet-11"
              onClick={() => toast("Code re-sent")}
            >
              Resend
            </button>
          </div>
          <button
            type="button"
            className="link w-fit text-sm font-medium text-muted-foreground"
            onClick={handleCancelChange}
          >
            Cancel this change
          </button>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
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
