"use client"

import { AuthProvider } from "../context/auth.context"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
