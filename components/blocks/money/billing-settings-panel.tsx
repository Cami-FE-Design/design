"use client"

// Billing panel inside the app settings dialog — DSG-73 §5.
//
// Its own section, separate from Payments, matching the benchmark. Fresha's
// workspace settings carry Business setup, Payments and Billing as three
// different cards, and the split is a good one:
//
//   Business setup  — how you trade. Trading name, currency, tax calculation.
//   Payments        — how your CLIENTS pay YOU. Policy, methods, terminals.
//   Billing         — who you are legally, and your money with the platform.
//
// Invoices and fees lives here as a panel rather than as a page you get thrown
// out of the dialog to reach. A settings menu card that closes the dialog and
// lands you somewhere else is disorienting, and Fresha keeps its equivalent in
// this same group.
//
// Putting the bank account and the legal entity under Payments (where they
// first landed) collides with Business details, because both then look like
// "my business's information". Under Billing there is nothing to explain: this
// is the identity printed on documents and the account the money lands in.
//
// Structure mirrors PaymentsSettingsPanel exactly — a card list that swaps to a
// sub-screen, with deep links for /screens.

import { BanknoteIcon, LandmarkIcon, ReceiptTextIcon, ScrollTextIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import {
  type BankAccountDemoState,
  BankAccountPanel,
} from "@/components/blocks/money/bank-account-panel"
import {
  type BillingDetailsDemoState,
  BillingDetailsPanel,
} from "@/components/blocks/money/billing-details-panel"
import { MoneyFeesPanel } from "@/components/blocks/money/money-fees-panel"
import { SettingsPanel } from "@/components/blocks/settings-panel"

const cardClass =
  "group flex flex-col gap-2.5 rounded-2xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-foreground/3"
const cardIconClass =
  "flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground"

type BillingView = "home" | "details" | "bank" | "fees"

const BILLING_BREADCRUMB_ROOT = { label: "Billing", icon: BanknoteIcon }

const BILLING_CARDS: {
  id: Exclude<BillingView, "home">
  label: string
  description: string
  icon: typeof BanknoteIcon
}[] = [
  {
    id: "details",
    label: "Billing details",
    description: "Legal name, TRN, and registered address, as printed on your invoices.",
    icon: ScrollTextIcon,
  },
  {
    id: "bank",
    label: "Bank account",
    description: "Where your payouts are sent, and when each sender pays them.",
    icon: LandmarkIcon,
  },
  {
    id: "fees",
    label: "Invoices and fees",
    description: "What Cami charged you, per period, with your tax invoices to download.",
    icon: ReceiptTextIcon,
  },
]

export function BillingSettingsPanel() {
  const searchParams = useSearchParams()
  const pathname = usePathname() ?? "/"
  const router = useRouter()

  const bp = searchParams.get("bp")
  const [view, setView] = useState<BillingView>(
    bp === "bank" || bp === "details" || bp === "fees" ? bp : "home",
  )

  // Going back to the card list also drops the deep-link params. Without this
  // the ?bp= that opened the sub-screen stays in the URL, so every time the
  // panel remounts — switching to Sales or Locations in the rail and back —
  // it re-seeds from the URL and reopens the sub-screen the user just left.
  function backToHome() {
    setView("home")
    const next = new URLSearchParams(searchParams.toString())
    for (const key of ["bp", "bl", "bd", "d1"]) next.delete(key)
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  if (view === "details") {
    return (
      <BillingDetailsPanel
        onBack={backToHome}
        breadcrumbRoot={BILLING_BREADCRUMB_ROOT}
        initialState={(searchParams.get("bl") as BillingDetailsDemoState) ?? "complete"}
      />
    )
  }

  if (view === "fees") {
    return (
      <MoneyFeesPanel
        onBack={backToHome}
        breadcrumbRoot={BILLING_BREADCRUMB_ROOT}
        terminalModel={searchParams.get("d1") === "invoice" ? "cami-invoices" : "gateway-deducts"}
      />
    )
  }

  if (view === "bank") {
    return (
      <BankAccountPanel
        onBack={backToHome}
        breadcrumbRoot={BILLING_BREADCRUMB_ROOT}
        initialState={(searchParams.get("bd") as BankAccountDemoState) ?? null}
      />
    )
  }

  return (
    <SettingsPanel
      header={
        <header className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">Billing</h2>
          <p className="max-w-xl text-sm leading-5 text-muted-foreground">
            Your legal details, where your payouts land, and what Cami charged you.
          </p>
        </header>
      }
    >
      {/* Same card footprint as the Payments landing and the Sales landing
          (see sales-settings.tsx) — this is a sibling menu, so it is the same
          menu. */}
      <div className="grid gap-3 sm:w-146 sm:grid-cols-2">
        {BILLING_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setView(card.id)}
              className={cardClass}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className={cardIconClass}>
                  <Icon className="size-4" />
                </span>
                <span className="truncate text-base font-semibold text-foreground">
                  {card.label}
                </span>
              </span>
              <span className="text-sm leading-5 text-muted-foreground">{card.description}</span>
            </button>
          )
        })}
      </div>
    </SettingsPanel>
  )
}
