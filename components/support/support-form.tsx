"use client"

import { Loader2, Send } from "lucide-react"

import { useForm } from "react-hook-form"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { Textarea } from "@/components/ui/textarea"

type SupportFormData = {
  name: string
  email: string
  subject: string
  message: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SupportForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupportFormData>({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },

    mode: "onSubmit",
  })

  const onSubmit = async (data: SupportFormData) => {
    const controller = new AbortController()

    const timeout = setTimeout(() => {
      controller.abort()
    }, 15000)

    try {
      const payload = {
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject.trim(),
        message: data.message.trim(),
      }

      const response = await fetch("/api/email/support", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),

        signal: controller.signal,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send support request")
      }

      toast.success("Support request sent successfully")

      reset()
    } catch (error: any) {
      console.error("Support Form Error:", error)

      if (error.name === "AbortError") {
        toast.error("Request timed out. Please try again.")

        return
      }

      toast.error(error.message || "Failed to send support request")
    } finally {
      clearTimeout(timeout)
    }
  }

  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl font-semibold">Contact Support</CardTitle>

        <CardDescription>
          Fill out the form below and our support team will get back to you
          shortly.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Row */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>

              <Input
                id="name"
                placeholder="John Doe"
                disabled={isSubmitting}
                className="h-11 rounded-xl"
                {...register("name", {
                  required: "Name is required",

                  minLength: {
                    value: 2,
                    message: "Name is too short",
                  },
                })}
              />

              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>

              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                disabled={isSubmitting}
                className="h-11 rounded-xl"
                {...register("email", {
                  required: "Email is required",

                  pattern: {
                    value: EMAIL_REGEX,

                    message: "Invalid email address",
                  },
                })}
              />

              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>

            <Input
              id="subject"
              placeholder="Issue regarding inventory updates"
              disabled={isSubmitting}
              className="h-11 rounded-xl"
              {...register("subject", {
                required: "Subject is required",

                minLength: {
                  value: 3,
                  message: "Subject is too short",
                },
              })}
            />

            {errors.subject && (
              <p className="text-sm text-destructive">
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>

            <Textarea
              id="message"
              rows={7}
              placeholder="Describe your issue or request in detail..."
              disabled={isSubmitting}
              className="resize-none rounded-2xl"
              {...register("message", {
                required: "Message is required",

                minLength: {
                  value: 10,
                  message: "Message is too short",
                },
              })}
            />

            <p className="text-xs text-muted-foreground">
              Include screenshots, workflow steps, or error details if
              applicable.
            </p>

            {errors.message && (
              <p className="text-sm text-destructive">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-xl px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
