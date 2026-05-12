// features/auth/components/login-form.tsx

"use client"

import Image from "next/image"
import { useState } from "react"

import { Eye, EyeOff, Loader2 } from "lucide-react"

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

import { ForgotPasswordDialog } from "./forgot-password-dialog"
import { useAuth } from "../context/auth.context"

interface LoginFormData {
  username: string
  password: string
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()

  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true)
      await login(data)

      await new Promise((resolve) => setTimeout(resolve, 1500))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border border-border/50 bg-background/95 p-4 shadow-2xl backdrop-blur">
      <CardHeader className="space-y-5 text-center">
        <div className="flex justify-center">
          <Image
            src="/logo/company-logo.png"
            alt="Company Logo"
            width={250}
            height={250}
            priority
          />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Inventory Management
          </CardTitle>

          <CardDescription className="text-base">
            Sign in to access your dashboard
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>

            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              className="h-11"
              disabled={loading}
              {...register("username", {
                required: "Username is required",
              })}
            />

            {errors.username && (
              <p className="text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>

              <ForgotPasswordDialog />
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="h-11 pr-11"
                disabled={loading}
                {...register("password", {
                  required: "Password is required",
                })}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-9 w-9"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
            </div>

            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
