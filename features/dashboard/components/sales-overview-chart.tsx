"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  sales: any[]
  inventory: any[]
}

export function SalesOverviewChart({ sales, inventory }: Props) {
  const dailySalesMap: Record<string, number> = {}

  sales.forEach((sale) => {
    const date = new Date(sale.timestamp || new Date())

    const day = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    })

    const inventoryItem = inventory.find(
      (item) => item.product === sale.product
    )

    const productPrice = inventoryItem?.pricePerUnit || 0

    const saleValue = Number(sale.quantity) * productPrice

    if (!dailySalesMap[day]) {
      dailySalesMap[day] = 0
    }

    dailySalesMap[day] += saleValue
  })

  const chartData = Object.entries(dailySalesMap).map(([date, value]) => ({
    date,
    value,
  }))

  return (
    <Card className="col-span-2 rounded-[28px] border-0 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">
          Daily Sales Overview
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.4} />

                  <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#ECECF2"
              />

              <XAxis dataKey="date" tickLine={false} axisLine={false} />

              <YAxis tickLine={false} axisLine={false} />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#8B5CF6"
                fill="url(#salesGradient)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
