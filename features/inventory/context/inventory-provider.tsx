"use client"

import { createContext, useContext, type ReactNode } from "react"

import { useInventory } from "../hooks/use-inventory"

type InventoryContextType = ReturnType<typeof useInventory>

const InventoryContext = createContext<InventoryContextType | null>(null)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const inventoryState = useInventory()

  return (
    <InventoryContext.Provider value={inventoryState}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventoryContext() {
  const context = useContext(InventoryContext)

  if (!context) {
    throw new Error("useInventoryContext must be used within InventoryProvider")
  }

  return context
}
