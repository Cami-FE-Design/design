import type * as React from "react"
import { AdminMobileDrawer } from "@/components/blocks/admin-mobile-drawer"
import { AdminMobileTopbar } from "@/components/blocks/admin-mobile-topbar"
import { AdminSidebar } from "@/components/blocks/admin-sidebar"
import { AdminTopbar } from "@/components/blocks/admin-topbar"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type Breakpoint = "desktop" | "mobile"

type AdminShellProps = React.ComponentProps<"div"> & {
  /** Force one variant; omit for responsive (mobile under lg, desktop at lg+). */
  breakpoint?: Breakpoint
  sidebar?: React.ReactNode
  topbar?: React.ReactNode
  drawer?: React.ReactNode
  header?: React.ReactNode
}

/**
 * Cami HQ application shell — for the ops-admin tool.
 *
 * Mirrors `AppShell` (Pet Business) in structure: sidebar + topbar + content,
 * responsive between mobile (Sheet drawer) and desktop (persistent sidebar) at
 * the lg breakpoint. Differs in branding (Cami HQ pill vs workspace switcher),
 * nav items (admin menu), and the surrounding background (cami-sage-4).
 *
 * Including the fix `AppShell` carries: **one tree, switched by CSS**. Both
 * shells rendered `children` twice, once per breakpoint, which is invisible for
 * ordinary content and not for a dialog — Radix portals that to `document.body`,
 * out of the container whose CSS was hiding the second copy, so two appeared
 * stacked. Only the chrome switches now. See `app-shell.tsx` for the whole of it.
 */
export function AdminShell({
  className,
  breakpoint,
  children,
  sidebar,
  topbar,
  drawer,
  header,
  ...props
}: AdminShellProps) {
  const responsive = breakpoint === undefined

  // Which chrome shows, and when. Only the classes differ between the three
  // cases — the tree below is the same in all of them.
  const rootLayout = responsive
    ? "flex-col lg:flex-row lg:items-start"
    : breakpoint === "desktop"
      ? "flex-row items-start"
      : "flex-col"
  const sidebarClass = responsive ? "hidden lg:flex" : breakpoint === "desktop" ? "flex" : "hidden"
  const mobileTopbarClass = responsive
    ? "flex lg:hidden"
    : breakpoint === "desktop"
      ? "hidden"
      : "flex"

  const headerFallback = (
    <p className="text-base font-medium leading-6 text-muted-foreground">Page Header</p>
  )
  const contentFallback = (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center border-2 border-dashed border-border">
      <p className="text-base font-normal leading-6 text-muted-foreground">Main Content</p>
    </div>
  )

  return (
    <Sheet>
      <div
        data-slot="admin-shell"
        data-breakpoint={responsive ? "responsive" : breakpoint}
        className={cn(
          // `h-dvh`, not `h-screen`: on mobile browsers 100vh is the large
          // viewport, so with the URL bar shown the bottom of the shell sits
          // below the fold and cannot be reached. On desktop the two are equal.
          "relative flex h-dvh w-full overflow-clip bg-cami-sage-4",
          rootLayout,
          className,
        )}
        {...props}
      >
        {sidebar ?? <AdminSidebar className={sidebarClass} />}

        <div className="relative z-[1] flex h-full w-full min-w-0 flex-1 flex-col">
          <div className="relative z-[2] w-full">
            {topbar ?? (
              <>
                <AdminMobileTopbar className={mobileTopbarClass} />
                <AdminTopbar className={sidebarClass} />
              </>
            )}
          </div>

          <div
            className={cn(
              "relative z-[1] flex w-full flex-1 flex-col overflow-hidden bg-background",
              responsive
                ? "rounded-t-2xl lg:rounded-tr-none"
                : breakpoint === "desktop"
                  ? "rounded-tl-2xl"
                  : "rounded-t-2xl",
            )}
          >
            {header !== null ? (
              <div className="flex w-full items-center justify-center px-3 py-6">
                {header ?? headerFallback}
              </div>
            ) : null}
            {/* Written once. */}
            <div className="flex min-h-0 w-full flex-1 flex-col px-3 pb-9">
              {children ?? contentFallback}
            </div>
          </div>
        </div>

        <SheetContent
          side="left"
          showCloseButton={false}
          inline
          className={cn(
            "data-[side=left]:max-w-[311px]",
            mobileTopbarClass === "hidden" ? "hidden" : undefined,
          )}
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          {drawer ?? <AdminMobileDrawer />}
        </SheetContent>
      </div>
    </Sheet>
  )
}
