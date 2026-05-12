"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  inventory: any[]
}

const COLORS = ["#C4B5FD", "#A7F3D0", "#BFDBFE", "#FDE68A", "#F9A8D4"]

export function InventoryCategoryChart({ inventory }: Props) {
  const categoryMap: Record<string, number> = {}

  inventory.forEach((item) => {
    if (!categoryMap[item.category]) {
      categoryMap[item.category] = 0
    }

    categoryMap[item.category] += Number(item.stock)
  })

  const data = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <Card className="rounded-[28px] border-0 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">
          Inventory Categories
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={80}
                outerRadius={115}
                paddingAngle={4}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
