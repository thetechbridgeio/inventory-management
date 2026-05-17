"use client"

import { useEffect, useState } from "react"

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  PackageSearch,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { Card, CardContent } from "@/components/ui/card"

import { Inventory } from "@/features/inventory/types/inventory.types"

import { SalesItem } from "@/features/sales/types/sales.types"
import { calculateAverageInventoryDays } from "../services/calculate-inventory-days"

type AverageInventoryDaysCardProps = {
  sales: SalesItem[]
  inventory: Inventory[]
}

export function AverageInventoryDaysCard({
  sales,
  inventory,
}: AverageInventoryDaysCardProps) {
  const [isCalculating, setIsCalculating] = useState(true)

  const [averageInventoryDays, setAverageInventoryDays] = useState(0)

  /**
   * Calculate inventory days
   */
  useEffect(() => {
    let isMounted = true

    const calculate = async () => {
      setIsCalculating(true)

      /**
       * Prevent UI blocking
       */
      await new Promise((resolve) => setTimeout(resolve, 300))

      const result = calculateAverageInventoryDays({
        sales,
        inventory,
      })

      if (!isMounted) return

      setAverageInventoryDays(result)

      setIsCalculating(false)
    }

    calculate()

    return () => {
      isMounted = false
    }
  }, [sales, inventory])

  /**
   * Status configuration
   */
  const status =
    averageInventoryDays <= 7
      ? {
          label: "Critical",

          icon: AlertTriangle,

          cardClass:
            "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30",

          iconClass:
            "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400",

          valueClass: "text-red-700 dark:text-red-300",

          description: "Inventory may run out very soon.",
        }
      : averageInventoryDays <= 30
        ? {
            label: "Warning",

            icon: PackageSearch,

            cardClass:
              "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30",

            iconClass:
              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",

            valueClass: "text-yellow-700 dark:text-yellow-300",

            description: "Inventory coverage is moderate.",
          }
        : {
            label: "Healthy",

            icon: CheckCircle2,

            cardClass:
              "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30",

            iconClass:
              "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",

            valueClass: "text-emerald-700 dark:text-emerald-300",

            description: "Inventory levels are healthy.",
          }

  const Icon = status.icon

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 rounded-3xl",
        status.cardClass
      )}
    >
      <CardContent className="p-6">
        {isCalculating ? (
          <div className="flex h-[120px] flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />

            <p className="text-sm text-muted-foreground">
              Calculating inventory health...
            </p>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Average Inventory Days
              </p>

              <div className="flex items-end gap-2">
                <h2
                  className={cn(
                    "text-4xl font-bold tracking-tight",
                    status.valueClass
                  )}
                >
                  {averageInventoryDays}
                </h2>

                <span className="mb-1 text-sm text-muted-foreground">days</span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">{status.label}</p>

                <p className="text-xs text-muted-foreground">
                  {status.description}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl",
                status.iconClass
              )}
            >
              <Icon className="h-7 w-7" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
