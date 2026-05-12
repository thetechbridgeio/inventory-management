// features/inventory/components/edit-inventory-dialog.tsx

"use client"

import { useEffect, useMemo, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"

import { Loader2, Pencil } from "lucide-react"

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

import { inventorySchema } from "../../schema/inventory.schema"
import { Inventory } from "../../types/inventory.types"
import { useInventoryContext } from "../../context/inventory-provider"

type InventoryFormData = z.infer<typeof inventorySchema>

type Props = {
  inventory: Inventory
}

export function EditInventoryDialog({ inventory }: Props) {
  const [open, setOpen] = useState(false)

  const { updateInventory, updating } = useInventoryContext()

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
      product: inventory.product,

      category: inventory.category,

      unit: inventory.unit,

      minimumQuantity: inventory.minimumQuantity,

      maximumQuantity: inventory.maximumQuantity,

      reorderQuantity: inventory.reorderQuantity,

      stock: inventory.stock,

      pricePerUnit: inventory.pricePerUnit,

      value: inventory.value,

      location: inventory.location || "",

      productType: inventory.productType,

      openingStock: inventory.openingStock || 0,
    },
  })

  useEffect(() => {
    reset({
      product: inventory.product,

      category: inventory.category,

      unit: inventory.unit,

      minimumQuantity: inventory.minimumQuantity,

      maximumQuantity: inventory.maximumQuantity,

      reorderQuantity: inventory.reorderQuantity,

      stock: inventory.stock,

      pricePerUnit: inventory.pricePerUnit,

      value: inventory.value,

      location: inventory.location || "",

      productType: inventory.productType,

      openingStock: inventory.openingStock || 0,
    })
  }, [inventory, reset])

  const stock = watch("stock")

  const pricePerUnit = watch("pricePerUnit")

  const calculatedValue = useMemo(() => {
    return Number(stock || 0) * Number(pricePerUnit || 0)
  }, [stock, pricePerUnit])

  const onSubmit = async (data: InventoryFormData) => {
    try {
      const updatedPayload: Inventory = {
        ...inventory,

        ...data,

        value: calculatedValue,

        timestamp: new Date().toISOString(),
      }

      const success = await updateInventory(inventory, updatedPayload)

      if (!success) {
        return
      }

      toast.success("Inventory updated successfully")

      setOpen(false)
    } catch (error) {
      console.error(error)

      toast.error("Failed to update inventory")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" className="rounded-xl">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Inventory Product
          </DialogTitle>

          <DialogDescription>
            Modify inventory information, stock thresholds, pricing, and storage
            details.
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
                Update inventory product information.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Product Name</Label>

                <Input
                  placeholder="Steel Pipe"
                  className="h-11 rounded-xl"
                  disabled={updating}
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
                  disabled={updating}
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
                  value={watch("productType")}
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
                  disabled={updating}
                  {...register("unit")}
                />

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
                  disabled={updating}
                  {...register("openingStock", {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Current Stock</Label>

                <Input
                  type="number"
                  className="h-11 rounded-xl"
                  disabled={updating}
                  {...register("stock", {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Minimum Quantity</Label>

                <Input
                  type="number"
                  className="h-11 rounded-xl"
                  disabled={updating}
                  {...register("minimumQuantity", {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Maximum Quantity</Label>

                <Input
                  type="number"
                  className="h-11 rounded-xl"
                  disabled={updating}
                  {...register("maximumQuantity", {
                    valueAsNumber: true,
                  })}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Reorder Quantity</Label>

                <Input
                  type="number"
                  className="h-11 rounded-xl"
                  disabled={updating}
                  {...register("reorderQuantity", {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Storage Location</Label>

                <Input
                  placeholder="Warehouse A - Rack 3"
                  className="h-11 rounded-xl"
                  disabled={updating}
                  {...register("location")}
                />
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
                  disabled={updating}
                  {...register("pricePerUnit", {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Inventory Value</Label>

                <Input
                  disabled
                  value={calculatedValue}
                  className="h-11 rounded-xl bg-muted/30 font-medium"
                />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <DialogFooter>
            <Button
              type="submit"
              disabled={updating}
              className="h-11 min-w-[220px] rounded-xl"
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Inventory...
                </>
              ) : (
                "Update Inventory Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
