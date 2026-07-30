"use client"

import { ClockIcon, MailIcon, PhoneIcon, UserIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  ConfirmEmailDialog,
  EditMyProfileDialog,
  VerifyPhoneDialog,
} from "@/components/blocks/edit-my-profile-dialog"
import { SettingsRow } from "@/components/blocks/settings-row"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { maskEmail, maskPhone, useCurrentUser } from "@/lib/current-user"

/**
 * "My profile" panel inside the Pet Business settings dialog (Account group).
 * Scope matches DSG-63 "Personal info, view and edit contact details" exactly:
 * one Contact card (Business-details pattern — w-146 footprint, SettingsRow
 * grid, single Edit → full-screen takeover). Name saves directly; a new
 * mobile number confirms by OTP, a new email by link; a pending change shows
 * as a "Pending verification" badge on its row that opens the matching
 * dialog. Anything beyond the ticket (schedule, workspaces, security) is
 * intentionally absent.
 */
export function MyProfilePanel() {
  const { pending, confirmEmailChange } = useCurrentUser()
  const [editing, setEditing] = useState(false)

  return (
    <div className="flex h-full flex-col gap-6">
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

        <ContactGrid onEdit={() => setEditing(true)} />
      </section>

      {/* Prototype demo control — stands in for the recipient clicking the
          confirmation link in their inbox, which no prototype can do for
          real. Same subtle bottom-right convention as the Gift cards
          empty-state toggle. */}
      {pending.email ? (
        <div className="mt-auto flex justify-end pt-2">
          <button
            type="button"
            onClick={() => {
              confirmEmailChange()
              toast.success("Email address updated")
            }}
            className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
          >
            Demo: open confirmation link
          </button>
        </div>
      ) : null}

      <EditMyProfileDialog open={editing} onOpenChange={setEditing} />
    </div>
  )
}

/**
 * The Contact rows. A pending change (DSG-63) shows as a single neutral
 * "Pending verification" badge under its own row — clicking it opens the
 * matching dialog (phone → OTP entry, email → confirmation-link sheet) where
 * Verify / Resend / Cancel live. The current value stays in place until the
 * change is confirmed, and the card itself stays free of notice blocks.
 */
function ContactGrid({ onEdit }: { onEdit: () => void }) {
  const { user, pending } = useCurrentUser()
  const [verifyPhoneOpen, setVerifyPhoneOpen] = useState(false)
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false)

  const fullName = `${user.firstName} ${user.lastName}`.trim()

  return (
    <>
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-[16rem_16rem]">
        <SettingsRow icon={UserIcon} label="Legal name" value={fullName} onAdd={onEdit} />
        <ContactRow
          icon={PhoneIcon}
          label="Mobile number"
          value={user.phone ? maskPhone(user.phoneCode, user.phone) : "—"}
          pending={pending.phone ? <PendingBadge onClick={() => setVerifyPhoneOpen(true)} /> : null}
        />
        <ContactRow
          icon={MailIcon}
          label="Email address"
          value={maskEmail(user.email)}
          pending={
            pending.email ? <PendingBadge onClick={() => setConfirmEmailOpen(true)} /> : null
          }
        />
      </div>

      <VerifyPhoneDialog open={verifyPhoneOpen} onOpenChange={setVerifyPhoneOpen} />
      <ConfirmEmailDialog open={confirmEmailOpen} onOpenChange={setConfirmEmailOpen} />
    </>
  )
}

/**
 * SettingsRow shape (icon box + label/value) with an optional pending badge.
 * The badge sits inline after the value so the row keeps the exact two-line
 * height of its SettingsRow siblings — the grid stays balanced.
 */
function ContactRow({
  icon: Icon,
  label,
  value,
  pending,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  pending?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-sm leading-5 text-muted-foreground">{label}</span>
        <span className="flex min-w-0 items-center gap-2 text-sm font-medium leading-5 text-foreground">
          <span className="truncate">{value}</span>
          {pending}
        </span>
      </div>
    </div>
  )
}

/** Neutral clickable pill — the row's only hint that a change awaits action. */
function PendingBadge({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="shrink-0">
      <Badge
        variant="secondary"
        className="cursor-pointer font-normal transition-colors hover:bg-foreground/10"
      >
        <ClockIcon className="size-3" aria-hidden />
        Pending
      </Badge>
    </button>
  )
}
