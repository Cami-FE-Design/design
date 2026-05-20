"use client"

import { CameraIcon, PencilIcon, RefreshCwIcon, Trash2Icon, XIcon } from "lucide-react"
import NextImage from "next/image"
import { useCallback, useRef, useState } from "react"
import type { Area } from "react-easy-crop"
import Cropper from "react-easy-crop"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = imageSrc
  })
  const canvas = document.createElement("canvas")
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )
  return canvas.toDataURL("image/jpeg", 0.92)
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Photo = {
  id: string
  url: string
  processing?: boolean
}

// ─── Photo tile ───────────────────────────────────────────────────────────────

type PhotoTileProps = {
  photo: Photo
  isMain: boolean
  isSelected: boolean
  isSwapping: boolean
  onPhotoClick: (id: string) => void
  onEdit: (photo: Photo) => void
  onDelete: (id: string) => void
}

function PhotoTile({
  photo,
  isMain,
  isSelected,
  isSwapping,
  onPhotoClick,
  onEdit,
  onDelete,
}: PhotoTileProps) {
  if (photo.processing) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-muted">
        <div className="aspect-square w-full" />
        {isMain && (
          <span className="absolute top-2 left-2 rounded-full bg-background/90 px-2.5 py-0.5 text-xs font-medium text-foreground shadow-sm">
            Main photo
          </span>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-1.5">
            {[0, 150, 300].map((delay) => (
              <div
                key={delay}
                className="size-2 animate-pulse rounded-full bg-foreground/25"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Loading image...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-xl",
        isSelected && "ring-2 ring-primary ring-offset-2",
        !isSelected && isSwapping && "hover:ring-2 hover:ring-primary/40 hover:ring-offset-1",
      )}
    >
      <button
        type="button"
        onClick={() => onPhotoClick(photo.id)}
        aria-label={isMain ? "Reorder main product photo" : "Reorder product photo"}
        className="block w-full cursor-pointer"
      >
        <div className="relative aspect-square w-full">
          <NextImage
            src={photo.url}
            alt={isMain ? "Main product photo" : "Product photo"}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      </button>

      {isMain && !isSwapping && (
        <span className="pointer-events-none absolute top-2 left-2 rounded-full bg-background/90 px-2.5 py-0.5 text-xs font-medium text-foreground shadow-sm">
          Main photo
        </span>
      )}

      {isSelected && (
        <span className="pointer-events-none absolute top-2 left-2 flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground shadow-sm">
          <RefreshCwIcon className="size-3" />
          Select another
        </span>
      )}

      {!isSwapping && (
        <div
          className={cn(
            "absolute flex gap-1 opacity-0 transition-opacity group-hover:opacity-100",
            isMain ? "top-2 right-2" : "top-1.5 right-1.5",
          )}
        >
          <button
            type="button"
            onClick={() => onEdit(photo)}
            className={cn(
              "flex items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors hover:bg-background",
              isMain ? "size-7" : "size-6",
            )}
            aria-label="Edit photo"
          >
            <PencilIcon className={isMain ? "size-3.5" : "size-3"} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(photo.id)}
            className={cn(
              "flex items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors hover:bg-background",
              isMain ? "size-7" : "size-6",
            )}
            aria-label="Delete photo"
          >
            <Trash2Icon className={isMain ? "size-3.5" : "size-3"} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function ProductPhotosCard() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [cropOpen, setCropOpen] = useState(false)
  const [cropUrl, setCropUrl] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const croppedAreaPixelsRef = useRef<Area | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null)
  const fileQueueRef = useRef<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Upload: no crop — upload → uploading → loading → image shown ──────────

  function startUpload(file: File) {
    const url = URL.createObjectURL(file)
    setUploading(true)
    // Step 1: uploading animation
    setTimeout(() => {
      setUploading(false)
      // Step 2: loading animation — add photo in processing state
      const newId = crypto.randomUUID()
      setPhotos((prev) => [...prev, { id: newId, url, processing: true }])
      // Step 3: reveal image
      setTimeout(() => {
        setPhotos((prev) => prev.map((p) => (p.id === newId ? { ...p, processing: false } : p)))
      }, 900)
      // Next file in queue
      const next = fileQueueRef.current[0]
      if (next) {
        fileQueueRef.current = fileQueueRef.current.slice(1)
        setTimeout(() => startUpload(next), 400)
      }
    }, 900)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ""
    fileQueueRef.current = files.slice(1)
    startUpload(files[0])
  }

  // ── Edit: opens crop dialog ────────────────────────────────────────────────

  function handleEdit(photo: Photo) {
    setEditingId(photo.id)
    setCropUrl(photo.url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    croppedAreaPixelsRef.current = null
    setCropOpen(true)
  }

  const handleCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    croppedAreaPixelsRef.current = croppedAreaPixels
  }, [])

  async function handleCropApply() {
    if (!editingId || !cropUrl || !croppedAreaPixelsRef.current) return
    const cropped = await getCroppedImg(cropUrl, croppedAreaPixelsRef.current)
    setPhotos((prev) => prev.map((p) => (p.id === editingId ? { ...p, url: cropped } : p)))
    setCropOpen(false)
    setCropUrl(null)
    setEditingId(null)
  }

  function handleCropCancel() {
    setCropOpen(false)
    setCropUrl(null)
    setEditingId(null)
  }

  // ── Swap ──────────────────────────────────────────────────────────────────

  function handlePhotoClick(id: string) {
    const photo = photos.find((p) => p.id === id)
    if (photo?.processing) return

    if (swapSourceId === null) {
      setSwapSourceId(id)
      return
    }
    if (swapSourceId === id) {
      setSwapSourceId(null)
      return
    }
    setPhotos((prev) => {
      const a = prev.findIndex((p) => p.id === swapSourceId)
      const b = prev.findIndex((p) => p.id === id)
      if (a === -1 || b === -1) return prev
      const next = [...prev]
      ;[next[a], next[b]] = [next[b], next[a]]
      return next
    })
    setSwapSourceId(null)
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  function confirmDelete() {
    if (deleteId) setPhotos((prev) => prev.filter((p) => p.id !== deleteId))
    setDeleteId(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const mainPhoto = photos[0] ?? null
  const otherPhotos = photos.slice(1)
  const isSwapping = swapSourceId !== null

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="flex items-start justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Product photos</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isSwapping
                ? "Click another photo to swap positions."
                : "Click a photo to reorder, or add more below."}
            </p>
          </div>
          {isSwapping && (
            <button
              type="button"
              onClick={() => setSwapSourceId(null)}
              className="mt-0.5 shrink-0 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2 px-4 pb-4">
          {/* ── No photos yet ─────────────────────────────────────────────── */}
          {photos.length === 0 &&
            (uploading ? (
              /* Full-width uploading tile */
              <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
                Uploading...
              </div>
            ) : (
              /* Full-width Add button */
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl bg-muted/60 py-8 text-center transition-colors hover:bg-muted"
              >
                <CameraIcon className="size-6 text-primary" strokeWidth={1.5} />
                <span className="text-sm font-medium text-primary">Add a photo</span>
              </button>
            ))}

          {/* ── Photos exist ──────────────────────────────────────────────── */}
          {photos.length > 0 && (
            <>
              {/* Main photo always stays at top, undisturbed */}
              <PhotoTile
                photo={mainPhoto!}
                isMain
                isSelected={swapSourceId === mainPhoto!.id}
                isSwapping={isSwapping}
                onPhotoClick={handlePhotoClick}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteId(id)}
              />

              {/* Secondary grid: other photos + uploading cell + Add button */}
              <div className="grid grid-cols-2 gap-2">
                {otherPhotos.map((photo) => (
                  <PhotoTile
                    key={photo.id}
                    photo={photo}
                    isMain={false}
                    isSelected={swapSourceId === photo.id}
                    isSwapping={isSwapping}
                    onPhotoClick={handlePhotoClick}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))}

                {/* Uploading cell — sits in grid next to existing photos */}
                {uploading && (
                  <div className="flex aspect-square items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">
                    Uploading...
                  </div>
                )}

                {/* Add a photo cell */}
                {!uploading && !isSwapping && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl bg-muted/60 transition-colors hover:bg-muted"
                  >
                    <CameraIcon className="size-5 text-primary" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-primary">Add a photo</span>
                  </button>
                )}
              </div>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* ── Crop dialog (edit only) ───────────────────────────────────────── */}
      <Dialog
        open={cropOpen}
        onOpenChange={(o) => {
          if (!o) handleCropCancel()
        }}
      >
        <DialogContent className="max-w-xl gap-0 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="flex flex-row items-center justify-between px-6 pt-7 pb-0">
            <DialogTitle>Crop photo</DialogTitle>
            <DialogDescription className="sr-only">
              Drag to reposition and pinch to zoom the photo into a square crop.
            </DialogDescription>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              radius="full"
              aria-label="Close"
              onClick={handleCropCancel}
            >
              <XIcon />
            </Button>
          </DialogHeader>

          {cropUrl && (
            <div className="relative mx-6 my-6 h-72 overflow-hidden rounded-2xl bg-[#2c2c2c]">
              <Cropper
                image={cropUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-border/60 px-6 py-4">
            <Button variant="outline" radius="full" onClick={handleCropCancel}>
              Cancel
            </Button>
            <Button radius="full" onClick={handleCropApply}>
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete dialog ────────────────────────────────────────────────── */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null)
        }}
      >
        <DialogContent className="max-w-md gap-0 p-0">
          <DialogHeader className="flex flex-row items-center justify-between px-6 pt-7 pb-0">
            <DialogTitle>Delete photo?</DialogTitle>
            <DialogDescription className="sr-only">
              Permanently remove this photo from the product. This action cannot be undone.
            </DialogDescription>
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm" radius="full" aria-label="Close">
                <XIcon />
              </Button>
            </DialogClose>
          </DialogHeader>
          <div className="px-6 py-6">
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2 border-t border-border/60 px-6 py-4">
            <Button variant="outline" radius="full" onClick={() => setDeleteId(null)}>
              Go back
            </Button>
            <Button variant="destructive" radius="full" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
