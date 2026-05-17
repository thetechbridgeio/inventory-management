// features/sales/components/add-sales-button.tsx

"use client"

import { useMemo, useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"

import { CalendarIcon, Loader2, Plus, ShoppingCart } from "lucide-react"

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

import { useSalesContext } from "../context/sales-provider"

import { salesSchema } from "../schema/sales.schema"

type SalesFormData = z.infer<typeof salesSchema>

export function AddSalesButton() {
  const [open, setOpen] = useState(false)
  const { createSales, creating } = useSalesContext()
  const { inventory } = useInventoryContext()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SalesFormData>({
    resolver: zodResolver(salesSchema),

    defaultValues: {
      product: "",
      quantity: 1,
      unit: "",
      contact: "",
      companyName: "",
      dateOfIssue: new Date().toISOString(),
    },
  })

  const selectedProduct = watch("product")

  const selectedInventory = useMemo(() => {
    return inventory.find((item) => item.product === selectedProduct)
  }, [inventory, selectedProduct])

  const productOptions = useMemo(() => {
    return Array.from(
      new Map(inventory.map((item) => [item.product, item])).values()
    )
  }, [inventory])

  const handleProductChange = (value: string) => {
    const matchedInventory = inventory.find((item) => item.product === value)

    setValue("product", value)

    if (matchedInventory?.unit) {
      setValue("unit", matchedInventory.unit)
    }
  }

  const onSubmit = async (data: SalesFormData) => {
    try {
      const payload = {
        ...data,

        timestamp: new Date().toISOString(),

        dateOfIssue: new Date(data.dateOfIssue).toISOString(),
      }

      const success = await createSales(payload)

      if (!success) {
        return
      }

      toast.success("Sales item added successfully")

      reset()

      setOpen(false)
    } catch (error) {
      console.error(error)

      toast.error("Failed to create sales item")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-xl">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add Outgoing
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add Sale</DialogTitle>

          <DialogDescription>
            Record a product sale, customer details, and issued quantity.
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
                Select the sold inventory item and configure quantity details.
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
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select inventory product" />
                  </SelectTrigger>

                  <SelectContent>
                    {productOptions.map((item) => (
                      <SelectItem key={item.product} value={item.product}>
                        <div className="flex flex-col">
                          <span>{item.product}</span>

                          <span className="text-xs text-muted-foreground">
                            {item.category}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <p className="text-xs text-muted-foreground">
                  Choose a product directly from your inventory system.
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
                  placeholder="25"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("quantity", {
                    valueAsNumber: true,
                  })}
                />

                <p className="text-xs text-muted-foreground">
                  Enter the total quantity sold.
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
                  placeholder="PCS / KG / Box"
                  className="h-11 rounded-xl"
                  disabled
                  value={watch("unit")}
                />

                <p className="text-xs text-muted-foreground">
                  Auto-filled from selected inventory product.
                </p>
              </div>

              {/* AVAILABLE STOCK */}
              <div className="space-y-2">
                <Label>Available Stock</Label>

                <Input
                  disabled
                  value={selectedInventory?.stock ?? "-"}
                  className="h-11 rounded-xl bg-muted/40"
                />

                <p className="text-xs text-muted-foreground">
                  Current inventory stock for the selected product.
                </p>
              </div>
            </div>
          </div>

          {/* CLIENT SECTION */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Client Information</h3>

              <p className="text-sm text-muted-foreground">
                Add buyer company and contact information.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* COMPANY */}
              <div className="space-y-2">
                <Label>Company Name</Label>

                <Input
                  placeholder="ABC Construction Pvt Ltd"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("companyName")}
                />

                {errors.companyName && (
                  <p className="text-sm text-destructive">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              {/* CONTACT */}
              <div className="space-y-2">
                <Label>Contact Number</Label>

                <Input
                  placeholder="+91 9876543210"
                  className="h-11 rounded-xl"
                  disabled={creating}
                  {...register("contact")}
                />

                <p className="text-xs text-muted-foreground">
                  Primary client contact information.
                </p>

                {errors.contact && (
                  <p className="text-sm text-destructive">
                    {errors.contact.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* DATE SECTION */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Issue Details</h3>

              <p className="text-sm text-muted-foreground">
                Configure the Outgoing issue date.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Date Of Issue</Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-11 w-full justify-start rounded-xl text-left font-normal",
                      !watch("dateOfIssue") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />

                    {watch("dateOfIssue") ? (
                      format(new Date(watch("dateOfIssue")), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      watch("dateOfIssue")
                        ? new Date(watch("dateOfIssue"))
                        : undefined
                    }
                    onSelect={(date) => {
                      if (!date) return

                      setValue("dateOfIssue", date.toISOString())
                    }}
                    // initialFocus
                  />
                </PopoverContent>
              </Popover>

              {errors.dateOfIssue && (
                <p className="text-sm text-destructive">
                  {errors.dateOfIssue.message}
                </p>
              )}
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
                  Creating Outgoing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Sales Entry
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
