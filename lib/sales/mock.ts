import type { CamiPayRail, CamiPayRate } from "@/lib/hq-camipay/store"
import type { SalePayment } from "@/lib/sales/payments"
// Sales history mock: every sale the sales list, the sale detail, invoices,
// the daily summary and the payments views read. It lived inside the sales
// list page, which made lib/ import a route; it is data, so it lives here.

export type SaleStatus = "completed" | "part-paid" | "unpaid" | "refunded" | "voided"

/** Gift-card purchase reference — present on sales that sold a gift card. */
export type SaleGiftCard = {
  /** Gift card id on /sales/gift-cards-sold, for the "View gift card" link. */
  cardId: string
  code: string
  /** Display status label, e.g. "Active". */
  status: string
  valueAed: number
}

/**
 * A payment taken over CamiPay, with the rate that was live when it was
 * captured copied onto it. The snapshot is the point: settlement and this
 * screen read the stored rate, never the Partner's current rate card, so a
 * renegotiation cannot restate a sale that already happened (PRO-737, INV-01).
 */
export type SaleCamiPay = {
  rail: CamiPayRail
  rate: CamiPayRate
}

/**
 * One line on a saved sale.
 *
 * Only what the detail has to print back. A covered line keeps the shape the
 * cart gave it — charged 0, with what it was worth in `originalPriceMinor` —
 * plus the id of the package that paid, because that is the whole record of
 * WHICH ledger was debited. Re-deriving it later would spend today's sessions
 * against a sale that settled months ago.
 */
export type SaleItem = {
  name: string
  /** What was charged, in fils. Zero on a line a package session paid for. */
  priceMinor: number
  /** What it was worth before the session paid for it. */
  originalPriceMinor?: number
  /** The client's package the session came out of. */
  customerPackageId?: string
  /** The client whose packages this line's coverage is read against. */
  clientId?: string
  meta?: string
}

export type Sale = {
  id: number
  client: string
  status: SaleStatus
  /**
   * The branch that took the formatAed (R11, G1).
   *
   * Not optional. A sale is the clearest operational write there is, and G6
   * hangs off it: the receipt sequence is per branch and prefixed, and the tax
   * identity is frozen onto the receipt at sale. A sale without a branch can
   * have neither, so leaving it absent would put the two facts a receipt
   * legally needs beyond reach.
   */
  locationId: string
  saleAt: Date
  tipsMinor: number
  grossMinor: number
  /**
   * The lines, when this sale has more to say than one figure.
   *
   * Absent on most of the seed, which is a list of totals — the detail falls
   * back to the single row it always drew. Present where the lines carry
   * something the total cannot: a package session, most of all.
   */
  items?: SaleItem[]
  /** Set when this sale is a gift-card purchase (drives the gift-card item UI). */
  giftCard?: SaleGiftCard
  /** Set when the payment went over CamiPay. Absent means cash. */
  camipay?: SaleCamiPay
  /**
   * The payments, each with the location that collected it.
   *
   * Absent on most of the seed, which derives one payment from the status at
   * the sale's own location. Present where a payment was taken somewhere else.
   */
  payments?: SalePayment[]
}

// Rate snapshots for the mock sales, copied from Shampooch JVC's rate card in
// `DEFAULT_CAMIPAY_STATE` as it stood on each sale's date. Written out rather
// than resolved at render time, because that is exactly what a real capture
// does: it stores the rate, it does not look it up later.
//
// Both are the rates effective 01 May 2026, which is before every sale below.
// The online one carries the AED 100 bracket, so the sales split across it:
// anything under keeps the AED 0.75, the AED 10,500 gift-card sale does not.
const RATE_TERMINAL: CamiPayRate = { percent: 1.8, fixedMinor: 0, fixedBelowMinor: null }
const RATE_ONLINE: CamiPayRate = { percent: 3, fixedMinor: 75, fixedBelowMinor: 10000 }

// Demo today is 2026-05-25. Trimmed to 10 rows: five "today" rows (one per
// status) guarantee every state is visible the moment the page opens, plus
// five older rows anchored on 22–24 May so the Last-7/30/90 ranges also fill
// out. The kept ids (1, 2, 3, 6, 7, 12–16) are exactly the ones deep-linked
// from /screens and the appointments "View sale" (?sale=2), so no existing
// link breaks.
export const MOCK_SALES: Sale[] = [
  // 25 May — today. One per status so the default Today view shows every state.
  // A refund and the sale it reverses, as a pair — production emits both as their
  // own rows with adjacent numbers (live Sale 241 → Refund 242, DSG-72 §0.6), and
  // the original stays `completed`. Kept adjacent and same-amount on purpose: a
  // credit note has to cite a real invoice, and before this pair existed the only
  // refunded rows sat next to a voided and a part-paid sale.
  {
    id: 20,
    locationId: "shampooch-jvc",
    client: "Yamen Haddad",
    status: "refunded",
    saleAt: new Date(2026, 4, 25, 17, 20),
    tipsMinor: 0,
    grossMinor: -190000,
  },
  {
    id: 19,
    locationId: "shampooch-jvc",
    client: "Yamen Haddad",
    status: "completed",
    saleAt: new Date(2026, 4, 25, 17, 5),
    tipsMinor: 0,
    grossMinor: 190000,
  },
  // Package redemption with a tip: nothing to pay for the service, but the client
  // tipped anyway. Mirrors live Cami Sale 387 (DSG-72 §0.6), where the tip is
  // folded into Total unlabelled and lands exactly where VAT would. Gross 0 with
  // a non-zero tip is the shape that breaks a single-Total receipt.
  {
    id: 17,
    locationId: "shampooch-jvc",
    client: "Haroon Zafar",
    status: "completed",
    saleAt: new Date(2026, 4, 25, 16, 10),
    tipsMinor: 500,
    grossMinor: 0,
  },
  {
    id: 16,
    locationId: "shampooch-jumeirah",
    client: "Tom Cassidy",
    status: "completed",
    saleAt: new Date(2026, 4, 25, 14, 30),
    tipsMinor: 1000,
    grossMinor: 5400,
    camipay: { rail: "terminal", rate: RATE_TERMINAL },
  },
  /**
   * A sale a package session paid for, kept so the detail has to read one back.
   *
   * The till writes the coverage onto the line and moves on; this is the other
   * end of it — months later, somebody opens the sale and has to be told why a
   * blow dry was charged at nothing. Without the package id on the line there
   * is no answer, only a zero.
   */
  {
    id: 18,
    locationId: "shampooch-jvc",
    client: "Aaishah Vaza",
    status: "completed",
    saleAt: new Date(2026, 4, 24, 11, 15),
    tipsMinor: 0,
    grossMinor: 4500,
    items: [
      {
        name: "Blow Dry & Style",
        priceMinor: 0,
        originalPriceMinor: 12000,
        customerPackageId: "cp-aaishah-1",
        clientId: "aaishah-vaza",
        meta: "45min · Beth Carter",
      },
      { name: "Nail trim", priceMinor: 4500, meta: "20min · Sara Park" },
    ],
    // A deposit taken at another location the day before, and the balance
    // here. Refunding or voiding the deposit belongs to Jumeirah, so a
    // viewer who holds JVC alone is not offered either for it.
    payments: [
      {
        id: "p1",
        kind: "card",
        amountMinor: 2000,
        at: new Date(2026, 4, 23, 18, 40),
        locationId: "shampooch-jumeirah",
      },
      {
        id: "p2",
        kind: "cash",
        amountMinor: 2500,
        at: new Date(2026, 4, 24, 11, 15),
        locationId: "shampooch-jvc",
      },
    ],
  },
  {
    id: 15,
    locationId: "shampooch-jvc",
    client: "Karen Dougall",
    status: "part-paid",
    saleAt: new Date(2026, 4, 25, 12, 5),
    tipsMinor: 0,
    grossMinor: 3800,
    // Under the AED 100 bracket, so the fixed AED 0.75 applies. Part-paid too,
    // which proves the fee follows what was captured, not the sale total.
    camipay: { rail: "online", rate: RATE_ONLINE },
  },
  {
    id: 14,
    locationId: "shampooch-jvc",
    client: "Millie Cassidy",
    status: "unpaid",
    saleAt: new Date(2026, 4, 25, 11, 20),
    tipsMinor: 0,
    grossMinor: 2100,
  },
  {
    id: 13,
    locationId: "shampooch-jumeirah",
    client: "Aya Hassan",
    status: "refunded",
    saleAt: new Date(2026, 4, 25, 10, 45),
    tipsMinor: 0,
    grossMinor: -1800,
  },
  {
    id: 12,
    locationId: "shampooch-jvc",
    client: "Charmaine Hayes",
    status: "voided",
    saleAt: new Date(2026, 4, 25, 9, 50),
    tipsMinor: 0,
    grossMinor: 4200,
  },
  // Older rows — preserved so /screens?sale=N deep-links don't break.
  {
    id: 7,
    locationId: "shampooch-jumeirah",
    client: "Jane Doe",
    status: "completed",
    saleAt: new Date(2026, 4, 24, 10, 15),
    tipsMinor: 0,
    grossMinor: 2500,
    camipay: { rail: "terminal", rate: RATE_TERMINAL },
  },
  {
    id: 6,
    locationId: "shampooch-jumeirah",
    client: "Jane Doe",
    status: "part-paid",
    saleAt: new Date(2026, 4, 24, 10, 15),
    tipsMinor: 0,
    grossMinor: 2500,
  },
  {
    id: 3,
    locationId: "shampooch-jvc",
    client: "John Doe",
    status: "refunded",
    saleAt: new Date(2026, 4, 22, 10, 45),
    tipsMinor: 0,
    grossMinor: -900,
  },
  {
    id: 2,
    locationId: "shampooch-jvc",
    client: "John Doe",
    status: "part-paid",
    saleAt: new Date(2026, 4, 22, 10, 33),
    tipsMinor: 0,
    grossMinor: 2500,
  },
  {
    id: 1,
    locationId: "shampooch-jvc",
    client: "John Doe",
    status: "voided",
    saleAt: new Date(2026, 4, 22, 10, 2),
    tipsMinor: 0,
    grossMinor: 2500,
  },
  // Gift-card-purchase sales (ids 20–24). These back the rows on
  // /sales/gift-cards-sold — each gift card references one of these by id, so
  // the gift card's "View sale" opens the matching sale and they appear here in
  // the listing too (single source of truth, no duplicated sale data).
  {
    id: 24,
    locationId: "shampooch-al-reem",
    client: "Aamena Fatta",
    status: "completed",
    saleAt: new Date(2026, 5, 1, 15, 33),
    tipsMinor: 0,
    grossMinor: 1050000,
    giftCard: { cardId: "gc-5", code: "ZTP3RG84", status: "Active", valueAed: 10500 },
    // Above the AED 100 bracket, so the AED 0.75 is dropped and the fee is the
    // percentage alone. Paired with sale 15, which sits under it. Reached from
    // /sales/gift-cards-sold via "View sale".
    camipay: { rail: "online", rate: RATE_ONLINE },
  },
  {
    id: 23,
    locationId: "shampooch-al-quoz",
    client: "Luke Williams",
    status: "completed",
    saleAt: new Date(2025, 1, 20, 12, 10),
    tipsMinor: 0,
    grossMinor: 700000,
    giftCard: { cardId: "gc-4", code: "HK7VWQ1M", status: "Expired", valueAed: 7000 },
  },
  {
    id: 22,
    locationId: "shampooch-jumeirah",
    client: "Tom Cassidy",
    status: "completed",
    saleAt: new Date(2026, 3, 3, 16, 45),
    tipsMinor: 0,
    grossMinor: 530000,
    giftCard: { cardId: "gc-3", code: "BX9PLND2", status: "Redeemed", valueAed: 5300 },
  },
  {
    id: 21,
    locationId: "shampooch-jumeirah",
    client: "Millie Cassidy",
    status: "completed",
    saleAt: new Date(2026, 4, 12, 9, 5),
    tipsMinor: 0,
    grossMinor: 350000,
    giftCard: { cardId: "gc-2", code: "QM4KTRZA", status: "Active", valueAed: 3500 },
  },
  {
    // Was a second id 20 — the refunded Yamen Haddad sale already held it, so
    // `?sale=20` and every `find` by id reached whichever came first and this
    // row could not be opened at all.
    id: 25,
    locationId: "shampooch-downtown-dubai",
    client: "Walk-In",
    status: "unpaid",
    saleAt: new Date(2026, 5, 29, 11, 20),
    tipsMinor: 0,
    grossMinor: 180000,
    giftCard: { cardId: "gc-1", code: "YYOSNPHO", status: "Unpaid", valueAed: 1800 },
  },

  // ── The rest of the estate, and the other businesses ───────────────────────
  //
  // Six branches had no sales at all, so every screen that bounds by branch
  // showed an empty table the moment the operator narrowed to one of them —
  // indistinguishable from a broken filter. Same for Purr Palace and Sota:
  // signing into either left the whole money side blank.
  //
  // Dated the same day as the rows above, so the default "Today" range holds
  // them. Each still belongs to exactly one branch (R11), and every surface
  // bounds by the reader's grant before it reads (R18) — so a Purr Palace
  // merchant sees Purr Palace's and nothing else.
  {
    id: 30,
    locationId: "shampooch-dubai-marina",
    client: "Layla Nasser",
    status: "completed",
    saleAt: new Date(2026, 4, 25, 15, 40),
    tipsMinor: 1500,
    grossMinor: 32000,
  },
  {
    id: 31,
    locationId: "shampooch-al-majaz",
    client: "Hind Al Suwaidi",
    status: "completed",
    saleAt: new Date(2026, 4, 25, 12, 15),
    tipsMinor: 0,
    grossMinor: 19000,
  },
  {
    id: 32,
    locationId: "shampooch-mirdif",
    client: "Rashid Al Blooshi",
    status: "part-paid",
    saleAt: new Date(2026, 4, 25, 10, 5),
    tipsMinor: 0,
    grossMinor: 15000,
  },
  {
    id: 33,
    locationId: "shampooch-al-reem",
    client: "Maryam Al Hosani",
    status: "unpaid",
    saleAt: new Date(2026, 4, 25, 9, 30),
    tipsMinor: 0,
    grossMinor: 24000,
  },
  {
    id: 34,
    locationId: "shampooch-downtown-dubai",
    client: "Walk-In",
    status: "completed",
    saleAt: new Date(2026, 4, 25, 13, 50),
    tipsMinor: 500,
    grossMinor: 26000,
  },
  {
    // Purr Palace — one site, so one branch and its slug is the business's.
    id: 40,
    locationId: "purr-palace",
    client: "Dana Khalil",
    status: "completed",
    saleAt: new Date(2026, 4, 25, 16, 10),
    tipsMinor: 1000,
    grossMinor: 21000,
  },
  {
    id: 41,
    locationId: "purr-palace",
    client: "Omar Sultan",
    status: "unpaid",
    saleAt: new Date(2026, 4, 25, 11, 45),
    tipsMinor: 0,
    grossMinor: 9000,
  },
  {
    // Sota — the non-pet business, which is what makes it a useful check on
    // anything that assumes a pet is on the sale.
    id: 50,
    locationId: "sota",
    client: "Maaz Shaffi",
    status: "completed",
    saleAt: new Date(2026, 4, 25, 14, 20),
    tipsMinor: 2000,
    grossMinor: 38000,
  },
  {
    id: 51,
    locationId: "sota",
    client: "Aisha Rahman",
    status: "part-paid",
    saleAt: new Date(2026, 4, 25, 10, 40),
    tipsMinor: 0,
    grossMinor: 52000,
  },
]
