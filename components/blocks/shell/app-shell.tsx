import type * as React from "react"
import { Suspense } from "react"
import { AppMobileDrawer } from "@/components/blocks/shell/app-mobile-drawer"
import { AppMobileTopbar } from "@/components/blocks/shell/app-mobile-topbar"
import { AppSettingsController } from "@/components/blocks/shell/app-settings-controller"
import { AppSidebar } from "@/components/blocks/shell/app-sidebar"
import { AppTopbar } from "@/components/blocks/shell/app-topbar"
import { LocationSwitcher } from "@/components/blocks/shell/location-switcher"
import { type ShellBreakpoint, ShellFrame } from "@/components/blocks/shell/shell-frame"
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

type Breakpoint = ShellBreakpoint

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
  return (
    <>
      <ShellFrame
        slot="app-shell"
        breakpoint={breakpoint}
        className={cn("bg-sand-3", className)}
        frameClassName={cn("shadow-[-22px_-44px_88px_0_rgba(221,221,221,0.87)]", frameClassName)}
        headerClassName={cn("min-h-[100px]", headerClassName)}
        contentClassName={contentClassName}
        header={header}
        locationGate
        chrome={(classes) => ({
          sidebar: sidebar ?? <AppSidebar className={classes.sidebar} />,
          topbar: topbar ?? (
            <>
              <AppMobileTopbar className={classes.mobileTopbar} />
              {/* SCR-04 on a phone. The bar has no room left beside the
                  workspace switcher, so the location gets its own row under
                  it. Renders nothing for a single-location business. */}
              <LocationSwitcher
                className={cn("mx-3 mb-2 w-[calc(100%-1.5rem)] max-w-none", classes.mobileTopbar)}
              />
              <AppTopbar className={classes.desktopTopbar} />
            </>
          ),
          drawer: drawer ?? <AppMobileDrawer />,
        })}
        {...props}
      >
        {children}
      </ShellFrame>
      <Suspense fallback={null}>
        <AppSettingsController />
      </Suspense>
    </>
  )
}
