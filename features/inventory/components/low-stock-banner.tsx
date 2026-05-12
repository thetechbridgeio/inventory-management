"use client"
import { useMemo, useState } from "react"

import { AlertTriangle } from "lucide-react"
import { getStockStatus } from "@/features/dashboard/services/stock.service"
import { Button } from "@/components/ui/button"
import LowStockModal from "./low-stock-modal"
import { useInventoryContext } from "../context/inventory-provider"

export default function LowStockBanner() {
  const { inventory } = useInventoryContext()
  const { lowStock, negativeStock } = useMemo(
    () => getStockStatus(inventory),
    [inventory]
  )
  const [open, setOpen] = useState(false)

  const total = lowStock + negativeStock

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-red-300 bg-red-50 shadow-sm hover:shadow-md transition">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="text-red-600 w-5 h-5" />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-semibold text-red-800">
              Inventory Alert
            </span>

            <span className="text-xs text-red-700">
              {negativeStock > 0 && (
                <>
                  <span className="font-medium">{negativeStock} </span>
                  out of stock •
                </>
              )}
              {lowStock > 0 && (
                <>
                  <span className="font-medium">{lowStock} </span>
                  low stock items
                </>
              )}
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium bg-red-200 text-red-800 px-2 py-1 rounded-full">
            {total}
          </span>

          <Button
            onClick={() => setOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            View Details
          </Button>
        </div>
      </div>

      <LowStockModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
