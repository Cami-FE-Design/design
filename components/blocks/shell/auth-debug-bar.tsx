"use client"

import { ChevronDownIcon, FlaskConicalIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ALL_HQ_PERMISSIONS, type PermissionKey, useAuth } from "@/lib/auth-mock"
import { cn } from "@/lib/utils"

const PERMISSION_LABELS: Record<PermissionKey, string> = {
  "dashboard.view": "Dashboard",
  "merchants.view": "Pet Businesses (view)",
  "merchants.edit": "Pet Businesses (edit)",
  "merchants.impersonate": "Login as Owner",
  "billing.read": "Billing (read)",
  "billing.edit": "Billing (edit)",
  "billing.camipay.rails.edit": "CamiPay rails (edit)",
  "billing.camipay.rates.edit": "CamiPay rates (edit)",
  "support.read": "Support",
  "audit.read": "Audit Log",
  "analytics.read": "Analytics",
  "hq_users.read": "HQ Users (read)",
  "hq_users.edit": "HQ Users (edit)",
  "roles.read": "Roles & Permissions",
}

export function AuthDebugBar() {
  const auth = useAuth()
  const [open, setOpen] = useState(false)

  function toggle(perm: PermissionKey, checked: boolean) {
    const next = new Set(auth.permissions)
    if (checked) next.add(perm)
    else next.delete(perm)
    auth.setPermissions(next)
  }

  function applyPreset(perms: PermissionKey[]) {
    auth.setPermissions(new Set(perms))
  }

  return (
    <div
      data-slot="auth-debug-bar"
      className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2"
    >
      {open ? (
        <div className="w-80 rounded-2xl bg-background p-4 shadow-overlay">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Demo controls
              </p>
              <p className="mt-1 text-sm text-foreground">
                Flip permissions, impersonation, and locale to see the HQ console adapt.
              </p>
            </div>

            <div className="flex flex-wrap gap-1">
              <Button
                variant="outline"
                size="xs"
                onClick={() => applyPreset([...ALL_HQ_PERMISSIONS])}
              >
                hq_admin
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() =>
                  applyPreset([
                    "dashboard.view",
                    "merchants.view",
                    "merchants.impersonate",
                    "support.read",
                    "audit.read",
                  ])
                }
              >
                hq_support
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() =>
                  applyPreset([
                    "dashboard.view",
                    "merchants.view",
                    "billing.read",
                    "billing.edit",
                    "audit.read",
                  ])
                }
              >
                hq_billing
              </Button>
              <Button variant="outline" size="xs" onClick={() => applyPreset([])}>
                None
              </Button>
            </div>

            <div className="-mx-1 h-px bg-border/60" />

            <div className="flex flex-col gap-1.5">
              {ALL_HQ_PERMISSIONS.map((perm) => {
                const checked = auth.permissions.has(perm)
                const id = `debug-perm-${perm}`
                return (
                  <label
                    key={perm}
                    htmlFor={id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1 text-sm hover:bg-muted/40"
                  >
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={(v) => toggle(perm, v === true)}
                    />
                    <span className="flex-1 text-sm text-foreground">
                      {PERMISSION_LABELS[perm]}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{perm}</span>
                  </label>
                )
              })}
            </div>

            <div className="-mx-1 h-px bg-border/60" />

            <div className="flex items-center justify-between">
              <Label htmlFor="debug-impersonating" className="text-sm">
                Impersonating
              </Label>
              <Switch
                id="debug-impersonating"
                checked={auth.isImpersonating}
                onCheckedChange={auth.setImpersonating}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="debug-rtl" className="text-sm">
                RTL (Arabic locale)
              </Label>
              <Switch
                id="debug-rtl"
                checked={auth.locale === "ar"}
                onCheckedChange={(v) => auth.setLocale(v ? "ar" : "en")}
              />
            </div>
          </div>
        </div>
      ) : null}
      <Button
        variant="default"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="shadow-overlay"
        data-icon="inline-start"
      >
        <FlaskConicalIcon />
        Demo controls
        <ChevronDownIcon className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </Button>
    </div>
  )
}
