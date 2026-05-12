"use client"

import { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface Props {
  title: string
  value: string | number
  icon: LucideIcon
  iconBg: string
  iconColor: string
}

export function DashboardCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: Props) {
  return (
    <Card className="rounded-[28px] border-0 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </h2>
          </div>

          <div className={`rounded-2xl p-3 ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
