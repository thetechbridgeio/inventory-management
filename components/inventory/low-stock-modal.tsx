"use client"

import { useInventory } from "@/context/low-stock-context"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { X } from "lucide-react"
import { Input } from "../ui/input"

type RestockMap = Record<string, number>

export default function LowStockModal({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) {
    const { lowStock, outOfStock } = useInventory()
    const [restockValues, setRestockValues] = useState<RestockMap>({})



    const getKey = (item: any) => {
        return item.id || item.Product // 👉 ideally use backend ID
    }

    useEffect(() => {
        const initial: RestockMap = {}

            ;[...lowStock, ...outOfStock].forEach((item) => {
                const key = getKey(item)
                initial[key] = item["Minimum Quantity"] || 1
            })

        setRestockValues(initial)
    }, [lowStock, outOfStock])

    const handleChange = (key: string, value: number) => {
        if (value < 1) return

        setRestockValues((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const handleRestock = () => {
        const payload = Object.entries(restockValues).map(
            ([productId, quantity]) => ({
                productId,
                quantity,
            })
        )

        console.log("🚀 Restock payload:", payload)

        // 👉 call your API here
    }

    if (!open) return null

    const renderItem = (item: any, type: "low" | "out") => {
        const key = getKey(item)
        const currentQty = type === "out" ? 0 : item.quantity

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
                        Current: {currentQty}
                    </span>

                    <span className="text-xs text-gray-400">
                        MOQ: {item["Minimum Quantity"] || 1}
                    </span>
                </div>

                {/* Input */}
                <Input
                    type="number"
                    min={1}
                    className="w-24 bg-white text-sm"
                    value={restockValues[key] ?? ""}
                    onChange={(e) =>
                        handleChange(key, Number(e.target.value))
                    }
                />
            </div>
        )
    }

    const totalItems = lowStock.length + outOfStock.length

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
                            Enter quantities to restock items
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

                    {totalItems === 0 && (
                        <div className="text-center text-sm text-gray-500">
                            No stock issues 🎉
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-5 py-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button
                        onClick={handleRestock}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={Object.keys(restockValues).length === 0}
                    >
                        Restock Items
                    </Button>
                </div>
            </div>
        </div>
    )
}