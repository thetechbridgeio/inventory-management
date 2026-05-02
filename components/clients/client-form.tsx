"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

import { Client } from "@/lib/types"
import { createClient } from "@/lib/api/clients"

interface Props {
  onSuccess: (client: Client) => void
}

export function ClientForm({ onSuccess }: Props) {
  const [form, setForm] = useState<Omit<Client, "id">>({
    name: "",
    email: "",
    phone: "",
    logoUrl: "",
    sheetId: "",
    username: "",
    password: "",
    superAdminEmail: "",
  })

  const [loading, setLoading] = useState(false)

  const update = (key: keyof typeof form, value: string) => {
    const updated = { ...form, [key]: value }

    if (key === "name") {
      updated.username = value.replace(/\s+/g, "").toLowerCase()
    }

    if (key === "username" && !form.password) {
      updated.password = `${value}@123`
    }

    setForm(updated)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      toast.error("Name and email are required")
      return
    }

    try {
      setLoading(true)
      const client = await createClient(form)
      onSuccess(client)
      toast.success("Client created")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      
      {/* 🔹 BASIC INFO */}
      <Card className="border-none shadow-none py-0">
        <CardContent className="space-y-4 p-0">
          <div>
            <h3 className="text-sm font-semibold">Basic Information</h3>
            <p className="text-xs text-muted-foreground">
              General details about the client
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Client Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Logo URL</Label>
              <Input
                value={form.logoUrl}
                onChange={(e) => update("logoUrl", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 ACCESS */}
      <Card className="border-none shadow-none py-0">
        <CardContent className="space-y-4 p-0">
          <div>
            <h3 className="text-sm font-semibold">Access & Credentials</h3>
            <p className="text-xs text-muted-foreground">
              Login details for the client account
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Super Admin Email</Label>
              <Input
                type="email"
                value={form.superAdminEmail}
                onChange={(e) =>
                  update("superAdminEmail", e.target.value)
                }
              />
              <p className="text-xs text-muted-foreground">
                Full access account for this client
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 INTEGRATION */}
      <Card className="border-none shadow-none py-0">
        <CardContent className="space-y-4 p-0">
          <div>
            <h3 className="text-sm font-semibold">Integration</h3>
            <p className="text-xs text-muted-foreground">
              External data configuration
            </p>
          </div>

          <div className="space-y-2">
            <Label>Google Sheet ID</Label>
            <Input
              value={form.sheetId}
              onChange={(e) => update("sheetId", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Paste only the ID from the sheet URL
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 ACTION */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create Client"}
        </Button>
      </div>
    </div>
  )
}