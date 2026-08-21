"use client"

// The downloadable invoice document (DSG-72).
//
// Spec: docs/specs/DSG-72-downloadable-invoice.md. Read §3 and §4 before editing.
//
// ONE component renders all three surfaces — PDF download, email attachment, and
// the unique invoice link. That is structural, not a convention: §4 requires the
// field order to be identical across the three, and the only way to guarantee it
// is to have a single renderer. Do not fork this for a surface.
//
// This is paper, not app chrome. It stays white-with-dark-ink in dark mode,
// carries no theme tokens, and uses no badges or pills — a document states its
// own condition in a sentence, which survives a photocopy where a colored pill
// does not (§0.2). The only status affordances are the numbers, a prose
// subtitle, and the void watermark.
//
// Layout departs from both Cami's current output and the Fresha benchmark, which
// both center-stack the top third of the page (§0.4 gap 14). Identity goes
// top-left with the logo slot, document title and meta top-right, recipient
// below identity — A4 with a recipient block and a reserved QR block cannot
// afford four centered lines.

import {
  documentTitle,
  formatInvoiceAmount,
  formatVatRate,
  invoiceTotals,
  lineVat,
  showsLineTaxColumns,
} from "@/lib/invoice/totals"
import type { InvoiceDocument, InvoiceLine } from "@/lib/invoice/types"
import { cn } from "@/lib/utils"

// ─── Dates ────────────────────────────────────────────────────────────────────

const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function formatTime(d: Date) {
  let h = d.getHours()
  const m = d.getMinutes()
  const meridiem = h >= 12 ? "pm" : "am"
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, "0")}${meridiem}`
}

/** "16 Aug 2026" — the compact form used in the meta block. */
function formatDate(d: Date) {
  return `${d.getDate()} ${MONTH[d.getMonth()]} ${d.getFullYear()}`
}

/** "Sunday, 16 Aug 2026 at 9:43am" — the long form, matching the reference. */
function formatDateTimeLong(d: Date) {
  return `${WEEKDAY[d.getDay()]}, ${formatDate(d)} at ${formatTime(d)}`
}

// ─── Pagination ───────────────────────────────────────────────────────────────
//
// Lines are chunked in JS rather than left to the browser. CSS can repeat a
// thead and avoid breaking a row, but it cannot tell us N of M, and §7 requires
// a real page counter plus a repeating condensed identity block. Chunking makes
// §7 reviewable on screen instead of only in a print preview.

/** Rows that fit under the identity, recipient and meta blocks on page 1. */
const ROWS_FIRST_PAGE = 12
/** Rows that fit under the condensed repeated header on later pages. */
const ROWS_LATER_PAGE = 20
/** Row-equivalents the totals, tender and QR blocks need on the last page. */
const CLOSING_BLOCK_ROWS = 8

/**
 * A page carries its own key, derived from the first line it holds, so React
 * never keys a page by its position — the closing-only page has no lines of its
 * own and gets a fixed key.
 */
type InvoicePage = { key: string; lines: InvoiceLine[] }

function paginateLines(lines: ReadonlyArray<InvoiceLine>): InvoicePage[] {
  const pageOf = (chunk: InvoiceLine[]): InvoicePage => ({
    key: chunk[0]?.id ?? "closing",
    lines: chunk,
  })

  if (lines.length === 0) return [pageOf([])]

  const pages: InvoicePage[] = []
  let cursor = 0
  while (cursor < lines.length) {
    const capacity = pages.length === 0 ? ROWS_FIRST_PAGE : ROWS_LATER_PAGE
    pages.push(pageOf(lines.slice(cursor, cursor + capacity)))
    cursor += capacity
  }

  // The closing blocks must never be orphaned from at least one line item (§7),
  // so if the last page is too full to hold them, give them their own page.
  const lastCapacity = pages.length === 1 ? ROWS_FIRST_PAGE : ROWS_LATER_PAGE
  const last = pages[pages.length - 1]
  if (last.lines.length + CLOSING_BLOCK_ROWS > lastCapacity) pages.push(pageOf([]))

  return pages
}

// ─── Shared bits ──────────────────────────────────────────────────────────────

const INK = "text-[#18181b]"
const MUTED = "text-[#71717a]"
const RULE = "bg-[#e4e4e7]"

function Rule({ strong = false }: { strong?: boolean }) {
  return <div className={cn("h-px w-full", strong ? "bg-[#a1a1aa]" : RULE)} />
}

function TotalRow({
  label,
  value,
  bold = false,
  muted = false,
  large = false,
}: {
  label: string
  value: string
  bold?: boolean
  muted?: boolean
  large?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4",
        large ? "text-[11pt]" : "text-[9pt]",
        bold ? "font-semibold" : "font-normal",
        muted ? MUTED : INK,
      )}
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}

// ─── Blocks ───────────────────────────────────────────────────────────────────

/** §4 block 2. Logo slot collapses with no placeholder box; the name shifts up. */
function IdentityBlock({ doc, condensed = false }: { doc: InvoiceDocument; condensed?: boolean }) {
  const { issuer } = doc

  if (condensed) {
    // Pages 2+: legal name + TRN only (§7).
    return (
      <div className={cn("flex flex-col gap-0.5 text-[8pt]", MUTED)}>
        <span className={cn("font-semibold", INK)}>{issuer.legalName}</span>
        {issuer.trn ? <span>TRN: {issuer.trn}</span> : null}
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {issuer.logoUrl ? (
        // biome-ignore lint/performance/noImgElement: print document, no next/image loader
        <img
          src={issuer.logoUrl}
          alt=""
          className="h-[14mm] w-[14mm] shrink-0 rounded-[2mm] object-cover"
        />
      ) : null}
      <div className="flex min-w-0 flex-col gap-0.5">
        {/* Wraps to two lines then truncates, and can never reach the meta block (§5). */}
        <span className={cn("line-clamp-2 text-[13pt] font-semibold leading-[1.25]", INK)}>
          {issuer.legalName}
        </span>
        {issuer.tradingName ? (
          <span className={cn("text-[9pt]", MUTED)}>Trading as {issuer.tradingName}</span>
        ) : null}
        <div className={cn("flex flex-col text-[8.5pt] leading-[1.45]", MUTED)}>
          {issuer.addressLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
          {issuer.phone ? <span>{issuer.phone}</span> : null}
          {issuer.email ? <span>{issuer.email}</span> : null}
          {/* A tax invoice cannot collapse the TRN (§4 block 2). */}
          {issuer.trn ? (
            <span className={cn("mt-1 font-medium", INK)}>TRN: {issuer.trn}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/**
 * §4 blocks 1 + 4. Title, number, dates, and the status subtitle — which appears
 * for Refunded and Voided only, because payment states are carried by the
 * numbers (§5).
 */
function MetaBlock({ doc, responsive = false }: { doc: InvoiceDocument; responsive?: boolean }) {
  const title = documentTitle(doc)
  const showSupplyDate = doc.suppliedAt && doc.suppliedAt.getTime() !== doc.issuedAt.getTime()

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col gap-1",
        // Right-aligned against the page edge on A4; left-aligned on a phone,
        // where it sits under the identity block and a ragged right edge reads
        // as a mistake.
        responsive
          ? "items-start text-left md:items-end md:text-right print:items-end print:text-right"
          : "items-end text-right",
      )}
    >
      <span className={cn("text-[19pt] font-semibold leading-[1.1] tracking-tight", INK)}>
        {title}
      </span>
      <span className={cn("text-[11pt] font-medium", INK)}>#{doc.number}</span>

      <div className={cn("mt-1 flex flex-col gap-0.5 text-[8.5pt] leading-[1.45]", MUTED)}>
        <span>
          <span className="font-medium">Date of issue</span> {formatDate(doc.issuedAt)}
        </span>
        {/* Only when it differs from issue (§4 block 4). */}
        {showSupplyDate ? (
          <span>
            <span className="font-medium">Date of supply</span> {formatDate(doc.suppliedAt as Date)}
          </span>
        ) : null}
      </div>

      {/* Prose, not a chip. A sentence survives a photocopy (§0.2). */}
      {doc.refundOf ? (
        <span className={cn("mt-2 max-w-[75mm] text-[8.5pt] leading-[1.4]", MUTED)}>
          Refund of original invoice #{doc.refundOf.number}, issued{" "}
          {formatDate(doc.refundOf.issuedAt)}
        </span>
      ) : null}
      {/* The reason a negative document exists. Production captures one and does
          not print it (§0.6 finding 28); we do, pending §9 Q15 — the client is
          holding the credit note and the reason is about them, not an internal
          decision the way a void reason is. */}
      {doc.refundReason ? (
        <span className={cn("max-w-[75mm] text-[8.5pt] leading-[1.4]", MUTED)}>
          Reason: {doc.refundReason}
        </span>
      ) : null}
      {doc.voidedAt ? (
        <span className={cn("mt-2 max-w-[75mm] text-[8.5pt] font-medium leading-[1.4]", INK)}>
          Invoice was voided on {formatDateTimeLong(doc.voidedAt)}
        </span>
      ) : null}
    </div>
  )
}

/**
 * §4 block 3. Collapses to a single name line for a consumer — no empty address
 * or TRN rows. The name may carry emoji and must not render as tofu (§0.4 gap 16).
 */
function RecipientBlock({ doc }: { doc: InvoiceDocument }) {
  const { recipient } = doc
  const hasDetail =
    Boolean(recipient.addressLines?.length) ||
    Boolean(recipient.trn) ||
    Boolean(recipient.email) ||
    Boolean(recipient.phone)

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className={cn("text-[8pt] font-medium uppercase tracking-[0.08em]", MUTED)}>
        {doc.kind === "credit-note" ? "Credited to" : "Billed to"}
      </span>
      <span className={cn("invoice-emoji text-[10pt] font-semibold", INK)}>{recipient.name}</span>
      {hasDetail ? (
        <div className={cn("flex flex-col text-[8.5pt] leading-[1.45]", MUTED)}>
          {recipient.addressLines?.map((line) => (
            <span key={line}>{line}</span>
          ))}
          {recipient.email ? <span>{recipient.email}</span> : null}
          {recipient.phone ? <span>{recipient.phone}</span> : null}
          {recipient.trn ? (
            <span className={cn("mt-1 font-medium", INK)}>TRN: {recipient.trn}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/**
 * §4 block 5. There is deliberately no discount column: a discounted line shows
 * the charged price with the original struck through above it, plus a sub-label
 * naming the discount (§0.3). Tax columns drop entirely when no tax applies.
 */
function LineTable({
  doc,
  lines,
  showHeader = true,
  responsive = false,
}: {
  doc: InvoiceDocument
  lines: InvoiceLine[]
  showHeader?: boolean
  responsive?: boolean
}) {
  const withTax = showsLineTaxColumns(doc)

  return (
    <>
      {/* Phones get the same fields stacked instead of a six-column table
          scrolling sideways. Same values, same labels, same order — a stacked
          row is a geometry change, whereas dropping the unit price or the tax
          amount would be a content change, which §8 forbids. */}
      {responsive ? (
        <div className="flex flex-col md:hidden print:hidden">
          {showHeader ? (
            <span
              className={cn(
                "border-b border-[#a1a1aa] pb-1.5 text-[7.5pt] font-medium uppercase tracking-[0.06em]",
                MUTED,
              )}
            >
              Description
            </span>
          ) : null}
          {lines.map((line) => (
            <StackedLine key={line.id} doc={doc} line={line} withTax={withTax} />
          ))}
        </div>
      ) : null}

      <table
        className={cn(
          "w-full border-collapse text-[9pt]",
          responsive && "hidden md:table print:table",
        )}
      >
        {showHeader ? (
          // display: table-header-group so the browser repeats it if a print
          // engine paginates the table anyway (§7).
          <thead className="table-header-group">
            <tr className={cn("text-[7.5pt] font-medium uppercase tracking-[0.06em]", MUTED)}>
              <th className="border-b border-[#a1a1aa] pb-1.5 text-left font-medium">
                Description
              </th>
              <th className="w-[12mm] border-b border-[#a1a1aa] pb-1.5 text-right font-medium">
                Qty
              </th>
              <th className="w-[26mm] border-b border-[#a1a1aa] pb-1.5 text-right font-medium">
                Unit price
              </th>
              {withTax ? (
                <>
                  <th className="w-[14mm] border-b border-[#a1a1aa] pb-1.5 text-right font-medium">
                    VAT
                  </th>
                  <th className="w-[24mm] border-b border-[#a1a1aa] pb-1.5 text-right font-medium">
                    VAT amount
                  </th>
                </>
              ) : null}
              <th className="w-[28mm] border-b border-[#a1a1aa] pb-1.5 text-right font-medium">
                Line total
              </th>
            </tr>
          </thead>
        ) : null}
        <tbody>
          {lines.map((line) => {
            const vat = lineVat(line, doc.vatRate)
            return (
              <tr key={line.id} className="break-inside-avoid align-top">
                <td className={cn("border-b border-[#e4e4e7] py-2 pr-4", INK)}>
                  <span className="invoice-emoji font-medium">{line.description}</span>
                  {line.subLabel ? (
                    <span className={cn("mt-0.5 block text-[8pt] leading-[1.35]", MUTED)}>
                      {line.subLabel}
                    </span>
                  ) : null}
                  {line.discountLabel ? (
                    <span className={cn("mt-0.5 block text-[8pt] leading-[1.35]", MUTED)}>
                      {line.discountLabel}
                    </span>
                  ) : null}
                </td>
                <td className={cn("border-b border-[#e4e4e7] py-2 text-right tabular-nums", INK)}>
                  {line.qty}
                </td>
                <td className={cn("border-b border-[#e4e4e7] py-2 text-right tabular-nums", INK)}>
                  {formatInvoiceAmount(line.unitGrossMinor)}
                  {/* The discount, carried by a strikethrough rather than a column. */}
                  {line.originalUnitGrossMinor !== undefined &&
                  line.originalUnitGrossMinor !== line.unitGrossMinor ? (
                    <span className={cn("mt-0.5 block text-[8pt] line-through", MUTED)}>
                      {formatInvoiceAmount(line.originalUnitGrossMinor)}
                    </span>
                  ) : null}
                </td>
                {withTax ? (
                  <>
                    <td
                      className={cn(
                        "border-b border-[#e4e4e7] py-2 text-right tabular-nums",
                        line.taxable ? INK : MUTED,
                      )}
                    >
                      {/* A non-taxable line shows an em dash, never a 0% that
                        implies it was rated (INV-P8). */}
                      {line.taxable ? formatVatRate(doc.vatRate) : "—"}
                    </td>
                    <td
                      className={cn(
                        "border-b border-[#e4e4e7] py-2 text-right tabular-nums",
                        line.taxable ? INK : MUTED,
                      )}
                    >
                      {line.taxable ? formatInvoiceAmount(vat) : "—"}
                    </td>
                  </>
                ) : null}
                <td
                  className={cn(
                    "border-b border-[#e4e4e7] py-2 text-right font-medium tabular-nums",
                    INK,
                  )}
                >
                  {formatInvoiceAmount(line.lineGrossMinor)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

/** One line item as a stacked block, for the phone layout only. */
function StackedLine({
  doc,
  line,
  withTax,
}: {
  doc: InvoiceDocument
  line: InvoiceLine
  withTax: boolean
}) {
  const vat = lineVat(line, doc.vatRate)

  return (
    <div className="flex flex-col gap-1.5 border-b border-[#e4e4e7] py-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className={cn("invoice-emoji min-w-0 text-[9.5pt] font-medium", INK)}>
          {line.description}
        </span>
        <span className={cn("shrink-0 text-[9.5pt] font-medium tabular-nums", INK)}>
          {formatInvoiceAmount(line.lineGrossMinor)}
        </span>
      </div>

      {line.subLabel ? (
        <span className={cn("text-[8pt] leading-[1.35]", MUTED)}>{line.subLabel}</span>
      ) : null}
      {line.discountLabel ? (
        <span className={cn("text-[8pt] leading-[1.35]", MUTED)}>{line.discountLabel}</span>
      ) : null}

      {/* The same columns the table would show, as labelled pairs in the same
          order: Qty, Unit price, then VAT and VAT amount when tax applies. */}
      <dl className={cn("flex flex-wrap gap-x-4 gap-y-0.5 text-[8pt]", MUTED)}>
        <div className="flex gap-1">
          <dt>Qty</dt>
          <dd className={cn("tabular-nums", INK)}>{line.qty}</dd>
        </div>
        <div className="flex gap-1">
          <dt>Unit price</dt>
          <dd className={cn("tabular-nums", INK)}>
            {formatInvoiceAmount(line.unitGrossMinor)}
            {line.originalUnitGrossMinor !== undefined &&
            line.originalUnitGrossMinor !== line.unitGrossMinor ? (
              <span className={cn("ml-1 line-through", MUTED)}>
                {formatInvoiceAmount(line.originalUnitGrossMinor)}
              </span>
            ) : null}
          </dd>
        </div>
        {withTax ? (
          <>
            <div className="flex gap-1">
              <dt>VAT</dt>
              <dd className={cn("tabular-nums", line.taxable ? INK : MUTED)}>
                {line.taxable ? formatVatRate(doc.vatRate) : "—"}
              </dd>
            </div>
            <div className="flex gap-1">
              <dt>VAT amount</dt>
              <dd className={cn("tabular-nums", line.taxable ? INK : MUTED)}>
                {line.taxable ? formatInvoiceAmount(vat) : "—"}
              </dd>
            </div>
          </>
        ) : null}
      </dl>
    </div>
  )
}

/** §3.1, exact order. Two bottom lines, both always rendered — this is EC-39. */
function TotalsBlock({ doc, responsive = false }: { doc: InvoiceDocument; responsive?: boolean }) {
  const t = invoiceTotals(doc)
  const hasDiscount = t.cartDiscountMinor !== 0

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col gap-1.5",
        responsive ? "w-full md:w-[80mm] print:w-[80mm]" : "w-[80mm]",
      )}
    >
      {/* Only when a discount exists — with none it just restates Total, which is
          why the no-discount reference omits it (§0.3). */}
      {hasDiscount ? (
        <>
          <TotalRow
            label="Items total (excl. discounts)"
            value={formatInvoiceAmount(t.itemsTotalMinor)}
            muted
          />
          <TotalRow
            label={doc.cartDiscount?.label ?? "Cart discount"}
            value={formatInvoiceAmount(-t.cartDiscountMinor)}
            muted
          />
          <div className="my-1">
            <Rule />
          </div>
        </>
      ) : null}

      {/* The label is qualified rather than renamed, so a client who already
          reads "Subtotal" is not handed new vocabulary (§3.1). */}
      <TotalRow
        label={t.showTax ? "Subtotal (excl. VAT)" : "Subtotal"}
        value={formatInvoiceAmount(t.subtotalExVatMinor)}
        muted
      />
      {t.showTax ? (
        <TotalRow
          label={`VAT ${formatVatRate(doc.vatRate)}`}
          value={formatInvoiceAmount(t.vatMinor)}
          muted
        />
      ) : null}
      <TotalRow
        label={t.showTax ? "Total (incl. VAT)" : "Total"}
        value={formatInvoiceAmount(t.totalInclVatMinor)}
      />

      {/* Outside the tax base, so it sits below the VAT summary (INV-M5). */}
      {t.tipMinor !== 0 ? (
        <TotalRow label="Tip" value={formatInvoiceAmount(t.tipMinor)} muted />
      ) : null}

      <div className="my-1">
        <Rule />
      </div>

      {/* Always rendered, even when it equals Total. Suppressing it when they
          match is exactly how EC-39 comes back (§3.1). */}
      <TotalRow label="Amount due" value={formatInvoiceAmount(t.amountDueMinor)} bold />
    </div>
  )
}

/**
 * §4 block 7. Never collapses. With no tenders it states the absence explicitly
 * rather than leaving the reference's bare gap, which reads as a rendering bug
 * (§0.4 gap 5).
 */
function TenderBlock({ doc, responsive = false }: { doc: InvoiceDocument; responsive?: boolean }) {
  const t = invoiceTotals(doc)

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col gap-1.5",
        responsive ? "w-full md:w-[80mm] print:w-[80mm]" : "w-[80mm]",
      )}
    >
      <span className={cn("text-[8pt] font-medium uppercase tracking-[0.08em]", MUTED)}>
        {doc.kind === "credit-note" ? "Refunded to" : "Payments"}
      </span>

      {doc.tenders.length === 0 ? (
        <span className={cn("py-1 text-[9pt]", MUTED)}>No payments received</span>
      ) : (
        doc.tenders.map((tender) => (
          <div key={tender.id} className="flex items-baseline justify-between gap-4 text-[9pt]">
            <span className="flex min-w-0 flex-col">
              <span className={INK}>{tender.method}</span>
              <span className={cn("text-[7.5pt]", MUTED)}>{formatDateTimeLong(tender.at)}</span>
            </span>
            <span className={cn("shrink-0 tabular-nums", INK)}>
              {/* Change goes back across the counter, so it reads negative and
                  does not increase collected (INV-M4). */}
              {formatInvoiceAmount(tender.isChange ? -tender.amountMinor : tender.amountMinor)}
            </span>
          </div>
        ))
      )}

      <div className="my-1">
        <Rule strong />
      </div>

      {/* Load-bearing: this IS the Unpaid / Part paid / Completed signal, so it
          renders at zero too (§5). */}
      <TotalRow label="Balance" value={formatInvoiceAmount(t.balanceMinor)} bold large />

      {/* A refunded sale keeps its number and stays `completed` (§2.2), so this
          figure is the only thing on the document that admits money went back.
          Production shows it in-app but omits it from the printed invoice (§0.6
          finding 29), which leaves a fully-paid-looking document in circulation
          for money that was returned — the same risk the void watermark exists
          for. Rendered here, with what is still refundable, so a reader cannot
          mistake a refunded invoice for a settled one. */}
      {doc.refundedToDateMinor ? (
        <>
          <div className="my-1">
            <Rule />
          </div>
          <TotalRow
            label="Refunded to date"
            value={formatInvoiceAmount(-Math.abs(doc.refundedToDateMinor))}
          />
          <TotalRow
            label="Still refundable"
            value={formatInvoiceAmount(
              Math.max(0, t.amountDueMinor - Math.abs(doc.refundedToDateMinor)),
            )}
            muted
          />
        </>
      ) : null}
    </div>
  )
}

/**
 * §4 block 8. Reserved at fixed dimensions whether or not a payload exists, so
 * the layout is never re-cut when PRD-9 lands. Sized for a KSA ZATCA TLV
 * payload, not a UAE Peppol one (§2.3).
 *
 * 24mm square: ZATCA guidance puts the practical floor for a scannable TLV QR
 * around 2cm, and 24mm leaves margin for a home printer.
 */
const QR_SIZE_MM = 24

function QrBlock({ doc }: { doc: InvoiceDocument }) {
  return (
    <div className="flex shrink-0 flex-col gap-1">
      <div
        className="flex items-center justify-center rounded-[1mm] border border-dashed border-[#d4d4d8]"
        style={{ width: `${QR_SIZE_MM}mm`, height: `${QR_SIZE_MM}mm` }}
        aria-hidden={!doc.qrPayload}
      >
        {doc.qrPayload ? (
          <span className={cn("text-[6pt]", MUTED)}>QR</span>
        ) : (
          <span className={cn("px-1 text-center text-[5.5pt] leading-[1.3]", MUTED)}>
            QR reserved
          </span>
        )}
      </div>
    </div>
  )
}

/** §4 block 9. Footer note comes from the business's invoicing settings. */
function FooterBlock({
  doc,
  page,
  pageCount,
}: {
  doc: InvoiceDocument
  page: number
  pageCount: number
}) {
  return (
    <div className="mt-auto flex flex-col gap-1.5 pt-4">
      <Rule />
      <div className={cn("flex items-start justify-between gap-6 text-[7.5pt]", MUTED)}>
        <span className="max-w-[110mm] leading-[1.4]">{doc.footerNote}</span>
        <span className="shrink-0 tabular-nums">
          {documentTitle(doc)} #{doc.number}
          {/* Hides on a single-page document (§4 block 9). */}
          {pageCount > 1 ? ` · Page ${page} of ${pageCount}` : ""}
        </span>
      </div>
    </div>
  )
}

/**
 * §6. Subtitle plus watermark, because the subtitle carries the timestamp the
 * watermark cannot and the watermark carries the at-a-glance signal the subtitle
 * does not.
 *
 * Opacity is the whole design problem: it has to survive a grayscale home
 * printer, a screenshot and a photocopy, while the line table and totals stay
 * legible through it. 10% black at this size clears a photocopy; much lighter
 * does not, much darker starts eating the numbers.
 */
function VoidWatermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
    >
      <span className="-rotate-45 select-none whitespace-nowrap text-[86pt] font-bold uppercase leading-none tracking-[0.12em] text-black/10">
        Void
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/** A4 portrait, 210 × 297 mm (§4). Fresha's US Letter measurements do not scale. */
function Page({
  doc,
  lines,
  page,
  pageCount,
  responsive = false,
}: {
  doc: InvoiceDocument
  lines: InvoiceLine[]
  page: number
  pageCount: number
  responsive?: boolean
}) {
  const isFirst = page === 1
  const isLast = page === pageCount

  // `responsive` relaxes the page GEOMETRY below md, and nothing else. Same
  // blocks, same order, same labels, same figures — see the comment on
  // InvoiceDocumentView for why that keeps §8's consistency guarantee intact.
  // A4 is 794px wide at 96dpi, so any viewport past md already gets the fixed
  // page; only phones reflow. Print always forces A4 back (see the style block).
  const pageBox = responsive
    ? "w-full max-w-[210mm] px-5 py-6 md:h-[297mm] md:w-[210mm] md:px-[14mm] md:py-[13mm]"
    : "h-[297mm] w-[210mm] px-[14mm] py-[13mm]"

  // Identity over meta on a phone, side by side from md up.
  const headerRow = responsive
    ? "flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-8 print:flex-row print:items-start print:justify-between print:gap-8"
    : "flex items-start justify-between gap-8"

  // On a phone the closing blocks stack and go full width; the QR moves under
  // them rather than squeezing the totals into half a screen.
  const closingRow = responsive
    ? "mt-6 flex flex-col-reverse gap-6 md:flex-row md:items-start md:justify-between md:gap-8 print:flex-row print:items-start print:justify-between print:gap-8"
    : "mt-6 flex items-start justify-between gap-8"

  return (
    <div
      className={cn(
        "invoice-page relative flex min-w-0 shrink-0 flex-col bg-white shadow-sm print:shadow-none",
        pageBox,
      )}
    >
      {doc.voidedAt ? <VoidWatermark /> : null}

      <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col">
        {isFirst ? (
          <>
            {/* Identity left, title + meta right. Not the reference's centered
                stack, which spends the top third of the page (§0.4 gap 14). */}
            <div className={headerRow}>
              <IdentityBlock doc={doc} />
              <MetaBlock doc={doc} responsive={responsive} />
            </div>
            <div className="mt-6">
              <RecipientBlock doc={doc} />
            </div>
          </>
        ) : (
          // Pages 2+: condensed identity and the document number only (§7).
          <div className={headerRow}>
            <IdentityBlock doc={doc} condensed />
            <span className={cn("text-[8pt] font-medium", INK)}>
              {documentTitle(doc)} #{doc.number}
            </span>
          </div>
        )}

        <div className="mt-6">
          {/* Column headers repeat on every page (§7). On a phone the six-column
              full-tax table cannot fit, so it scrolls inside its own container
              rather than dropping a column — a missing unit price or tax amount
              would be a content change, which §8 does not allow. */}
          <div
            className={
              responsive
                ? "invoice-scroll -mx-1 w-full min-w-0 overflow-x-auto px-1 md:mx-0 md:px-0"
                : undefined
            }
          >
            <div className={responsive ? "w-max min-w-full md:w-auto md:min-w-0" : undefined}>
              <LineTable doc={doc} lines={lines} responsive={responsive} />
            </div>
          </div>
        </div>

        {isLast ? (
          <div className={closingRow}>
            {/* QR bottom-left beside the closing blocks — reserved, last page
                only (§7). */}
            <QrBlock doc={doc} />
            <div className="flex flex-col gap-5">
              <TotalsBlock doc={doc} responsive={responsive} />
              <TenderBlock doc={doc} responsive={responsive} />
            </div>
          </div>
        ) : null}

        <FooterBlock doc={doc} page={page} pageCount={pageCount} />
      </div>
    </div>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

export function InvoiceDocumentView({
  doc,
  className,
  responsive = false,
}: {
  doc: InvoiceDocument
  className?: string
  /**
   * Let the page reflow below md. Off by default: the PDF and the review harness
   * must always show true A4 geometry.
   *
   * On for the customer-facing invoice link only, because that is the one surface
   * opened on a phone, where a 210mm page zooms out to something unreadable.
   *
   * This does NOT fork the design, and §8's "consistent in content and field
   * order" survives: every block, in the same order, with the same labels and the
   * same figures. Only the geometry moves — identity stacks over meta, the
   * closing blocks go full width, and the line table scrolls inside its own
   * container instead of dropping a column. What would break §8 is a different
   * design, which is exactly what live Cami ships today (§0.6 finding 21):
   * different labels, different date format, a status chip, a different order.
   *
   * Pending Michelle's ruling on §9 Q14. Print is unaffected either way.
   */
  responsive?: boolean
}) {
  const pages = paginateLines(doc.lines)

  return (
    <div
      className={cn(
        "invoice-doc flex flex-col items-center gap-6 print:gap-0",
        // Without an explicit width the items-center ancestors shrink-wrap to the
        // widest child, so the page could never be narrower than its own table.
        responsive && "w-full min-w-0",
        className,
      )}
    >
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        /* The document is paper: it must print with its own ink and rules even
           when the browser would otherwise drop backgrounds. */
        .invoice-doc { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        /* Emoji in a client name or line description must not render as tofu on a
           legal document (§0.4 gap 16). */
        .invoice-doc .invoice-emoji {
          font-family: inherit, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
        }
        @media print {
          /* Only the document prints — no app chrome, no state switcher. Done by
             visibility rather than display:none on body's children, so it works
             wherever the document is mounted in the tree. */
          body { visibility: hidden; }
          .invoice-doc {
            visibility: visible;
            position: absolute;
            inset: 0 auto auto 0;
            gap: 0;
          }
          .invoice-doc * { visibility: visible; }
          /* Print is always true A4, even when the viewport put the page in its
             reflowed state — a printed invoice is never "mobile". */
          .invoice-page {
            box-shadow: none !important;
            break-after: page;
            width: 210mm !important;
            max-width: 210mm !important;
            height: 297mm !important;
            padding: 13mm 14mm !important;
          }
          .invoice-page .invoice-scroll { overflow: visible !important; min-width: 0 !important; }
          .invoice-page:last-child { break-after: auto; }
        }
      `}</style>

      {pages.map((p, i) => (
        <Page
          key={p.key}
          doc={doc}
          lines={p.lines}
          page={i + 1}
          pageCount={pages.length}
          responsive={responsive}
        />
      ))}
    </div>
  )
}
