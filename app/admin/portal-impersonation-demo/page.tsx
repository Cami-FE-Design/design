"use client"

import { ReceiptTextIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { AppShell } from "@/components/blocks/app-shell"
import { ImpersonationBanner } from "@/components/blocks/impersonation-banner"
import { PIIReveal } from "@/components/blocks/pii-reveal"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-mock"
import { useDemoBusiness } from "@/lib/demo-business"

const BUSINESS = {
  ownerName: "Maz Khan",
  ownerEmail: "maaz@getcami.io",
}

const INVOICE = {
  id: "INV-2031",
  customerName: "Lina Haddad",
  customerPhone: "+971 50 482 6967",
  customerEmail: "lina.haddad@gmail.com",
  customerAddress: "Apt 1204, Marina Pinnacle Tower, Dubai Marina, Dubai",
  paymentLast4: "4242",
  total: "AED 312.00",
  date: "29 Apr 2026",
  status: "Paid",
}

export default function PortalImpersonationDemoPage() {
  const auth = useAuth()
  const { name: businessName } = useDemoBusiness()
  const [reveals, setReveals] = useState<
    { id: string; field: string; reason: string; at: string }[]
  >([])
  function appendReveal(field: string, reason: string, at: string) {
    setReveals((prev) => [...prev, { id: crypto.randomUUID(), field, reason, at }])
  }

  useEffect(() => {
    if (!auth.isImpersonating) auth.setImpersonating(true)
  }, [auth])

  return (
    <div className="h-dvh w-full overflow-hidden bg-cami-yellow-9 p-1 lg:h-screen">
      <div className="relative flex h-full w-full overflow-hidden rounded-xl">
        <div className="relative flex h-full w-full overflow-hidden">
          <AppShell
            breakpoint="desktop"
            className="h-full"
            header={
              <div className="flex w-full items-center justify-between gap-4">
                <h1 className="font-heading text-base font-medium leading-6 text-foreground">
                  {businessName}, Owner view
                </h1>
                <span className="text-xs text-muted-foreground">Partner portal</span>
              </div>
            }
          >
            <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-3">
              <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background p-5 lg:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-cami-violet-3 text-cami-violet-11">
                      <ReceiptTextIcon className="size-4" />
                    </span>
                    <div className="flex flex-col leading-tight">
                      <span className="font-mono text-xs text-muted-foreground">{INVOICE.id}</span>
                      <span className="text-sm font-medium text-foreground">
                        Invoice for {INVOICE.customerName}
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-cami-green-3 text-cami-green-11">{INVOICE.status}</Badge>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <InvoiceField label="Date" value={INVOICE.date} />
                  <InvoiceField label="Total" value={INVOICE.total} />
                  <InvoiceField label="Customer name" value={INVOICE.customerName} />
                  <PIIInvoiceField label="Phone">
                    <PIIReveal
                      field="customer_phone"
                      resource={`Invoice ${INVOICE.id}`}
                      value={INVOICE.customerPhone}
                      onReveal={(reason, at) => appendReveal("customer_phone", reason, at)}
                    />
                  </PIIInvoiceField>
                  <PIIInvoiceField label="Email">
                    <PIIReveal
                      field="customer_email"
                      resource={`Invoice ${INVOICE.id}`}
                      value={INVOICE.customerEmail}
                      onReveal={(reason, at) => appendReveal("customer_email", reason, at)}
                    />
                  </PIIInvoiceField>
                  <PIIInvoiceField label="Billing address">
                    <PIIReveal
                      field="customer_address"
                      resource={`Invoice ${INVOICE.id}`}
                      value={INVOICE.customerAddress}
                      onReveal={(reason, at) => appendReveal("customer_address", reason, at)}
                    />
                  </PIIInvoiceField>
                  <PIIInvoiceField label="Card on file">
                    <PIIReveal
                      field="payment_last4"
                      resource={`Invoice ${INVOICE.id}`}
                      value={INVOICE.paymentLast4}
                      onReveal={(reason, at) => appendReveal("payment_last4", reason, at)}
                    />
                  </PIIInvoiceField>
                </div>

                <div className="mt-2 rounded-xl bg-cami-yellow-3 px-3 py-2.5 text-xs text-cami-yellow-12">
                  Sensitive fields are masked while you're impersonating. Each reveal is logged with
                  your reason and visible to {BUSINESS.ownerName} on request.
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background p-5">
                <h2 className="text-sm font-medium text-foreground">This session</h2>
                <p className="text-sm text-muted-foreground">
                  Cami HQ logs every action you take here against your name.
                </p>
                <div className="flex flex-col gap-2">
                  <SessionStat label="HQ user" value={auth.user.name} />
                  <SessionStat label="Pet Business" value={businessName} />
                  <SessionStat
                    label="Sensitive reveals"
                    value={reveals.length === 0 ? "None yet" : `${reveals.length} this session`}
                  />
                </div>
                {reveals.length > 0 ? (
                  <div className="mt-1 flex flex-col gap-1.5 rounded-xl bg-muted/40 p-3">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Reveal history
                    </span>
                    <ul className="flex flex-col gap-1.5">
                      {reveals.map((r) => (
                        <li key={r.id} className="flex flex-col gap-0.5 text-xs leading-4">
                          <span className="font-mono text-muted-foreground">
                            {new Date(r.at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                          <span className="text-foreground">
                            {r.field.replace("_", " ")}, reason: {r.reason}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </AppShell>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center">
          <div className="pointer-events-auto">
            <ImpersonationBanner
              ownerName={BUSINESS.ownerName}
              businessName={businessName}
              onExit={() => {
                auth.setImpersonating(false)
                window.close()
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function InvoiceField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}

function PIIInvoiceField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
        <span className="rounded-sm bg-cami-yellow-3 px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cami-yellow-11">
          PII
        </span>
      </span>
      {children}
    </div>
  )
}

function SessionStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  )
}
