// features/auth/components/require-admin.tsx

"use client"

import { useEffect } from "react"

import { useRouter } from "next/navigation"

import { Loader2 } from "lucide-react"

import { useAuth } from "../context/auth.context"

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const { loading, initialized, authenticated, isAdmin } = useAuth()

  useEffect(() => {
    if (initialized && !loading && (!authenticated || !isAdmin)) {
      router.replace("/inventory")
    }
  }, [initialized, loading, authenticated, isAdmin, router])

  if (!initialized || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return children
}
