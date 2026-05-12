"use client"

import { createContext, useContext } from "react"
import { useSales } from "../hooks/use-sales"

const SalesContext = createContext<ReturnType<typeof useSales> | null>(null)

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const salesState = useSales()

  return (
    <SalesContext.Provider value={salesState}>{children}</SalesContext.Provider>
  )
}

export function useSalesContext() {
  const context = useContext(SalesContext)

  if (!context) {
    throw new Error("useSalesContext must be used within SalesProvider")
  }

  return context
}
