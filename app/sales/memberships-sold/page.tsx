"use client"

import { ChevronDownIcon, InboxIcon, PencilIcon, SlidersHorizontalIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useState } from "react"
import { AppShell } from "@/components/blocks/app-shell"
import { ClientDetailDialog } from "@/components/blocks/client-detail-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
import { MembershipSoldDetailDialog } from "@/components/blocks/membership-sold-detail-dialog"
import {
  MOCK_SOLD_MEMBERSHIPS,
  type SoldActivityEntry,
  type SoldMembership,
  SoldMembershipsTable,
} from "@/components/blocks/sold-memberships"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "@/components/ui/search-input"

function MembershipsSoldIndex() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedId = searchParams.get("sold")

  const setSelectedId = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (id) params.set("sold", id)
      else params.delete("sold")
      const qs = params.toString()
      router.replace(qs ? `?${qs}` : "?", { scroll: false })
    },
    [router, searchParams],
  )

  const [query, setQuery] = useState("")
  const [showEmpty, setShowEmpty] = useState(false)
  const [rows, setRows] = useState<SoldMembership[]>(MOCK_SOLD_MEMBERSHIPS)
  const [clientModal, setClientModal] = useState<SoldMembership | null>(null)

  const all: SoldMembership[] = showEmpty ? [] : rows
  const visible = query.trim()
    ? all.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.client.toLowerCase().includes(query.toLowerCase()),
      )
    : all

  const selected = rows.find((r) => r.id === selectedId) ?? null

  function applyStatus(id: string, status: SoldMembership["status"], entry: SoldActivityEntry) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, activity: [entry, ...r.activity] } : r)),
    )
  }

  return (
    <AppShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl leading-8 font-medium text-foreground">Memberships sold</h1>
            <p className="text-sm text-muted-foreground">
              View and filter memberships purchased by your clients.{" "}
              <span className="text-cami-violet-11">Learn more</span>
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" radius="full" size="sm">
                Options
                <ChevronDownIcon className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto min-w-52">
              <DropdownMenuItem asChild className="whitespace-nowrap">
                <Link href="/catalogs/memberships">
                  <PencilIcon className="size-4" />
                  Manage memberships
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        {all.length === 0 ? (
          <div className="rounded-2xl border border-border/60 py-24">
            <EmptyState
              icon={InboxIcon}
              title="No membership sales yet"
              description="Memberships your clients purchase will show up here"
              action={
                <Button asChild variant="outline" radius="full">
                  <Link href="/sales/new-sale">Create new sale</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* No tabs — search + filter on the left */}
            <div className="flex items-center gap-2">
              <SearchInput
                className="h-9! w-80"
                placeholder="Search by client or membership name"
                aria-label="Search memberships sold"
                onValueChange={setQuery}
              />
              <Button variant="outline" size="sm" radius="full" className="gap-1.5">
                <SlidersHorizontalIcon className="size-4" />
                Filters
              </Button>
            </div>

            <SoldMembershipsTable
              rows={visible}
              onRowClick={setSelectedId}
              onClientClick={setClientModal}
            />

            <p className="pt-2 text-center text-sm text-muted-foreground">
              Showing {visible.length} of {all.length} results
            </p>
          </>
        )}

        {/* Prototype demo toggle */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setShowEmpty((v) => !v)}
            className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
          >
            {showEmpty ? "Show populated state" : "Show empty state"}
          </button>
        </div>
      </div>

      <MembershipSoldDetailDialog
        membership={selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
        onPause={(id, entry) => applyStatus(id, "paused", entry)}
        onResume={(id, entry) => applyStatus(id, "active", entry)}
      />

      <ClientDetailDialog
        open={clientModal !== null}
        onOpenChange={(open) => {
          if (!open) setClientModal(null)
        }}
        client={
          clientModal
            ? {
                id: clientModal.clientId,
                name: clientModal.client,
                email: clientModal.clientEmail,
              }
            : { name: "" }
        }
        hasPets
      />
    </AppShell>
  )
}

export default function MembershipsSoldPage() {
  return (
    <Suspense fallback={null}>
      <MembershipsSoldIndex />
    </Suspense>
  )
}
