"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Lock, UserIcon, CheckCircle } from "lucide-react"
import { useClientContext } from "@/context/client-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { setCookie, deleteCookie } from "cookies-next"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setClient } = useClientContext()
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false)

  // Password reset form state
  const [resetForm, setResetForm] = useState({
    name: "",
    contactNumber: "",
    companyName: "",
  })
  const [isSubmittingReset, setIsSubmittingReset] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleResetFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setResetForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleResetFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!resetForm.name || !resetForm.contactNumber || !resetForm.companyName) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSubmittingReset(true)

    try {
      const response = await fetch("/api/email/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resetForm),
      })

      if (!response.ok) {
        throw new Error("Failed to send password reset request")
      }

      setResetSuccess(true)

      // Reset form
      setResetForm({
        name: "",
        contactNumber: "",
        companyName: "",
      })
    } catch (error) {
      console.error("Password reset request error:", error)
      toast.error("Failed to send password reset request. Please try again.")
    } finally {
      setIsSubmittingReset(false)
    }
  }

  const handleCloseResetDialog = () => {
    setShowForgotPasswordDialog(false)
    // Reset the success state after dialog is closed
    setTimeout(() => {
      setResetSuccess(false)
    }, 300)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check for admin credentials
    if (username === "Lexwell" && password === "lexwell@123") {
      // Store admin login state
      sessionStorage.setItem("isLoggedIn", "true")
      sessionStorage.setItem("userRole", "admin")

      // Clear any selected client for admin
      setClient(null)

      // Clear clientId cookie
      deleteCookie("clientId")

      // Redirect to inventory page
      router.push("/dashboard/inventory")
      return
    }

    try {
      // Fetch clients to find matching credentials
      const response = await fetch("/api/clients")

      if (!response.ok) {
        throw new Error("Failed to fetch clients")
      }

      const result = await response.json()

      if (!result.data || !Array.isArray(result.data)) {
        throw new Error("Invalid client data format")
      }

      // Find client with matching credentials
      const client = result.data.find((c: any) => c.username === username && c.password === password)

      if (client) {
        // Store client login state
        sessionStorage.setItem("isLoggedIn", "true")
        sessionStorage.setItem("userRole", "client")
        sessionStorage.setItem("clientId", client.id)

        // Set the client in context
        setClient(client)

        // Set clientId cookie
        setCookie("clientId", client.id)

        // Redirect to inventory page
        router.push("/dashboard/inventory")
      } else {
        setError("Invalid username or password")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center space-y-2 text-center mb-6">
          <Image
            src="/images/company-logo.png"
            alt="Company Logo"
            width={160}
            height={160}
            className="h-32 w-auto"
            priority
          />
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Sign in to access your dashboard</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs"
                      onClick={(e) => {
                        e.preventDefault()
                        setShowForgotPasswordDialog(true)
                      }}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </div>
              <Dialog open={showForgotPasswordDialog} onOpenChange={handleCloseResetDialog}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                      {resetSuccess
                        ? "Your password reset request has been sent."
                        : "Fill in the form below to request a password reset."}
                    </DialogDescription>
                  </DialogHeader>

                  {resetSuccess ? (
                    <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                      <p className="text-lg font-medium">Request Sent Successfully</p>
                      <p className="text-sm text-muted-foreground">
                        We will contact you shortly to help reset your password.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleResetFormSubmit} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-name">Name</Label>
                        <Input
                          id="reset-name"
                          name="name"
                          placeholder="Enter your name"
                          value={resetForm.name}
                          onChange={handleResetFormChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reset-contact">Contact Number</Label>
                        <Input
                          id="reset-contact"
                          name="contactNumber"
                          placeholder="Enter your contact number"
                          value={resetForm.contactNumber}
                          onChange={handleResetFormChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reset-company">Company Name</Label>
                        <Input
                          id="reset-company"
                          name="companyName"
                          placeholder="Enter your company name"
                          value={resetForm.companyName}
                          onChange={handleResetFormChange}
                          required
                        />
                      </div>
                      <DialogFooter className="sm:justify-between mt-6 gap-2">
                        <Button type="button" variant="outline" onClick={handleCloseResetDialog}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmittingReset}>
                          {isSubmittingReset ? (
                            <>
                              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                              Sending...
                            </>
                          ) : (
                            "Send Reset Request"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {/* <div className="text-center text-sm text-muted-foreground">
             <p>Demo credentials:</p>
             <p>
               Admin: <span className="font-mono">Admin</span> | Password: <span className="font-mono">admin@123</span>
             </p>
             <p>
               Client: <span className="font-mono">ClientOne</span> | Password:{" "}
               <span className="font-mono">client1@123</span>
             </p>
           </div> */}
          </CardFooter>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Inventory Management System
        </p>
      </div>
    </div>
  )
}

