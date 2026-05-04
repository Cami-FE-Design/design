"use client"

import type * as React from "react"
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
        <AuthDebugBar />
      </LocaleDir>
    </AuthProvider>
  )
}
