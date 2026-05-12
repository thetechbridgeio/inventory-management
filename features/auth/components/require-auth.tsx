"use client"

import { useEffect } from "react"

import { useRouter } from "next/navigation"

import { Loader2 } from "lucide-react"

import { useAuth } from "../context/auth.context"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const { authenticated, loading, initialized } = useAuth()

  useEffect(() => {
    if (initialized && !loading && !authenticated) {
      router.replace("/")
    }
  }, [initialized, authenticated, loading, router])

  if (!initialized || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return children
}
