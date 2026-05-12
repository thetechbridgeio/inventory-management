// features/suppliers/components/edit-supplier-dialog.tsx

"use client"

import { useEffect, useState } from "react"

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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { SupplierSchema } from "../schemas/supplier.schemas"
import { useSuppliers } from "../hooks/supplier.hooks"
import { Supplier } from "../types/supplier.types"

type SupplierFormData = z.infer<typeof SupplierSchema>

type EditSupplierDialogProps = {
  supplier: Supplier
}

export function EditSupplierDialog({ supplier }: EditSupplierDialogProps) {
  const [open, setOpen] = useState(false)

  const { updateSupplier, updating } = useSuppliers()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(SupplierSchema),

    defaultValues: supplier,
  })

  const automatedOrderEnabled = watch("sentAutomatedOrder")

  // PREFILL FORM
  useEffect(() => {
    reset({
      ...supplier,

      gstNumber: String(supplier.gstNumber ?? ""),

      phoneNumber: String(supplier.phoneNumber ?? ""),
    })
  }, [supplier, reset])

  const onSubmit = async (data: SupplierFormData) => {
    try {
      console.log("Updating supplier with data:", data)
      const success = await updateSupplier(supplier, data)

      if (!success) return

      toast.success("Supplier updated successfully")

      setOpen(false)
    } catch (error) {
      console.error(error)

      toast.error("Failed to update supplier")
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
            Edit Supplier
          </DialogTitle>

          <DialogDescription>
            Update supplier information and procurement preferences.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit, () => {
            toast.error("Please complete all required fields")
          })}
          className="space-y-8"
        >
          {/* COMPANY */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Company Information</h3>

              <p className="text-sm text-muted-foreground">
                Update operational supplier details.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company Name</Label>

                <Input
                  className="h-11 rounded-xl"
                  disabled={updating}
                  {...register("companyName")}
                />

                {errors.companyName && (
                  <p className="text-sm text-destructive">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>GST Number</Label>

                <Input
                  className="h-11 rounded-xl"
                  type="text"
                  disabled={updating}
                  {...register("gstNumber")}
                />

                {errors.gstNumber && (
                  <p className="text-sm text-destructive">
                    {errors.gstNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>

              <Textarea
                rows={3}
                className="rounded-2xl resize-none"
                disabled={updating}
                {...register("address")}
              />

              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>

              <Textarea
                rows={3}
                className="rounded-2xl resize-none"
                disabled={updating}
                {...register("description")}
              />
            </div>
          </div>

          {/* CONTACT */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Contact Details</h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone Number</Label>

                <Input
                  className="h-11 rounded-xl"
                  type="text"
                  disabled={updating}
                  {...register("phoneNumber")}
                />

                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>

                <Input
                  type="email"
                  className="h-11 rounded-xl"
                  disabled={updating}
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
              <h3 className="text-lg font-semibold">Procurement</h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Payment Terms</Label>

                <Input
                  placeholder="Net 30 days"
                  className="h-11 rounded-xl"
                  disabled={updating}
                  {...register("paymentTerms")}
                />

                <p className="text-xs text-muted-foreground">
                  Example: Advance, Net 15, Net 30
                </p>

                {errors.paymentTerms && (
                  <p className="text-sm text-destructive">
                    {errors.paymentTerms.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Estimated Delivery</Label>

                <Input
                  placeholder="3-5 business days"
                  className="h-11 rounded-xl"
                  disabled={updating}
                  {...register("estimatedDeliveryPeriod")}
                />

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
                  Enable automatic purchase requests for this supplier.
                </p>
              </div>

              <Switch
                checked={automatedOrderEnabled}
                onCheckedChange={(checked) =>
                  setValue("sentAutomatedOrder", checked)
                }
                disabled={updating}
              />
            </div>
          </div>

          {/* FOOTER */}
          <DialogFooter>
            <Button
              type="submit"
              disabled={updating}
              className="h-11 min-w-[180px] rounded-xl"
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Supplier...
                </>
              ) : (
                "Update Supplier"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
