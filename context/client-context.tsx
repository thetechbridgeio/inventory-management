"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  logoUrl?: string
  sheetId?: string
}

interface ClientContextType {
  client: Client | null
  setClient: (client: Client | null) => void
  fetchClients: () => Promise<Client[]>
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null)

  // Load client from localStorage on initial render (client-side only)
  useEffect(() => {
    const storedClient = localStorage.getItem("client")
    if (storedClient) {
      try {
        setClient(JSON.parse(storedClient))
      } catch (error) {
        console.error("Failed to parse client from localStorage:", error)
      }
    }
  }, [])

  // Save client to localStorage whenever it changes
  useEffect(() => {
    if (client) {
      localStorage.setItem("client", JSON.stringify(client))
    } else {
      localStorage.removeItem("client")
    }
  }, [client])

  const fetchClients = async (): Promise<Client[]> => {
    try {
      const response = await fetch("/api/clients")

      if (!response.ok) {
        throw new Error("Failed to fetch clients")
      }

      const result = await response.json()

      if (result.data && Array.isArray(result.data)) {
        return result.data
      }

      return []
    } catch (error) {
      console.error("Error fetching clients:", error)
      return []
    }
  }

  return <ClientContext.Provider value={{ client, setClient, fetchClients }}>{children}</ClientContext.Provider>
}

export function useClientContext() {
  const context = useContext(ClientContext)
  if (context === undefined) {
    console.error("useClientContext must be used within a ClientProvider")
    throw new Error("useClientContext must be used within a ClientProvider")
  }
  return context
}
