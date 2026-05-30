// features/purchases/components/add-purchase-button.tsx

"use client"

import { useMemo, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"

import { CalendarIcon, Loader2, PackagePlus, Plus } from "lucide-react"

import { format } from "date-fns"

import { useForm } from "react-hook-form"

import { toast } from "sonner"

import { z } from "zod"

import { Button } from "@/components/ui/button"

import { Calendar } from "@/components/ui/calendar"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { cn } from "@/lib/utils"

import { useInventoryContext } from "@/features/inventory/context/inventory-provider"

import { purchaseSchema } from "../schema/purchase.schema"
import { useSuppliersContext } from "@/features/suppliers/context/supplier-provider"
import { usePurchasesContext } from "../context/purchase-provider"

type PurchaseFormData = z.infer<typeof purchaseSchema>

export function AddPurchaseButton() {
  const [open, setOpen] = useState(false)
  const { suppliers } = useSuppliersContext()
  const { createPurchase, creating } = usePurchasesContext()

  const { inventory } = useInventoryContext()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),

    defaultValues: {
      product: "",
      quantity: 1,
      unit: "",
      poNumber: "",
      supplier: "",
      rackNumber: "",
      dateOfReceiving: new Date().toISOString(),
    },
  })

  const selectedProduct = watch("product")

  const selectedInventory = useMemo(() => {
    if (!selectedProduct) return null

    return (
      inventory.find(
        (item) => item?.product?.trim() === selectedProduct?.trim()
      ) ?? null
    )
  }, [inventory, selectedProduct])

  const productOptions = useMemo(() => {
    return Array.from(
      new Map(
        inventory
          .filter((item) => item?.product?.trim())
          .map((item) => [item.product.trim(), item])
      ).values()
    )
  }, [inventory])

  const supplierOptions = useMemo(() => {
    return Array.from(
      new Map(
        suppliers
          .filter((supplier) => supplier?.companyName?.trim())
          .map((supplier) => [supplier.companyName.trim(), supplier])
      ).values()
    )
  }, [suppliers])

  const handleProductChange = (value: string) => {
    if (!value?.trim()) return

    const matchedInventory = inventory.find(
      (item) => item?.product?.trim() === value.trim()
    )

    setValue("product", value.trim())

    setValue("unit", matchedInventory?.unit?.trim() || "")
  }

  const onSubmit = async (data: PurchaseFormData) => {
    try {
      const payload = {
        ...data,

        timestamp: new Date().toISOString(),

        dateOfReceiving: new Date(data.dateOfReceiving).toISOString(),
      }

      const success = await createPurchase(payload, selectedInventory!)

      if (!success) {
        return
      }

      toast.success("Purchase added successfully")

      reset()

      setOpen(false)
    } catch (error) {
      console.error(error)

      toast.error("Failed to create purchase")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-xl">
          <PackagePlus className="mr-2 h-4 w-4" />
          Add Incoming
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add Incoming</DialogTitle>

          <DialogDescription>
            Record incoming inventory purchases, supplier details, and receiving
            information.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit, () => {
            toast.error("Please complete all required fields")
          })}
          className="space-y-8"
        >
          {/* PRODUCT SECTION */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Product Information</h3>

              <p className="text-sm text-muted-foreground">
                Select inventory product and define receiving quantity.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* PRODUCT */}
              <div className="space-y-2">
                <Label>Product</Label>

                <Select
                  value={watch("product")}
                  onValueChange={handleProductChange}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Select inventory product" />
                  </SelectTrigger>

                  <SelectContent>
                    {productOptions.map((item) => (
                      <SelectItem
                        key={item.product}
                        value={item.product || "Unknown Product"}
                        className="py-3"
                      >
                        <div className="flex w-full min-w-0 flex-col">
                          <span className="truncate font-medium">
                            {item.product}
                          </span>

                          <span className="truncate text-xs text-muted-foreground">
                            {item.category}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <p className="text-xs text-muted-foreground">
                  Choose an inventory product to purchase.
                </p>

                {errors.product && (
                  <p className="text-sm text-destructive">
                    {errors.product.message}
                  </p>
                )}
              </div>

              {/* QUANTITY */}
              <div className="space-y-2">
                <Label>Quantity</Label>

                <Input
                  type="number"
                  min={1}
                  placeholder="50"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("quantity", {
                    valueAsNumber: true,
                  })}
                />

                <p className="text-xs text-muted-foreground">
                  Total received purchase quantity.
                </p>

                {errors.quantity && (
                  <p className="text-sm text-destructive">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* UNIT */}
              <div className="space-y-2">
                <Label>Unit</Label>

                <Input
                  disabled
                  value={watch("unit")}
                  className="h-11 rounded-xl bg-muted/40"
                />

                <p className="text-xs text-muted-foreground">
                  Auto-filled from selected product.
                </p>
              </div>

              {/* STOCK */}
              <div className="space-y-2">
                <Label>Current Stock</Label>

                <Input
                  disabled
                  value={selectedInventory?.stock ?? "-"}
                  className="h-11 rounded-xl bg-muted/40"
                />

                <p className="text-xs text-muted-foreground">
                  Current inventory stock before receiving.
                </p>
              </div>
            </div>
          </div>

          {/* PURCHASE DETAILS */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Purchase Details</h3>

              <p className="text-sm text-muted-foreground">
                Supplier and purchase order information.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* PO NUMBER */}
              <div className="space-y-2">
                <Label>PO Number</Label>

                <Input
                  placeholder="PO-2026-001"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("poNumber")}
                />

                <p className="text-xs text-muted-foreground">
                  Purchase order reference number.
                </p>

                {errors.poNumber && (
                  <p className="text-sm text-destructive">
                    {errors.poNumber.message}
                  </p>
                )}
              </div>

              {/* SUPPLIER */}
              {/* SUPPLIER */}
              <div className="space-y-2">
                <Label>Supplier</Label>

                <Select
                  value={watch("supplier") || ""}
                  onValueChange={(value) => {
                    if (!value?.trim()) return

                    setValue("supplier", value.trim())
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>

                  <SelectContent>
                    {supplierOptions.map((supplier) => (
                      <SelectItem
                        key={supplier.companyName}
                        value={supplier.companyName || "Unknown Supplier Name"}
                        className="py-3"
                      >
                        <div className="flex w-full min-w-0 flex-col">
                          <span className="truncate font-medium">
                            {supplier.companyName}
                          </span>

                          <span className="truncate text-xs text-muted-foreground">
                            {supplier.phoneNumber}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <p className="text-xs text-muted-foreground">
                  Select supplier directly from supplier management.
                </p>

                {errors.supplier && (
                  <p className="text-sm text-destructive">
                    {errors.supplier.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* RACK */}
              <div className="space-y-2">
                <Label>Rack Number</Label>

                <Input
                  placeholder="Rack A-12"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("rackNumber")}
                />

                <p className="text-xs text-muted-foreground">
                  Storage rack or warehouse placement.
                </p>

                {errors.rackNumber && (
                  <p className="text-sm text-destructive">
                    {errors.rackNumber.message}
                  </p>
                )}
              </div>

              {/* DATE */}
              <div className="space-y-2">
                <Label>Date Of Receiving</Label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-11 w-full justify-start rounded-xl text-left font-normal",
                        !watch("dateOfReceiving") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />

                      {watch("dateOfReceiving") ? (
                        format(new Date(watch("dateOfReceiving")), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        watch("dateOfReceiving")
                          ? new Date(watch("dateOfReceiving"))
                          : undefined
                      }
                      onSelect={(date) => {
                        if (!date) return

                        setValue("dateOfReceiving", date.toISOString())
                      }}
                    />
                  </PopoverContent>
                </Popover>

                {errors.dateOfReceiving && (
                  <p className="text-sm text-destructive">
                    {errors.dateOfReceiving.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <DialogFooter>
            <Button
              type="submit"
              disabled={creating}
              className="h-11 min-w-[220px] rounded-xl"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Incoming...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Incoming
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
