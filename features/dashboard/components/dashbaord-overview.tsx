"use client"

import { IndianRupee, ShoppingCart, Wallet } from "lucide-react"

import { getTotalInventoryValue } from "../services/inventory.service"

import { getTotalPurchaseValue } from "../services/purchase.service"

import { getTotalSalesValue } from "../services/sales.service"

import { DashboardCard } from "./dashbaord-card"
import { AverageInventoryDaysCard } from "./avg-inventory-days.card"
import { Inventory } from "@/features/inventory/types/inventory.types"
import { SalesItem } from "@/features/sales/types/sales.types"
import { Purchase } from "@/features/purchase/types/purchase.types"

interface Props {
  inventory: Inventory[]
  sales: SalesItem[]
  purchases: Purchase[]
}

export function DashboardOverview({ inventory, sales, purchases }: Props) {
  const totalInventoryValue = getTotalInventoryValue(inventory)

  const totalSalesValue = getTotalSalesValue(sales, inventory)

  const totalPurchaseValue = getTotalPurchaseValue(purchases, inventory)

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {/* Inventory */}
      <DashboardCard
        title="Inventory Value"
        value={`₹${totalInventoryValue.toLocaleString()}`}
        icon={IndianRupee}
        bgColor="bg-[#F3EEFF]"
        iconBg="bg-violet-100"
        iconColor="text-violet-700"
      />

      {/* Sales */}
      <DashboardCard
        title="Outgoing Value"
        value={`₹${totalSalesValue.toLocaleString()}`}
        icon={ShoppingCart}
        bgColor="bg-[#EAF8EE]"
        iconBg="bg-emerald-100"
        iconColor="text-emerald-700"
      />

      <AverageInventoryDaysCard sales={sales} inventory={inventory} />
    </div>
  )
}
