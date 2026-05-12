import { Purchase } from "../types/purchase.types"

export function normalizePurchase(purchase: Purchase): Purchase {
  return {
    product: purchase.product.trim(),

    quantity: Number(purchase.quantity),

    unit: purchase.unit.trim(),

    poNumber: purchase.poNumber.trim(),

    supplier: purchase.supplier.trim(),

    dateOfReceiving: purchase.dateOfReceiving.trim(),

    rackNumber: purchase.rackNumber.trim(),

    timestamp: purchase.timestamp || new Date().toISOString(),
  }
}

export function purchasesMatch(purchaseA: Purchase, purchaseB: Purchase) {
  return (
    purchaseA.product.trim().toLowerCase() ===
      purchaseB.product.trim().toLowerCase() &&
    purchaseA.poNumber.trim().toLowerCase() ===
      purchaseB.poNumber.trim().toLowerCase()
  )
}

export function purchaseExists(
  purchases: Purchase[],
  targetPurchase: Purchase
) {
  return purchases.some((purchase) => purchasesMatch(purchase, targetPurchase))
}

export function getTotalPurchaseQuantity(purchases: Purchase[]) {
  return purchases.reduce(
    (total, purchase) => total + Number(purchase.quantity || 0),
    0
  )
}
