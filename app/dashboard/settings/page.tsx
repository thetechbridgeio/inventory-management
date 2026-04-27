"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { InventoryItem } from "@/lib/types"
import type { SearchableSelectOption } from "@/components/ui/searchable-select"
import { useClientContext } from "@/context/client-context"
import { EditProductForm } from "@/components/product/edit-product-form"
import { AddProductForm } from "@/components/product/add-product-form"




function extractUnique<T>(arr: T[], key: keyof T): string[] {
  return Array.from(
    new Set(
      arr
        .filter((item) => item[key] && typeof item[key] === "string")
        .map((item) => item[key] as string)
    )
  ).sort()
}

function normalizeInventoryItem(item: any, index: number): InventoryItem {
  return {
    srNo: item.srNo || item["Sr. no"] || index + 1,
    product: item.product || item["Product"] || "Unknown Product",
    category: item.category || item["Category"] || "Uncategorized",
    unit: item.unit || item["Unit"] || "PCS",
    minimumQuantity: Number(item.minimumQuantity || item["Minimum Quantity"] || 0),
    maximumQuantity: Number(item.maximumQuantity || item["Maximum Quantity"] || 0),
    reorderQuantity: Number(item.reorderQuantity || item["Reorder Quantity"] || 0),
    stock: Number(item.stock || item["Stock"] || 0),
    pricePerUnit: Number(item.pricePerUnit || item["Price per Unit"] || 0),
    value: Number(item.value || item["Value"] || 0),
    productType: item.productType || item["Product Type"] || "",
    location: item.location || item["Location"] || "",
  }
}


export default function SettingsPage() {
  const { client } = useClientContext()

  const [loading, setLoading] = useState(true)
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const [productOptions, setProductOptions] = useState<SearchableSelectOption[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [units, setUnits] = useState<string[]>([])

  useEffect(() => {
    if (client?.id) {
      fetchInventory()
    } else {
      setLoading(false)
    }
  }, [client?.id])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/sheets?sheet=Inventory&clientId=${client?.id}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Unknown error")
      }

      const { data } = await res.json()
      if (!Array.isArray(data)) throw new Error("Invalid data format")

      const processed = data.map(normalizeInventoryItem)

      setInventoryData(processed)
      setProductOptions(
        processed
          .filter((item) => item.product && typeof item.product === "string")
          .map((item) => ({ value: item.product, label: item.product }))
      )
      setCategories(extractUnique(processed, "category"))
      setUnits(extractUnique(processed, "unit"))
    } catch (error: any) {
      console.error("Error fetching inventory:", error)
      toast.error("Failed to load inventory data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryAdded = (category: string) => {
    setCategories((prev) =>
      prev.includes(category) ? prev : [...prev, category].sort()
    )
  }

  const handleUnitAdded = (unit: string) => {
    setUnits((prev) =>
      prev.includes(unit) ? prev : [...prev, unit].sort()
    )
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          No client selected. Please select a client to view settings.
        </p>
      </div>
    )
  }


  const sharedProps = {
    categories,
    units,
    onCategoryAdded: handleCategoryAdded,
    onUnitAdded: handleUnitAdded,
    clientId: client.id,
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="edit-product" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit-product">Edit Product</TabsTrigger>
          <TabsTrigger value="add-product">Add Product</TabsTrigger>
        </TabsList>

        <TabsContent value="edit-product">
          <EditProductForm
            inventoryData={inventoryData}
            productOptions={productOptions}
            {...sharedProps}
          />
        </TabsContent>

        <TabsContent value="add-product">
          <AddProductForm
            inventoryData={inventoryData}
            {...sharedProps}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}