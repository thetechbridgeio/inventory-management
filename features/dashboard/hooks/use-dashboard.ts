"use client"

import { useCallback, useEffect, useState } from "react"

import { toast } from "sonner"

import { DashboardData } from "../types/dashboard.types"

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const refreshDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const storedClient = sessionStorage.getItem("client")

      if (!storedClient) {
        throw new Error("Client session not found")
      }

      const client = JSON.parse(storedClient)

      const response = await fetch(`/api/dashboard?sheetId=${client.sheetId}`, {
        method: "GET",
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch dashboard")
      }

      setDashboard(result.data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch dashboard"

      setError(message)

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshDashboard()
  }, [refreshDashboard])

  return {
    dashboard,

    loading,

    error,

    refreshDashboard,
  }
}
