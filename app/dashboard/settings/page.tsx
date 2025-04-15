"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { InventoryItem } from "@/lib/types"
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useClientContext } from "@/context/client-context"

export default function SettingsPage() {
  const router = useRouter()
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState("")
  const [productOptions, setProductOptions] = useState<SearchableSelectOption[]>([])
  const [productForm, setProductForm] = useState({
    product: "",
    category: "",
    unit: "",
    minimumQuantity: "",
    maximumQuantity: "",
    reorderQuantity: "",
    pricePerUnit: "",
    stock: "", // Add this line to include stock in the form state
  })
  const [newProductForm, setNewProductForm] = useState({
    product: "",
    category: "",
    unit: "",
    minimumQuantity: "",
    maximumQuantity: "",
    reorderQuantity: "",
    pricePerUnit: "",
    initialStock: "", // Add this new field
  })

  const [categories, setCategories] = useState<string[]>([])
  const [units, setUnits] = useState<string[]>([])
  const [openCategory, setOpenCategory] = useState(false)
  const [openUnit, setOpenUnit] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [newUnit, setNewUnit] = useState("")
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false)
  const [isAddingNewUnit, setIsAddingNewUnit] = useState(false)
  const [categorySearchQuery, setCategorySearchQuery] = useState("")
  const [unitSearchQuery, setUnitSearchQuery] = useState("")
  // Add a new state variable for tracking update loading state
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const { client } = useClientContext()

  // Move the fetchData function outside of useEffect so we can call it after adding a product
  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch inventory data
      const inventoryResponse = await fetch(`/api/sheets?sheet=Inventory&clientId=${client?.id}`)
      if (!inventoryResponse.ok) {
        const errorData = await inventoryResponse.json()
        console.error("Inventory API error:", errorData)
        throw new Error(`Inventory API error: ${errorData.error || "Unknown error"}`)
      }
      const inventoryResult = await inventoryResponse.json()

      if (inventoryResult.data && Array.isArray(inventoryResult.data)) {
        // Map the field names from Google Sheets to our expected field names
        const processedData = inventoryResult.data.map((item: any, index: number) => {
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

        setInventoryData(processedData)

        // Create options for searchable select - don't filter out any products
        const options = processedData.map((item: InventoryItem, index) => {
          // More robust handling of product names
          let productName = "Unnamed Product"

          // Check for product name in various formats
          if (item.product !== undefined && item.product !== null) {
            // Convert to string regardless of original type
            productName = String(item.product).trim()
          } else if (item["Product"] !== undefined && item["Product"] !== null) {
            // Try alternative property name with capital P
            productName = String(item["Product"]).trim()
          }

          // If after all checks we have an empty string, use "Unnamed Product"
          if (productName === "") {
            productName = "Unnamed Product"
          }

          // Log any items that still end up as "Unnamed Product" for debugging
          if (productName === "Unnamed Product") {
            console.log(`Item at index ${index} has no valid product name:`, item)
          }

          // Create a truly unique value using the array index only
          return {
            value: `${index}`, // Just use the index as the value
            label: productName, // Show the product name as the label
          }
        })

        setProductOptions(options)

        // Add console log to show number of items in the dropdown and inventory
        console.log(`Inventory data has ${processedData.length} items, dropdown has ${options.length} options`)
        console.log(`Any missing items: ${processedData.length - options.length}`)

        if (processedData.length > 0) {
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(
              processedData
                .filter((item) => item.category && typeof item.category === "string")
                .map((item) => item.category),
            ),
          ).sort()

          // Extract unique units
          const uniqueUnits = Array.from(
            new Set(
              processedData.filter((item) => item.unit && typeof item.unit === "string").map((item) => item.unit),
            ),
          ).sort()

          setCategories(uniqueCategories)
          setUnits(uniqueUnits)
        }
      } else {
        console.error("Invalid data format received:", inventoryResult)
        toast.error("Failed to load inventory data: Invalid format")
      }
    } catch (error) {
      console.error("Error fetching settings data:", error)
      toast.error("Failed to fetch settings data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (client?.id) {
      fetchData()
    } else {
      console.warn("Settings: No client ID available")
      setLoading(false) // Stop loading if no client ID
    }
  }, [client?.id])

  // Add a useEffect to log when productOptions changes
  useEffect(() => {
    console.log(`Product dropdown updated: ${productOptions.length} items available`)
  }, [productOptions])

  const handleProductSelect = (value: string) => {
    console.log("Selected product:", value)
    // The value is now just the index
    const index = Number.parseInt(value, 10)
    setSelectedProduct(value)

    // Find the selected product in inventory data using the index
    const product = inventoryData[index]

    if (product) {
      // Log the raw product data to see what's actually in there
      console.log("Raw product data:", product)
      console.log("Product name type:", typeof product.product)

      // Get the product name, ensuring it's a string
      const productName =
        product.product !== undefined && product.product !== null ? String(product.product).trim() : ""

      setProductForm({
        product: productName,
        category: product.category,
        unit: product.unit,
        minimumQuantity: product.minimumQuantity.toString(),
        maximumQuantity: product.maximumQuantity.toString(),
        reorderQuantity: product.reorderQuantity.toString(),
        pricePerUnit: product.pricePerUnit.toString(),
        stock: product.stock.toString(),
      })
    }
  }

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNewProductFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewProductForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const toggleAddNewCategory = () => {
    setIsAddingNewCategory(!isAddingNewCategory)
    if (!isAddingNewCategory) {
      // Switching to add new category mode - clear category
      if (selectedProduct) {
        setProductForm((prev) => ({ ...prev, category: "" }))
      } else {
        setNewProductForm((prev) => ({ ...prev, category: "" }))
      }
      setNewCategory("")
    } else {
      // Switching back to select category mode - clear new category
      setNewCategory("")
    }
  }

  const toggleAddNewUnit = () => {
    setIsAddingNewUnit(!isAddingNewUnit)
    if (!isAddingNewUnit) {
      // Switching to add new unit mode - clear unit
      if (selectedProduct) {
        setProductForm((prev) => ({ ...prev, unit: "" }))
      } else {
        setNewProductForm((prev) => ({ ...prev, unit: "" }))
      }
      setNewUnit("")
    } else {
      // Switching back to select unit mode - clear new unit
      setNewUnit("")
    }
  }

  // Update the handleAddNewCategory function to properly save the new category
  const handleAddNewCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory].sort())

      // Update the form with the new category
      if (selectedProduct) {
        setProductForm((prev) => ({ ...prev, category: newCategory }))
      } else {
        setNewProductForm((prev) => ({ ...prev, category: newCategory }))
      }

      // Important: Add this to save the category to the form state immediately
      if (!selectedProduct) {
        console.log("Setting new category:", newCategory)
      }

      setIsAddingNewCategory(false)
      setNewCategory("")
    } else if (newCategory) {
      // If the category already exists, just use it
      if (selectedProduct) {
        setProductForm((prev) => ({ ...prev, category: newCategory }))
      } else {
        setNewProductForm((prev) => ({ ...prev, category: newCategory }))
      }
      setIsAddingNewCategory(false)
      setNewCategory("")
    }
  }

  // Update the handleAddNewUnit function to properly save the new unit
  const handleAddNewUnit = () => {
    if (newUnit && !units.includes(newUnit)) {
      setUnits((prev) => [...prev, newUnit].sort())

      // Update the form with the new unit
      if (selectedProduct) {
        setProductForm((prev) => ({ ...prev, unit: newUnit }))
      } else {
        setNewProductForm((prev) => ({ ...prev, unit: newUnit }))
      }

      // Important: Add this to save the unit to the form state immediately
      if (!selectedProduct) {
        console.log("Setting new unit:", newUnit)
      }

      setIsAddingNewUnit(false)
      setNewUnit("")
    } else if (newUnit) {
      // If the unit already exists, just use it
      if (selectedProduct) {
        setProductForm((prev) => ({ ...prev, unit: newUnit }))
      } else {
        setNewProductForm((prev) => ({ ...prev, unit: newUnit }))
      }
      setIsAddingNewUnit(false)
      setNewUnit("")
    }
  }

  // Add a key press handler for the new category input
  const handleNewCategoryKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddNewCategory()
    }
  }

  // Add a key press handler for the new unit input
  const handleNewUnitKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddNewUnit()
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(categorySearchQuery.toLowerCase()),
  )

  const filteredUnits = units.filter((unit) => unit.toLowerCase().includes(unitSearchQuery.toLowerCase()))

  // Update the handleUpdateProduct function to use the loading state
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form data
    if (
      !productForm.product ||
      !productForm.category ||
      !productForm.unit ||
      !productForm.minimumQuantity ||
      !productForm.maximumQuantity ||
      !productForm.reorderQuantity ||
      !productForm.pricePerUnit ||
      !productForm.stock
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsUpdating(true)
      toast.loading("Updating product...")

      // The selectedProduct value is now just the index
      const index = Number.parseInt(selectedProduct, 10)

      // Get the original product using the index
      const originalProduct = inventoryData[index]

      if (!originalProduct) {
        throw new Error("Product not found")
      }

      // Create updated product object
      const updatedProduct = {
        srNo: originalProduct.srNo,
        product: productForm.product,
        category: productForm.category,
        unit: productForm.unit,
        minimumQuantity: Number(productForm.minimumQuantity),
        maximumQuantity: Number(productForm.maximumQuantity),
        reorderQuantity: Number(productForm.reorderQuantity),
        stock: Number(productForm.stock),
        pricePerUnit: Number(productForm.pricePerUnit),
        value: Number(productForm.stock) * Number(productForm.pricePerUnit),
      }

      console.log("Updated product:", updatedProduct)
      console.log("API request payload:", {
        product: originalProduct.product, // Use the original product name
        updatedData: updatedProduct,
        clientId: client?.id,
      })

      // Make API call to update the product in Google Sheets
      const response = await fetch("/api/sheets/update-product", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: originalProduct.product, // Use the original product name
          updatedData: updatedProduct,
          clientId: client?.id,
        }),
      })

      // Log the raw response
      const responseText = await response.text()
      console.log("Raw API response:", responseText)

      // Parse the response
      let responseData
      try {
        responseData = JSON.parse(responseText)
        console.log("Parsed API response:", responseData)
      } catch (error) {
        console.error("Failed to parse response as JSON:", error)
        throw new Error("Invalid response format")
      }

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update product")
      }

      toast.dismiss()
      toast.success("Product updated successfully")

      // Redirect to inventory page after successful update
      router.push("/dashboard/inventory")
    } catch (error) {
      console.error("Error updating product:", error)
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : "Failed to update product")
    } finally {
      setIsUpdating(false)
    }
  }

  // Update the handleAddProduct function to add more debugging
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    // Log the form state for debugging
    console.log("Form state before validation:", {
      product: newProductForm.product,
      category: newProductForm.category,
      unit: newProductForm.unit,
      minimumQuantity: newProductForm.minimumQuantity,
      maximumQuantity: newProductForm.maximumQuantity,
      reorderQuantity: newProductForm.reorderQuantity,
      pricePerUnit: newProductForm.pricePerUnit,
      initialStock: newProductForm.initialStock,
    })

    // Validate form data
    if (
      !newProductForm.product ||
      !newProductForm.category ||
      !newProductForm.unit ||
      !newProductForm.minimumQuantity ||
      !newProductForm.maximumQuantity ||
      !newProductForm.reorderQuantity ||
      !newProductForm.pricePerUnit
    ) {
      // Log which fields are missing
      const missingFields = []
      if (!newProductForm.product) missingFields.push("Product Name")
      if (!newProductForm.category) missingFields.push("Category")
      if (!newProductForm.unit) missingFields.push("Unit")
      if (!newProductForm.minimumQuantity) missingFields.push("Minimum Quantity")
      if (!newProductForm.maximumQuantity) missingFields.push("Maximum Quantity")
      if (!newProductForm.reorderQuantity) missingFields.push("Reorder Quantity")
      if (!newProductForm.pricePerUnit) missingFields.push("Price Per Unit")

      console.log("Missing fields:", missingFields)
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`)
      return
    }

    // Check if product already exists
    const productExists = inventoryData.some(
      (item) =>
        typeof item.product === "string" &&
        typeof newProductForm.product === "string" &&
        item.product.toLowerCase() === newProductForm.product.toLowerCase(),
    )

    if (productExists) {
      toast.error("Product already exists")
      return
    }

    try {
      // Show loading state
      toast.loading("Adding product...")
      setIsLoading(true)

      // Create new product
      const newProduct = {
        // Don't include srNo here, it will be assigned by the server
        product: newProductForm.product,
        category: newProductForm.category,
        unit: newProductForm.unit,
        minimumQuantity: Number(newProductForm.minimumQuantity),
        maximumQuantity: Number(newProductForm.maximumQuantity),
        reorderQuantity: Number(newProductForm.reorderQuantity),
        stock: Number(newProductForm.initialStock) || 0, // Use initialStock or default to 0
        pricePerUnit: Number(newProductForm.pricePerUnit),
        value: Number(newProductForm.initialStock || 0) * Number(newProductForm.pricePerUnit), // Calculate value based on initialStock
      }

      // Make API call to add the product to Google Sheets
      const response = await fetch("/api/sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sheetName: "Inventory",
          entry: newProduct,
          clientId: client?.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add product")
      }

      const result = await response.json()
      console.log("API response:", result)

      toast.dismiss()
      toast.success("Product added successfully")

      // Redirect to inventory page after successful addition
      router.push("/dashboard/inventory")
    } catch (error) {
      console.error("Error adding product:", error)
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : "Failed to add product")
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">No client selected. Please select a client to view settings.</p>
      </div>
    )
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
          <Card>
            <CardHeader>
              <CardTitle>Edit Product</CardTitle>
              <CardDescription>Update the details of an existing product.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProduct}>
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="selectProduct" className="text-right">
                      Select Product
                    </Label>
                    <div className="col-span-3">
                      {productOptions.length > 0 ? (
                        <SearchableSelect
                          options={productOptions}
                          value={selectedProduct}
                          onValueChange={(value) => {
                            console.log(`Selected product from dropdown (${productOptions.length} total options)`)
                            handleProductSelect(value)
                          }}
                          placeholder="Search for a product..."
                          emptyMessage="No products found."
                        />
                      ) : (
                        <div className="text-muted-foreground">No products available</div>
                      )}
                    </div>
                  </div>

                  {selectedProduct && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="product" className="text-right">
                          Product Name
                        </Label>
                        <Input
                          id="product"
                          name="product"
                          value={productForm.product}
                          onChange={handleProductFormChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                          Category
                        </Label>
                        <div className="col-span-3 space-y-2">
                          {isAddingNewCategory ? (
                            <div className="flex gap-2">
                              <Input
                                id="newCategory"
                                placeholder="Enter new category name"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyPress={handleNewCategoryKeyPress}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={toggleAddNewCategory}
                                className="h-10 w-10"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button type="button" onClick={handleAddNewCategory} className="h-10">
                                Add
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Popover open={openCategory} onOpenChange={setOpenCategory}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCategory}
                                    className="w-full justify-between"
                                  >
                                    {productForm.category || "Select category..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <div className="flex flex-col">
                                    <div className="flex items-center border-b p-2">
                                      <Input
                                        placeholder="Search category..."
                                        value={categorySearchQuery}
                                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                                        className="flex h-8 w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                      />
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                      {filteredCategories.length > 0 ? (
                                        <div className="flex flex-col py-1">
                                          {filteredCategories.map((category) => (
                                            <div
                                              key={category}
                                              className={cn(
                                                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                productForm.category === category && "bg-accent text-accent-foreground",
                                              )}
                                              onClick={() => {
                                                setProductForm((prev) => ({ ...prev, category }))
                                                setOpenCategory(false)
                                                setCategorySearchQuery("")
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  productForm.category === category ? "opacity-100" : "opacity-0",
                                                )}
                                              />
                                              {category}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                          No categories found.
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <Button
                                type="button"
                                variant="link"
                                className="h-auto p-0 text-xs flex items-center"
                                onClick={toggleAddNewCategory}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add New Category
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit" className="text-right">
                          Unit
                        </Label>
                        <div className="col-span-3 space-y-2">
                          {isAddingNewUnit ? (
                            <div className="flex gap-2">
                              <Input
                                id="newUnit"
                                placeholder="Enter new unit name"
                                value={newUnit}
                                onChange={(e) => setNewUnit(e.target.value)}
                                onKeyPress={handleNewUnitKeyPress}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={toggleAddNewUnit}
                                className="h-10 w-10"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button type="button" onClick={handleAddNewUnit} className="h-10">
                                Add
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Popover open={openUnit} onOpenChange={setOpenUnit}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openUnit}
                                    className="w-full justify-between"
                                  >
                                    {productForm.unit || "Select unit..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <div className="flex flex-col">
                                    <div className="flex items-center border-b p-2">
                                      <Input
                                        placeholder="Search unit..."
                                        value={unitSearchQuery}
                                        onChange={(e) => setUnitSearchQuery(e.target.value)}
                                        className="flex h-8 w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                      />
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                      {filteredUnits.length > 0 ? (
                                        <div className="flex flex-col py-1">
                                          {filteredUnits.map((unit) => (
                                            <div
                                              key={unit}
                                              className={cn(
                                                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                productForm.unit === unit && "bg-accent text-accent-foreground",
                                              )}
                                              onClick={() => {
                                                setProductForm((prev) => ({ ...prev, unit }))
                                                setOpenUnit(false)
                                                setUnitSearchQuery("")
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  productForm.unit === unit ? "opacity-100" : "opacity-0",
                                                )}
                                              />
                                              {unit}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                          No units found.
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <Button
                                type="button"
                                variant="link"
                                className="h-auto p-0 text-xs flex items-center"
                                onClick={toggleAddNewUnit}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add New Unit
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="minimumQuantity" className="text-right">
                          Minimum Quantity
                        </Label>
                        <Input
                          id="minimumQuantity"
                          name="minimumQuantity"
                          type="number"
                          value={productForm.minimumQuantity}
                          onChange={handleProductFormChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="maximumQuantity" className="text-right">
                          Maximum Quantity
                        </Label>
                        <Input
                          id="maximumQuantity"
                          name="maximumQuantity"
                          type="number"
                          value={productForm.maximumQuantity}
                          onChange={handleProductFormChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reorderQuantity" className="text-right">
                          Reorder Quantity
                        </Label>
                        <Input
                          id="reorderQuantity"
                          name="reorderQuantity"
                          type="number"
                          value={productForm.reorderQuantity}
                          onChange={handleProductFormChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pricePerUnit" className="text-right">
                          Price Per Unit
                        </Label>
                        <Input
                          id="pricePerUnit"
                          name="pricePerUnit"
                          type="number"
                          value={productForm.pricePerUnit}
                          onChange={handleProductFormChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stock" className="text-right">
                          Current Stock
                        </Label>
                        <Input
                          id="stock"
                          name="stock"
                          type="number"
                          value={productForm.stock}
                          onChange={handleProductFormChange}
                          className="col-span-3"
                        />
                      </div>
                    </>
                  )}
                </div>

                {selectedProduct && (
                  <div className="flex justify-end mt-6">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          Updating...
                        </>
                      ) : (
                        "Update Product"
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-product">
          <Card>
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
              <CardDescription>Add a new product to the inventory.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct}>
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newProduct" className="text-right">
                      Product Name
                    </Label>
                    <Input
                      id="newProduct"
                      name="product"
                      value={newProductForm.product}
                      onChange={handleNewProductFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newCategory" className="text-right">
                      Category
                    </Label>
                    <div className="col-span-3 space-y-2">
                      {isAddingNewCategory ? (
                        <div className="flex gap-2">
                          <Input
                            id="newCategory"
                            placeholder="Enter new category name"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyPress={handleNewCategoryKeyPress}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={toggleAddNewCategory}
                            className="h-10 w-10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button type="button" onClick={handleAddNewCategory} className="h-10">
                            Add
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Popover open={openCategory} onOpenChange={setOpenCategory}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openCategory}
                                className="w-full justify-between"
                              >
                                {newProductForm.category || "Select category..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <div className="flex flex-col">
                                <div className="flex items-center border-b p-2">
                                  <Input
                                    placeholder="Search category..."
                                    value={categorySearchQuery}
                                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                                    className="flex h-8 w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                  />
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                  {filteredCategories.length > 0 ? (
                                    <div className="flex flex-col py-1">
                                      {filteredCategories.map((category) => (
                                        <div
                                          key={category}
                                          className={cn(
                                            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                            newProductForm.category === category && "bg-accent text-accent-foreground",
                                          )}
                                          onClick={() => {
                                            setNewProductForm((prev) => ({ ...prev, category }))
                                            setOpenCategory(false)
                                            setCategorySearchQuery("")
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              newProductForm.category === category ? "opacity-100" : "opacity-0",
                                            )}
                                          />
                                          {category}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                      No categories found.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-xs flex items-center"
                            onClick={toggleAddNewCategory}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add New Category
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newUnit" className="text-right">
                      Unit
                    </Label>
                    <div className="col-span-3 space-y-2">
                      {isAddingNewUnit ? (
                        <div className="flex gap-2">
                          <Input
                            id="newUnit"
                            placeholder="Enter new unit name"
                            value={newUnit}
                            onChange={(e) => setNewUnit(e.target.value)}
                            onKeyPress={handleNewUnitKeyPress}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={toggleAddNewUnit}
                            className="h-10 w-10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button type="button" onClick={handleAddNewUnit} className="h-10">
                            Add
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Popover open={openUnit} onOpenChange={setOpenUnit}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openUnit}
                                className="w-full justify-between"
                              >
                                {newProductForm.unit || "Select unit..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <div className="flex flex-col">
                                <div className="flex items-center border-b p-2">
                                  <Input
                                    placeholder="Search unit..."
                                    value={unitSearchQuery}
                                    onChange={(e) => setUnitSearchQuery(e.target.value)}
                                    className="flex h-8 w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                  />
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                  {filteredUnits.length > 0 ? (
                                    <div className="flex flex-col py-1">
                                      {filteredUnits.map((unit) => (
                                        <div
                                          key={unit}
                                          className={cn(
                                            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                            newProductForm.unit === unit && "bg-accent text-accent-foreground",
                                          )}
                                          onClick={() => {
                                            setNewProductForm((prev) => ({ ...prev, unit }))
                                            setOpenUnit(false)
                                            setUnitSearchQuery("")
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              newProductForm.unit === unit ? "opacity-100" : "opacity-0",
                                            )}
                                          />
                                          {unit}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                      No units found.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-xs flex items-center"
                            onClick={toggleAddNewUnit}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add New Unit
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="initialStock" className="text-right">
                      Initial Stock
                    </Label>
                    <Input
                      id="initialStock"
                      name="initialStock"
                      type="number"
                      value={newProductForm.initialStock}
                      onChange={handleNewProductFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="minimumQuantity" className="text-right">
                      Minimum Quantity
                    </Label>
                    <Input
                      id="minimumQuantity"
                      name="minimumQuantity"
                      type="number"
                      value={newProductForm.minimumQuantity}
                      onChange={handleNewProductFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="maximumQuantity" className="text-right">
                      Maximum Quantity
                    </Label>
                    <Input
                      id="maximumQuantity"
                      name="maximumQuantity"
                      type="number"
                      value={newProductForm.maximumQuantity}
                      onChange={handleNewProductFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reorderQuantity" className="text-right">
                      Reorder Quantity
                    </Label>
                    <Input
                      id="reorderQuantity"
                      name="reorderQuantity"
                      type="number"
                      value={newProductForm.reorderQuantity}
                      onChange={handleNewProductFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pricePerUnit" className="text-right">
                      Price Per Unit
                    </Label>
                    <Input
                      id="pricePerUnit"
                      name="pricePerUnit"
                      type="number"
                      value={newProductForm.pricePerUnit}
                      onChange={handleNewProductFormChange}
                      className="col-span-3"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Adding...
                      </>
                    ) : (
                      "Add Product"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
