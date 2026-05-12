"use client"

import { AlertTriangle, BadgeMinus, CheckCircle2, Layers3 } from "lucide-react"
import { getStockStatus } from "../services/stock.service"
import { DashboardCard } from "./dashbaord-card"

interface Props {
  inventory: any[]
}

export function StockStatusSection({ inventory }: Props) {
  const stockStatus = getStockStatus(inventory)

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <DashboardCard
        title="Low Stock"
        value={stockStatus.lowStock}
        icon={AlertTriangle}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
      />

      <DashboardCard
        title="Normal Stock"
        value={stockStatus.normalStock}
        icon={CheckCircle2}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
      />

      <DashboardCard
        title="Negative Stock"
        value={stockStatus.negativeStock}
        icon={BadgeMinus}
        iconBg="bg-rose-100"
        iconColor="text-rose-600"
      />

      <DashboardCard
        title="Excess Stock"
        value={stockStatus.excessStock}
        icon={Layers3}
        iconBg="bg-indigo-100"
        iconColor="text-indigo-600"
      />
    </div>
  )
}
