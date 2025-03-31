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
import { useClientContext } from "@/context/client-context"

export default function SettingsPage() {
  const { client } = useClientContext()
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

  // Move the fetchData function outside of useEffect so we can call it after adding a product

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch inventory data
      const inventoryResponse = await fetch(`/api/sheets?sheet=Inventory${client?.id ? `&clientId=${client.id}` : ""}`)
      const inventoryResult = await inventoryResponse.json()

      if (inventoryResult.data && Array.isArray(inventoryResult.data)) {
        console.log("Raw inventory data:", inventoryResult.data)

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

        console.log("Processed inventory data:", processedData)
        setInventoryData(processedData)

        // Create options for searchable select
        const options = processedData
          .filter((item) => item.product && typeof item.product === "string")
          .map((item: InventoryItem) => ({
            value: item.product,
            label: item.product,
          }))

        console.log("Product options:", options)
        setProductOptions(options)
      } else {
        console.error("Invalid data format received:", inventoryResult)
        toast.error("Failed to load inventory data: Invalid format")
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

  const handleProductSelect = (value: string) => {
    console.log("Selected product:", value)
    setSelectedProduct(value)

    // Find the selected product in inventory data
    const product = inventoryData.find((item) => item.product === value)

    if (product) {
      setProductForm({
        product: product.product,
        category: product.category,
        unit: product.unit,
        minimumQuantity: product.minimumQuantity.toString(),
        maximumQuantity: product.maximumQuantity.toString(),
        reorderQuantity: product.reorderQuantity.toString(),
        pricePerUnit: product.pricePerUnit.toString(),
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
      !productForm.pricePerUnit
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      toast.loading("Updating product...")

      // Find the original product to get its srNo
      const originalProduct = inventoryData.find((item) => item.product === selectedProduct)

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
        stock: originalProduct.stock, // Keep the current stock
        pricePerUnit: Number(productForm.pricePerUnit),
        value: originalProduct.stock * Number(productForm.pricePerUnit), // Recalculate value
      }

      // Make API call to update the product in Google Sheets
      const response = await fetch("/api/sheets/update-product", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalProduct: selectedProduct,
          updatedProduct,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update product")
      }

      toast.dismiss()
      toast.success("Product updated successfully")

      // Redirect to inventory page after successful update
      router.push("/dashboard/inventory")
    } catch (error) {
      console.error("Error updating product:", error)
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : "Failed to update product")
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()

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
      toast.error("Please fill in all required fields")
      return
    }

    // Check if product already exists
    const productExists = inventoryData.some(
      (item) => item.product.toLowerCase() === newProductForm.product.toLowerCase(),
    )

    if (productExists) {
      toast.error("Product already exists")
      return
    }

    try {
      // Show loading state
      toast.loading("Adding product...")

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
      const response = await fetch(`/api/sheets?sheet=Inventory${client?.id ? `&clientId=${client.id}` : ""}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sheetName: "Inventory",
          entry: newProduct,
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
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
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
                          onValueChange={handleProductSelect}
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
                        <Input
                          id="category"
                          name="category"
                          value={productForm.category}
                          onChange={handleProductFormChange}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit" className="text-right">
                          Unit
                        </Label>
                        <Input
                          id="unit"
                          name="unit"
                          value={productForm.unit}
                          onChange={handleProductFormChange}
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
                    </>
                  )}
                </div>

                {selectedProduct && (
                  <div className="flex justify-end mt-6">
                    <Button type="submit">Update Product</Button>
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
                    <Input
                      id="newCategory"
                      name="category"
                      value={newProductForm.category}
                      onChange={handleNewProductFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newUnit" className="text-right">
                      Unit
                    </Label>
                    <Input
                      id="newUnit"
                      name="unit"
                      value={newProductForm.unit}
                      onChange={handleNewProductFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newMinimumQuantity" className="text-right">
                      Minimum Quantity
                    </Label>
                    <Input
                      id="newMinimumQuantity"
                      name="minimumQuantity"
                      type="number"
                      value={newProductForm.minimumQuantity}
                      onChange={handleNewProductFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newMaximumQuantity" className="text-right">
                      Maximum Quantity
                    </Label>
                    <Input
                      id="newMaximumQuantity"
                      name="maximumQuantity"
                      type="number"
                      value={newProductForm.maximumQuantity}
                      onChange={handleNewProductFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newReorderQuantity" className="text-right">
                      Reorder Quantity
                    </Label>
                    <Input
                      id="newReorderQuantity"
                      name="reorderQuantity"
                      type="number"
                      value={newProductForm.reorderQuantity}
                      onChange={handleNewProductFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newPricePerUnit" className="text-right">
                      Price Per Unit
                    </Label>
                    <Input
                      id="newPricePerUnit"
                      name="pricePerUnit"
                      type="number"
                      value={newProductForm.pricePerUnit}
                      onChange={handleNewProductFormChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newInitialStock" className="text-right">
                      Initial Stock
                    </Label>
                    <Input
                      id="newInitialStock"
                      name="initialStock"
                      type="number"
                      value={newProductForm.initialStock}
                      onChange={handleNewProductFormChange}
                      className="col-span-3"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button type="submit">Add Product</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

