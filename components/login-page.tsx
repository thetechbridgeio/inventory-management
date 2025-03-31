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
import { AlertCircle, Lock, UserIcon } from "lucide-react"
import { useClientContext } from "@/context/client-context"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setClient } = useClientContext()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check for admin credentials
    if (username === "Admin" && password === "admin@123") {
      // Store admin login state
      sessionStorage.setItem("isLoggedIn", "true")
      sessionStorage.setItem("userRole", "admin")

      // Clear any selected client for admin
      setClient(null)

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

        // Set the client ID in a cookie for API requests
        document.cookie = `clientId=${client.id}; path=/; max-age=86400`

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
                    <Button variant="link" className="h-auto p-0 text-xs">
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
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Demo credentials:</p>
              <p>
                Admin: <span className="font-mono">Admin</span> | Password: <span className="font-mono">admin@123</span>
              </p>
              <p>
                Client: <span className="font-mono">ClientOne</span> | Password:{" "}
                <span className="font-mono">client1@123</span>
              </p>
            </div>
          </CardFooter>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Inventory Management System
        </p>
      </div>
    </div>
  )
}

