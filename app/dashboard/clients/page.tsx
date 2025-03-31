"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useClientContext } from "@/context/client-context"
import { RefreshCcw, Plus, User, Mail, Phone, Image, Check, Database, Key } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  logoUrl?: string
  sheetId?: string
  username?: string
  password?: string
}

export default function ClientsPage() {
  const { client: selectedClient, setClient } = useClientContext()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: "",
    email: "",
    phone: "",
    logoUrl: "",
    sheetId: "",
    username: "",
    password: "",
  })
  const router = useRouter()

  // Check if user is admin
  useEffect(() => {
    const userRole = sessionStorage.getItem("userRole")
    if (userRole !== "admin") {
      toast.error("You don't have permission to access this page")
      router.push("/dashboard/inventory")
    }
  }, [router])

  const fetchClients = async () => {
    try {
      setIsRefreshing(true)
      setError(null)

      const response = await fetch("/api/clients")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const result = await response.json()

      if (result.data && Array.isArray(result.data)) {
        setClients(result.data)
      } else {
        setClients([])
        if (result.error) {
          setError(result.error)
        }
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch clients")
      toast.error("Failed to fetch clients")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleSelectClient = (client: Client) => {
    setClient(client)
    toast.success(`Selected client: ${client.name}`)
  }

  const handleAddClient = async () => {
    try {
      if (!newClient.name || !newClient.email) {
        toast.error("Name and email are required")
        return
      }

      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ client: newClient }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to add client")
      }

      // Add the new client to the list
      setClients((prev) => [...prev, result.client])

      // Reset the form
      setNewClient({
        name: "",
        email: "",
        phone: "",
        logoUrl: "",
        sheetId: "",
        username: "",
        password: "",
      })

      // Close the dialog
      setIsAddDialogOpen(false)

      toast.success("Client added successfully")
    } catch (error) {
      console.error("Error adding client:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add client")
    }
  }

  const renderSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>
      <Skeleton className="h-[400px] w-full mt-4" />
    </div>
  )

  if (loading) {
    return <div className="space-y-6">{renderSkeleton()}</div>
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Client Management</h1>
          <Button variant="outline" onClick={fetchClients} disabled={isRefreshing} className="shadow-sm">
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Retry"}
          </Button>
        </div>

        <Card className="shadow-sm border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="mt-4 text-muted-foreground">
              Please check your Google Sheets connection and make sure the sheet is properly set up.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">Manage your clients and their data sources</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={fetchClients} disabled={isRefreshing} className="shadow-sm">
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="h-4 w-4 inline mr-2" />
                    Client Name
                  </Label>
                  <Input
                    id="name"
                    value={newClient.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setNewClient({
                        ...newClient,
                        name,
                        // Auto-generate username based on name
                        username: name.replace(/\s+/g, "").toLowerCase(),
                      })
                    }}
                    placeholder="Enter client name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">
                    <Image className="h-4 w-4 inline mr-2" />
                    Logo URL (Optional)
                  </Label>
                  <Input
                    id="logoUrl"
                    value={newClient.logoUrl}
                    onChange={(e) => setNewClient({ ...newClient, logoUrl: e.target.value })}
                    placeholder="Enter logo URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sheetId">
                    <Database className="h-4 w-4 inline mr-2" />
                    Google Sheet ID
                  </Label>
                  <Input
                    id="sheetId"
                    value={newClient.sheetId}
                    onChange={(e) => setNewClient({ ...newClient, sheetId: e.target.value })}
                    placeholder="Enter Google Sheet ID"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The ID from the client's Google Sheet URL: https://docs.google.com/spreadsheets/d/
                    <span className="font-bold">SHEET_ID</span>/edit
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">
                    <User className="h-4 w-4 inline mr-2" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={newClient.username}
                    onChange={(e) => setNewClient({ ...newClient, username: e.target.value })}
                    placeholder="Enter username for login"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-generated from client name, but you can change it
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    <Key className="h-4 w-4 inline mr-2" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    value={newClient.password || (newClient.username ? `${newClient.username}@123` : "")}
                    onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                    placeholder="Enter password for login"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default is username@123, but you can set a custom password
                  </p>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleAddClient}>Add Client</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-sm border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle>Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No clients found. Add your first client to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Sheet ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.username}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{client.password}</span>
                    </TableCell>
                    <TableCell>
                      {client.sheetId ? (
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {client.sheetId.length > 15 ? client.sheetId.substring(0, 15) + "..." : client.sheetId}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectClient(client)}
                        className={selectedClient?.id === client.id ? "bg-primary text-primary-foreground" : ""}
                      >
                        {selectedClient?.id === client.id ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Selected
                          </>
                        ) : (
                          "Select"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

