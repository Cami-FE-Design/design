import type * as React from "react"
import { AdminMobileDrawer } from "@/components/blocks/admin/admin-mobile-drawer"
import { AdminMobileTopbar } from "@/components/blocks/admin/admin-mobile-topbar"
import { AdminSidebar } from "@/components/blocks/admin/admin-sidebar"
import { AdminTopbar } from "@/components/blocks/admin/admin-topbar"
import { type ShellBreakpoint, ShellFrame } from "@/components/blocks/shell/shell-frame"
import { cn } from "@/lib/utils"

type Breakpoint = ShellBreakpoint

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
  return (
    <ShellFrame
      slot="admin-shell"
      breakpoint={breakpoint}
      className={cn("bg-cami-sage-4", className)}
      header={header}
      chrome={(classes) => ({
        sidebar: sidebar ?? <AdminSidebar className={classes.sidebar} />,
        topbar: topbar ?? (
          <>
            <AdminMobileTopbar className={classes.mobileTopbar} />
            <AdminTopbar className={classes.desktopTopbar} />
          </>
        ),
        drawer: drawer ?? <AdminMobileDrawer />,
      })}
      {...props}
    >
      {children}
    </ShellFrame>
  )
}
