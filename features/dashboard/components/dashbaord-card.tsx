"use client"

import { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface Props {
  title: string
  value: string | number
  icon: LucideIcon

  /**
   * Full card pastel background
   * Example: bg-[#EEF9F1]
   */
  bgColor: string

  /**
   * Icon container background
   * Example: bg-green-100
   */
  iconBg: string

  /**
   * Icon color
   * Example: text-green-700
   */
  iconColor: string
}

export function DashboardCard({
  title,
  value,
  icon: Icon,
  bgColor,
  iconBg,
  iconColor,
}: Props) {
  return (
    <Card
      className={`
        relative overflow-hidden rounded-3xl
        border border-black/5
        shadow-sm
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-md
        ${bgColor}
      `}
    >
      {/* Matte Glow */}
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/30 blur-3xl" />

      <CardContent className="relative z-10 p-6">
        <div className="flex items-start justify-between gap-4">
          {/* LEFT */}
          <div className="space-y-4">
            {/* Title */}
            <p className="text-sm font-medium tracking-wide text-slate-600">
              {title}
            </p>

            {/* Value */}
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">
              {value}
            </h2>
          </div>

          {/* ICON */}
          <div
            className={`
              rounded-2xl p-3 shadow-sm
              backdrop-blur-sm
              ${iconBg}
            `}
          >
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
