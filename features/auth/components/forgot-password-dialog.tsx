// features/auth/components/forgot-password-dialog.tsx

"use client"

import { useState } from "react"

import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

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

interface ForgotPasswordFormData {
  name: string
  contactNumber: string
  companyName: string
}

export function ForgotPasswordDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      name: "",
      contactNumber: "",
      companyName: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const controller = new AbortController()

    const timeout = setTimeout(() => {
      controller.abort()
    }, 15000)

    try {
      setLoading(true)

      const payload = {
        name: data.name.trim(),
        contactNumber: data.contactNumber.trim(),
        companyName: data.companyName.trim(),
      }

      const response = await fetch("/api/email/forgot-password", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),

        signal: controller.signal,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit request")
      }

      toast.success("Password reset request submitted successfully")

      reset()

      setOpen(false)
    } catch (error: any) {
      console.error("Forgot Password Error:", error)

      if (error.name === "AbortError") {
        toast.error("Request timed out. Please try again.")

        return
      }

      toast.error(error.message || "Something went wrong")
    } finally {
      clearTimeout(timeout)

      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-sm" type="button">
          Forgot Password?
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>

          <DialogDescription>
            Fill in the details below. Our team will contact you shortly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>

            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              disabled={loading}
              {...register("name", {
                required: "Full name is required",
              })}
            />

            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-number">Contact Number</Label>

            <Input
              id="contact-number"
              type="tel"
              placeholder="Enter your contact number"
              disabled={loading}
              {...register("contactNumber", {
                required: "Contact number is required",
              })}
            />

            {errors.contactNumber && (
              <p className="text-sm text-destructive">
                {errors.contactNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>

            <Input
              id="company-name"
              type="text"
              placeholder="Enter your company name"
              disabled={loading}
              {...register("companyName", {
                required: "Company name is required",
              })}
            />

            {errors.companyName && (
              <p className="text-sm text-destructive">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <DialogFooter className="border-0 bg-white pb-1 pt-2">
            <Button type="submit" className="h-11 w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
