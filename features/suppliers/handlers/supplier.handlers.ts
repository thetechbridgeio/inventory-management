// features/suppliers/handlers/supplier.handlers.ts

import { Supplier } from "../types/supplier.types"

function normalizeString(value: unknown): string {
  return String(value ?? "").trim()
}

export function normalizeSupplier(supplier: Supplier): Supplier {
  return {
    ...supplier,

    companyName: normalizeString(supplier.companyName),

    description: normalizeString(supplier.description),

    address: normalizeString(supplier.address),

    phoneNumber: normalizeString(supplier.phoneNumber),

    emailId: normalizeString(supplier.emailId),

    gstNumber: normalizeString(supplier.gstNumber),

    paymentTerms: normalizeString(supplier.paymentTerms),

    estimatedDeliveryPeriod: normalizeString(supplier.estimatedDeliveryPeriod),
  }
}

export function suppliersMatch(a: Supplier, b: Supplier) {
  return (
    normalizeString(a.companyName).toLowerCase() ===
      normalizeString(b.companyName).toLowerCase() &&
    normalizeString(a.phoneNumber) === normalizeString(b.phoneNumber)
  )
}

export function supplierExists(suppliers: Supplier[], supplier: Supplier) {
  return suppliers.some((item) => suppliersMatch(item, supplier))
}
