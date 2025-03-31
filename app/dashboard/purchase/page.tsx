"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Download, Filter, Plus, Search, Trash2, X, MinusCircle } from "lucide-react"
import { DataTable } from "@/components/data-table/data-table"
import { purchaseColumns } from "@/components/data-table/columns/purchase-columns"
import type { PurchaseItem, InventoryItem, Supplier, PurchaseFilterState } from "@/lib/types"
import { cn } from "@/lib/utils"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select"

// Define a type for a single purchase entry form
interface PurchaseEntryForm {
  product: string
  quantity: string
  unit: string
  poNumber: string
  supplier: string
  newSupplier: string
  dateOfReceiving: Date
  rackNumber: string
}

export default function PurchasePage() {
  const [data, setData] = useState<PurchaseItem[]>([])
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const [supplierData, setSupplierData] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<PurchaseItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isAddingNewSupplier, setIsAddingNewSupplier] = useState(false)
  const [productOptions, setProductOptions] = useState<SearchableSelectOption[]>([])
  const [supplierOptions, setSupplierOptions] = useState<SearchableSelectOption[]>([])
  const [filters, setFilters] = useState<PurchaseFilterState>({
    product: [],
    supplier: [],
    dateRange: {
      from: undefined,
      to: undefined,
    },
    search: "",
  })
  const [productFilters, setProductFilters] = useState<Record<string, boolean>>({})
  const [supplierFilters, setSupplierFilters] = useState<Record<string, boolean>>({})

  // Replace single formData with an array of entries
  const [formEntries, setFormEntries] = useState<PurchaseEntryForm[]>([
    {
      product: "",
      quantity: "",
      unit: "",
      poNumber: "",
      supplier: "",
      newSupplier: "",
      dateOfReceiving: new Date(),
      rackNumber: "",
    },
  ])

  const [isLoading, setIsLoading] = useState(false)

  // Function to sort data by date (newest first)
  const sortByDateDesc = (items: PurchaseItem[]) => {
    return [...items].sort((a, b) => {
      // Only try to sort if both dates are valid
      if (a.dateOfReceiving && b.dateOfReceiving) {
        try {
          const dateA = new Date(a.dateOfReceiving).getTime()
          const dateB = new Date(b.dateOfReceiving).getTime()

          // Only sort if both dates are valid
          if (!isNaN(dateA) && !isNaN(dateB)) {
            return dateB - dateA // Descending order (newest first)
          }
        } catch (error) {}
      }

      // Fallback to srNo if dates can't be compared
      return b.srNo - a.srNo
    })
  }

  const fetchData = async () => {
    try {
      // Fetch purchase data
      const purchaseResponse = await fetch("/api/sheets?sheet=Purchase")
      const purchaseResult = await purchaseResponse.json()

      if (purchaseResult.data) {
        // Map the field names from Google Sheets to our expected field names
        const processedData = purchaseResult.data.map((item: any, index: number) => {
          // Create the processed item
          const processedItem = {
            srNo: item.srNo || item["Sr. no"] || index + 1,
            product: item.product || item["Product"] || "Unknown Product",
            quantity: Number(item.quantity || item["Quantity"] || 0),
            unit: item.unit || item["Unit"] || "PCS",
            poNumber: item.poNumber || item["PO Number"] || "",
            supplier: item.supplier || item["Supplier"] || "",
            // Use dateOfReceiving if available, otherwise try Date of receiving
            dateOfReceiving: item.dateOfReceiving || item["Date of receiving"] || "",
            rackNumber:
              item.rackNumber ||
              item["Rack Number"] ||
              item["Rack Number/Location of Stock"] ||
              item["Location of Stock"] ||
              "",
          }

          return processedItem
        })

        // Sort data by date (newest first)
        const sortedData = sortByDateDesc(processedData)
        setData(sortedData)
      }

      // Fetch inventory data for product dropdown
      const inventoryResponse = await fetch("/api/sheets?sheet=Inventory")
      const inventoryResult = await inventoryResponse.json()

      if (inventoryResult.data) {
        // Map the field names from Google Sheets to our expected field names
        const processedInventory = inventoryResult.data.map((item: any, index: number) => {
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
          }
        })

        setInventoryData(processedInventory)

        // Create product options for searchable select
        const options = processedInventory.map((item: InventoryItem) => ({
          value: item.product,
          label: item.product,
        }))
        setProductOptions(options)

        // Initialize product filters
        const uniqueProducts = [...new Set(processedInventory.map((item: InventoryItem) => item.product))]
        const initialProductFilters: Record<string, boolean> = {}
        uniqueProducts.forEach((product) => {
          initialProductFilters[product] = false
        })
        setProductFilters(initialProductFilters)
      }

      // Fetch supplier data for supplier dropdown
      const supplierResponse = await fetch("/api/sheets?sheet=Suppliers")
      const supplierResult = await supplierResponse.json()

      if (supplierResult.data) {
        // Map the field names from Google Sheets to our expected field names
        const processedSuppliers = supplierResult.data.map((item: any) => {
          return {
            supplier: item.supplier || item["Supplier"] || "",
            companyName: item.companyName || item["Company Name"] || "",
          }
        })

        setSupplierData(processedSuppliers)

        // Create supplier options for searchable select - use only the supplier field
        const options = processedSuppliers
          .filter((item) => item.supplier) // Only include items with a supplier value
          .map((item: Supplier) => ({
            value: item.supplier,
            label: item.supplier,
          }))
        setSupplierOptions(options)

        // Initialize supplier filters
        const initialSupplierFilters: Record<string, boolean> = {}
        processedSuppliers.forEach((item: Supplier) => {
          if (item.supplier) {
            initialSupplierFilters[item.supplier] = false
          }
        })
        setSupplierFilters(initialSupplierFilters)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Update filters.product when productFilters change
    const selectedProducts = Object.entries(productFilters)
      .filter(([_, isSelected]) => isSelected)
      .map(([product]) => product)

    // Update filters.supplier when supplierFilters change
    const selectedSuppliers = Object.entries(supplierFilters)
      .filter(([_, isSelected]) => isSelected)
      .map(([supplier]) => supplier)

    setFilters((prev) => ({
      ...prev,
      product: selectedProducts,
      supplier: selectedSuppliers,
    }))
  }, [productFilters, supplierFilters])

  const handleRowSelectionChange = (rows: PurchaseItem[]) => {
    setSelectedRows(rows)
  }

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return

    try {
      toast.loading("Deleting selected items...")

      // Log the items we're trying to delete
      console.log("Attempting to delete items:", selectedRows)

      // Call the API to delete the items from Google Sheets
      const response = await fetch("/api/sheets/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Use the exact sheet name as it appears in the Google Sheet
          sheetName: "Purchase",
          items: selectedRows,
        }),
      })

      // Get the response text first for debugging
      const responseText = await response.text()
      console.log("Raw response:", responseText)

      // Parse the JSON (if possible)
      let result
      try {
        result = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse response as JSON:", e)
        result = { error: "Invalid response format" }
      }

      console.log("Parsed result:", result)

      if (!response.ok) {
        console.error("Delete API error:", result)
        throw new Error(result.error || "Failed to delete items")
      }

      // Update the local state to remove the deleted items
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

  const handleExportPDF = () => {
    // Create PDF in landscape orientation
    const doc = new jsPDF({
      orientation: "landscape",
    })

    // Add title
    doc.setFontSize(18)
    doc.text("Purchase Report", 14, 22)

    // Add date
    doc.setFontSize(11)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

    // Define the columns for the table
    const tableColumn = ["Sr. No", "Product", "Quantity", "Unit", "PO Number", "Supplier", "Date", "Location"]

    // Define the rows for the table - use filteredData instead of data
    const tableRows = filteredData.map((item, index) => {
      // Format the date if it's valid, otherwise use the raw string
      let dateDisplay = item.dateOfReceiving || ""
      if (item.dateOfReceiving) {
        try {
          const date = new Date(item.dateOfReceiving)
          if (!isNaN(date.getTime())) {
            dateDisplay = format(date, "MMM d, yyyy")
          }
        } catch (error) {}
      }

      return [
        index + 1, // Use sequential numbering from the filtered table
        item.product,
        item.quantity,
        item.unit,
        item.poNumber,
        item.supplier,
        dateDisplay,
        item.rackNumber,
      ]
    })

    // Generate the table with improved styling
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "grid",
      styles: {
        overflow: "linebreak",
        cellWidth: "wrap",
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 15 }, // Sr. No
        1: { cellWidth: "auto" }, // Product
        2: { cellWidth: 20 }, // Quantity
        3: { cellWidth: 15 }, // Unit
        4: { cellWidth: 25 }, // PO Number
        5: { cellWidth: 30 }, // Supplier
        6: { cellWidth: 25 }, // Date
        7: { cellWidth: 25 }, // Location
      },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: 255,
        fontStyle: "bold",
      },
    })

    // Save the PDF
    doc.save("purchase-report.pdf")

    toast.success("PDF exported successfully")
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
    }))
  }

  const handleProductChange = (product: string, index: number) => {
    setFormEntries((prev) => {
      const newEntries = [...prev]
      // Find the selected product in inventory data
      const selectedProduct = inventoryData.find((item) => item.product === product)

      // Update the unit based on the selected product
      newEntries[index] = {
        ...newEntries[index],
        product,
        unit: selectedProduct ? selectedProduct.unit : newEntries[index].unit,
      }
      return newEntries
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target
    setFormEntries((prev) => {
      const newEntries = [...prev]
      newEntries[index] = {
        ...newEntries[index],
        [name]: value,
      }
      return newEntries
    })
  }

  const toggleAddNewSupplier = () => {
    setIsAddingNewSupplier(!isAddingNewSupplier)
    if (!isAddingNewSupplier) {
      // Switching to add new supplier mode - clear supplier for all entries
      setFormEntries((prev) =>
        prev.map((entry) => ({
          ...entry,
          supplier: "", // Clear the selected supplier
        })),
      )
    } else {
      // Switching back to select supplier mode - clear newSupplier for all entries
      setFormEntries((prev) =>
        prev.map((entry) => ({
          ...entry,
          newSupplier: "", // Clear the new supplier input
        })),
      )
    }
  }

  const handleDateChange = (date: Date | undefined, index: number) => {
    setFormEntries((prev) => {
      const newEntries = [...prev]
      newEntries[index] = {
        ...newEntries[index],
        dateOfReceiving: date || new Date(),
      }
      return newEntries
    })
  }

  const addEntry = () => {
    setFormEntries((prev) => [
      ...prev,
      {
        product: "",
        quantity: "",
        unit: "",
        poNumber: prev[0].poNumber, // Copy PO number from first entry
        supplier: isAddingNewSupplier ? "" : prev[0].supplier, // Copy supplier if using existing
        newSupplier: isAddingNewSupplier ? prev[0].newSupplier : "", // Copy new supplier if adding new
        dateOfReceiving: prev[0].dateOfReceiving, // Copy date from first entry
        rackNumber: prev[0].rackNumber, // Copy rack number from first entry
      },
    ])
  }

  const removeEntry = (index: number) => {
    if (formEntries.length <= 1) return // Don't remove the last entry
    setFormEntries((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all entries
    const invalidEntries = formEntries.filter((entry) => {
      return (
        !entry.product ||
        !entry.quantity ||
        !entry.poNumber ||
        !entry.rackNumber ||
        (isAddingNewSupplier ? !entry.newSupplier : !entry.supplier)
      )
    })

    if (invalidEntries.length > 0) {
      toast.error(`Please fill in all required fields for all entries`)
      return
    }

    try {
      setIsLoading(true)

      // Process all entries
      for (let i = 0; i < formEntries.length; i++) {
        const entry = formEntries[i]

        // Determine the supplier to use
        const supplier = isAddingNewSupplier ? entry.newSupplier : entry.supplier

        // Ensure the date is properly formatted
        let formattedDate
        try {
          // If it's a Date object, format it to YYYY-MM-DD
          if (entry.dateOfReceiving instanceof Date) {
            formattedDate = entry.dateOfReceiving.toISOString().split("T")[0]
          } else {
            // Otherwise try to parse and format it
            const dateStr = String(entry.dateOfReceiving)

            const date = new Date(dateStr)
            if (!isNaN(date.getTime())) {
              formattedDate = date.toISOString().split("T")[0]
            } else {
              // IMPORTANT: Use the original string instead of today's date
              formattedDate = dateStr
            }
          }
        } catch (error) {
          // Use the original string if possible
          formattedDate = String(entry.dateOfReceiving)
        }

        // Create new purchase entry
        const newEntry = {
          // Don't include srNo here, it will be assigned by the server
          product: entry.product,
          quantity: Number.parseInt(entry.quantity),
          unit: entry.unit,
          poNumber: entry.poNumber,
          supplier: supplier,
          dateOfReceiving: formattedDate,
          rackNumber: entry.rackNumber,
        }

        // Add the purchase entry to the Google Sheet
        const purchaseResponse = await fetch("/api/sheets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sheetName: "Purchase",
            entry: newEntry,
          }),
        })

        if (!purchaseResponse.ok) {
          throw new Error(`Failed to add purchase entry ${i + 1}`)
        }

        const purchaseResult = await purchaseResponse.json()

        // Update the local data with the new entry at the beginning (newest first)
        setData((prev) => sortByDateDesc([purchaseResult.data, ...prev]))

        // Find the product in inventory data to update stock
        const productIndex = inventoryData.findIndex((item) => item.product === entry.product)

        if (productIndex !== -1) {
          // Calculate new stock and value
          const currentStock = inventoryData[productIndex].stock
          const newStock = currentStock + Number.parseInt(entry.quantity)
          const newValue = newStock * inventoryData[productIndex].pricePerUnit

          // Update inventory in Google Sheet
          const inventoryResponse = await fetch("/api/sheets", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              product: entry.product,
              newStock,
              newValue,
            }),
          })

          if (!inventoryResponse.ok) {
            throw new Error(`Failed to update inventory for entry ${i + 1}`)
          }

          // Update local inventory data
          const updatedInventory = [...inventoryData]
          updatedInventory[productIndex].stock = newStock
          updatedInventory[productIndex].value = newValue
          setInventoryData(updatedInventory)
        }

        // If it's a new supplier, add it to the supplier data (only for the first entry with this supplier)
        if (isAddingNewSupplier && !supplierData.some((s) => s.supplier === entry.newSupplier)) {
          try {
            // Add the new supplier to the Suppliers sheet - only set the supplier field
            const supplierResponse = await fetch("/api/sheets", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sheetName: "Suppliers",
                entry: {
                  supplier: entry.newSupplier,
                  // Leave companyName empty
                  companyName: "",
                },
              }),
            })

            if (supplierResponse.ok) {
              // Add to supplier data
              const newSupplier: Supplier = {
                supplier: entry.newSupplier,
                companyName: "",
              }
              setSupplierData((prev) => [...prev, newSupplier])

              // Add to supplier options
              setSupplierOptions((prev) => [...prev, { value: newSupplier.supplier, label: newSupplier.supplier }])

              // Add to supplier filters
              setSupplierFilters((prev) => ({
                ...prev,
                [entry.newSupplier]: false,
              }))
            }
          } catch (error) {
            // Continue with the purchase even if adding the supplier fails
          }
        }
      }

      // Reset form data
      setFormEntries([
        {
          product: "",
          quantity: "",
          unit: "",
          poNumber: "",
          supplier: "",
          newSupplier: "",
          dateOfReceiving: new Date(),
          rackNumber: "",
        },
      ])
      setIsAddingNewSupplier(false)

      // Close dialog
      setIsDialogOpen(false)

      toast.success(`${formEntries.length} purchase entries added successfully`)
    } catch (error) {
      console.error("Error adding purchase:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add purchase entries")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProductFilterChange = (product: string, checked: boolean) => {
    setProductFilters((prev) => ({
      ...prev,
      [product]: checked,
    }))
  }

  const handleSupplierFilterChange = (supplier: string, checked: boolean) => {
    setSupplierFilters((prev) => ({
      ...prev,
      [supplier]: checked,
    }))
  }

  const handleDateRangeChange = (field: "from" | "to", date?: Date) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: date,
      },
    }))
  }

  const filteredData = data.filter((item) => {
    // Filter by product
    if (filters.product.length > 0 && !filters.product.includes(item.product)) {
      return false
    }

    // Filter by supplier
    if (filters.supplier.length > 0 && !filters.supplier.includes(item.supplier)) {
      return false
    }

    // Filter by date range
    if (filters.dateRange.from || filters.dateRange.to) {
      // Ensure we have a valid date object
      let itemDate
      try {
        itemDate = new Date(item.dateOfReceiving)

        // Check if it's a valid date
        if (isNaN(itemDate.getTime())) {
          return false
        }
      } catch (error) {
        return false
      }

      if (filters.dateRange.from && itemDate < filters.dateRange.from) {
        return false
      }

      if (filters.dateRange.to) {
        // Add one day to include the end date
        const endDate = new Date(filters.dateRange.to)
        endDate.setDate(endDate.getDate() + 1)

        if (itemDate > endDate) {
          return false
        }
      }
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        (typeof item.product === "string" && item.product.toLowerCase().includes(searchTerm)) ||
        (typeof item.supplier === "string" && item.supplier.toLowerCase().includes(searchTerm)) ||
        (typeof item.poNumber === "string" && item.poNumber.toLowerCase().includes(searchTerm))
      )
    }

    return true
  })

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Purchase Management</h1>
        <div className="flex flex-wrap gap-2">
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                // Reset the form when dialog is closed
                setFormEntries([
                  {
                    product: "",
                    quantity: "",
                    unit: "",
                    poNumber: "",
                    supplier: "",
                    newSupplier: "",
                    dateOfReceiving: new Date(),
                    rackNumber: "",
                  },
                ])
                setIsAddingNewSupplier(false)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Purchase
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Purchase</DialogTitle>
                <DialogDescription>Enter the details of the new purchase entries.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                {formEntries.map((entry, index) => (
                  <div key={index} className={cn("py-4", index > 0 && "border-t border-gray-200 mt-4")}>
                    {index > 0 && (
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Entry #{index + 1}</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEntry(index)}
                          className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <MinusCircle className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    )}
                    <div className="grid gap-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`product-${index}`} className="text-right">
                          Product
                        </Label>
                        <div className="col-span-3">
                          <SearchableSelect
                            options={productOptions}
                            value={entry.product}
                            onValueChange={(value) => handleProductChange(value, index)}
                            placeholder="Search for a product..."
                            emptyMessage="No products found."
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`quantity-${index}`} className="text-right">
                          Quantity
                        </Label>
                        <Input
                          id={`quantity-${index}`}
                          name="quantity"
                          type="number"
                          value={entry.quantity}
                          onChange={(e) => handleInputChange(e, index)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`unit-${index}`} className="text-right">
                          Unit
                        </Label>
                        <Input
                          id={`unit-${index}`}
                          name="unit"
                          value={entry.unit}
                          readOnly
                          className="col-span-3 bg-muted"
                        />
                      </div>

                      {index === 0 && (
                        <>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="poNumber" className="text-right">
                              PO Number
                            </Label>
                            <Input
                              id="poNumber"
                              name="poNumber"
                              value={entry.poNumber}
                              onChange={(e) => {
                                // Update PO Number for all entries
                                const value = e.target.value
                                setFormEntries((prev) =>
                                  prev.map((entry) => ({
                                    ...entry,
                                    poNumber: value,
                                  })),
                                )
                              }}
                              className="col-span-3"
                            />
                          </div>

                          {isAddingNewSupplier ? (
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="newSupplier" className="text-right">
                                New Supplier
                              </Label>
                              <div className="col-span-3 flex gap-2">
                                <Input
                                  id="newSupplier"
                                  name="newSupplier"
                                  placeholder="Enter new supplier name"
                                  value={entry.newSupplier}
                                  onChange={(e) => {
                                    // Update new supplier for all entries
                                    const value = e.target.value
                                    setFormEntries((prev) =>
                                      prev.map((entry) => ({
                                        ...entry,
                                        newSupplier: value,
                                      })),
                                    )
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={toggleAddNewSupplier}
                                  className="h-10 w-10"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="supplier" className="text-right">
                                  Supplier
                                </Label>
                                <div className="col-span-3">
                                  <SearchableSelect
                                    options={supplierOptions}
                                    value={entry.supplier}
                                    onValueChange={(value) => {
                                      // Update supplier for all entries
                                      setFormEntries((prev) =>
                                        prev.map((entry) => ({
                                          ...entry,
                                          supplier: value,
                                        })),
                                      )
                                    }}
                                    placeholder="Search for a supplier..."
                                    emptyMessage="No suppliers found."
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <div className="col-span-3 col-start-2">
                                  <Button
                                    type="button"
                                    variant="link"
                                    className="h-auto p-0 text-xs"
                                    onClick={toggleAddNewSupplier}
                                  >
                                    + Add New Supplier
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}

                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dateOfReceiving" className="text-right">
                              Date
                            </Label>
                            <div className="col-span-3">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !entry.dateOfReceiving && "text-muted-foreground",
                                    )}
                                    onClick={() => {
                                      // Update date for all entries when clicked
                                      setFormEntries((prev) =>
                                        prev.map((e) => ({
                                          ...e,
                                          dateOfReceiving: entry.dateOfReceiving,
                                        })),
                                      )
                                    }}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {entry.dateOfReceiving ? (
                                      format(entry.dateOfReceiving, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={entry.dateOfReceiving}
                                    onSelect={(date) => {
                                      // Update date for all entries
                                      const newDate = date || new Date()
                                      setFormEntries((prev) =>
                                        prev.map((entry) => ({
                                          ...entry,
                                          dateOfReceiving: newDate,
                                        })),
                                      )
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="rackNumber" className="text-right">
                              Location
                            </Label>
                            <Input
                              id="rackNumber"
                              name="rackNumber"
                              value={entry.rackNumber}
                              onChange={(e) => {
                                // Update rack number for all entries
                                const value = e.target.value
                                setFormEntries((prev) =>
                                  prev.map((entry) => ({
                                    ...entry,
                                    rackNumber: value,
                                  })),
                                )
                              }}
                              className="col-span-3"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex justify-center my-4">
                  <Button type="button" variant="outline" onClick={addEntry} className="w-full max-w-xs">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Entry
                  </Button>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Adding...
                      </>
                    ) : (
                      `Add ${formEntries.length} Purchase ${formEntries.length > 1 ? "Entries" : "Entry"}`
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {(filters.product.length > 0 ||
                  filters.supplier.length > 0 ||
                  filters.dateRange.from ||
                  filters.dateRange.to) && (
                  <span className="ml-1 rounded-full bg-primary w-5 h-5 text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                    {filters.product.length +
                      filters.supplier.length +
                      (filters.dateRange.from || filters.dateRange.to ? 1 : 0)}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Products</h4>
                  <div className="max-h-[150px] overflow-auto space-y-2">
                    {Object.keys(productFilters).map((product) => (
                      <div key={product} className="flex items-center space-x-2">
                        <Checkbox
                          id={`product-filter-${product}`}
                          checked={productFilters[product] || false}
                          onCheckedChange={(checked) => handleProductFilterChange(product, !!checked)}
                        />
                        <Label htmlFor={`product-filter-${product}`} className="text-sm">
                          {product}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Suppliers</h4>
                  <div className="max-h-[150px] overflow-auto space-y-2">
                    {Object.keys(supplierFilters).map((supplier) => (
                      <div key={supplier} className="flex items-center space-x-2">
                        <Checkbox
                          id={`supplier-filter-${supplier}`}
                          checked={supplierFilters[supplier] || false}
                          onCheckedChange={(checked) => handleSupplierFilterChange(supplier, !!checked)}
                        />
                        <Label htmlFor={`supplier-filter-${supplier}`} className="text-sm">
                          {supplier}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Date Range</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="dateFrom" className="text-xs">
                        From
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="dateFrom"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal text-xs h-8",
                              !filters.dateRange.from && "text-muted-foreground",
                            )}
                          >
                            {filters.dateRange.from ? format(filters.dateRange.from, "PP") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateRange.from}
                            onSelect={(date) => handleDateRangeChange("from", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="dateTo" className="text-xs">
                        To
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="dateTo"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal text-xs h-8",
                              !filters.dateRange.to && "text-muted-foreground",
                            )}
                          >
                            {filters.dateRange.to ? format(filters.dateRange.to, "PP") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateRange.to}
                            onSelect={(date) => handleDateRangeChange("to", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Reset product filters
                      const resetProductFilters: Record<string, boolean> = {}
                      Object.keys(productFilters).forEach((product) => {
                        resetProductFilters[product] = false
                      })
                      setProductFilters(resetProductFilters)

                      // Reset supplier filters
                      const resetSupplierFilters: Record<string, boolean> = {}
                      Object.keys(supplierFilters).forEach((supplier) => {
                        resetSupplierFilters[supplier] = false
                      })
                      setSupplierFilters(resetSupplierFilters)

                      // Reset date range
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: {
                          from: undefined,
                          to: undefined,
                        },
                      }))
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
          <Button variant="destructive" onClick={handleDeleteSelected} disabled={selectedRows.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Purchase Items</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search purchases..."
                className="pl-8 h-8 w-[200px] lg:w-[300px]"
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={purchaseColumns} data={filteredData} onRowSelectionChange={handleRowSelectionChange} />
        </CardContent>
      </Card>
    </div>
  )
}

