"use client"

import { IndianRupee, ShoppingCart, Wallet } from "lucide-react"
import { getTotalInventoryValue } from "../services/inventory.service"
import { getTotalPurchaseValue } from "../services/purchase.service"
import { getTotalSalesValue } from "../services/sales.service"
import { DashboardCard } from "./dashbaord-card"

interface Props {
  inventory: any[]
  sales: any[]
  purchases: any[]
}

export function DashboardOverview({ inventory, sales, purchases }: Props) {
  const totalInventoryValue = getTotalInventoryValue(inventory)

  const totalSalesValue = getTotalSalesValue(sales, inventory)

  const totalPurchaseValue = getTotalPurchaseValue(purchases, inventory)

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <DashboardCard
        title="Inventory Value"
        value={`₹${totalInventoryValue.toLocaleString()}`}
        icon={IndianRupee}
        iconBg="bg-violet-100"
        iconColor="text-violet-600"
      />

      <DashboardCard
        title="Sales Value"
        value={`₹${totalSalesValue.toLocaleString()}`}
        icon={ShoppingCart}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
      />

      <DashboardCard
        title="Purchase Value"
        value={`₹${totalPurchaseValue.toLocaleString()}`}
        icon={Wallet}
        iconBg="bg-sky-100"
        iconColor="text-sky-600"
      />
    </div>
  )
}
