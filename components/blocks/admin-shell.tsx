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
  const renderMobile = breakpoint === "mobile" || breakpoint === undefined
  const renderDesktop = breakpoint === "desktop" || breakpoint === undefined
  const responsive = breakpoint === undefined

  const mobileRoot = responsive ? "flex lg:hidden" : "flex"
  const desktopRoot = responsive ? "hidden lg:flex" : "flex"
  const mobileHeight = responsive ? "h-dvh" : "h-full"

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
      {renderMobile && (
        <Sheet>
          <div
            data-slot="admin-shell"
            data-breakpoint={responsive ? "responsive" : "mobile"}
            className={cn(
              mobileRoot,
              mobileHeight,
              "relative w-full flex-col overflow-clip bg-cami-sage-4",
              className,
            )}
            {...(renderDesktop ? {} : props)}
          >
            <div className="relative z-[2] w-full">{topbar ?? <AdminMobileTopbar />}</div>
            <div className="relative z-[1] flex w-full flex-1 flex-col overflow-hidden rounded-tl-2xl rounded-tr-2xl bg-background">
              {header !== null && (
                <div className="flex w-full items-center justify-center px-3 py-6">
                  {header ?? headerFallback}
                </div>
              )}
              <div className="flex min-h-0 w-full flex-1 flex-col px-3 pb-9">
                {children ?? contentFallback}
              </div>
            </div>
            <SheetContent
              side="left"
              showCloseButton={false}
              inline
              className="data-[side=left]:max-w-[311px]"
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              {drawer ?? <AdminMobileDrawer />}
            </SheetContent>
          </div>
        </Sheet>
      )}

      {renderDesktop && (
        <div
          data-slot="admin-shell"
          data-breakpoint={responsive ? "responsive" : "desktop"}
          className={cn(
            desktopRoot,
            "h-screen w-full items-start overflow-clip bg-cami-sage-4",
            className,
          )}
          {...props}
        >
          {sidebar ?? <AdminSidebar />}
          <div className="relative z-[1] flex h-full min-w-0 flex-1 flex-col">
            <div className="relative z-[2] w-full">{topbar ?? <AdminTopbar />}</div>
            <div className="relative z-[1] flex w-full flex-1 flex-col overflow-hidden rounded-tl-2xl">
              {header !== null ? (
                <div className="flex w-full items-center justify-center bg-background px-3 py-6">
                  {header ?? headerFallback}
                </div>
              ) : null}
              <div className="flex min-h-0 w-full flex-1 flex-col bg-background px-3 pb-9">
                {children ?? contentFallback}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
