"use client"

import { ChevronDownIcon } from "lucide-react"
import Link from "next/link"
import { AppShell } from "@/components/blocks/app-shell"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ServiceMenuPage() {
  return (
    <AppShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl leading-8 font-medium text-foreground">Service menu</h1>
            <p className="text-sm text-muted-foreground">
              View and manage the services offered by your business.{" "}
              <button type="button" className="font-medium text-cami-violet-11 hover:underline">
                Learn more
              </button>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" radius="full" size="sm">
                  Options
                  <ChevronDownIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem>Manage categories</DropdownMenuItem>
                <DropdownMenuItem>Reorder menu</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button radius="full">
                  Add
                  <ChevronDownIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem>Single service</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/catalogs/service-menu/combos/new">Combo</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Category</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4" />
    </AppShell>
  )
}
