"use client"

// Invoices and fees, inside the Billing settings section — DSG-76.
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md
//
// The screen itself is `MoneyFeesView`; this is only the settings frame around
// it — breadcrumb, title, description — so the merchant stays inside the dialog
// they opened rather than being thrown out to a page.
//
// Same view, same derivation, whichever way in they came.

import { MoneyFeesView } from "@/components/blocks/money/money-fees"
import { NotionBreadcrumb } from "@/components/blocks/notion-breadcrumb"
import type { BreadcrumbRoot } from "@/components/blocks/sales-settings"
import { SettingsPanel } from "@/components/blocks/settings-panel"
import { CamiPayProvider } from "@/lib/hq-camipay/store"
import type { TerminalFeeModel } from "@/lib/money/fees"
import { MONEY_TXS } from "@/lib/money/mock"
import type { MerchantRails } from "@/lib/money/types"

const BOTH_RAILS: MerchantRails = { online: true, terminal: true }

export function MoneyFeesPanel({
  onBack,
  breadcrumbRoot,
  terminalModel = "gateway-deducts",
  rails = BOTH_RAILS,
}: {
  onBack: () => void
  breadcrumbRoot: BreadcrumbRoot
  /** Decision D1, still open. Both outcomes are drawn. */
  terminalModel?: TerminalFeeModel
  rails?: MerchantRails
}) {
  return (
    <SettingsPanel
      header={
        <>
          <NotionBreadcrumb
            segments={[
              { label: breadcrumbRoot.label, icon: breadcrumbRoot.icon, onClick: onBack },
              { label: "Invoices and fees" },
            ]}
          />
          <header className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
              Invoices and fees
            </h2>
            <p className="max-w-xl text-sm leading-5 text-muted-foreground">
              What Cami charged you, period by period, with your tax invoices to download.
            </p>
          </header>
        </>
      }
    >
      {/* The CamiPay store is mounted in the HQ layout, not this one — same
          wrapping the Payments panel does for the rates screen, so a rate set
          in HQ is the rate this screen states. */}
      <CamiPayProvider>
        <MoneyFeesView
          txs={MONEY_TXS.filter((t) => rails[t.rail])}
          rails={rails}
          terminalModel={terminalModel}
        />
      </CamiPayProvider>
    </SettingsPanel>
  )
}
