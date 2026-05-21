import { normalize } from "@/lib/normalize"
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
  normalize(purchaseA.product) === normalize(purchaseB.product) &&
    normalize(purchaseA.poNumber) === normalize(purchaseB.poNumber)
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
