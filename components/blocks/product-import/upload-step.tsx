"use client"

// Step 1 — file pick, import mode, price threshold, template downloads.
// Faithful port of cami-business `UploadStep` (product branch).
//
// In production the FE validates only extension and size; everything else is a
// backend verdict. That split is preserved here: the scenario's `uploadError`
// stands in for the server's answer.

import { DownloadIcon, FileSpreadsheetIcon, XIcon } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DEFAULT_PRICE_THRESHOLD, PRODUCT_IMPORT_CONFIG } from "@/lib/product-import/config"
import type { ProductImportMode } from "@/lib/product-import/types"

const ACCEPTED =
  ".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

type Props = {
  /** Server-side rejection of the upload, if the active scenario has one. */
  serverError?: string | null
  onSubmit: (params: { mode: ProductImportMode; priceChangeThresholdPct: number }) => void
}

export function UploadStep({ serverError, onSubmit }: Props) {
  const config = PRODUCT_IMPORT_CONFIG
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
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
      setFileError("Only .csv and .xlsx files are supported.")
      setFile(null)
      return
    }
    if (selected.size > maxSizeBytes) {
      setFileError(`File must be smaller than ${config.maxFileSizeMb} MB.`)
      setFile(null)
      return
    }
    setFile(selected)
  }

  const handleSubmit = () => {
    if (!file) return
    const parsed = Number.parseInt(threshold, 10)
    const priceChangeThresholdPct = Number.isNaN(parsed)
      ? DEFAULT_PRICE_THRESHOLD
      : Math.min(100, Math.max(0, parsed))
    onSubmit({ mode, priceChangeThresholdPct })
  }

  const modeHint = config.importModes.find((o) => o.value === mode)?.hint

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">Upload your file</h2>
        <p className="text-sm text-muted-foreground">
          Upload a CSV or Excel file to bulk-import {config.plural}. Max {config.maxFileSizeMb} MB ·
          max {config.maxRows} rows.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="import-mode">Import mode</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as ProductImportMode)}>
            <SelectTrigger id="import-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {config.importModes.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{modeHint}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price-threshold">Price-change threshold (%)</Label>
          <Input
            id="price-threshold"
            type="number"
            min={0}
            max={100}
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Retail-price jumps above this flag the row for your approval.
          </p>
        </div>
      </div>

      {!file && (
        <button
          type="button"
          aria-label="Select import file"
          className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border/70 bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/60"
          onClick={() => inputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault()
            selectFile(e.dataTransfer.files[0] ?? null)
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <DownloadIcon className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Click to upload or drag and drop</p>
            <p className="mt-0.5 text-xs text-muted-foreground">CSV or Excel (.xlsx)</p>
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
      />

      {file && (
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
          <FileSpreadsheetIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
          <button
            type="button"
            aria-label="Remove file"
            className="shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => {
              setFile(null)
              setFileError(null)
              if (inputRef.current) inputRef.current.value = ""
            }}
          >
            <XIcon className="size-4" />
          </button>
        </div>
      )}

      {fileError && <p className="text-xs text-destructive">{fileError}</p>}
      {serverError && !fileError && <p className="text-xs text-destructive">{serverError}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Need the template?</span>
          <Button variant="outline" size="sm" asChild>
            <a href={config.templatePaths.csv} download>
              <DownloadIcon />
              CSV
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={config.templatePaths.xlsx} download>
              <DownloadIcon />
              Excel
            </a>
          </Button>
        </div>
        <Button onClick={handleSubmit} disabled={!file}>
          Upload &amp; analyze
        </Button>
      </div>
    </div>
  )
}
