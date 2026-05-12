// features/inventory/components/add-inventory-button.tsx

"use client"

import { useMemo, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"

import { Loader2, PackagePlus } from "lucide-react"

import { useForm } from "react-hook-form"

import { toast } from "sonner"

import { z } from "zod"

import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Textarea } from "@/components/ui/textarea"

import { useInventoryContext } from "../context/inventory-provider"

import { inventorySchema } from "../schema/inventory.schema"

type InventoryFormData = z.infer<typeof inventorySchema>

export function AddInventoryButton() {
  const [open, setOpen] = useState(false)

  const { createInventory, creating } = useInventoryContext()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),

    defaultValues: {
      product: "",
      category: "",
      unit: "",
      minimumQuantity: 0,
      maximumQuantity: 0,
      reorderQuantity: 0,
      stock: 0,
      pricePerUnit: 0,
      value: 0,
      location: "",
      productType: "Raw",
      openingStock: 0,
    },
  })

  const stock = watch("stock")

  const pricePerUnit = watch("pricePerUnit")

  const calculatedValue = useMemo(() => {
    return Number(stock || 0) * Number(pricePerUnit || 0)
  }, [stock, pricePerUnit])

  const onSubmit = async (data: InventoryFormData) => {
    try {
      const payload = {
        ...data,

        value: calculatedValue,

        timestamp: new Date().toISOString(),
      }

      const success = await createInventory(payload)

      if (!success) return

      toast.success("Inventory product added successfully")

      reset()

      setOpen(false)
    } catch (error) {
      console.error(error)

      toast.error("Failed to add inventory product")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 gap-2 rounded-xl">
          <PackagePlus className="h-4 w-4" />
          Add Inventory
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Add Inventory Product
          </DialogTitle>

          <DialogDescription>
            Create a new inventory item and configure stock thresholds, pricing,
            and storage details.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit, () => {
            toast.error("Please complete all required fields")
          })}
          className="space-y-8"
        >
          {/* PRODUCT DETAILS */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Product Details</h3>

              <p className="text-sm text-muted-foreground">
                Basic inventory product information.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Product Name</Label>

                <Input
                  placeholder="Steel Pipe"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("product")}
                />

                {errors.product && (
                  <p className="text-sm text-destructive">
                    {errors.product.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Category</Label>

                <Input
                  placeholder="Construction Material"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("category")}
                />

                {errors.category && (
                  <p className="text-sm text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Product Type</Label>

                <Select
                  defaultValue="Raw"
                  onValueChange={(value) =>
                    setValue("productType", value as "Raw" | "Finished")
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Raw">Raw Material</SelectItem>

                    <SelectItem value="Finished">Finished Product</SelectItem>
                  </SelectContent>
                </Select>

                {errors.productType && (
                  <p className="text-sm text-destructive">
                    {errors.productType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Unit</Label>

                <Input
                  placeholder="Kg / PCS / Box"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("unit")}
                />

                <p className="text-xs text-muted-foreground">
                  Define inventory measurement unit.
                </p>

                {errors.unit && (
                  <p className="text-sm text-destructive">
                    {errors.unit.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* STOCK CONFIG */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Stock Configuration</h3>

              <p className="text-sm text-muted-foreground">
                Configure operational inventory thresholds.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Opening Stock</Label>

                <Input
                  type="number"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("openingStock", {
                    valueAsNumber: true,
                  })}
                />

                {errors.openingStock && (
                  <p className="text-sm text-destructive">
                    {errors.openingStock.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Current Stock</Label>

                <Input
                  type="number"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("stock", {
                    valueAsNumber: true,
                  })}
                />

                {errors.stock && (
                  <p className="text-sm text-destructive">
                    {errors.stock.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Minimum Quantity</Label>

                <Input
                  type="number"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("minimumQuantity", {
                    valueAsNumber: true,
                  })}
                />

                {errors.minimumQuantity && (
                  <p className="text-sm text-destructive">
                    {errors.minimumQuantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Maximum Quantity</Label>

                <Input
                  type="number"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("maximumQuantity", {
                    valueAsNumber: true,
                  })}
                />

                {errors.maximumQuantity && (
                  <p className="text-sm text-destructive">
                    {errors.maximumQuantity.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Reorder Quantity</Label>

                <Input
                  type="number"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("reorderQuantity", {
                    valueAsNumber: true,
                  })}
                />

                <p className="text-xs text-muted-foreground">
                  Quantity to reorder automatically when stock becomes low.
                </p>

                {errors.reorderQuantity && (
                  <p className="text-sm text-destructive">
                    {errors.reorderQuantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Storage Location</Label>

                <Input
                  placeholder="Warehouse A - Rack 3"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("location")}
                />

                {errors.location && (
                  <p className="text-sm text-destructive">
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* PRICING */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Pricing</h3>

              <p className="text-sm text-muted-foreground">
                Inventory valuation and pricing details.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Price Per Unit</Label>

                <Input
                  type="number"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("pricePerUnit", {
                    valueAsNumber: true,
                  })}
                />

                {errors.pricePerUnit && (
                  <p className="text-sm text-destructive">
                    {errors.pricePerUnit.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Inventory Value</Label>

                <Input
                  disabled
                  value={calculatedValue}
                  className="h-11 rounded-xl bg-muted/30 font-medium"
                />

                <p className="text-xs text-muted-foreground">
                  Auto-calculated using stock × unit price.
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <DialogFooter>
            <Button
              type="submit"
              disabled={creating}
              className="h-11 min-w-[200px] rounded-xl"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Inventory...
                </>
              ) : (
                "Create Inventory Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
