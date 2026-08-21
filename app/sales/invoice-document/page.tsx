"use client"

// Demo route for the downloadable invoice (DSG-72 §5).
//
// Every state in the spec is reachable by query param, so the screens can be
// reviewed against the reference PDFs in docs/specs/assets/ side by side:
//   ?state=<id>      — one of INVOICE_FIXTURES (defaults to completed)
//   ?surface=pdf|link|email
//
// The `surface` param only changes the chrome AROUND the document. The document
// itself is one component on all three, which is how §8's "consistent in content
// and field order" is guaranteed rather than promised.

import { ArrowLeftIcon, DownloadIcon, PaperclipIcon, PrinterIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useRef } from "react"
import { MOCK_SALES } from "@/app/sales/sales-list/page"
import { AppShell } from "@/components/blocks/app-shell"
import { InvoiceDocumentView } from "@/components/blocks/invoice-document"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { invoiceFromSale } from "@/lib/invoice/from-sale"
import {
  DEFAULT_INVOICE_FIXTURE,
  INVOICE_FIXTURE_IDS,
  INVOICE_FIXTURES,
  resolveInvoiceFixture,
} from "@/lib/invoice/mock"
import { documentTitle } from "@/lib/invoice/totals"

type Surface = "pdf" | "link" | "email"

const SURFACES: ReadonlyArray<{ id: Surface; label: string }> = [
  { id: "pdf", label: "PDF download" },
  { id: "link", label: "Invoice link" },
  { id: "email", label: "Email attachment" },
]

function InvoiceDocumentDemo() {
  const router = useRouter()
  const params = useSearchParams()

  const stateId = params.get("state") ?? DEFAULT_INVOICE_FIXTURE
  const surface = (params.get("surface") as Surface | null) ?? "pdf"

  // ?sale=<id> renders the document for a real row from the sales listing, which
  // is what the Sale detail dialog's Share invoice / Print / Download actions
  // open. ?state=<id> renders a spec fixture. Sale wins when both are present.
  const autoPrint = params.get("autoprint") === "1"
  const saleId = Number(params.get("sale"))
  const sale = Number.isFinite(saleId) ? MOCK_SALES.find((s) => s.id === saleId) : undefined
  const doc = sale ? invoiceFromSale(sale) : resolveInvoiceFixture(stateId)

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      next.set(key, value)
      // Picking a fixture drops the sale, otherwise ?sale= would keep winning and
      // the switcher would look broken.
      if (key === "state") next.delete("sale")
      router.replace(`?${next.toString()}`, { scroll: false })
    },
    [params, router],
  )

  const activeState = stateId in INVOICE_FIXTURES ? stateId : DEFAULT_INVOICE_FIXTURE

  // ?autoprint=1 opens the print dialog on its own, which is what production's
  // Print does: it generates the PDF, opens it in a new tab, and the print
  // dialog appears without a second click. Guarded by a ref so React's dev-mode
  // double-effect cannot raise two dialogs, and deferred a beat so the A4 page
  // and its fonts have painted before the browser snapshots it.
  const printed = useRef(false)
  useEffect(() => {
    if (!autoPrint || printed.current) return
    printed.current = true
    const timer = setTimeout(() => window.print(), 300)
    return () => clearTimeout(timer)
  }, [autoPrint])

  return (
    <AppShell
      header={
        // Two headers, deliberately. Arriving from a sale is a product surface —
        // it must not look like a design-repo harness, so the fixture switcher
        // and the spec blurb are gone and the page names the document itself.
        // Arriving without a sale IS the harness, and keeps both.
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          {sale ? (
            <>
              <div className="flex flex-col">
                <h1 className="text-2xl font-medium leading-8 text-foreground">
                  {documentTitle(doc)} #{doc.number}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sale #{sale.id} · {sale.client}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  radius="full"
                  size="sm"
                  onClick={() => router.push(`/sales/sales-list?sale=${sale.id}`)}
                >
                  <ArrowLeftIcon className="size-3.5" />
                  Back to sale
                </Button>
                <Button radius="full" size="sm" onClick={() => window.print()}>
                  <PrinterIcon className="size-3.5" />
                  Print
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col">
                <h1 className="text-2xl font-medium leading-8 text-foreground">Invoice document</h1>
                <p className="text-sm text-muted-foreground">
                  A4 tax invoice, credit note and every state from the DSG-72 spec. One component
                  renders the PDF, the email attachment and the invoice link.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Select value={activeState} onValueChange={(v) => setParam("state", v)}>
                  <SelectTrigger className="w-56" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVOICE_FIXTURE_IDS.map((id) => (
                      <SelectItem key={id} value={id}>
                        {INVOICE_FIXTURES[id].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" radius="full" size="sm" onClick={() => window.print()}>
                  <PrinterIcon className="size-3.5" />
                  Print
                </Button>
              </div>
            </>
          )}
        </div>
      }
    >
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 overflow-y-auto">
        <Tabs value={surface} onValueChange={(v) => setParam("surface", v)}>
          <TabsList>
            {SURFACES.map((s) => (
              <TabsTrigger key={s.id} value={s.id}>
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Each surface frames the same document differently. Nothing inside the
            page changes — that is the point of §4's field-order guarantee. */}
        <div className="flex flex-col items-center gap-4 pb-10">
          {surface === "link" ? <LinkChrome doc={doc} /> : null}
          {surface === "email" ? <EmailChrome doc={doc} /> : null}

          <div
            className={
              surface === "pdf"
                ? "rounded-lg bg-sand-3 p-6 dark:bg-neutral-900"
                : "rounded-lg bg-sand-3 p-4 dark:bg-neutral-900"
            }
          >
            <InvoiceDocumentView doc={doc} />
          </div>
        </div>
      </div>
    </AppShell>
  )
}

/**
 * The customer-facing invoice link. Per §4 this is the same document in a
 * viewport frame, not a separate design — so the chrome is a thin action bar and
 * nothing more.
 */
function LinkChrome({ doc }: { doc: ReturnType<typeof resolveInvoiceFixture> }) {
  return (
    <div className="flex w-[210mm] items-center justify-between gap-4 rounded-xl border border-border/60 bg-card px-5 py-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">
          {documentTitle(doc)} #{doc.number}
        </span>
        <span className="text-xs text-muted-foreground">{doc.issuer.legalName}</span>
      </div>
      <Button size="sm" radius="full" onClick={() => window.print()}>
        <DownloadIcon className="size-3.5" />
        Download PDF
      </Button>
    </div>
  )
}

/** The attachment as it appears in the email body, above the rendered document. */
function EmailChrome({ doc }: { doc: ReturnType<typeof resolveInvoiceFixture> }) {
  const fileName = `${documentTitle(doc).replace(/\s+/g, "-").toLowerCase()}-${doc.number}.pdf`

  return (
    <div className="flex w-[210mm] flex-col gap-3 rounded-xl border border-border/60 bg-card p-5">
      <span className="text-sm text-foreground">
        Hi {doc.recipient.name}, your {documentTitle(doc).toLowerCase()} from {doc.issuer.legalName}{" "}
        is attached.
      </span>
      <div className="flex items-center gap-3 rounded-xl bg-cami-sage-2 p-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
          <PaperclipIcon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{fileName}</span>
          <span className="text-xs text-muted-foreground">PDF · A4 · 1 page</span>
        </div>
      </div>
    </div>
  )
}

export default function InvoiceDocumentPage() {
  return (
    <Suspense fallback={null}>
      <InvoiceDocumentDemo />
    </Suspense>
  )
}
