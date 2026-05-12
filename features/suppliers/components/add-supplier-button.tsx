// features/suppliers/components/add-supplier-button.tsx

"use client"

import { useState } from "react"

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

import { Switch } from "@/components/ui/switch"

import { Textarea } from "@/components/ui/textarea"

import { SupplierSchema } from "../schemas/supplier.schemas"
import { useSuppliersContext } from "../context/supplier-provider"

type SupplierFormData = z.infer<typeof SupplierSchema>

export function AddSupplierButton() {
  const [open, setOpen] = useState(false)

  const { createSupplier, creating } = useSuppliersContext()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(SupplierSchema),

    defaultValues: {
      companyName: "",
      description: "",
      address: "",

      phoneNumber: "",
      emailId: "",
      gstNumber: "",

      paymentTerms: "",
      estimatedDeliveryPeriod: "",

      sentAutomatedOrder: false,
    },
  })

  const automatedOrderEnabled = watch("sentAutomatedOrder")

  const onSubmit = async (data: SupplierFormData) => {
    try {
      const success = await createSupplier(data)

      if (!success) return

      toast.success("Supplier added successfully")

      reset()

      setOpen(false)
    } catch (error) {
      console.error(error)

      toast.error("Failed to add supplier")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 gap-2 rounded-xl">
          <PackagePlus className="h-4 w-4" />
          Add Supplier
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-4xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold">
            Add New Supplier
          </DialogTitle>

          <DialogDescription>
            Register a supplier for inventory procurement and operational
            management.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit, () => {
            toast.error("Please complete all required fields")
          })}
          className="space-y-8"
        >
          {/* COMPANY DETAILS */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Company Information</h3>

              <p className="text-sm text-muted-foreground">
                Basic supplier and business information.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Company Name */}
              <div className="space-y-2">
                <Label>Company Name</Label>

                <Input
                  placeholder="ABC Traders Pvt Ltd"
                  disabled={creating}
                  className="h-11 rounded-xl"
                  {...register("companyName")}
                />

                {errors.companyName && (
                  <p className="text-sm text-destructive">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              {/* GST */}
              <div className="space-y-2">
                <Label>GST Number</Label>

                <Input
                  placeholder="27ABCDE1234F1Z5"
                  disabled={creating}
                  className="h-11 rounded-xl"
                  {...register("gstNumber")}
                />

                <p className="text-xs text-muted-foreground">
                  Required for tax invoices and procurement records.
                </p>

                {errors.gstNumber && (
                  <p className="text-sm text-destructive">
                    {errors.gstNumber.message}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label>Address</Label>

              <Textarea
                rows={3}
                placeholder="Warehouse or operational address"
                disabled={creating}
                className="rounded-2xl resize-none"
                {...register("address")}
              />

              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>

              <Textarea
                rows={3}
                placeholder="Short supplier overview, categories, or procurement notes"
                disabled={creating}
                className="rounded-2xl resize-none"
                {...register("description")}
              />

              <p className="text-xs text-muted-foreground">
                Optional internal notes for operational teams.
              </p>
            </div>
          </div>

          {/* CONTACT DETAILS */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Contact Details</h3>

              <p className="text-sm text-muted-foreground">
                Primary supplier communication information.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Phone */}
              <div className="space-y-2">
                <Label>Phone Number</Label>

                <Input
                  placeholder="+91 9876543210"
                  disabled={creating}
                  className="h-11 rounded-xl"
                  {...register("phoneNumber")}
                />

                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label>Email</Label>

                <Input
                  type="email"
                  placeholder="supplier@example.com"
                  disabled={creating}
                  className="h-11 rounded-xl"
                  {...register("emailId")}
                />

                {errors.emailId && (
                  <p className="text-sm text-destructive">
                    {errors.emailId.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* PROCUREMENT */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Procurement Preferences</h3>

              <p className="text-sm text-muted-foreground">
                Payment and delivery handling configuration.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Payment Terms */}
              <div className="space-y-2">
                <Label>Payment Terms</Label>

                <Input
                  placeholder="The terms of the supplier payment"
                  disabled={creating}
                  className="h-11 rounded-xl"
                  {...register("paymentTerms")}
                />
                <p className="text-xs text-muted-foreground">
                  E.g. "Net 30", "50% upfront, 50% on delivery", etc.
                </p>
                {errors.paymentTerms && (
                  <p className="text-sm text-destructive">
                    {errors.paymentTerms.message}
                  </p>
                )}
              </div>

              {/* Delivery Period */}
              <div className="space-y-2">
                <Label>Estimated Delivery</Label>

                <Input
                  placeholder="3-5 business days"
                  disabled={creating}
                  className="h-11 rounded-xl"
                  {...register("estimatedDeliveryPeriod")}
                />

                <p className="text-xs text-muted-foreground">
                  Helps operational planning and stock forecasting.
                </p>

                {errors.estimatedDeliveryPeriod && (
                  <p className="text-sm text-destructive">
                    {errors.estimatedDeliveryPeriod.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* AUTOMATION */}
          <div className="rounded-3xl border bg-muted/20 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-semibold">Automated Orders</h4>

                <p className="text-sm text-muted-foreground">
                  Automatically send purchase requests to this supplier when
                  inventory thresholds are low.
                </p>
              </div>

              <Switch
                checked={automatedOrderEnabled}
                onCheckedChange={(checked) =>
                  setValue("sentAutomatedOrder", checked)
                }
                disabled={creating}
              />
            </div>
          </div>

          {/* FOOTER */}
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={creating}
              className="h-11 min-w-45 rounded-xl"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Supplier...
                </>
              ) : (
                "Create Supplier"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
