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
import { getSalesColumns } from "@/components/data-table/columns/sales-columns"
import type { SalesItem, InventoryItem, Supplier, SalesFilterState } from "@/lib/types"
import { cn } from "@/lib/utils"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select"
import { useClientContext } from "@/context/client-context"

// Import the client terminology utilities
import { getSalesTerm } from "@/lib/client-terminology"

// Update the SalesEntryForm interface to include indentNumber
interface SalesEntryForm {
  product: string
  quantity: string
  unit: string
  contact: string
  companyName: string
  newCompany: string
  dateOfIssue: Date
  indentNumber?: string // Add this new field
}

export default function SalesPage() {
  const { client } = useClientContext()
  const [data, setData] = useState<SalesItem[]>([])
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const [supplierData, setSupplierData] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<SalesItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isAddingNewCompany, setIsAddingNewCompany] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [productOptions, setProductOptions] = useState<SearchableSelectOption[]>([])
  const [companyOptions, setCompanyOptions] = useState<SearchableSelectOption[]>([])
  const [filters, setFilters] = useState<SalesFilterState>({
    product: [],
    company: [],
    dateRange: {
      from: undefined,
      to: undefined,
    },
    search: "",
  })
  const [productFilters, setProductFilters] = useState<Record<string, boolean>>({})
  const [companyFilters, setCompanyFilters] = useState<Record<string, boolean>>({})

  // Create columns based on client name
  const columns = getSalesColumns(client?.name)

  // Update the initial form state in the useState hook to include indentNumber
  const [formEntries, setFormEntries] = useState<SalesEntryForm[]>([
    {
      product: "",
      quantity: "",
      unit: "",
      contact: "",
      companyName: "",
      newCompany: "",
      dateOfIssue: new Date(),
      indentNumber: "", // Add this new field
    },
  ])

  const [isLoading, setIsLoading] = useState(false)

  // Function to sort data by date (newest first)
  const sortByDateDesc = (items: SalesItem[]) => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.dateOfIssue).getTime()
      const dateB = new Date(b.dateOfIssue).getTime()
      return dateB - dateA // Descending order (newest first)
    })
  }

  // Update the useEffect to pass clientId in the fetch requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime()

        // Ensure client ID is properly passed in the URL
        const clientParam = client?.id ? `&clientId=${encodeURIComponent(client.id)}` : ""
        console.log(`Sales: Using client parameter: ${clientParam}`)

        // Fetch sales data
        const salesResponse = await fetch(`/api/sheets?sheet=Sales${clientParam}&t=${timestamp}`)

        if (!salesResponse.ok) {
          const errorData = await salesResponse.json()
          console.error("Sales API error:", errorData)
          throw new Error(`Sales API error: ${errorData.error || "Unknown error"}`)
        }

        const salesResult = await salesResponse.json()
        console.log("Sales data fetched:", salesResult)

        if (salesResult.data) {
          // Map the field names from Google Sheets to our expected field names
          const processedData = salesResult.data.map((item: any, index: number) => {
            // Create a unique identifier for each row if it doesn't have one
            const uniqueId =
              item._uniqueId ||
              item.id ||
              item.ID ||
              `sales_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

            return {
              _uniqueId: uniqueId, // Add a unique identifier
              srNo: item.srNo || item["Sr. no"] || index + 1,
              product: item.product || item["Product"] || "Unknown Product",
              quantity: Number(item.quantity || item["Quantity"] || 0),
              unit: item.unit || item["Unit"] || "PCS",
              contact: item.contact || item["Contact"] || "",
              companyName: item.companyName || item["Company Name"] || "",
              dateOfIssue: item.dateOfIssue || item["Date of Issue"] || new Date().toISOString().split("T")[0],
              indentNumber: item.indentNumber || item["Indent Number"] || "",
            }
          })

          // Sort data by date (newest first)
          const sortedData = sortByDateDesc(processedData)
          setData(sortedData)
        }

        // Fetch inventory data for product dropdown
        const inventoryResponse = await fetch(
          `/api/sheets?sheet=Inventory${client?.id ? `&clientId=${client.id}` : ""}`,
        )
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
          const productOpts = processedInventory.map((item: InventoryItem) => ({
            value: item.product,
            label: item.product,
          }))
          setProductOptions(productOpts)

          // Initialize product filters
          const uniqueProducts = [...new Set(processedInventory.map((item: InventoryItem) => item.product))]
          const initialProductFilters: Record<string, boolean> = {}
          uniqueProducts.forEach((product) => {
            initialProductFilters[product] = false
          })
          setProductFilters(initialProductFilters)
        }

        // Fetch supplier data for company dropdown
        const supplierResponse = await fetch(`/api/sheets?sheet=Suppliers${client?.id ? `&clientId=${client.id}` : ""}`)
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

          // Create company options for searchable select - use only the companyName field
          const options = processedSuppliers
            .filter((item) => item.companyName) // Only include items with a companyName value
            .map((item: Supplier) => ({
              value: item.companyName,
              label: item.companyName,
            }))
          setCompanyOptions(options)

          // Initialize company filters
          const initialCompanyFilters: Record<string, boolean> = {}
          processedSuppliers.forEach((item: Supplier) => {
            if (item.companyName) {
              initialCompanyFilters[item.companyName] = false
            }
          })
          setCompanyFilters(initialCompanyFilters)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [client?.id])

  useEffect(() => {
    // Update filters.product when productFilters change
    const selectedProducts = Object.entries(productFilters)
      .filter(([_, isSelected]) => isSelected)
      .map(([product]) => product)

    // Update filters.company when companyFilters change
    const selectedCompanies = Object.entries(companyFilters)
      .filter(([_, isSelected]) => isSelected)
      .map(([company]) => company)

    setFilters((prev) => ({
      ...prev,
      product: selectedProducts,
      company: selectedCompanies,
    }))
  }, [productFilters, companyFilters])

  const handleRowSelectionChange = (rows: SalesItem[]) => {
    setSelectedRows(rows)
  }

  // Update the handleDeleteSelected function to pass clientId
  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return

    try {
      setIsDeleting(true)
      toast.loading("Deleting selected items...")

      // First, update inventory stock for each deleted sales entry
      for (const salesItem of selectedRows) {
        // Find the corresponding product in inventory
        const productIndex = inventoryData.findIndex((item) => item.product === salesItem.product)

        if (productIndex !== -1) {
          // For sales deletion, we need to INCREASE the stock
          const currentStock = inventoryData[productIndex].stock
          const newStock = currentStock + salesItem.quantity
          const newValue = newStock * inventoryData[productIndex].pricePerUnit

          // Update inventory in Google Sheet
          const inventoryResponse = await fetch("/api/sheets", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              product: salesItem.product,
              newStock: newStock,
              newValue: newValue,
              clientId: client?.id,
            }),
          })

          if (!inventoryResponse.ok) {
            console.error(`Failed to update inventory for ${salesItem.product}`)
          } else {
            // Update local inventory data
            const updatedInventory = [...inventoryData]
            updatedInventory[productIndex].stock = newStock
            updatedInventory[productIndex].value = newValue
            setInventoryData(updatedInventory)
          }
        }
      }

      // Call the API to delete the items from Google Sheets
      const response = await fetch("/api/sheets/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Use the exact sheet name as it appears in the Google Sheet
          sheetName: "Sales",
          items: selectedRows,
          clientId: client?.id,
        }),
      })

      // Get the response text first for debugging
      const responseText = await response.text()

      // Parse the JSON (if possible)
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

      // Update the local state to remove the deleted items
      const updatedData = data.filter((item) => {
        // Only filter out items that exactly match the selected rows
        return !selectedRows.some(
          (row) => row.srNo === item.srNo && row.product === item.product && row.dateOfIssue === item.dateOfIssue,
        )
      })
      setData(updatedData)
      setSelectedRows([])

      toast.dismiss()
      toast.success(`${selectedRows.length} item(s) deleted successfully`)
    } catch (error) {
      console.error("Error deleting items:", error)
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : "Failed to delete items")
    } finally {
      setIsDeleting(false)
    }
  }

  // Replace the handleExportPDF function with this improved version
  const handleExportPDF = () => {
    // Create PDF in landscape orientation
    const doc = new jsPDF({
      orientation: "landscape",
    })

    // Add title
    doc.setFontSize(18)
    doc.text("Sales Report", 14, 22)

    // Add date
    doc.setFontSize(11)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

    // Define the columns for the table
    const tableColumn = ["Sr. No", "Product", "Quantity", "Unit", "Contact", "Company", "Date"]

    // Add Indent Number column for Cranoist
    if (client?.name?.toLowerCase() === "cranoist") {
      tableColumn.push("Indent Number")
    }

    // Define the rows for the table - use filtered data
    const filteredItems = data.filter((item) => {
      // Filter by product
      if (filters.product.length > 0 && !filters.product.includes(item.product)) {
        return false
      }

      // Filter by company
      if (filters.company.length > 0 && !filters.company.includes(item.companyName)) {
        return false
      }

      // Filter by date range
      if (filters.dateRange.from || filters.dateRange.to) {
        const itemDate = new Date(item.dateOfIssue)

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
          (typeof item.contact === "string" && item.contact.toLowerCase().includes(searchTerm)) ||
          (typeof item.companyName === "string" && item.companyName.toLowerCase().includes(searchTerm))
        )
      }

      return true
    })

    const tableRows = filteredItems.map((item, index) => {
      const row = [
        index + 1, // Use sequential numbering from the filtered table
        item.product,
        item.quantity,
        item.unit,
        item.contact,
        item.companyName,
        format(new Date(item.dateOfIssue), "MMM d, yyyy"),
      ]

      // Add Indent Number for Cranoist
      if (client?.name?.toLowerCase() === "cranoist") {
        row.push(item.indentNumber || "")
      }

      return row
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
        4: { cellWidth: 30 }, // Contact
        5: { cellWidth: 30 }, // Company
        6: { cellWidth: 25 }, // Date
      },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: 255,
        fontStyle: "bold",
      },
    })

    // Save the PDF
    doc.save("sales-report.pdf")

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

  const toggleAddNewCompany = () => {
    setIsAddingNewCompany(!isAddingNewCompany)
    if (!isAddingNewCompany) {
      // Switching to add new company mode - clear company for all entries
      setFormEntries((prev) =>
        prev.map((entry) => ({
          ...entry,
          companyName: "", // Clear the selected company
        })),
      )
    } else {
      // Switching back to select company mode - clear newCompany for all entries
      setFormEntries((prev) =>
        prev.map((entry) => ({
          ...entry,
          newCompany: "", // Clear the new company input
        })),
      )
    }
  }

  const handleDateChange = (date: Date | undefined, index: number) => {
    setFormEntries((prev) => {
      const newEntries = [...prev]
      newEntries[index] = {
        ...newEntries[index],
        dateOfIssue: date || new Date(),
      }
      return newEntries
    })
  }

  // Update the addEntry function to include indentNumber
  const addEntry = () => {
    setFormEntries((prev) => [
      ...prev,
      {
        product: "",
        quantity: "",
        unit: "",
        contact: prev[0].contact, // Copy contact from first entry
        companyName: isAddingNewCompany ? "" : prev[0].companyName, // Copy company if using existing
        newCompany: isAddingNewCompany ? prev[0].newCompany : "", // Copy new company if adding new
        dateOfIssue: prev[0].dateOfIssue, // Copy date from first entry
        indentNumber: prev[0].indentNumber, // Copy indent number from first entry
      },
    ])
  }

  const removeEntry = (index: number) => {
    if (formEntries.length <= 1) return // Don't remove the last entry
    setFormEntries((prev) => prev.filter((_, i) => i !== index))
  }

  // Update the handleSubmit function to pass clientId
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all entries
    const invalidEntriesInitial = formEntries.filter((entry) => {
      return (
        !entry.product ||
        !entry.quantity ||
        !entry.contact ||
        (isAddingNewCompany ? !entry.newCompany : !entry.companyName)
      )
    })

    if (invalidEntriesInitial.length > 0) {
      toast.error(`Please fill in all required fields for all entries`)
      return
    }

    try {
      setIsLoading(true)

      // Track entries with insufficient stock for warning purposes
      const insufficientStockEntries = []

      // Process all entries
      for (let i = 0; i < formEntries.length; i++) {
        const entry = formEntries[i]

        // Determine the company name to use
        const companyName = isAddingNewCompany ? entry.newCompany : entry.companyName

        // Find the handleSubmit function and update the newEntry object creation to include indentNumber
        // Inside the handleSubmit function, update the newEntry object:
        const newEntry = {
          // Don't include srNo here, it will be assigned by the server
          product: entry.product,
          quantity: Number.parseInt(entry.quantity),
          unit: entry.unit,
          contact: entry.contact,
          companyName: companyName,
          dateOfIssue: format(entry.dateOfIssue, "yyyy-MM-dd"),
          indentNumber: entry.indentNumber, // Ensure this line is present
        }

        // Check if there's enough stock (for warning purposes only)
        const productIndex = inventoryData.findIndex((item) => item.product === entry.product)
        if (productIndex !== -1) {
          const currentStock = inventoryData[productIndex].stock
          const requestedQuantity = Number.parseInt(entry.quantity)

          if (currentStock < requestedQuantity) {
            insufficientStockEntries.push({
              product: entry.product,
              requested: requestedQuantity,
              available: currentStock,
              unit: entry.unit,
            })
          }
        }

        // Add the sales entry to the Google Sheet regardless of stock
        const salesResponse = await fetch("/api/sheets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sheetName: "Sales",
            entry: newEntry,
            clientId: client?.id,
          }),
        })

        if (!salesResponse.ok) {
          throw new Error(`Failed to add sales entry ${i + 1}`)
        }

        const salesResult = await salesResponse.json()

        // Update the local data with the new entry at the beginning (newest first)
        setData((prev) => sortByDateDesc([salesResult.data, ...prev]))

        // Update inventory stock even if it goes negative
        if (productIndex !== -1) {
          // Calculate new stock and value
          const currentStock = inventoryData[productIndex].stock
          const newStock = currentStock - Number.parseInt(entry.quantity)
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
              clientId: client?.id,
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

        // If it's a new company, add it to the company filters and options
        if (isAddingNewCompany && !companyFilters[entry.newCompany]) {
          try {
            // Add the new company to the Suppliers sheet - only set the companyName field
            const supplierResponse = await fetch("/api/sheets", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sheetName: "Suppliers",
                entry: {
                  supplier: "", // Leave supplier empty
                  companyName: entry.newCompany,
                },
                clientId: client?.id,
              }),
            })

            if (supplierResponse.ok) {
              // Update UI components
              setCompanyFilters((prev) => ({
                ...prev,
                [entry.newCompany]: false,
              }))

              // Add to company options
              setCompanyOptions((prev) => [...prev, { value: entry.newCompany, label: entry.newCompany }])

              // Add to supplier data
              const newSupplier: Supplier = {
                supplier: "",
                companyName: entry.newCompany,
              }
              setSupplierData((prev) => [...prev, newSupplier])
            }
          } catch (error) {
            console.error("Error adding company to Suppliers sheet:", error)
            // Continue with the sale even if adding the company fails
          }
        }
      }

      // Show success message
      toast.success(`${formEntries.length} sales entries added successfully`, {
        duration: 5000,
        position: "bottom-right",
      })

      // Show warning about insufficient stock if any
      if (insufficientStockEntries.length > 0) {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col ring-1 ring-black ring-opacity-5`}
            >
              <div className="p-4 border-l-4 border-amber-500">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <svg
                      className="h-5 w-5 text-amber-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">Warning: Insufficient Stock</p>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                        {insufficientStockEntries.map((item, index) => (
                          <li key={index}>
                            <span>
                              <span className="font-medium">{item.product}</span>: Sold {item.requested} {item.unit}(s),
                              but only {item.available} were available
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex border-t border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-b-lg p-3 flex items-center justify-center text-sm font-medium text-amber-600 hover:text-amber-500 focus:outline-none"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ),
          {
            duration: 10000,
            position: "top-center",
            id: "insufficient-stock-warning",
          },
        )
      }

      // Reset form data
      setFormEntries([
        {
          product: "",
          quantity: "",
          unit: "",
          contact: "",
          companyName: "",
          newCompany: "",
          dateOfIssue: new Date(),
          indentNumber: "",
        },
      ])
      setIsAddingNewCompany(false)

      // Close dialog
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error adding sale:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add sales entries")
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

  const handleCompanyFilterChange = (company: string, checked: boolean) => {
    setCompanyFilters((prev) => ({
      ...prev,
      [company]: checked,
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

    // Filter by company
    if (filters.company.length > 0 && !filters.company.includes(item.companyName)) {
      return false
    }

    // Filter by date range
    if (filters.dateRange.from || filters.dateRange.to) {
      const itemDate = new Date(item.dateOfIssue)

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
        (typeof item.contact === "string" && item.contact.toLowerCase().includes(searchTerm)) ||
        (typeof item.companyName === "string" && item.companyName.toLowerCase().includes(searchTerm))
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
        {/* Update the page title */}
        <h1 className="text-2xl font-bold">{getSalesTerm(client?.name)} Management</h1>
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
                    contact: "",
                    companyName: "",
                    newCompany: "",
                    dateOfIssue: new Date(),
                    indentNumber: "",
                  },
                ])
                setIsAddingNewCompany(false)
              }
            }}
          >
            <DialogTrigger asChild>
              {/* Update the "Add Sale" button text */}
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add {getSalesTerm(client?.name)}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                {/* Update the dialog title and description */}
                <DialogTitle>Add New {getSalesTerm(client?.name)}</DialogTitle>
                <DialogDescription>
                  Enter the details of the new {getSalesTerm(client?.name).toLowerCase()} entries.
                </DialogDescription>
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
                            <Label htmlFor="contact" className="text-right">
                              Contact
                            </Label>
                            <Input
                              id="contact"
                              name="contact"
                              value={entry.contact}
                              onChange={(e) => {
                                // Update contact for all entries
                                const value = e.target.value
                                setFormEntries((prev) =>
                                  prev.map((entry) => ({
                                    ...entry,
                                    contact: value,
                                  })),
                                )
                              }}
                              className="col-span-3"
                            />
                          </div>

                          {isAddingNewCompany ? (
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="newCompany" className="text-right">
                                New Company
                              </Label>
                              <div className="col-span-3 flex gap-2">
                                <Input
                                  id="newCompany"
                                  name="newCompany"
                                  placeholder="Enter new company name"
                                  value={entry.newCompany}
                                  onChange={(e) => {
                                    // Update new company for all entries
                                    const value = e.target.value
                                    setFormEntries((prev) =>
                                      prev.map((entry) => ({
                                        ...entry,
                                        newCompany: value,
                                      })),
                                    )
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={toggleAddNewCompany}
                                  className="h-10 w-10"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="companyName" className="text-right">
                                  Company
                                </Label>
                                <div className="col-span-3">
                                  <SearchableSelect
                                    options={companyOptions}
                                    value={entry.companyName}
                                    onValueChange={(value) => {
                                      // Update company for all entries
                                      setFormEntries((prev) =>
                                        prev.map((entry) => ({
                                          ...entry,
                                          companyName: value,
                                        })),
                                      )
                                    }}
                                    placeholder="Search for a company..."
                                    emptyMessage="No companies found."
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <div className="col-span-3 col-start-2">
                                  <Button
                                    type="button"
                                    variant="link"
                                    className="h-auto p-0 text-xs"
                                    onClick={toggleAddNewCompany}
                                  >
                                    + Add New Company
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}

                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dateOfIssue" className="text-right">
                              Date
                            </Label>
                            <div className="col-span-3">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !entry.dateOfIssue && "text-muted-foreground",
                                    )}
                                    onClick={() => {
                                      // Update date for all entries when clicked
                                      setFormEntries((prev) =>
                                        prev.map((e) => ({
                                          ...e,
                                          dateOfIssue: entry.dateOfIssue,
                                        })),
                                      )
                                    }}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {entry.dateOfIssue ? format(entry.dateOfIssue, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={entry.dateOfIssue}
                                    onSelect={(date) => {
                                      // Update date for all entries
                                      const newDate = date || new Date()
                                      setFormEntries((prev) =>
                                        prev.map((entry) => ({
                                          ...entry,
                                          dateOfIssue: newDate,
                                        })),
                                      )
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          {/* Find the form in the JSX and add the Indent Number field after the Date field for Cranoist */}
                          {/* Look for the section with dateOfIssue and add this after it: */}
                          {client?.name?.toLowerCase() === "cranoist" && (
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="indentNumber" className="text-right">
                                Indent Number
                              </Label>
                              <Input
                                id="indentNumber"
                                name="indentNumber"
                                value={entry.indentNumber || ""}
                                onChange={(e) => {
                                  // Update indent number for all entries
                                  const value = e.target.value
                                  setFormEntries((prev) =>
                                    prev.map((entry) => ({
                                      ...entry,
                                      indentNumber: value,
                                    })),
                                  )
                                }}
                                className="col-span-3"
                              />
                            </div>
                          )}
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
                  {/* Update the submit button text */}
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Adding...
                      </>
                    ) : (
                      `Add ${formEntries.length} ${getSalesTerm(client?.name)} ${
                        formEntries.length > 1 ? "Entries" : "Entry"
                      }`
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
                  filters.company.length > 0 ||
                  filters.dateRange.from ||
                  filters.dateRange.to) && (
                  <span className="ml-1 rounded-full bg-primary w-5 h-5 text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                    {filters.product.length +
                      filters.company.length +
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
                  <h4 className="font-medium text-sm">Companies</h4>
                  <div className="max-h-[150px] overflow-auto space-y-2">
                    {Object.keys(companyFilters).map((company) => (
                      <div key={company} className="flex items-center space-x-2">
                        <Checkbox
                          id={`company-filter-${company}`}
                          checked={companyFilters[company] || false}
                          onCheckedChange={(checked) => handleCompanyFilterChange(company, !!checked)}
                        />
                        <Label htmlFor={`company-filter-${company}`} className="text-sm">
                          {company}
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

                      // Reset company filters
                      const resetCompanyFilters: Record<string, boolean> = {}
                      Object.keys(companyFilters).forEach((company) => {
                        resetCompanyFilters[company] = false
                      })
                      setCompanyFilters(resetCompanyFilters)

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
          <Button
            variant="destructive"
            onClick={handleDeleteSelected}
            disabled={selectedRows.length === 0 || isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedRows.length})
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            {/* Update the card title */}
            <CardTitle>{getSalesTerm(client?.name)} Items</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              {/* Update the search placeholder */}
              <Input
                placeholder={`Search ${getSalesTerm(client?.name).toLowerCase()}s...`}
                className="pl-8 h-8 w-[200px] lg:w-[300px]"
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Update the DataTable component call to use the columns variable */}
          <DataTable columns={columns} data={filteredData} onRowSelectionChange={handleRowSelectionChange} />
        </CardContent>
      </Card>
    </div>
  )
}
