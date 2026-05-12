"use client"

import { createContext, useContext } from "react"
import { useSuppliers } from "../hooks/supplier.hooks"

const SupplierContext = createContext<ReturnType<typeof useSuppliers> | null>(
  null
)

export function SuppliersProvider({ children }: { children: React.ReactNode }) {
  const supplierState = useSuppliers()

  return (
    <SupplierContext.Provider value={supplierState}>
      {children}
    </SupplierContext.Provider>
  )
}

export function useSuppliersContext() {
  const context = useContext(SupplierContext)

  if (!context) {
    throw new Error("useSupplierContext must be used inside SuppliersProvider")
  }

  return context
}
