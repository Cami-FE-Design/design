"use client"

import { MailIcon, PhoneIcon, UserIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { EditMyProfileDialog, VerifyPhoneDialog } from "@/components/blocks/edit-my-profile-dialog"
import { SettingsRow } from "@/components/blocks/settings-row"
import { Button } from "@/components/ui/button"
import { maskEmail, maskPhone, useCurrentUser } from "@/lib/current-user"

/**
 * "My profile" panel inside the Pet Business settings dialog (Account group).
 * Scope matches DSG-63 "Personal info, view and edit contact details" exactly:
 * one Contact card (Business-details pattern — w-146 footprint, SettingsRow
 * grid, single Edit → full-screen takeover). Name saves directly; a new
 * mobile number confirms by OTP, a new email by link; pending changes show
 * inline below the rows with Verify/Resend/Cancel. Anything beyond the ticket
 * (schedule, workspaces, security) is intentionally absent.
 */
export function MyProfilePanel() {
  const { user } = useCurrentUser()
  const [editing, setEditing] = useState(false)

  const fullName = `${user.firstName} ${user.lastName}`.trim()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
          Personal info
        </h2>
        <p className="text-sm leading-5 text-muted-foreground">
          Customize your personal details and how we can contact you.
        </p>
      </header>

      <section className="flex w-full flex-col gap-6 rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146 sm:max-w-146">
        <header className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">Contact</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            radius="full"
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-[16rem_16rem]">
          <SettingsRow
            icon={UserIcon}
            label="Legal name"
            value={fullName}
            onAdd={() => setEditing(true)}
          />
          <SettingsRow
            icon={PhoneIcon}
            label="Mobile number"
            value={user.phone ? maskPhone(user.phoneCode, user.phone) : null}
            onAdd={() => setEditing(true)}
          />
          <SettingsRow
            icon={MailIcon}
            label="Email address"
            value={maskEmail(user.email)}
            onAdd={() => setEditing(true)}
          />
        </div>

        <PendingContactNotices />
      </section>

      <EditMyProfileDialog open={editing} onOpenChange={setEditing} />
    </div>
  )
}

/**
 * Pending contact changes (DSG-63): a new email waits for its confirmation
 * link, a new mobile number waits for its OTP. The current values stay active
 * until confirmed; either change can be cancelled. Rendered in the shared
 * left-accent notice idiom (see terminal-pairing-panel.tsx) — yellow for
 * "action needed", primary action as a pill on the right, secondary actions
 * inline in the copy. "Open link" stands in for clicking the confirmation
 * email in this demo.
 */
function PendingContactNotices() {
  const { pending, confirmEmailChange, cancelEmailChange, cancelPhoneChange } = useCurrentUser()
  const [verifyOpen, setVerifyOpen] = useState(false)

  if (!pending.email && !pending.phone) return null

  return (
    <div className="flex flex-col gap-3">
      {pending.phone ? (
        <div className="flex items-start justify-between gap-3 rounded-xl border-l-2 border-cami-yellow-8 bg-cami-yellow-2 p-3 text-sm leading-5 text-foreground">
          <div className="flex items-start gap-2">
            <PhoneIcon className="mt-0.5 size-4 shrink-0 text-cami-yellow-11" aria-hidden />
            <span>
              <span className="font-medium">Verify your new mobile number.</span> We texted a code
              to {maskPhone(pending.phone.code, pending.phone.number)} — your current number stays
              active until you verify.{" "}
              <button
                type="button"
                className="link font-medium text-tomato-11"
                onClick={() => {
                  cancelPhoneChange()
                  toast("Mobile number change cancelled")
                }}
              >
                Cancel change
              </button>
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            radius="full"
            className="shrink-0"
            onClick={() => setVerifyOpen(true)}
          >
            Verify now
          </Button>
        </div>
      ) : null}

      {pending.email ? (
        <div className="flex items-start justify-between gap-3 rounded-xl border-l-2 border-cami-yellow-8 bg-cami-yellow-2 p-3 text-sm leading-5 text-foreground">
          <div className="flex items-start gap-2">
            <MailIcon className="mt-0.5 size-4 shrink-0 text-cami-yellow-11" aria-hidden />
            <span>
              <span className="font-medium">Confirm your new email address.</span> We sent a link to{" "}
              {pending.email} — your current email stays active until you confirm.{" "}
              <button
                type="button"
                className="link font-medium text-cami-violet-11"
                onClick={() => toast("Confirmation link re-sent")}
              >
                Resend link
              </button>
              <span aria-hidden> · </span>
              <button
                type="button"
                className="link font-medium text-tomato-11"
                onClick={() => {
                  cancelEmailChange()
                  toast("Email change cancelled")
                }}
              >
                Cancel change
              </button>
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            radius="full"
            className="shrink-0"
            onClick={() => {
              confirmEmailChange()
              toast.success("Email address updated")
            }}
          >
            Open link (demo)
          </Button>
        </div>
      ) : null}

      <VerifyPhoneDialog open={verifyOpen} onOpenChange={setVerifyOpen} />
    </div>
  )
}
