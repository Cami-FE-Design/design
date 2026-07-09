// Builds a real, single- or multi-page PDF entirely in the browser, so the
// signer flow and the operator form viewer can embed a genuine PDF with no
// network request. The rest of the app is mock-only, and this keeps the
// signable document mock-only too: we synthesise a representative consent PDF
// from the form's copy.
//
// This used to hand-assemble PDF bytes (xref offsets, content streams) by hand,
// which was fragile — a subtle structural error rendered the text jumbled and
// out of order. Now that pdf-lib is a dependency (for compositing signatures),
// we let it lay out the document: it handles fonts, text metrics, xref, and
// pagination correctly. pdf-lib is lazy-imported so it stays out of any bundle
// that doesn't actually build a PDF.

// Page + layout geometry (points; A4 is 595.28 × 841.89pt).
const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 56
const TITLE_SIZE = 20
const BODY_SIZE = 11
const LINE_HEIGHT = 16
/** Extra gap after each paragraph, as a fraction of a line. */
const PARAGRAPH_GAP = LINE_HEIGHT * 0.6

/**
 * Replace the smart-punctuation code points our copy might use with ASCII, and
 * drop anything a StandardFont (WinAnsi) can't encode — pdf-lib throws on
 * un-encodable characters otherwise.
 */
function sanitize(value: string): string {
  return value
    .replace(/[‘’′]/g, "'")
    .replace(/[“”″]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ")
    .replace(/[^\x20-\x7e]/g, "")
}

/** Greedy word-wrap a paragraph to a pixel width using the font's real metrics. */
function wrapParagraph(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  size: number,
  maxWidth: number,
): string[] {
  const words = sanitize(text).split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ""
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : [""]
}

/** Assemble the raw bytes of an A4 consent PDF with a title and body paragraphs. */
export async function buildConsentPdfBytes(
  title: string,
  paragraphs: readonly string[],
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib")

  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const titleFont = await doc.embedFont(StandardFonts.HelveticaBold)
  const ink = rgb(0.13, 0.13, 0.15)
  const contentWidth = PAGE_WIDTH - MARGIN * 2

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let y = PAGE_HEIGHT - MARGIN

  // Start a fresh page and reset the cursor when we run past the bottom margin.
  const ensureRoom = (needed: number) => {
    if (y - needed < MARGIN) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      y = PAGE_HEIGHT - MARGIN
    }
  }

  // Title
  page.drawText(sanitize(title), {
    x: MARGIN,
    y: y - TITLE_SIZE,
    size: TITLE_SIZE,
    font: titleFont,
    color: ink,
  })
  y -= TITLE_SIZE + LINE_HEIGHT * 1.5

  // Body paragraphs
  for (const paragraph of paragraphs) {
    for (const line of wrapParagraph(paragraph, font, BODY_SIZE, contentWidth)) {
      ensureRoom(LINE_HEIGHT)
      page.drawText(line, { x: MARGIN, y: y - BODY_SIZE, size: BODY_SIZE, font, color: ink })
      y -= LINE_HEIGHT
    }
    y -= PARAGRAPH_GAP
  }

  return doc.save()
}

/**
 * Build the consent PDF and return an object URL for it. The caller owns the
 * URL and must `URL.revokeObjectURL` it when the embed unmounts.
 */
export async function buildConsentPdfUrl(
  title: string,
  paragraphs: readonly string[],
): Promise<string> {
  const bytes = await buildConsentPdfBytes(title, paragraphs)
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" })
  return URL.createObjectURL(blob)
}
