"use client"

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react"

type Item = {
    id?: string
    name?: string
    quantity: number
    [key: string]: any
}

type InventoryContextType = {
    lowStock: Item[]
    outOfStock: Item[]
    loading: boolean
    refresh: () => Promise<void>
}

const InventoryContext = createContext<InventoryContextType | null>(null)

export const InventoryProvider = ({
    children,
    clientId,
}: {
    children: React.ReactNode
    clientId: string
}) => {
    const [lowStock, setLowStock] = useState<Item[]>([])
    const [outOfStock, setOutOfStock] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        if (!clientId) return

        try {
            const res = await fetch(
                `/api/inventory/low-stock?clientId=${clientId}`
            )

            const data = await res.json()

            setLowStock(data.lowStock || [])
            setOutOfStock(data.outOfStock || [])
        } catch (err) {
            console.error("Inventory fetch failed", err)
        } finally {
            setLoading(false)
        }
    }, [clientId])

    useEffect(() => {
        fetchData()

        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [fetchData])

    return (
        <InventoryContext.Provider
            value={{
                lowStock,
                outOfStock,
                loading,
                refresh: fetchData,
            }}
        >
            {children}
        </InventoryContext.Provider>
    )
}

export const useInventory = () => {
    const ctx = useContext(InventoryContext)
    if (!ctx) throw new Error("useInventory must be used inside InventoryProvider")
    return ctx
}