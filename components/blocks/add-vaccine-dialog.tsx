"use client"

import { PaperclipIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { DatePicker } from "@/components/blocks/date-picker"
import { SearchableCombobox } from "@/components/blocks/searchable-combobox"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const VACCINE_OPTIONS: string[] = [
  "Rabies",
  "Distemper",
  "Parvovirus",
  "Adenovirus",
  "Parainfluenza",
  "Bordetella",
  "Leptospirosis",
  "Lyme Disease",
  "DHPP",
  "DA2PP",
  "Canine influenza",
  "FVRCP",
  "FeLV",
  "Calicivirus",
]

export type NewVaccine = {
  name: string
  expirationDate: string
  hasDocument: boolean
}

type AddVaccineDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd?: (vaccine: NewVaccine) => void
}

export function AddVaccineDialog({ open, onOpenChange, onAdd }: AddVaccineDialogProps) {
  const [name, setName] = useState("")
  const [customOptions, setCustomOptions] = useState<string[]>([])
  const [expirationDate, setExpirationDate] = useState("")
  const [hasDocument, setHasDocument] = useState(false)

  useEffect(() => {
    if (open) {
      setName("")
      setExpirationDate("")
      setHasDocument(false)
    }
  }, [open])

  const canAdd = name.trim() !== "" && expirationDate !== ""

  function handleAdd() {
    if (!canAdd) return
    onAdd?.({ name: name.trim(), expirationDate, hasDocument })
    toast.success(`${name.trim()} added`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add vaccine</DialogTitle>
          <DialogDescription className="sr-only">
            Add a vaccination record with name, expiration date, and an optional document.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="vaccine-name">
              Vaccine name <span className="text-foreground">*</span>
            </Label>
            <SearchableCombobox
              id="vaccine-name"
              value={name}
              onValueChange={setName}
              baseOptions={VACCINE_OPTIONS}
              customOptions={customOptions}
              onAddCustom={(v) => setCustomOptions((prev) => [...prev, v])}
              placeholder="Search or add new"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="vaccine-expiration">
              Expiration date <span className="text-foreground">*</span>
            </Label>
            <DatePicker
              id="vaccine-expiration"
              value={expirationDate}
              onChange={setExpirationDate}
              placeholder="Select date"
              disableBefore={new Date()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Document</Label>
            <button
              type="button"
              onClick={() => setHasDocument((v) => !v)}
              className="flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
            >
              <PaperclipIcon className="size-4" />
              <span>{hasDocument ? "vaccine-cert.pdf (mock)" : "Click or drag to upload"}</span>
              <span className="text-xs">jpg, png, doc, docx, pdf</span>
            </button>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" radius="full">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" radius="full" disabled={!canAdd} onClick={handleAdd}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
