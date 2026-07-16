// Mock rows for each report, keyed by report id. All money values are whole AED.
// Values match the column `key`s in registry.ts; the Table template formats each
// cell by its column `kind`. Totals are computed by the template, not stored.

import type { AvatarSpecies } from "@/components/ui/avatar"

export type ReportRow = Record<string, string | number | boolean | null>

/** Pet species/breed lookup so a Pet link cell can open the shared PetDetailDialog. */
export const PET_DETAILS: Record<string, { species: AvatarSpecies; breed: string }> = {
  Bobo: { species: "dog", breed: "Labrador" },
  Shadow: { species: "dog", breed: "German Shepherd" },
  Pickle: { species: "cat", breed: "British Shorthair" },
}

// Group-by datasets — the "Type" pill re-slices the report by a chosen
// dimension. On Sales summary the top-level Type rows (Service/Product) are
// clickable and drill into that type's items (`_group` marks each item's type).
export const MOCK_GROUPED: Record<string, Record<string, ReportRow[]>> = {
  "sales-summary": {
    Type: [
      {
        type: "Service",
        salesQty: 2,
        itemsSold: 2,
        grossSales: 50,
        totalDiscounts: 0,
        refunds: 0,
        netSales: 50,
        taxes: 0,
        totalSales: 50,
      },
      {
        type: "Product",
        salesQty: 1,
        itemsSold: 1,
        grossSales: 12,
        totalDiscounts: 0,
        refunds: 0,
        netSales: 12,
        taxes: 0,
        totalSales: 12,
      },
    ],
    Item: [
      {
        type: "Haircut",
        _group: "Service",
        salesQty: 1,
        itemsSold: 1,
        grossSales: 25,
        totalDiscounts: 0,
        refunds: 0,
        netSales: 25,
        taxes: 0,
        totalSales: 25,
      },
      {
        type: "Blow Dry",
        _group: "Service",
        salesQty: 1,
        itemsSold: 1,
        grossSales: 25,
        totalDiscounts: 0,
        refunds: 0,
        netSales: 25,
        taxes: 0,
        totalSales: 25,
      },
      {
        type: "Blinds",
        _group: "Product",
        salesQty: 1,
        itemsSold: 1,
        grossSales: 12,
        totalDiscounts: 0,
        refunds: 0,
        netSales: 12,
        taxes: 0,
        totalSales: 12,
      },
    ],
    "Team member": [
      {
        type: "Aziz Rahman",
        salesQty: 2,
        itemsSold: 2,
        grossSales: 50,
        totalDiscounts: 0,
        refunds: 0,
        netSales: 50,
        taxes: 0,
        totalSales: 50,
      },
      {
        type: "Sara Park",
        salesQty: 1,
        itemsSold: 1,
        grossSales: 12,
        totalDiscounts: 0,
        refunds: 0,
        netSales: 12,
        taxes: 0,
        totalSales: 12,
      },
    ],
    Location: [
      {
        type: "Pet Loft",
        salesQty: 3,
        itemsSold: 3,
        grossSales: 62,
        totalDiscounts: 0,
        refunds: 0,
        netSales: 62,
        taxes: 0,
        totalSales: 62,
      },
    ],
  },
  // Appointments summary re-slices by Location / Team member / Service. The
  // first-column value is stored under `location` (the column key); the drill
  // navigates to the Appointments list filtered by that value, so the entity
  // names here match the list rows' location / teamMember / service.
  "appointments-summary": {
    Location: [
      {
        location: "Pet Loft",
        appointments: 64,
        services: 88,
        pctRequested: 40,
        totalApptValue: 9200,
        avgApptValue: 144,
        pctOnline: 55,
        pctCancelled: 6,
        pctNoShow: 3,
        totalClients: 58,
        newClients: 14,
        pctNewClients: 24,
        pctReturningClients: 76,
      },
    ],
    "Team member": [
      {
        location: "Aziz Rahman",
        appointments: 38,
        services: 52,
        pctRequested: 47,
        totalApptValue: 5800,
        avgApptValue: 153,
        pctOnline: 61,
        pctCancelled: 4,
        pctNoShow: 2,
        totalClients: 34,
        newClients: 9,
        pctNewClients: 26,
        pctReturningClients: 74,
      },
      {
        location: "Beth Carter",
        appointments: 26,
        services: 36,
        pctRequested: 31,
        totalApptValue: 3400,
        avgApptValue: 131,
        pctOnline: 46,
        pctCancelled: 9,
        pctNoShow: 5,
        totalClients: 24,
        newClients: 5,
        pctNewClients: 21,
        pctReturningClients: 79,
      },
    ],
    Service: [
      {
        location: "Full Groom — Dog",
        appointments: 18,
        services: 18,
        pctRequested: 50,
        totalApptValue: 3960,
        avgApptValue: 220,
        pctOnline: 61,
        pctCancelled: 3,
        pctNoShow: 2,
        totalClients: 17,
        newClients: 4,
        pctNewClients: 24,
        pctReturningClients: 76,
      },
      {
        location: "Nail Trim",
        appointments: 14,
        services: 14,
        pctRequested: 20,
        totalApptValue: 420,
        avgApptValue: 30,
        pctOnline: 40,
        pctCancelled: 12,
        pctNoShow: 7,
        totalClients: 13,
        newClients: 2,
        pctNewClients: 15,
        pctReturningClients: 85,
      },
    ],
  },
}

export const MOCK_ROWS: Record<string, ReportRow[]> = {
  // ─── Sales ────────────────────────────────────────────────────────────────
  "sales-summary": [
    {
      type: "Service",
      salesQty: 42,
      itemsSold: 58,
      grossSales: 8460,
      totalDiscounts: 320,
      refunds: 150,
      netSales: 7990,
      taxes: 0,
      totalSales: 7990,
    },
    {
      type: "Product",
      salesQty: 17,
      itemsSold: 23,
      grossSales: 2140,
      totalDiscounts: 60,
      refunds: 0,
      netSales: 2080,
      taxes: 0,
      totalSales: 2080,
    },
  ],
  "sales-log-detail": [
    {
      date: "2026-07-15T14:30:00",
      saleNo: "16",
      location: "Pet Loft",
      type: "Service",
      item: "Full Groom — Dog",
      category: "Grooming",
      client: "Tom Cassidy",
      teamMember: "Aziz Rahman",
      channel: "Operator",
      grossSales: 54,
      itemDiscounts: 0,
      cartDiscounts: 0,
      totalDiscounts: 0,
      refunds: 0,
      netSales: 54,
      taxesOnNetSales: 0,
      totalSales: 54,
    },
    {
      date: "2026-07-15T12:05:00",
      saleNo: "15",
      location: "Pet Loft",
      type: "Product",
      item: "Royal Canin Adult 2kg",
      category: "Food",
      client: "Karen Dougall",
      teamMember: "Sara Park",
      channel: "Walk-in",
      grossSales: 38,
      itemDiscounts: 0,
      cartDiscounts: 0,
      totalDiscounts: 0,
      refunds: 0,
      netSales: 38,
      taxesOnNetSales: 0,
      totalSales: 38,
    },
    {
      date: "2026-07-15T11:20:00",
      saleNo: "14",
      location: "Pet Loft",
      type: "Service",
      item: "Nail Trim",
      category: "Grooming",
      client: "Millie Cassidy",
      teamMember: "Beth Carter",
      channel: "Public booking",
      grossSales: 21,
      itemDiscounts: 0,
      cartDiscounts: 0,
      totalDiscounts: 0,
      refunds: 0,
      netSales: 21,
      taxesOnNetSales: 0,
      totalSales: 21,
    },
  ],
  "discount-summary": [
    {
      discountCategory: "Loyalty",
      itemsDiscounted: 12,
      grossSales: 3200,
      itemDiscounts: 180,
      cartDiscounts: 60,
      totalDiscounts: 240,
      totalDiscountPct: 7,
    },
    {
      discountCategory: "Seasonal promo",
      itemsDiscounted: 8,
      grossSales: 1900,
      itemDiscounts: 140,
      cartDiscounts: 0,
      totalDiscounts: 140,
      totalDiscountPct: 7,
    },
  ],

  // ─── Finance ────────────────────────────────────────────────────────────
  "taxes-summary": [
    {
      taxType: "VAT 5%",
      location: "Pet Loft",
      taxRate: 5,
      itemsSold: 81,
      taxesOnNetSales: 503,
      taxOnServiceCharges: 0,
      totalTax: 503,
    },
  ],
  "payments-summary": [
    {
      paymentMethod: "CamiPay",
      noOfPayments: 34,
      paymentAmount: 6120,
      noOfRefunds: 1,
      refunds: 150,
      netPayments: 5970,
    },
    {
      paymentMethod: "NeoPay",
      noOfPayments: 11,
      paymentAmount: 2480,
      noOfRefunds: 0,
      refunds: 0,
      netPayments: 2480,
    },
    {
      paymentMethod: "Cash",
      noOfPayments: 9,
      paymentAmount: 1340,
      noOfRefunds: 0,
      refunds: 0,
      netPayments: 1340,
    },
    {
      paymentMethod: "Gift card",
      noOfPayments: 3,
      paymentAmount: 300,
      noOfRefunds: 0,
      refunds: 0,
      netPayments: 300,
    },
  ],
  "payment-transactions": [
    {
      paymentDate: "2026-07-15T14:30:00",
      paymentNo: "561912059",
      saleDate: "2026-07-15T14:30:00",
      saleNo: "16",
      apptRef: "AEBBFFE0",
      client: "Tom Cassidy",
      location: "Pet Loft",
      teamMember: "Aziz Rahman",
      transactionType: "Sales",
      paymentMethod: "CamiPay",
      paymentAmount: 54,
    },
    {
      paymentDate: "2026-07-15T12:05:00",
      paymentNo: "561911354",
      saleDate: "2026-07-15T12:05:00",
      saleNo: "15",
      apptRef: null,
      client: "Karen Dougall",
      location: "Pet Loft",
      teamMember: "Sara Park",
      transactionType: "Sales",
      paymentMethod: "Cash",
      paymentAmount: 38,
    },
    {
      paymentDate: "2026-07-15T11:20:00",
      paymentNo: "561910612",
      saleDate: "2026-07-15T11:20:00",
      saleNo: "14",
      apptRef: null,
      client: "Millie Cassidy",
      location: "Pet Loft",
      teamMember: "Beth Carter",
      transactionType: "Sales",
      paymentMethod: "NeoPay",
      paymentAmount: 21,
    },
  ],

  // ─── Appointments ──────────────────────────────────────────────────────────
  // Fallback single row — the grouped datasets in MOCK_GROUPED drive this report;
  // kept in sync so the columns match if ever rendered ungrouped.
  "appointments-summary": [
    {
      location: "Pet Loft",
      appointments: 64,
      services: 88,
      pctRequested: 40,
      totalApptValue: 9200,
      avgApptValue: 144,
      pctOnline: 55,
      pctCancelled: 6,
      pctNoShow: 3,
      totalClients: 58,
      newClients: 14,
      pctNewClients: 24,
      pctReturningClients: 76,
    },
  ],
  "appointments-list": [
    {
      apptRef: "AEBBFFE0",
      client: "Millie Cassidy",
      teamMember: "Aziz Rahman",
      resource: "Room 1",
      status: "Completed",
      createdDate: "2026-07-15T13:37:00",
      scheduledDate: "2026-07-16T10:45:00",
      cancelledDate: null,
      category: "Grooming",
      service: "Full Groom — Dog",
      duration: 90,
      apptSlot: "10:45am – 12:15pm",
      createdBy: "Aziz Rahman",
      cancelledBy: null,
      location: "Pet Loft",
      netSales: 220,
      cancellationReason: null,
      feesCharged: 0,
      prepayments: 0,
    },
    {
      apptRef: "AE774C11",
      client: "Luke",
      teamMember: "Beth Carter",
      resource: "No resource",
      status: "Cancelled",
      createdDate: "2026-07-13T09:20:00",
      scheduledDate: "2026-07-14T15:00:00",
      cancelledDate: "2026-07-14T08:00:00",
      category: "Grooming",
      service: "Nail Trim",
      duration: 30,
      apptSlot: "3:00pm – 3:30pm",
      createdBy: "Beth Carter",
      cancelledBy: "Luke",
      location: "Pet Loft",
      netSales: 0,
      cancellationReason: "Client request",
      feesCharged: 0,
      prepayments: 0,
    },
  ],
  "cancellations-no-show-summary": [
    { reason: "Client request", noOfAppointments: 5, value: 640, feesCharged: 0 },
    { reason: "No-show", noOfAppointments: 2, value: 300, feesCharged: 50 },
  ],

  // ─── Team ────────────────────────────────────────────────────────────────
  "tips-summary": [
    { teamMember: "Aziz Rahman", tipsCollected: 420, tipsRefunded: 0, totalTips: 420 },
    { teamMember: "Sara Park", tipsCollected: 260, tipsRefunded: 20, totalTips: 240 },
    { teamMember: "Beth Carter", tipsCollected: 180, tipsRefunded: 0, totalTips: 180 },
  ],
  "tips-detail": [
    {
      saleNo: "16",
      saleDate: "2026-07-15T14:30:00",
      teamMember: "Aziz Rahman",
      client: "Tom Cassidy",
      location: "Pet Loft",
      transactionType: "Sales",
      channel: "Operator",
      paymentMethod: "CamiPay",
      tipsCollected: 10,
    },
    {
      saleNo: "15",
      saleDate: "2026-07-15T12:05:00",
      teamMember: "Sara Park",
      client: "Karen Dougall",
      location: "Pet Loft",
      transactionType: "Sales",
      channel: "Public booking",
      paymentMethod: "NeoPay",
      tipsCollected: 15,
    },
  ],
  "working-hours-summary": [
    {
      teamMember: "Aziz Rahman",
      scheduled: 2400,
      timeOff: 0,
      blocked: 60,
      available: 2340,
      booked: 1980,
      unbooked: 360,
      pctOccupancy: 85,
    },
    {
      teamMember: "Sara Park",
      scheduled: 1800,
      timeOff: 120,
      blocked: 0,
      available: 1680,
      booked: 1260,
      unbooked: 420,
      pctOccupancy: 75,
    },
  ],

  // ─── Clients ─────────────────────────────────────────────────────────────
  "client-summary": [
    {
      location: "Pet Loft",
      totalClients: 551,
      newClients: 128,
      pctNew: 23.2,
      newClientsAtLocation: 128,
      pctNewAtLocation: 23.2,
      returningClients: 423,
      pctReturning: 76.8,
      returningClientsAtLocation: 423,
      pctReturningAtLocation: 76.8,
      walkInClients: 10,
      pctWalkIns: 1.8,
      rebooked: 83,
      pctRebooked: 15.1,
      rebookedClientsAtLocation: 83,
      pctRebookedAtLocation: 15.1,
    },
  ],
  "client-list": [
    {
      client: "Millie Cassidy",
      pet: "Bobo",
      gender: "Female",
      age: 34,
      mobile: "+971 58 509 9313",
      email: "millie@example.com",
      rebooked: false,
      clientSource: "Walk-in",
      referredBy: null,
      addedOn: "2026-04-22",
      firstAppt: "2026-04-25",
      lastAppt: "2026-07-16",
      totalAppts: 3,
      totalApptValue: 2720,
      reviews: "5.00 (1)",
    },
    {
      client: "Luke",
      pet: "Shadow",
      gender: "Male",
      age: 41,
      mobile: "+971 52 155 0516",
      email: null,
      rebooked: true,
      clientSource: "Book Now Link",
      referredBy: null,
      addedOn: "2026-05-06",
      firstAppt: "2026-05-10",
      lastAppt: "2026-07-14",
      totalAppts: 1,
      totalApptValue: 770,
      reviews: null,
    },
    {
      client: "Karen Dougall",
      pet: "Pickle",
      gender: "Female",
      age: 29,
      mobile: "+971 54 433 3592",
      email: null,
      rebooked: false,
      clientSource: "Walk-in",
      referredBy: "Millie Cassidy",
      addedOn: "2026-05-01",
      firstAppt: "2026-05-03",
      lastAppt: "2026-07-02",
      totalAppts: 5,
      totalApptValue: 850,
      reviews: "5.00 (2)",
    },
  ],

  // ─── Inventory ─────────────────────────────────────────────────────────────
  "stock-on-hand": [
    {
      brand: "Royal Canin",
      primarySku: "RC-ADT-2KG",
      product: "Royal Canin Adult 2kg",
      location: "Pet Loft",
      stockOnHand: 24,
      totalCost: 1680,
      avgCost: 70,
      retailPrice: 95,
      retailValue: 2280,
      supplyPrice: 70,
      supplyValue: 1680,
      pctMargin: 26,
      lowStockLevel: 5,
      reorderQty: 12,
    },
    {
      brand: "Frontline",
      primarySku: "FL-SPRAY-250",
      product: "Flea & Tick Spray 250ml",
      location: "Pet Loft",
      stockOnHand: 11,
      totalCost: 385,
      avgCost: 35,
      retailPrice: 55,
      retailValue: 605,
      supplyPrice: 35,
      supplyValue: 385,
      pctMargin: 36,
      lowStockLevel: 3,
      reorderQty: 10,
    },
  ],
  "stock-movement-summary": [
    {
      brand: "Royal Canin",
      primarySku: "RC-ADT-2KG",
      product: "Royal Canin Adult 2kg",
      startStock: 30,
      received: 12,
      sold: 18,
      adjusted: 0,
      endStock: 24,
      ordered: 12,
    },
    {
      brand: "Frontline",
      primarySku: "FL-SPRAY-250",
      product: "Flea & Tick Spray 250ml",
      startStock: 15,
      received: 0,
      sold: 4,
      adjusted: 0,
      endStock: 11,
      ordered: 0,
    },
  ],
  "stock-movement-log": [
    {
      // "Sold" movements reference the sale — Adj. ref. links to the sale detail
      // (adjSaleId resolves to a MOCK_SALES record).
      date: "2026-07-15T13:39:00",
      brand: null,
      primarySku: "BLND-001",
      product: "Blinds",
      location: "Pet Loft",
      adjReason: "Sold",
      adjRef: "Sale 3",
      adjSaleId: 3,
      qty: -1,
      cost: 0,
      avgCost: 0,
    },
    {
      // "Stock received" references the purchase order — Adj. ref. drills into
      // the Ordered stock report, filtered to that reference.
      date: "2026-07-12T09:30:00",
      brand: "Royal Canin",
      primarySku: "RC-ADT-2KG",
      product: "Royal Canin Adult 2kg",
      location: "Pet Loft",
      adjReason: "Stock received",
      adjRef: "PO-204",
      adjSaleId: null,
      qty: 12,
      cost: 840,
      avgCost: 70,
    },
  ],
  "product-list": [
    {
      primarySku: "RC-ADT-2KG",
      product: "Royal Canin Adult 2kg",
      category: "Food",
      brand: "Royal Canin",
      barcode: "6291000012345",
      supplier: "Gulf Pet Supplies",
      hasDescription: true,
      hasImage: true,
      units: 42,
      uom: "Each",
      retailPrice: 95,
    },
    {
      primarySku: "FL-SPRAY-250",
      product: "Flea & Tick Spray 250ml",
      category: "Healthcare",
      brand: "Frontline",
      barcode: "6291000067890",
      supplier: "VetCare Trading",
      hasDescription: true,
      hasImage: false,
      units: 18,
      uom: "Bottle",
      retailPrice: 55,
    },
  ],
  "ordered-stock": [
    {
      ordered: "2026-07-10",
      expected: "2026-07-17",
      received: "2026-07-12",
      reference: "PO-204",
      product: "Royal Canin Adult 2kg",
      location: "Pet Loft",
      supplier: "Gulf Pet Supplies",
      orderQty: 12,
      receivedQty: 12,
      cancelledQty: 0,
      pendingStock: 0,
      totalCost: 840,
      avgUnitCost: 70,
      status: "Received",
    },
    {
      ordered: "2026-07-14",
      expected: "2026-07-21",
      received: null,
      reference: "PO-205",
      product: "Flea & Tick Spray 250ml",
      location: "Pet Loft",
      supplier: "VetCare Trading",
      orderQty: 20,
      receivedQty: 0,
      cancelledQty: 0,
      pendingStock: 20,
      totalCost: 700,
      avgUnitCost: 35,
      status: "Ordered",
    },
  ],
}

// ─── Finance summary (Detailed Table) — metric rows × period columns ─────────
// Flat rows grouped into sections with bold subtotals and drill-down links —
// mirrors Fresha and the existing daily-summary emphasis pattern (no expandable
// UI, per Michelle). `values` align to FINANCE_SUMMARY_PERIODS.

export type DetailedRow = {
  label: string
  /**
   * When set, the label becomes an accent-coloured drill-down link to the
   * report with this id (e.g. Discounts → discount-summary).
   */
  linkTo?: string
  /** Bold subtotal/total row. */
  emphasis?: boolean
  values: number[]
}

export type DetailedSection = {
  label: string
  rows: DetailedRow[]
}

export const FINANCE_SUMMARY_PERIODS = [
  "Total",
  "Jul 2026",
  "Jun 2026",
  "May 2026",
  "Apr 2026",
  "Mar 2026",
  "Feb 2026",
]

export const FINANCE_SUMMARY_SECTIONS: DetailedSection[] = [
  {
    label: "Sales",
    rows: [
      { label: "Gross sales", values: [61200, 10600, 9800, 10100, 10400, 10000, 10300] },
      {
        label: "Discounts",
        linkTo: "discount-summary",
        values: [-2100, -380, -300, -360, -340, -360, -360],
      },
      { label: "Refunds / Returns", values: [-900, -150, 0, -150, -200, -200, -200] },
      { label: "Net sales", values: [58200, 10070, 9500, 9590, 9860, 9440, 9740] },
      { label: "Taxes", linkTo: "taxes-summary", values: [2910, 503, 475, 480, 493, 472, 487] },
      {
        label: "Total sales",
        linkTo: "sales-summary",
        emphasis: true,
        values: [61110, 10573, 9975, 10070, 10353, 9912, 10227],
      },
      {
        label: "Gift card sales",
        linkTo: "sales-summary",
        values: [1200, 300, 200, 200, 200, 100, 200],
      },
      { label: "Service charges", linkTo: "sales-summary", values: [0, 0, 0, 0, 0, 0, 0] },
      { label: "Tips", linkTo: "tips-summary", values: [3480, 840, 560, 520, 540, 500, 520] },
      { label: "Net other sales", values: [4680, 1140, 760, 720, 740, 600, 720] },
      { label: "Total other sales", emphasis: true, values: [4680, 1140, 760, 720, 740, 600, 720] },
      {
        label: "Total sales + other sales",
        emphasis: true,
        values: [65790, 11713, 10735, 10790, 11093, 10512, 10947],
      },
      { label: "Sales paid in period", values: [63200, 11200, 10400, 10300, 10600, 10100, 10600] },
      { label: "Unpaid sales in period", values: [2590, 513, 335, 490, 493, 412, 347] },
    ],
  },
  {
    label: "Payments",
    rows: [
      {
        label: "Total payments",
        linkTo: "payments-summary",
        emphasis: true,
        values: [63200, 11200, 10400, 10300, 10600, 10100, 10600],
      },
      {
        label: "Payments for sales in period",
        values: [60610, 10687, 10065, 9810, 10107, 9688, 10253],
      },
      {
        label: "Payments for sales in previous periods",
        values: [2590, 513, 335, 490, 493, 412, 347],
      },
      {
        label: "Prepayments",
        linkTo: "payments-summary",
        values: [1200, 300, 200, 200, 200, 100, 200],
      },
    ],
  },
  {
    label: "Redemptions",
    rows: [
      {
        label: "Prepayment redemptions",
        linkTo: "payments-summary",
        values: [900, 200, 150, 150, 150, 100, 150],
      },
      {
        label: "Gift card redemption",
        linkTo: "payments-summary",
        values: [600, 150, 100, 100, 100, 50, 100],
      },
      {
        label: "Total redemptions",
        linkTo: "payments-summary",
        emphasis: true,
        values: [1500, 350, 250, 250, 250, 150, 250],
      },
      { label: "Redemptions for sales in period", values: [1350, 320, 220, 230, 230, 130, 220] },
      { label: "Redemptions for sales in previous periods", values: [150, 30, 30, 20, 20, 20, 30] },
    ],
  },
]

// ─── Performance dashboard (Dashboard View) ──────────────────────────────────
// Cami's own spec (Maaz's "Dashboard WIP" tab): 6 metrics owners track daily,
// each drilling into a source report. Charts are current-vs-comparison overlays.

export type SeriesPoint = { label: string; current: number; comparison: number }

export const DASHBOARD_SALES_SERIES: SeriesPoint[] = [
  { label: "Jun 15", current: 620, comparison: 480 },
  { label: "Jun 18", current: 740, comparison: 690 },
  { label: "Jun 21", current: 560, comparison: 610 },
  { label: "Jun 24", current: 910, comparison: 720 },
  { label: "Jun 27", current: 830, comparison: 650 },
  { label: "Jun 30", current: 1020, comparison: 780 },
  { label: "Jul 3", current: 690, comparison: 700 },
  { label: "Jul 6", current: 880, comparison: 640 },
  { label: "Jul 9", current: 960, comparison: 810 },
  { label: "Jul 12", current: 1120, comparison: 730 },
  { label: "Jul 14", current: 870, comparison: 690 },
]

export type DashboardBreakdownItem = { label: string; value: number; money?: boolean }

export const PERFORMANCE_DASHBOARD = {
  periodLabel: "Jun 15 – Jul 14, 2026",
  comparisonLabel: "May 16 – Jun 14, 2026",
  // 1. Sales (→ Sales summary)
  sales: { value: 9070, deltaPct: 12 },
  // 2. Appointments (→ Appointments summary)
  appointments: {
    value: 64,
    deltaPct: 6,
    breakdown: [
      { label: "Completed", value: 52 },
      { label: "Cancelled", value: 8 },
      { label: "No-show", value: 4 },
    ] as DashboardBreakdownItem[],
  },
  // 3. New vs Returning Customers (→ Client summary)
  clients: {
    deltaPct: 3,
    breakdown: [
      { label: "New", value: 128 },
      { label: "Returning", value: 423 },
      { label: "Walk-in", value: 10 },
    ] as DashboardBreakdownItem[],
  },
  // 4. Overall Occupancy (→ Working hours summary)
  occupancy: { pct: 72, deltaPct: -2 },
  // 5. Sales by Category (→ Sales summary)
  salesByCategory: [
    { label: "Services", value: 6420, money: true },
    { label: "Products", value: 2140, money: true },
    { label: "Memberships", value: 320, money: true },
    { label: "Packages", value: 190, money: true },
  ] as DashboardBreakdownItem[],
  // 6. Payment Method Breakdown (→ Payments summary)
  paymentMethods: [
    { label: "CamiPay", value: 6120, money: true },
    { label: "NeoPay", value: 2480, money: true },
    { label: "Cash", value: 1340, money: true },
    { label: "Gift card", value: 300, money: true },
  ] as DashboardBreakdownItem[],
}

// ─── Performance summary (Matrix View) ───────────────────────────────────────
// Metric × team-member matrix (Fresha's Performance summary shape, adapted to
// Cami's real roster + channels). Rows are grouped into sections with bold
// subtotal/total rows; the leading "Total" column sums each row across members
// (computed by the view for summable kinds, explicit for ratio/average rows).
// Team-member labels resolve to the real roster (see lib/team/mock.ts).

export type PerfMetricKind = "money" | "number" | "percent" | "duration"

export type PerfMetricRow = {
  label: string
  kind: PerfMetricKind
  /** One value per member column, in PERFORMANCE_SUMMARY_MEMBERS order. */
  values: number[]
  /**
   * Row total (the leading "Total" column). Omit for summable kinds (money /
   * number / duration) — the view sums `values`. REQUIRED for percent and
   * average rows, which are weighted ratios that can't be summed.
   */
  total?: number
  /** Bold subtotal/total row (tinted, like the daily-summary emphasis rows). */
  emphasis?: boolean
  /** Metric label links to a source report (honest drill-down only). */
  linkTo?: string
}

export type PerfSection = { label: string; rows: PerfMetricRow[] }

/** Column order for every PerfMetricRow.values array. */
export const PERFORMANCE_SUMMARY_MEMBERS = ["Maz Khan", "Aziz Rahman", "Sara Park", "Beth Carter"]

export const PERFORMANCE_SUMMARY_SECTIONS: PerfSection[] = [
  {
    label: "Sales summary",
    rows: [
      {
        label: "Services",
        kind: "money",
        linkTo: "sales-summary",
        values: [9330, 2646, 5497, 4152],
      },
      { label: "Service add-ons", kind: "money", linkTo: "sales-summary", values: [0, 0, 0, 0] },
      { label: "Products", kind: "money", linkTo: "sales-summary", values: [280, 1420, 0, 900] },
      { label: "Packages", kind: "money", linkTo: "sales-summary", values: [0, 0, 1100, 0] },
      { label: "Memberships", kind: "money", linkTo: "sales-summary", values: [0, 1100, 0, 0] },
      { label: "No show fees", kind: "money", linkTo: "sales-summary", values: [0, 0, 55, 0] },
      { label: "Total sales", kind: "money", emphasis: true, values: [9610, 5166, 6652, 5052] },
      { label: "Tips", kind: "money", linkTo: "tips-summary", values: [93, 46, 150, 25] },
      { label: "Total other sales", kind: "money", emphasis: true, values: [93, 46, 150, 25] },
      {
        label: "Total sales + other sales",
        kind: "money",
        emphasis: true,
        values: [9703, 5212, 6802, 5077],
      },
    ],
  },
  {
    label: "Sales performance",
    rows: [
      { label: "Services sold", kind: "number", linkTo: "sales-summary", values: [54, 24, 13, 56] },
      { label: "Avg. service value", kind: "money", total: 291, values: [173, 110, 423, 74] },
      { label: "Products sold", kind: "number", linkTo: "sales-summary", values: [2, 6, 0, 4] },
      { label: "Avg. product value", kind: "money", total: 217, values: [140, 237, 0, 225] },
    ],
  },
  {
    label: "Appointments value",
    rows: [
      {
        label: "Online appts",
        kind: "money",
        linkTo: "appointments-summary",
        values: [500, 200, 0, 0],
      },
      {
        label: "Public booking",
        kind: "money",
        linkTo: "appointments-summary",
        values: [385, 200, 0, 0],
      },
      {
        label: "Book Now link",
        kind: "money",
        linkTo: "appointments-summary",
        values: [115, 0, 0, 0],
      },
      { label: "% Online appts", kind: "percent", total: 2.3, values: [5.3, 6.5, 0, 0] },
      {
        label: "Offline appts",
        kind: "money",
        linkTo: "appointments-summary",
        values: [9014, 2866, 7257, 24850],
      },
      {
        label: "Operator",
        kind: "money",
        linkTo: "appointments-summary",
        values: [7200, 2400, 6100, 20500],
      },
      {
        label: "Walk-in",
        kind: "money",
        linkTo: "appointments-summary",
        values: [1814, 466, 1157, 4350],
      },
      { label: "% Offline appts", kind: "percent", total: 97.7, values: [94.7, 93.5, 100, 100] },
      {
        label: "Total appts value",
        kind: "money",
        emphasis: true,
        values: [9514, 3066, 7257, 24850],
      },
      { label: "Avg. appt value", kind: "money", total: 696, values: [453, 236, 1209, 1308] },
      {
        label: "Cancelled appts",
        kind: "number",
        linkTo: "cancellations-no-show-summary",
        values: [3, 1, 1, 1],
      },
      {
        label: "No show appts",
        kind: "number",
        linkTo: "cancellations-no-show-summary",
        values: [0, 1, 0, 0],
      },
    ],
  },
  {
    label: "Productivity",
    rows: [
      {
        label: "Scheduled hours",
        kind: "duration",
        linkTo: "working-hours-summary",
        values: [5820, 6600, 5070, 6120],
      },
      {
        label: "Blocked hours",
        kind: "duration",
        linkTo: "working-hours-summary",
        values: [180, 180, 0, 120],
      },
      {
        label: "Available hours",
        kind: "duration",
        linkTo: "working-hours-summary",
        values: [5955, 6420, 630, 6560],
      },
      {
        label: "Booked hours",
        kind: "duration",
        linkTo: "working-hours-summary",
        values: [3270, 1485, 625, 5340],
      },
      {
        label: "% Occupancy",
        kind: "percent",
        emphasis: true,
        total: 44.5,
        values: [54.9, 23.1, 99.2, 81.4],
      },
      {
        label: "Unbooked hours",
        kind: "duration",
        linkTo: "working-hours-summary",
        values: [2685, 4935, 5, 1220],
      },
    ],
  },
  {
    label: "Clients",
    rows: [
      { label: "New clients", kind: "number", linkTo: "client-summary", values: [7, 4, 0, 7] },
      {
        label: "Returning clients",
        kind: "number",
        linkTo: "client-summary",
        values: [30, 17, 5, 25],
      },
      { label: "Walk-ins", kind: "number", linkTo: "client-summary", values: [0, 0, 0, 0] },
      { label: "Total clients", kind: "number", emphasis: true, values: [37, 21, 5, 32] },
      { label: "Rebooked clients", kind: "number", linkTo: "client-summary", values: [5, 6, 1, 5] },
      { label: "% Rebooked clients", kind: "percent", total: 16.8, values: [13.5, 28.6, 20, 15.6] },
    ],
  },
  {
    label: "Clients reviews",
    rows: [
      { label: "Avg. client rating", kind: "number", total: 4.933, values: [5, 0, 0, 5] },
      { label: "No. of client reviews", kind: "number", values: [2, 0, 0, 3] },
    ],
  },
]
