import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import { BusinessLocationsProvider } from "@/components/blocks/business-locations-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { BusinessLinksProvider } from "@/lib/business-links/store"
import { CommsTemplatesProvider } from "@/lib/comms/store"
import { CurrentUserProvider } from "@/lib/current-user"
import { CustomerCardThemeProvider } from "@/lib/customer-card/store"
import { DemoBusinessProvider } from "@/lib/demo-business"
import { DemoFilesProvider } from "@/lib/demo-files"
import { BranchStockProvider } from "@/lib/inventory/store"
import { BranchSettingsProvider } from "@/lib/locations/branch-settings"
import { HqNotificationsProvider } from "@/lib/notifications/hq-store"
import { NotificationsProvider } from "@/lib/notifications/store"
import { PaymentPolicyProvider } from "@/lib/payment-policy/store"
import { LocationOfferingsProvider } from "@/lib/service-catalog/offerings-store"
import { ServiceCatalogProvider } from "@/lib/service-catalog/store"
import { TerminalsProvider } from "@/lib/terminals/store"
import { cn } from "@/lib/utils"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Cami",
  description: "Cami design system",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("h-full", manrope.variable)} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={150}>
            <CurrentUserProvider>
              <DemoBusinessProvider>
                {/* Inside DemoBusinessProvider: business identity sits above
                    location on the blueprint's planes (§02), so a branch is
                    scoped by the business, never the other way round. Root,
                    because the switcher is on every operator surface and the
                    scope has to survive navigation between them (R03). */}
                {/* The estate belongs to the business, so it is read from the
                    one the demo is signed into rather than fixed here — which
                    is what the comment above already claimed and a fixed seed
                    did not keep. Shampooch's nine branches are still the nine:
                    every multi-location defect this repo has found showed up at
                    nine and not at three. */}
                <BusinessLocationsProvider>
                  <CustomerCardThemeProvider>
                    {/* Beside DemoBusiness, and for the same reason: the merchant's
                    Google review link is business identity. Both the settings
                    field and the template editor's "this line won't send"
                    notice read it, so it can't live in either of them. */}
                    <BusinessLinksProvider>
                      {/* Inside LocationsProvider: every setting it holds is keyed
                      by a branch, and there is nothing to resolve without the
                      estate. Root rather than in the settings dialog, because
                      a receipt prefix and a tip scale are read at the point of
                      sale, not only where they are edited. */}
                      {/* Beside BranchSettingsProvider: a balance is keyed by a
                      branch, and a movement recorded at the point of sale has
                      to change the same row the product screens read. */}
                      <BranchStockProvider>
                        <BranchSettingsProvider>
                          <DemoFilesProvider>
                            <PaymentPolicyProvider>
                              {/* Root, not /catalogs: a combo created on the service menu
                        has to turn up in the appointment service pickers, so
                        both sides of the app read one catalog. */}
                              {/* Inside ServiceCatalogProvider: a per-branch offering is
                        an override on a service, so it has no meaning without
                        the catalog it overrides. */}
                              <ServiceCatalogProvider>
                                <LocationOfferingsProvider>
                                  <TerminalsProvider>
                                    <NotificationsProvider>
                                      {/* Root, not the admin layout: HQ sets the rates but
                              both portals read them — a merchant sees the price
                              they're billed at. */}
                                      <HqNotificationsProvider>
                                        {/* Inside NotificationsProvider: a template row dims
                                when the Reminders matrix has that channel off, so
                                the panel reads both stores. */}
                                        <CommsTemplatesProvider>
                                          {children}
                                          <Toaster />
                                        </CommsTemplatesProvider>
                                      </HqNotificationsProvider>
                                    </NotificationsProvider>
                                  </TerminalsProvider>
                                </LocationOfferingsProvider>
                              </ServiceCatalogProvider>
                            </PaymentPolicyProvider>
                          </DemoFilesProvider>
                        </BranchSettingsProvider>
                      </BranchStockProvider>
                    </BusinessLinksProvider>
                  </CustomerCardThemeProvider>
                </BusinessLocationsProvider>
              </DemoBusinessProvider>
            </CurrentUserProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
