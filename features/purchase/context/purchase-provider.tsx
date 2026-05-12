"use client"

import { createContext, useContext, type ReactNode } from "react"

import { usePurchases } from "../hooks/use-purchases"

type PurchaseContextType = ReturnType<typeof usePurchases>

const PurchaseContext = createContext<PurchaseContextType | null>(null)

export function PurchaseProvider({ children }: { children: ReactNode }) {
  const purchaseState = usePurchases()

  return (
    <PurchaseContext.Provider value={purchaseState}>
      {children}
    </PurchaseContext.Provider>
  )
}

export function usePurchasesContext() {
  const context = useContext(PurchaseContext)

  if (!context) {
    throw new Error("usePurchaseContext must be used within PurchaseProvider")
  }

  return context
}
