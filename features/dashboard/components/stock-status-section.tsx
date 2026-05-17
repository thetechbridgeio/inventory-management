"use client"

import { AlertTriangle, BadgeMinus, CheckCircle2, Layers3 } from "lucide-react"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { getStockStatus } from "../services/stock.service"

interface Props {
  inventory: any[]
}

export function StockStatusSection({ inventory }: Props) {
  const stockStatus = getStockStatus(inventory)

  const data = [
    {
      name: "Low Stock",
      value: stockStatus.lowStock as number,
      color: "#F59E0B",
      description: "Products below reorder level",
      icon: AlertTriangle,
    },
    {
      name: "Normal Stock",
      value: stockStatus.normalStock as number,
      color: "#10B981",
      description: "Healthy inventory levels",
      icon: CheckCircle2,
    },
    {
      name: "Negative Stock",
      value: stockStatus.negativeStock as number,
      color: "#EF4444",
      description: "Inventory mismatch detected",
      icon: BadgeMinus,
    },
    {
      name: "Excess Stock",
      value: stockStatus.excessStock as number,
      color: "#6366F1",
      description: "Overstocked inventory items",
      icon: Layers3,
    },
  ]

  return (
    <Card className="border-none shadow-sm rounded-2xl bg-white">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-slate-800">
              Stock Status Overview
            </CardTitle>

            {/* <p className="text-sm text-slate-500 mt-1">
              Distribution of inventory based on stock health categories.
            </p> */}
          </div>
        </div>

        {/* LEGENDS
        <div className="flex flex-wrap gap-4 pt-2">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5"
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />

              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">
                  {item.name}
                </span>

                <span className="text-xs text-slate-500">
                  {item.description}
                </span>
              </div>
            </div>
          ))}
        </div> */}
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 30,
                right: 20,
                left: 10,
                bottom: 20,
              }}
              barCategoryGap={35}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />

              <XAxis
                dataKey="name"
                tick={{
                  fill: "#475569",
                  fontSize: 13,
                  fontWeight: 500,
                }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: "Stock Categories",
                  position: "insideBottom",
                  offset: -10,
                  fill: "#64748B",
                  fontSize: 13,
                }}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fill: "#475569",
                  fontSize: 13,
                }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: "Number of Products",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#64748B",
                  fontSize: 13,
                }}
              />

              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.08)" }}
                contentStyle={{
                  borderRadius: "14px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0px 4px 20px rgba(15, 23, 42, 0.08)",
                  backgroundColor: "#fff",
                }}
                formatter={(value) => [`${value ?? 0} products`, "Count"]}
              />

              <Bar dataKey="value" radius={[14, 14, 0, 0]} maxBarSize={90}>
                <LabelList
                  dataKey="value"
                  position="top"
                  className="fill-slate-700 text-sm font-semibold"
                />

                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* HELPER TEXT */}
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {data.map((item) => (
            <div
              key={item.name}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${item.color}15`,
                  }}
                >
                  <item.icon
                    className="h-5 w-5"
                    style={{ color: item.color }}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {item.name}
                  </p>

                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
