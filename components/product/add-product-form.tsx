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
import { CategoryUnitSelector } from "./category-unit-selector"

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewProductForm {
    product: string
    category: string
    unit: string
    initialStock: string
    minimumQuantity: string
    maximumQuantity: string
    reorderQuantity: string
    pricePerUnit: string
    productType: "Raw" | "Finished"
    location?: string
}

interface AddProductFormProps {
    inventoryData: InventoryItem[]
    categories: string[]
    units: string[]
    onCategoryAdded: (category: string) => void
    onUnitAdded: (unit: string) => void
    clientId?: string
}

const EMPTY_FORM: NewProductForm = {
    product: "",
    category: "",
    unit: "",
    initialStock: "",
    minimumQuantity: "",
    maximumQuantity: "",
    reorderQuantity: "",
    pricePerUnit: "",
    productType: "Raw",
    location: "",
}

const REQUIRED_FIELDS: (keyof NewProductForm)[] = [
    "product",
    "category",
    "unit",
    "minimumQuantity",
    "maximumQuantity",
    "reorderQuantity",
    "pricePerUnit",
]

const FIELD_LABELS: Record<keyof NewProductForm, string> = {
    product: "Product Name",
    category: "Category",
    unit: "Unit",
    initialStock: "Initial Stock",
    minimumQuantity: "Minimum Quantity",
    maximumQuantity: "Maximum Quantity",
    reorderQuantity: "Reorder Quantity",
    pricePerUnit: "Price Per Unit",
    productType: "Product Type",
    location: "Location",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalize = (val: any) =>
    String(val ?? "").toLowerCase().trim()

const toNumber = (val: string) => {
    const num = Number(val)
    return isNaN(num) ? 0 : num
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AddProductForm({
    inventoryData,
    categories,
    units,
    onCategoryAdded,
    onUnitAdded,
    clientId,
}: AddProductFormProps) {
    const router = useRouter()
    const [form, setForm] = useState<NewProductForm>(EMPTY_FORM)
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // ─── Required Field Validation ───
        const missingFields = REQUIRED_FIELDS.filter(
            (field) => !String(form[field]).trim()
        ).map((field) => FIELD_LABELS[field])

        if (missingFields.length > 0) {
            toast.error(`Please fill in: ${missingFields.join(", ")}`)
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

        // ─── Duplicate Check ───
        const productExists = inventoryData.some(
            (item) => normalize(item.product) === normalize(form.product)
        )

        if (productExists) {
            toast.error("A product with this name already exists")
            return
        }

        try {
            setLoading(true)
            toast.loading("Adding product...")

            const stock = form.initialStock ? toNumber(form.initialStock) : 0
            const price = toNumber(form.pricePerUnit)

            const newProduct = {
                product: form.product.trim(),
                category: form.category,
                unit: form.unit,
                minimumQuantity: toNumber(form.minimumQuantity),
                maximumQuantity: toNumber(form.maximumQuantity),
                reorderQuantity: toNumber(form.reorderQuantity),
                stock,
                pricePerUnit: price,
                value: stock * price,
                productType: form.productType,
                location: form.location?.trim() || undefined,
            }

            const response = await fetch("/api/sheets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sheetName: "Inventory",
                    entry: newProduct,
                    clientId,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to add product")
            }

            toast.dismiss()
            toast.success("Product added successfully")
            router.push("/dashboard/inventory")
        } catch (error: any) {
            toast.dismiss()
            toast.error(
                error instanceof Error ? error.message : "Failed to add product"
            )
        } finally {
            setLoading(false)
        }
    }

    const numericFields: { id: keyof NewProductForm; label: string }[] = [
        { id: "initialStock", label: "Initial Stock" },
        { id: "minimumQuantity", label: "Minimum Quantity" },
        { id: "maximumQuantity", label: "Maximum Quantity" },
        { id: "reorderQuantity", label: "Reorder Quantity" },
        { id: "pricePerUnit", label: "Price Per Unit" },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Product</CardTitle>
                <CardDescription>
                    Add a new product to the inventory.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">

                        {/* Product Name */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="add-product" className="text-right">
                                Product Name
                            </Label>
                            <Input
                                id="add-product"
                                name="product"
                                value={form.product}
                                onChange={handleChange}
                                className="col-span-3"
                                placeholder="Enter product name"
                            />
                        </div>

                        {/* Product Type */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Product Type</Label>
                            <select
                                value={form.productType}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        productType: e.target.value as "Raw" | "Finished",
                                    }))
                                }
                                className="col-span-3 border rounded px-2 py-1"
                            >
                                <option value="Raw">Raw</option>
                                <option value="Finished">Finished</option>
                            </select>
                        </div>

                        {/* Location (Optional) */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="add-location" className="text-right">
                                Location
                            </Label>
                            <Input
                                id="add-location"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                className="col-span-3"
                                placeholder="Enter location of product(optional)"
                            />
                        </div>

                        {/* Category */}
                        <CategoryUnitSelector
                            label="Category"
                            value={form.category}
                            options={categories}
                            onSelect={(v) => setForm((prev) => ({ ...prev, category: v }))}
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
                            onSelect={(v) => setForm((prev) => ({ ...prev, unit: v }))}
                            onAddNew={(v) => {
                                onUnitAdded(v)
                                setForm((prev) => ({ ...prev, unit: v }))
                            }}
                        />

                        {/* Numeric Fields */}
                        {numericFields.map(({ id, label }) => (
                            <div
                                key={id}
                                className="grid grid-cols-4 items-center gap-4"
                            >
                                <Label htmlFor={`add-${id}`} className="text-right">
                                    {label}
                                </Label>
                                <Input
                                    id={`add-${id}`}
                                    name={id}
                                    type="number"
                                    value={form[id]}
                                    onChange={handleChange}
                                    className="col-span-3"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end mt-6">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Product"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}