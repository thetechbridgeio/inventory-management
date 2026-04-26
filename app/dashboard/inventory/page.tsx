"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SimpleSelect, SimpleSelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/data-table/data-table"
import { inventoryColumns } from "@/components/data-table/columns/inventory-columns"
import type { InventoryItem, FilterState, StockStatus } from "@/lib/types"
import { getStockStatus } from "@/lib/utils"
import { Download, Mail, Trash2, Search, Filter, RefreshCcw, Package } from "lucide-react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { useClientContext } from "@/context/client-context"
import InventoryLayout from "./inventory-layout"
import LowStockBanner from "@/components/inventory/low-stock-banner"

export default function InventoryPage() {
  const { client } = useClientContext()
  const [data, setData] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<InventoryItem[]>([])
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    stockStatus: "all",
    search: "",
    productType: [],
  })
  const [categories, setCategories] = useState<string[]>([])
  const [productTypes, setProductTypes] = useState<string[]>([])
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>({})
  const [productTypeFilters, setProductTypeFilters] = useState<Record<string, boolean>>({})

  const fetchData = async () => {
    try {
      setIsRefreshing(true)
      setError(null)

      const response = await fetch(`/api/sheets?sheet=Inventory${client?.id ? `&clientId=${client.id}` : ""}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const result = await response.json()

      if (result.data && Array.isArray(result.data)) {
        const processedData = result.data.map((item: any, index: number) => {
          const inventoryItem: InventoryItem = {
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
            timestamp: item.timestamp || item["Timestamp"] || "",
            location: item.location || item["Location"] || "",
            productType: item.productType || item["Product Type"] || "Raw",
          }
          return inventoryItem
        })

        setData(processedData)

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(
            processedData
              .map((item: InventoryItem) => item.category)
              .filter((c: string) => c && c !== ""),
          ),
        ] as string[]
        setCategories(uniqueCategories)

        const initialCategoryFilters: Record<string, boolean> = {}
        uniqueCategories.forEach((category) => {
          initialCategoryFilters[category] = filters.category.includes(category)
        })
        setCategoryFilters(initialCategoryFilters)

        // Extract unique product types
        const uniqueProductTypes = [
          ...new Set(
            processedData
              .map((item: InventoryItem) => item.productType)
              .filter((pt: string) => pt && pt !== ""),
          ),
        ] as string[]
        setProductTypes(uniqueProductTypes)

        const initialProductTypeFilters: Record<string, boolean> = {}
        uniqueProductTypes.forEach((pt) => {
          initialProductTypeFilters[pt] = filters.productType.includes(pt)
        })
        setProductTypeFilters(initialProductTypeFilters)

      } else {
        setData([])
        setCategories([])
        setProductTypes([])
        setCategoryFilters({})
        setProductTypeFilters({})
        if (result.error) {
          setError(result.error)
        } else {
          setError("Received invalid data format from API")
        }
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch inventory data")
      toast.error("Failed to fetch inventory data")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [client?.id])

  useEffect(() => {
    const selectedCategories = Object.entries(categoryFilters)
      .filter(([_, isSelected]) => isSelected)
      .map(([category]) => category)
    setFilters((prev) => ({ ...prev, category: selectedCategories }))
  }, [categoryFilters])

  useEffect(() => {
    const selectedTypes = Object.entries(productTypeFilters)
      .filter(([_, isSelected]) => isSelected)
      .map(([pt]) => pt)
    setFilters((prev) => ({ ...prev, productType: selectedTypes }))
  }, [productTypeFilters])

  const handleRowSelectionChange = (rows: InventoryItem[]) => {
    setSelectedRows(rows)
  }

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return

    try {
      toast.loading("Deleting selected items...")

      const response = await fetch("/api/sheets/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sheetName: "Inventory",
          items: selectedRows.map((row) => ({
            product: row.product,
          })),
          clientId: client?.id,
        }),
      })

      const responseText = await response.text()

      let result
      try {
        result = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse response as JSON:", e)
        result = { error: "Invalid response format" }
      }

      if (!response.ok) {
        console.error("Delete API error:", result)
        throw new Error(result.error || "Failed to delete items")
      }

      const updatedData = data.filter((item) => !selectedRows.some((row) => row.srNo === item.srNo))
      setData(updatedData)
      setSelectedRows([])

      toast.dismiss()
      toast.success(`${selectedRows.length} item(s) deleted successfully`)
    } catch (error) {
      console.error("Error deleting items:", error)
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : "Failed to delete items")
    }
  }

  const handleSendLowStockEmail = async () => {
    try {
      if (!client || !client.email) {
        toast.error("Client email not found. Please check client settings.")
        return
      }

      toast.loading("Sending low stock alert email...")

      const response = await fetch("/api/email/low-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientEmail: client.email,
          clientName: client.name,
          clientId: client.id,
        }),
      })

      const result = await response.json()

      toast.dismiss()

      if (result.success) {
        toast.success(result.message || `Low stock email sent to ${client.email}`)
      } else {
        throw new Error(result.error || "Failed to send email")
      }
    } catch (error) {
      console.error("Error sending low stock email:", error)
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : "Failed to send low stock email")
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" })

    doc.setFontSize(18)
    doc.text("Inventory Report", 14, 22)
    doc.setFontSize(11)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

    const tableColumn = [
      "Sr. No",
      "Product",
      "Category",
      "Unit",
      "Location",
      "Product Type",
      "Min Qty",
      "Max Qty",
      "Reorder Qty",
      "Stock",
      "Status",
      "Price",
      "Value",
    ]

    const tableRows = filteredData.map((item, index) => [
      index + 1,
      item.product,
      item.category,
      item.unit,
      item.location || "—",
      item.productType || "Raw",
      item.minimumQuantity,
      item.maximumQuantity,
      item.reorderQuantity,
      item.stock,
      getStockStatus(item),
      `Rs. ${item.pricePerUnit.toLocaleString("en-IN")}`,
      `Rs. ${item.value.toLocaleString("en-IN")}`,
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "grid",
      styles: {
        overflow: "linebreak",
        cellWidth: "wrap",
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 55 },
        2: { cellWidth: 22 },
        3: { cellWidth: 10 },
        4: { cellWidth: 22 },
        5: { cellWidth: 22 },
        6: { cellWidth: 13 },
        7: { cellWidth: 13 },
        8: { cellWidth: 15 },
        9: { cellWidth: 10 },
        10: { cellWidth: 16 },
        11: { cellWidth: 25 },
        12: { cellWidth: 28 },
      },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: 255,
        fontStyle: "bold",
      },
    })

    doc.save(`inventory-report-${client?.name || "all"}.pdf`)
    toast.success("PDF exported successfully")
  }

  const handleCategoryFilterChange = (category: string, checked: boolean) => {
    setCategoryFilters((prev) => ({ ...prev, [category]: checked }))
  }

  const handleProductTypeFilterChange = (pt: string, checked: boolean) => {
    setProductTypeFilters((prev) => ({ ...prev, [pt]: checked }))
  }

  const handleStockStatusChange = (status: string) => {
    setFilters((prev) => ({ ...prev, stockStatus: status }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }))
  }

  const handleRefresh = () => {
    fetchData()
  }

  const filteredData = data.filter((item) => {
    if (filters.category.length > 0 && !filters.category.includes(item.category)) {
      return false
    }

    if (filters.productType.length > 0 && !filters.productType.includes(item.productType)) {
      return false
    }

    if (filters.stockStatus && filters.stockStatus !== "all") {
      const status = getStockStatus(item)
      if (status !== filters.stockStatus) {
        return false
      }
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const productStr = String(item.product || "")
      const categoryStr = String(item.category || "")
      return productStr.toLowerCase().includes(searchTerm) || categoryStr.toLowerCase().includes(searchTerm)
    }

    return true
  })

  const activeFilterCount =
    filters.category.length +
    filters.productType.length +
    (filters.stockStatus !== "all" ? 1 : 0)

  const stockStatusOptions: StockStatus[] = [
    { label: "All", value: "all" },
    { label: "Negative Stock", value: "negative" },
    { label: "Low Stock", value: "low" },
    { label: "Normal Stock", value: "normal" },
    { label: "Excess Stock", value: "excess" },
  ]

  const renderSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>
      <div className="flex space-x-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <Skeleton className="h-[400px] w-full mt-4" />
    </div>
  )

  if (loading) {
    return <div className="space-y-6">{renderSkeleton()}</div>
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <Button variant="outline" onClick={fetchData} disabled={isRefreshing} className="shadow-sm">
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Retry"}
          </Button>
        </div>
        <Card className="shadow-sm border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="mt-4 text-muted-foreground">
              Please check your Google Sheets connection and make sure the sheet is properly set up.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <InventoryLayout clientId={client?.id || ""}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground">Manage and track your product inventory</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="shadow-sm">
              <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="shadow-sm">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleSendLowStockEmail}
              className="shadow-sm"
              disabled={!client?.email}
              title={!client?.email ? "Client email not available" : "Send low stock alert email"}
            >
              <Mail className="mr-2 h-4 w-4" />
              Send Low Stock Alert
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={selectedRows.length === 0}
              className="shadow-sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedRows.length})
            </Button>
          </div>
        </div>
        <LowStockBanner />

        <Card className="shadow-sm border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Inventory Items</CardTitle>
              <div className="flex items-center gap-2">
                <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1 shadow-sm">
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filters</span>
                      {activeFilterCount > 0 && (
                        <span className="ml-1 rounded-full bg-primary w-5 h-5 text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-4" align="end">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Stock Status</h4>
                        <SimpleSelect
                          value={filters.stockStatus}
                          onValueChange={handleStockStatusChange}
                          className="w-full"
                        >
                          {stockStatusOptions.map((option) => (
                            <SimpleSelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SimpleSelectItem>
                          ))}
                        </SimpleSelect>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Categories</h4>
                        <div className="max-h-[150px] overflow-auto space-y-2">
                          {categories.map((category) => (
                            <div key={category} className="flex items-center space-x-2">
                              <Checkbox
                                id={`category-filter-${category}`}
                                checked={categoryFilters[category] || false}
                                onCheckedChange={(checked) => handleCategoryFilterChange(category, !!checked)}
                              />
                              <Label htmlFor={`category-filter-${category}`} className="text-sm">
                                {category}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Product Type</h4>
                        <div className="max-h-[120px] overflow-auto space-y-2">
                          {productTypes.map((pt) => (
                            <div key={pt} className="flex items-center space-x-2">
                              <Checkbox
                                id={`pt-filter-${pt}`}
                                checked={productTypeFilters[pt] || false}
                                onCheckedChange={(checked) => handleProductTypeFilterChange(pt, !!checked)}
                              />
                              <Label htmlFor={`pt-filter-${pt}`} className="text-sm">
                                {pt}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const resetCategoryFilters: Record<string, boolean> = {}
                            categories.forEach((c) => { resetCategoryFilters[c] = false })
                            setCategoryFilters(resetCategoryFilters)

                            const resetProductTypeFilters: Record<string, boolean> = {}
                            productTypes.forEach((pt) => { resetProductTypeFilters[pt] = false })
                            setProductTypeFilters(resetProductTypeFilters)

                            setFilters((prev) => ({ ...prev, stockStatus: "all" }))
                          }}
                        >
                          Reset
                        </Button>
                        <Button size="sm" onClick={() => setIsFiltersOpen(false)}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-8 h-8 w-[150px] md:w-[200px] lg:w-[300px] shadow-sm"
                    value={filters.search}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={inventoryColumns} data={filteredData} onRowSelectionChange={handleRowSelectionChange} />

            {filteredData.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <Package className="mx-auto h-12 w-12 opacity-30 mb-2" />
                <h3 className="font-medium text-lg mb-1">No items found</h3>
                <p className="text-sm text-muted-foreground">
                  {filters.category.length > 0 || filters.productType.length > 0 || filters.stockStatus !== "all" || filters.search
                    ? "Try adjusting your filters or search query"
                    : "Add some inventory items to get started"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </InventoryLayout>
  )
}