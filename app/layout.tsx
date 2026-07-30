import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CurrentUserProvider } from "@/lib/current-user"
import { DemoBusinessProvider } from "@/lib/demo-business"
import { DemoFilesProvider } from "@/lib/demo-files"
import { PaymentPolicyProvider } from "@/lib/payment-policy/store"
import { TerminalPairingProvider } from "@/lib/terminal-pairing/store"
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
                <DemoFilesProvider>
                  <PaymentPolicyProvider>
                    <TerminalPairingProvider>
                      {children}
                      <Toaster />
                    </TerminalPairingProvider>
                  </PaymentPolicyProvider>
                </DemoFilesProvider>
              </DemoBusinessProvider>
            </CurrentUserProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
