"use client"

// The unique invoice link, as the customer sees it (DSG-72).
//
// Path shape matches production exactly — live Cami's Share invoice hands out
// `https://business.getcami.io/invoice/<id>`, so this is `/invoice/<id>`. That
// means the URL in <ShareInvoiceDialog> is a real, clickable link in the design
// repo instead of a cosmetic string.
//
// No AppShell: this is a customer surface, and the customer is not signed in.
// Per §4 the document itself is unchanged here — "the on-screen link view is the
// same document in a viewport frame, not a separate design" — so the only thing
// this adds is a thin action bar.

import { DownloadIcon } from "lucide-react"
import { MOCK_SALES } from "@/app/sales/sales-list/page"
import { InvoiceDocumentView } from "@/components/blocks/invoice-document"
import { Button } from "@/components/ui/button"
import { invoiceFromSale } from "@/lib/invoice/from-sale"
import { documentTitle } from "@/lib/invoice/totals"

export function InvoiceLinkView({ id }: { id: string }) {
  const sale = MOCK_SALES.find((s) => String(s.id) === id)

  if (!sale) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-sand-2 px-6">
        <div className="flex max-w-md flex-col gap-2 text-center">
          <h1 className="text-xl font-semibold text-foreground">Invoice not found</h1>
          <p className="text-sm text-muted-foreground">
            This link may have expired, or the invoice was removed. Ask the business for a new link.
          </p>
        </div>
      </main>
    )
  }

  const doc = invoiceFromSale(sale)
  const label = `${documentTitle(doc)} #${doc.number}`

  return (
    <main className="flex min-h-dvh flex-col items-center gap-5 bg-sand-2 px-4 py-8">
      {/* The action bar is the only chrome. It must not compete with the
          document, so it borrows the document's own width. */}
      <div className="flex w-full max-w-[210mm] items-center justify-between gap-4 rounded-xl border border-border/60 bg-card px-5 py-3 print:hidden">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{label}</span>
          <span className="truncate text-xs text-muted-foreground">
            {doc.issuer.tradingName ?? doc.issuer.legalName}
          </span>
        </div>
        <Button size="sm" radius="full" onClick={() => window.print()}>
          <DownloadIcon className="size-3.5" />
          Download PDF
        </Button>
      </div>

      {/* The one surface a customer opens on a phone, so it reflows below md.
          Same blocks, same order, same figures — only the geometry moves, and
          print still emits true A4. Pending §9 Q14. */}
      <InvoiceDocumentView doc={doc} responsive />
    </main>
  )
}
