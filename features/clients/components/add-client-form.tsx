"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"
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

import {
  createClientSchema,
  type CreateClientInput,
} from "../schemas/client.schemas"
import { useClients } from "../hooks/use-clients"

type ClientFormData = CreateClientInput

// Reusable inline error component
function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-destructive">{message}</p>
}

export function AddClientButton() {
  const [open, setOpen] = useState(false)
  const { createClient } = useClients()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      sheetId: "",
      companyName: "",
      gstNumber: "",
      address: "",
      description: "",
      logoUrl: "",
      website: "",
      contactPersonName: "",
      contactPersonEmail: "",
      contactPersonPhone: "",
      superAdminName: "",
      superAdminEmail: "",
      superAdminPhoneNumber: "",
      username: "",
      password: "",
      isActive: true,
    },
  })

  const isActive = watch("isActive")

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true)
    const success = await createClient(data as any)

    if (success) {
      reset()
      setOpen(false)
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-4xl p-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Add New Client
          </DialogTitle>
          <DialogDescription>
            Create and configure a new business client account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* COMPANY DETAILS */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Company Details</h3>
              <p className="text-sm text-muted-foreground">
                Basic company information and branding.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  placeholder="Business Pvt Ltd"
                  disabled={loading}
                  {...register("companyName")}
                />
                <FieldError message={errors.companyName?.message} />
              </div>

              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input
                  placeholder="27ABCDE1234F1Z5"
                  disabled={loading}
                  {...register("gstNumber")}
                />
                <p className="text-xs text-muted-foreground">
                  Enter valid GSTIN for invoicing and tax reports.
                </p>
                <FieldError message={errors.gstNumber?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea
                rows={3}
                placeholder="Company operational address"
                disabled={loading}
                {...register("address")}
              />
              <FieldError message={errors.address?.message} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                placeholder="Short overview of company operations"
                disabled={loading}
                {...register("description")}
              />
              <FieldError message={errors.description?.message} />{" "}
              {/* ✅ added */}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  placeholder="https://example.com/logo.png"
                  disabled={loading}
                  {...register("logoUrl")}
                />
                <FieldError message={errors.logoUrl?.message} />{" "}
                {/* ✅ added */}
              </div>

              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  placeholder="https://company.com"
                  disabled={loading}
                  {...register("website")}
                />
                <FieldError message={errors.website?.message} />{" "}
                {/* ✅ added */}
              </div>
            </div>
          </div>

          {/* CONTACT PERSON */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Primary Contact</h3>
              <p className="text-sm text-muted-foreground">
                Person responsible for operational coordination.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="John Doe"
                  disabled={loading}
                  {...register("contactPersonName")}
                />
                <FieldError message={errors.contactPersonName?.message} />{" "}
                {/* ✅ added */}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="contact@company.com"
                  disabled={loading}
                  {...register("contactPersonEmail")}
                />
                <FieldError message={errors.contactPersonEmail?.message} />{" "}
                {/* ✅ added */}
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="+91 9876543210"
                  disabled={loading}
                  {...register("contactPersonPhone")}
                />
                <FieldError message={errors.contactPersonPhone?.message} />{" "}
                {/* ✅ added */}
              </div>
            </div>
          </div>

          {/* SUPER ADMIN */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Super Admin</h3>
              <p className="text-sm text-muted-foreground">
                Credentials owner with full administrative access.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Admin Name"
                  disabled={loading}
                  {...register("superAdminName")}
                />
                <FieldError message={errors.superAdminName?.message} />{" "}
                {/* ✅ added */}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="admin@company.com"
                  disabled={loading}
                  {...register("superAdminEmail")}
                />
                <FieldError message={errors.superAdminEmail?.message} />{" "}
                {/* ✅ added */}
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="+91 9876543210"
                  disabled={loading}
                  {...register("superAdminPhoneNumber")}
                />
                <FieldError message={errors.superAdminPhoneNumber?.message} />{" "}
                {/* ✅ added */}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Google Sheet ID</Label>
              <Input
                placeholder="Google Sheet ID"
                disabled={loading}
                {...register("sheetId")}
              />
              <p className="text-xs text-muted-foreground">
                Enter the Google sheet id, which will be used to sync the
                inventory data.
              </p>
              <FieldError message={errors.sheetId?.message} />{" "}
            </div>
          </div>

          {/* AUTH */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Credentials used for platform login access.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  placeholder="unique_username"
                  disabled={loading}
                  {...register("username")}
                />
                <FieldError message={errors.username?.message} />{" "}
                {/* ✅ added */}
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Create strong password"
                  disabled={loading}
                  {...register("password")}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters recommended.
                </p>
                <FieldError message={errors.password?.message} />{" "}
                {/* ✅ added */}
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <h4 className="font-medium">Active Status</h4>
              <p className="text-sm text-muted-foreground">
                Enable or disable client access immediately.
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked: boolean) =>
                setValue("isActive", checked)
              }
              disabled={loading}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="h-11 min-w-45 rounded-xl"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Client...
                </>
              ) : (
                "Create Client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
