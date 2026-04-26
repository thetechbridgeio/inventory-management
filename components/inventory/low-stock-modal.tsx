"use client"

import { useInventory } from "@/context/low-stock-context"
import { useState } from "react"
import { Button } from "../ui/button"
import { X } from "lucide-react"
import { Input } from "../ui/input"

export default function LowStockModal({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) {
    const { lowStock, outOfStock } = useInventory()

    const [restockValues, setRestockValues] = useState<Record<string, number>>({})

    if (!open) return null

    const handleChange = (key: string, value: number) => {
        setRestockValues(prev => ({
            ...prev,
            [key]: value,
        }))
    }

    const handleRestock = () => {
        console.log("Restock payload:", restockValues)
        // 👉 call your API here
    }

    const renderItem = (item: any, type: "low" | "out") => {
        const key = `${type}-${item.Product}-${item.quantity}`

        return (
            <div
                key={key}
                className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition"
            >
                {/* Product Info */}
                <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                        {item.Product || "Unnamed"}
                    </span>
                    <span className="text-xs text-gray-500">
                        Current: {type === "out" ? 0 : item.quantity}
                    </span>
                </div>

                {/* Restock Input */}
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        className="w-20 bg-white text-sm"
                        value={restockValues[key] || ""}
                        onChange={(e) =>
                            handleChange(key, Number(e.target.value))
                        }
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white w-[600px] max-h-[85vh] flex flex-col rounded-xl shadow-lg">

                {/* Header */}
                <div className="flex justify-between items-start px-5 py-4 border-b">

                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Stock Alerts
                        </h2>
                        <p className="text-xs text-gray-500">
                            Restock items as per your need
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-gray-100"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-5 py-4 overflow-y-auto flex-1 space-y-6">

                    {/* Out of Stock */}
                    {outOfStock.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-red-600 font-semibold">
                                    Out of Stock
                                </h3>
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                    {outOfStock.length}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {outOfStock.map((item) =>
                                    renderItem(item, "out")
                                )}
                            </div>
                        </div>
                    )}

                    {/* Low Stock */}
                    {lowStock.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-yellow-600 font-semibold">
                                    Low Stock
                                </h3>
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                    {lowStock.length}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {lowStock.map((item) =>
                                    renderItem(item, "low")
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 px-5 py-4 border-t">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleRestock}
                        className="bg-green-600 hover:bg-red-700 text-white"
                    >
                        Restock Items
                    </Button>
                </div>
            </div>
        </div>
    )
}