import type * as React from "react"
import { Suspense } from "react"
import { AppMobileDrawer } from "@/components/blocks/app-mobile-drawer"
import { AppMobileTopbar } from "@/components/blocks/app-mobile-topbar"
import { AppSettingsController } from "@/components/blocks/app-settings-controller"
import { AppSidebar } from "@/components/blocks/app-sidebar"
import { AppTopbar } from "@/components/blocks/app-topbar"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type Breakpoint = "desktop" | "mobile"

type AppShellProps = React.ComponentProps<"div"> & {
  breakpoint?: Breakpoint
  sidebar?: React.ReactNode
  topbar?: React.ReactNode
  drawer?: React.ReactNode
  header?: React.ReactNode
}

export function AppShell({
  className,
  breakpoint,
  children,
  sidebar,
  topbar,
  drawer,
  header,
  ...props
}: AppShellProps) {
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
            data-slot="app-shell"
            data-breakpoint={responsive ? "responsive" : "mobile"}
            className={cn(
              mobileRoot,
              mobileHeight,
              "relative w-full flex-col overflow-clip bg-sand-3",
              className,
            )}
            {...(renderDesktop ? {} : props)}
          >
            <div className="relative z-[2] w-full">{topbar ?? <AppMobileTopbar />}</div>
            <div className="relative z-[1] flex w-full flex-1 flex-col overflow-hidden rounded-tl-2xl rounded-tr-2xl bg-background shadow-[-22px_-44px_88px_0_rgba(221,221,221,0.87)]">
              {header !== null && (
                <div className="flex min-h-[100px] w-full items-center justify-center px-3 py-6">
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
              {drawer ?? <AppMobileDrawer />}
            </SheetContent>
          </div>
        </Sheet>
      )}

      {renderDesktop && (
        <div
          data-slot="app-shell"
          data-breakpoint={responsive ? "responsive" : "desktop"}
          className={cn(
            desktopRoot,
            "h-screen w-full items-start overflow-clip bg-sand-3",
            className,
          )}
          {...props}
        >
          {sidebar ?? <AppSidebar />}
          <div className="relative z-[1] flex h-full min-w-0 flex-1 flex-col">
            <div className="relative z-[2] w-full">{topbar ?? <AppTopbar />}</div>
            <div className="relative z-[1] flex w-full flex-1 flex-col overflow-hidden rounded-tl-2xl shadow-[-22px_-44px_88px_0_rgba(221,221,221,0.87)]">
              {header !== null && (
                <div className="flex min-h-[100px] w-full items-center justify-center bg-background px-3 py-6">
                  {header ?? headerFallback}
                </div>
              )}
              <div className="flex min-h-0 w-full flex-1 flex-col bg-background px-3 pb-9">
                {children ?? contentFallback}
              </div>
            </div>
          </div>
        </div>
      )}
      <Suspense fallback={null}>
        <AppSettingsController />
      </Suspense>
    </>
  )
}
