"use client"

import { useInventory } from "@/context/low-stock-context"
import { useState } from "react"
import LowStockModal from "./low-stock-modal"
import { Button } from "../ui/button"
import { AlertTriangle } from "lucide-react"

export default function LowStockBanner() {
    const { lowStock, outOfStock, loading } = useInventory()
    const [open, setOpen] = useState(false)

    if (loading) return null

    const total = lowStock.length + outOfStock.length
    if (total === 0) return null

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
                            {
                                outOfStock.length > 0 && (
                                    <>
                                        <span className="font-medium">
                                            {outOfStock.length}{" "}
                                        </span>
                                        out of stock •
                                    </>
                                )
                            }
                            {
                                lowStock.length > 0 && (
                                    <>
                                        <span className="font-medium">
                                            {lowStock.length}{" "}
                                        </span>
                                        low stock items
                                    </>
                                )
                            }
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