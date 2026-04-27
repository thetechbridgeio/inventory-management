"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import type { InventoryItem } from "@/lib/types"
import {
    SearchableSelect,
    type SearchableSelectOption,
} from "@/components/ui/searchable-select"
import { CategoryUnitSelector } from "./category-unit-selector"
import { SimpleSelect, SimpleSelectItem } from "../ui/select"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductForm {
    product: string
    category: string
    unit: string
    minimumQuantity: string
    maximumQuantity: string
    reorderQuantity: string
    pricePerUnit: string
    productType: "Raw" | "Finished"
    location?: string
}

interface EditProductFormProps {
    inventoryData: InventoryItem[]
    productOptions: SearchableSelectOption[]
    categories: string[]
    units: string[]
    onCategoryAdded: (category: string) => void
    onUnitAdded: (unit: string) => void
    clientId?: string
}

const EMPTY_FORM: ProductForm = {
    product: "",
    category: "",
    unit: "",
    minimumQuantity: "",
    maximumQuantity: "",
    reorderQuantity: "",
    pricePerUnit: "",
    productType: "Raw",
    location: "",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalize = (val: any) =>
    String(val ?? "").toLowerCase().trim()

const toNumber = (val: string) => {
    const num = Number(val)
    return isNaN(num) ? 0 : num
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditProductForm({
    inventoryData,
    productOptions,
    categories,
    units,
    onCategoryAdded,
    onUnitAdded,
    clientId,
}: EditProductFormProps) {
    const router = useRouter()

    const [selectedProduct, setSelectedProduct] = useState("")
    const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
    const [loading, setLoading] = useState(false)

    const handleProductSelect = (value: string) => {
        setSelectedProduct(value)

        const product = inventoryData.find(
            (item) => normalize(item.product) === normalize(value)
        )

        if (product) {
            setForm({
                product: product.product,
                category: product.category,
                unit: product.unit,
                minimumQuantity: product.minimumQuantity.toString(),
                maximumQuantity: product.maximumQuantity.toString(),
                reorderQuantity: product.reorderQuantity.toString(),
                pricePerUnit: product.pricePerUnit.toString(),
                productType: product.productType,
                location: product.location ?? "",
            })
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // ─── Required Validation ───
        const requiredFields: (keyof ProductForm)[] = [
            "product",
            "category",
            "unit",
            "minimumQuantity",
            "maximumQuantity",
            "reorderQuantity",
            "pricePerUnit",
        ]

        const missingFields = requiredFields.filter(
            (field) => !String(form[field]).trim()
        )

        if (missingFields.length > 0) {
            toast.error(`Please fill all required fields`)
            return
        }

        // ─── Logical Validation ───
        if (toNumber(form.minimumQuantity) > toNumber(form.maximumQuantity)) {
            toast.error("Minimum Quantity cannot be greater than Maximum Quantity")
            return
        }

        if (toNumber(form.reorderQuantity) > toNumber(form.maximumQuantity)) {
            toast.error("Reorder Quantity cannot exceed Maximum Quantity")
            return
        }

        if (toNumber(form.pricePerUnit) <= 0) {
            toast.error("Price must be greater than 0")
            return
        }

        const originalProduct = inventoryData.find(
            (item) => normalize(item.product) === normalize(selectedProduct)
        )

        if (!originalProduct) {
            toast.error("Product not found")
            return
        }

        // ─── Duplicate Check (exclude self) ───
        const duplicateExists = inventoryData.some(
            (item) =>
                normalize(item.product) === normalize(form.product) &&
                normalize(item.product) !== normalize(selectedProduct)
        )

        if (duplicateExists) {
            toast.error("Another product with this name already exists")
            return
        }

        try {
            setLoading(true)
            toast.loading("Updating product...")

            const price = toNumber(form.pricePerUnit)

            const updatedProduct = {
                srNo: originalProduct.srNo,
                product: form.product.trim(),
                category: form.category,
                unit: form.unit,
                minimumQuantity: toNumber(form.minimumQuantity),
                maximumQuantity: toNumber(form.maximumQuantity),
                reorderQuantity: toNumber(form.reorderQuantity),
                stock: originalProduct.stock,
                pricePerUnit: price,
                value: originalProduct.stock * price,
                productType: form.productType,
                location: form.location?.trim() || undefined,
            }

            const response = await fetch("/api/sheets/update-product", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalProduct: selectedProduct.trim(),
                    updatedProduct: updatedProduct,
                    clientId,
                }),
            })

            const data = await response.json()
            if (!response.ok)
                throw new Error(data.error || "Failed to update product")

            toast.dismiss()
            toast.success("Product updated successfully")
            router.push("/dashboard/inventory")
        } catch (error: any) {
            toast.dismiss()
            toast.error(
                error instanceof Error ? error.message : "Failed to update product"
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Product</CardTitle>
                <CardDescription>
                    Update the details of an existing product.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">

                        {/* Product Selector */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Select Product</Label>
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
                                    <span className="text-muted-foreground text-sm">
                                        No products available
                                    </span>
                                )}
                            </div>
                        </div>

                        {selectedProduct && (
                            <>
                                {/* Product Name */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Product Name</Label>
                                    <Input
                                        name="product"
                                        value={form.product}
                                        onChange={handleChange}
                                        className="col-span-3"
                                    />
                                </div>

                                {/* Product Type */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Product Type</Label>
                                    <SimpleSelect
                                        value={form.productType}
                                        onValueChange={(value) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                productType: value as "Raw" | "Finished",
                                            }))
                                        }
                                        className="col-span-3"
                                    >
                                        <SimpleSelectItem value="Raw">Raw</SimpleSelectItem>
                                        <SimpleSelectItem value="Finished">
                                            Finished
                                        </SimpleSelectItem>
                                    </SimpleSelect>
                                </div>

                                {/* Location */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Location</Label>
                                    <Input
                                        name="location"
                                        value={form.location}
                                        onChange={handleChange}
                                        className="col-span-3"
                                        placeholder="Optional"
                                    />
                                </div>

                                {/* Category */}
                                <CategoryUnitSelector
                                    label="Category"
                                    value={form.category}
                                    options={categories}
                                    onSelect={(v) =>
                                        setForm((prev) => ({ ...prev, category: v }))
                                    }
                                    onAddNew={(v) => {
                                        onCategoryAdded(v)
                                        setForm((prev) => ({ ...prev, category: v }))
                                    }}
                                />

                                {/* Unit */}
                                <CategoryUnitSelector
                                    label="Unit"
                                    value={form.unit}
                                    options={units}
                                    onSelect={(v) =>
                                        setForm((prev) => ({ ...prev, unit: v }))
                                    }
                                    onAddNew={(v) => {
                                        onUnitAdded(v)
                                        setForm((prev) => ({ ...prev, unit: v }))
                                    }}
                                />

                                {/* Numeric Fields */}
                                {[
                                    { id: "minimumQuantity", label: "Minimum Quantity" },
                                    { id: "maximumQuantity", label: "Maximum Quantity" },
                                    { id: "reorderQuantity", label: "Reorder Quantity" },
                                    { id: "pricePerUnit", label: "Price Per Unit" },
                                ].map(({ id, label }) => (
                                    <div
                                        key={id}
                                        className="grid grid-cols-4 items-center gap-4"
                                    >
                                        <Label className="text-right">{label}</Label>
                                        <Input
                                            name={id}
                                            type="number"
                                            value={form[id as keyof ProductForm]}
                                            onChange={handleChange}
                                            className="col-span-3"
                                        />
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {selectedProduct && (
                        <div className="flex justify-end mt-6">
                            <Button type="submit" disabled={loading}>
                                {loading ? "Updating..." : "Update Product"}
                            </Button>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}