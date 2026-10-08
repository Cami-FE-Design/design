import type * as React from "react"
import { Suspense } from "react"
import { AppMobileDrawer } from "@/components/blocks/shell/app-mobile-drawer"
import { AppMobileTopbar } from "@/components/blocks/shell/app-mobile-topbar"
import { AppSettingsController } from "@/components/blocks/shell/app-settings-controller"
import { AppSidebar } from "@/components/blocks/shell/app-sidebar"
import { AppTopbar } from "@/components/blocks/shell/app-topbar"
import { LocationSwitcher } from "@/components/blocks/shell/location-switcher"
import { LocationAccessGate, NoLocationAccess } from "@/components/blocks/shell/no-location-access"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

/**
 * The app frame: sidebar or drawer, topbar, and the page under it.
 *
 * ## One tree, switched by CSS
 *
 * This used to render **two** complete trees — a mobile one and a desktop one,
 * with `lg:hidden` / `hidden lg:flex` hiding whichever did not apply — so every
 * page existed twice in the DOM at all times. For ordinary content that is
 * invisible: the hidden copy sits inside a container with `display: none`.
 *
 * A dialog does not. Radix portals it to `document.body`, out of the container
 * whose CSS was hiding it, so **both** copies became visible — two dialogs
 * stacked, each with its own state, closing one leaving the other. Nine pages
 * mount a dialog inside this shell and every one of them had it; it was only
 * ever noticed on the Deals page it then had, where the fix was to move that page's
 * dialogs outside the shell. That is a fix per page, and per page somebody
 * remembers.
 *
 * So the duplication is gone instead. Only the **chrome** switches — sidebar
 * against drawer, desktop topbar against mobile — and `children` is written
 * once. This is the shape the dev repo's own `app-shell.tsx` already has, whose
 * comment says it "mirrors projects-cami's app-shell structure exactly": they
 * took this shell and dropped the duplication on the way.
 *
 * Two things follow from it beyond the bug: half the DOM goes, and assertions
 * stop having to count matches — `getAllByText` in this repo's page tests is a
 * scar from this.
 *
 * ## `breakpoint`
 *
 * Forces one of the two, for a demo that has to show a desktop frame whatever
 * the viewport (`/admin/portal-impersonation-demo`). It picks which classes the
 * chrome gets; it never duplicates the content.
 */

type Breakpoint = "desktop" | "mobile"

type AppShellProps = React.ComponentProps<"div"> & {
  breakpoint?: Breakpoint
  sidebar?: React.ReactNode
  topbar?: React.ReactNode
  drawer?: React.ReactNode
  header?: React.ReactNode
  /** Override the default header wrapper classes (min-h, padding). Pass "" for none. */
  headerClassName?: string
  /** Extra classes for the content wrapper (e.g. "pb-0" to drop the default bottom padding). */
  contentClassName?: string
  /** Extra classes for the rounded content frame (the panel under the topbar). */
  frameClassName?: string
}

export function AppShell({
  className,
  breakpoint,
  children,
  sidebar,
  topbar,
  drawer,
  header,
  headerClassName,
  contentClassName,
  frameClassName,
  ...props
}: AppShellProps) {
  const responsive = breakpoint === undefined

  // Which chrome shows, and when. Three cases, and only the classes differ —
  // the tree below is the same in all of them.
  const rootLayout = responsive
    ? "flex-col lg:flex-row lg:items-start"
    : breakpoint === "desktop"
      ? "flex-row items-start"
      : "flex-col"
  const sidebarClass = responsive ? "hidden lg:flex" : breakpoint === "desktop" ? "flex" : "hidden"
  const desktopTopbarClass = sidebarClass
  const mobileTopbarClass = responsive
    ? "flex lg:hidden"
    : breakpoint === "desktop"
      ? "hidden"
      : "flex"
  // The drawer is the mobile nav, so it goes wherever the mobile topbar does.
  const drawerClass = mobileTopbarClass === "hidden" ? "hidden" : undefined

  const headerFallback = (
    <p className="text-base font-medium leading-6 text-muted-foreground">Page Header</p>
  )
  const contentFallback = (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center border-2 border-dashed border-border">
      <p className="text-base font-normal leading-6 text-muted-foreground">Main Content</p>
    </div>
  )

  return (
    <>
      <Sheet>
        <div
          data-slot="app-shell"
          data-breakpoint={responsive ? "responsive" : breakpoint}
          className={cn(
            // `h-dvh`, not `h-screen`: on mobile browsers 100vh is the LARGE
            // viewport (URL bar collapsed), so with the bar shown the bottom of
            // the shell sits below the fold and is unreachable — the body does
            // not scroll, `overflow-clip`. On desktop dvh and vh are the same,
            // so one value serves both.
            "relative flex h-dvh w-full overflow-clip bg-sand-3",
            rootLayout,
            className,
          )}
          {...props}
        >
          {sidebar ?? <AppSidebar className={sidebarClass} />}

          <div className="relative z-[1] flex h-full min-w-0 w-full flex-1 flex-col">
            {/* The topbar sits on its own layer above the rounded content frame,
                so dropdowns anchored to it render over the page rather than
                under it. */}
            <div className="relative z-[2] w-full">
              {topbar ?? (
                <>
                  <AppMobileTopbar className={mobileTopbarClass} />
                  {/* SCR-04 on a phone. The bar has no room left beside the
                      workspace switcher, so the location gets its own row under
                      it. Renders nothing for a single-location business. */}
                  <LocationSwitcher
                    className={cn("mx-3 mb-2 w-[calc(100%-1.5rem)] max-w-none", mobileTopbarClass)}
                  />
                  <AppTopbar className={desktopTopbarClass} />
                </>
              )}
            </div>

            <div
              className={cn(
                "relative z-[1] flex w-full flex-1 flex-col overflow-hidden bg-background shadow-[-22px_-44px_88px_0_rgba(221,221,221,0.87)]",
                frameClassName,
                // Both corners on mobile, where the frame spans the width; only
                // the left one on desktop, where the sidebar meets it.
                responsive
                  ? "rounded-t-2xl lg:rounded-tr-none"
                  : breakpoint === "desktop"
                    ? "rounded-tl-2xl"
                    : "rounded-t-2xl",
              )}
            >
              {/* Somebody who holds no location has nothing here to act on, so
                  the page's header and content give way to one full-page
                  state. For everybody else the gate renders nothing of its own. */}
              {header !== null && (
                <LocationAccessGate fallback={null}>
                  <div
                    className={cn(
                      "flex min-h-[100px] w-full items-center justify-center px-3 py-6",
                      headerClassName,
                    )}
                  >
                    {header ?? headerFallback}
                  </div>
                </LocationAccessGate>
              )}
              {/* Written once. This is the whole point of the file. */}
              <div
                className={cn("flex min-h-0 w-full flex-1 flex-col px-3 pb-9", contentClassName)}
              >
                <LocationAccessGate fallback={<NoLocationAccess className="mt-3" />}>
                  {children ?? contentFallback}
                </LocationAccessGate>
              </div>
            </div>
          </div>

          <SheetContent
            side="left"
            showCloseButton={false}
            inline
            className={cn("data-[side=left]:max-w-[311px]", drawerClass)}
          >
            <SheetTitle className="sr-only">Menu</SheetTitle>
            {drawer ?? <AppMobileDrawer />}
          </SheetContent>
        </div>
      </Sheet>
      <Suspense fallback={null}>
        <AppSettingsController />
      </Suspense>
    </>
  )
}
