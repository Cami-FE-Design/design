"use client"

import type * as React from "react"
import { Suspense } from "react"
import { AdminSettingsController } from "@/components/blocks/admin-settings-controller"
import { AuthDebugBar } from "@/components/blocks/auth-debug-bar"
import { AuthProvider, useAuth } from "@/lib/auth-mock"

function LocaleDir({ children }: { children: React.ReactNode }) {
  const { locale } = useAuth()
  return (
    <div
      data-slot="locale-dir"
      lang={locale === "ar" ? "ar" : "en"}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="contents"
    >
      {children}
    </div>
  )
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LocaleDir>
        {children}
        <Suspense fallback={null}>
          <AdminSettingsController />
        </Suspense>
        <AuthDebugBar />
      </LocaleDir>
    </AuthProvider>
  )
}
