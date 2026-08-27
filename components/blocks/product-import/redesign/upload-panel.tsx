"use client"

// Redesigned step 1. Same three inputs as the as-built screen, asked as
// questions rather than named as settings: "Import mode" becomes "What should we
// do with products you already have?", and the threshold reads as a sentence
// with the number inside it.

import { DownloadIcon, FileSpreadsheetIcon, UploadCloudIcon, XIcon } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DEFAULT_PRICE_THRESHOLD, PRODUCT_IMPORT_CONFIG } from "@/lib/product-import/config"
import { IMPORT_MODE_COPY, UPLOAD_COPY } from "@/lib/product-import/copy"
import type { ProductImportMode } from "@/lib/product-import/types"
import { cn } from "@/lib/utils"

const ACCEPTED =
  ".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

const MODE_ORDER: ProductImportMode[] = ["UPSERT", "CREATE_ONLY", "UPDATE_ONLY", "STOCK_SYNC"]

/**
 * One footprint for both the empty picker and the picked file, so choosing a
 * file does not collapse the column and shift everything beside it.
 */
const FILE_BOX =
  "flex max-h-72 min-h-50 w-full flex-1 flex-col items-center justify-center gap-3 rounded-2xl bg-sand-2 px-6 py-8 text-center"

/** `1.4 MB` · `812 KB` — enough for the operator to spot the wrong file. */
function formatFileSize(bytes: number): string {
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

type Props = {
  serverError?: string | null
  busy?: boolean
  onSubmit: (params: { mode: ProductImportMode; priceChangeThresholdPct: number }) => void
}

export function UploadPanel({ serverError, busy, onSubmit }: Props) {
  const config = PRODUCT_IMPORT_CONFIG
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [mode, setMode] = useState<ProductImportMode>("UPSERT")
  const [threshold, setThreshold] = useState<string>(String(DEFAULT_PRICE_THRESHOLD))

  const maxSizeBytes = config.maxFileSizeMb * 1024 * 1024

  const selectFile = (selected: File | null) => {
    setFileError(null)
    if (!selected) {
      setFile(null)
      return
    }
    const ext = selected.name.split(".").pop()?.toLowerCase()
    if (ext !== "csv" && ext !== "xlsx") {
      setFileError("That file type won't work — we need an Excel (.xlsx) or CSV file.")
      setFile(null)
      return
    }
    if (selected.size > maxSizeBytes) {
      setFileError(`That file is bigger than ${config.maxFileSizeMb} MB. Try splitting it in two.`)
      setFile(null)
      return
    }
    setFile(selected)
  }

  const handleSubmit = () => {
    if (!file || busy) return
    const parsed = Number.parseInt(threshold, 10)
    const priceChangeThresholdPct = Number.isNaN(parsed)
      ? DEFAULT_PRICE_THRESHOLD
      : Math.min(100, Math.max(0, parsed))
    onSubmit({ mode, priceChangeThresholdPct })
  }

  return (
    // One panel that fills the frame: pinned header, scrolling body, pinned
    // footer. Previously the card was max-w-2xl inside a max-w-5xl page, which
    // either misaligned with the rest of the flow (centred) or left a large void
    // to its right (left-aligned). Full width with the file picker and the
    // options side by side balances it and roughly halves the height.
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex shrink-0 flex-col gap-1 border-b border-border/60 px-6 py-3.5">
        <h2 className="font-heading text-xl font-semibold text-foreground">{UPLOAD_COPY.title}</h2>
        <p className="text-sm text-muted-foreground">
          {UPLOAD_COPY.subtitle(config.maxFileSizeMb, config.maxRows)}
        </p>
      </div>

      <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col gap-3">
          {!file ? (
            <button
              type="button"
              aria-label={UPLOAD_COPY.dropTitle}
              className={cn(
                FILE_BOX,
                "cursor-pointer border-2 border-dashed transition-colors",
                dragging
                  ? "border-cami-violet-8 bg-cami-violet-2"
                  : "border-sand-7 bg-sand-2 hover:border-sand-8 hover:bg-sand-3",
              )}
              onClick={() => inputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                selectFile(e.dataTransfer.files[0] ?? null)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-cami-violet-3 text-cami-violet-11">
                <UploadCloudIcon className="size-5" strokeWidth={1.5} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{UPLOAD_COPY.dropTitle}</span>
                <span className="text-xs text-muted-foreground">{UPLOAD_COPY.dropHint}</span>
              </span>
            </button>
          ) : (
            <div className={cn(FILE_BOX, "border border-sand-7")}>
              <span className="flex size-12 items-center justify-center rounded-full bg-cami-violet-3 text-cami-violet-11">
                <FileSpreadsheetIcon className="size-5" strokeWidth={1.5} />
              </span>
              <div className="flex min-w-0 max-w-full flex-col gap-0.5">
                <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
                <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  radius="full"
                  onClick={() => inputRef.current?.click()}
                >
                  Choose a different file
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  radius="full"
                  aria-label="Remove file"
                  onClick={() => {
                    setFile(null)
                    setFileError(null)
                    if (inputRef.current) inputRef.current.value = ""
                  }}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
          />

          {fileError && <p className="text-sm text-destructive">{fileError}</p>}
          {serverError && !fileError && (
            <div className="flex flex-col gap-1 rounded-xl bg-cami-yellow-2 p-3">
              <p className="text-sm font-medium text-foreground">We couldn&apos;t read that file</p>
              <p className="text-sm text-muted-foreground">{serverError}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {/* The mode choice, as a question with real options rather than a select
          of internal enum labels. Native radios so the whole card is the hit
          target and arrow keys move between options. */}
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium text-foreground">
              {UPLOAD_COPY.modeLabel}
            </legend>
            {MODE_ORDER.map((value) => {
              const selected = mode === value
              return (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foreground",
                    selected
                      ? "border-cami-violet-8 bg-cami-violet-2"
                      : "border-sand-7 bg-background hover:border-sand-8 hover:bg-sand-2",
                  )}
                >
                  <input
                    type="radio"
                    name="import-mode"
                    value={value}
                    checked={selected}
                    onChange={() => setMode(value)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                      selected ? "border-cami-violet-9" : "border-border",
                    )}
                  >
                    {selected && <span className="size-2 rounded-full bg-cami-violet-9" />}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {IMPORT_MODE_COPY[value].label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {IMPORT_MODE_COPY[value].hint}
                    </span>
                  </span>
                </label>
              )
            })}
          </fieldset>

          {/* Label and field on one line: it already reads as a sentence, and
              three stacked rows for one number was the last of the height that
              forced a scrollbar into the step. */}
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="price-threshold" className="text-sm font-medium">
                {UPLOAD_COPY.thresholdLabel}
              </Label>
              <div className="relative w-24">
                <Input
                  id="price-threshold"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  maxLength={3}
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="px-3 pe-8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{UPLOAD_COPY.thresholdHint}</p>
          </div>
        </div>
      </div>

      {/* The panel's own footer: pinned by the flex column rather than sticky,
          so it is genuinely the card's bottom edge and the body scrolls under
          it instead of appearing to be sliced by it. */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border/60 px-6 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{UPLOAD_COPY.templateLabel}</span>
          <Button variant="outline" size="sm" radius="full" asChild>
            <a href={config.templatePaths.xlsx} download>
              <DownloadIcon />
              Excel
            </a>
          </Button>
          <Button variant="outline" size="sm" radius="full" asChild>
            <a href={config.templatePaths.csv} download>
              <DownloadIcon />
              CSV
            </a>
          </Button>
        </div>
        <Button radius="full" size="lg" onClick={handleSubmit} disabled={!file || busy}>
          {busy ? UPLOAD_COPY.checking : UPLOAD_COPY.submit}
        </Button>
      </div>
    </div>
  )
}
