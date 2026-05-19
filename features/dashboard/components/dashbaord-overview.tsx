"use client"

import { useMemo } from "react"

import { IndianRupee, ShoppingCart, PackageCheck } from "lucide-react"

import { Inventory } from "@/features/inventory/types/inventory.types"
import { Purchase } from "@/features/purchase/types/purchase.types"
import { SalesItem } from "@/features/sales/types/sales.types"

import { DashboardCard } from "./dashbaord-card"
import { AverageInventoryDaysCard } from "./avg-inventory-days.card"

import { getTotalInventoryValue } from "../services/inventory.service"
import { getLast30DaysSalesValue } from "../services/get-last-month-sale-value"

interface Props {
  inventory: Inventory[]
  sales: SalesItem[]
  purchases: Purchase[]
}

export function DashboardOverview({ inventory, sales }: Props) {
  /**
   * Memoized calculations
   * Prevents unnecessary recalculations on rerenders
   */
  const metrics = useMemo(() => {
    const totalInventoryValue = getTotalInventoryValue(inventory)

    const last30DaysSalesValue = getLast30DaysSalesValue(sales, inventory)

    const totalProducts = inventory.length

    return {
      totalInventoryValue,
      last30DaysSalesValue,
      totalProducts,
    }
  }, [inventory, sales])

  /**
   * Currency formatter
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <section className="space-y-5">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Inventory Value */}
        <DashboardCard
          title="Inventory Value"
          value={formatCurrency(metrics.totalInventoryValue)}
          icon={IndianRupee}
          bgColor="bg-violet-50"
          iconBg="bg-violet-100"
          iconColor="text-violet-700"
        />

        {/* Outgoing Value */}
        <DashboardCard
          title="Last 30 Days Sales"
          value={formatCurrency(metrics.last30DaysSalesValue)}
          icon={ShoppingCart}
          bgColor="bg-emerald-50"
          iconBg="bg-emerald-100"
          iconColor="text-emerald-700"
        />

        {/* Inventory Days */}
        <AverageInventoryDaysCard sales={sales} inventory={inventory} />
      </div>
    </section>
  )
}
