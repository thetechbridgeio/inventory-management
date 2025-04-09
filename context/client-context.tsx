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
    console.log(`ClientContext: Setting client to ${client?.name || "null"} (${client?.id || "none"})`)
    if (client) {
      localStorage.setItem("client", JSON.stringify(client))
      // Also store the client ID in sessionStorage for consistency
      sessionStorage.setItem("clientId", client.id)
      sessionStorage.setItem("clientName", client.name || "")

      // Set the client ID in a cookie for server-side access
      document.cookie = `clientId=${client.id}; path=/; max-age=86400` // 24 hours
      console.log(`ClientContext: Set clientId cookie to ${client.id}`)
    } else {
      localStorage.removeItem("client")
      // Also clear the client ID from sessionStorage
      sessionStorage.removeItem("clientId")
      sessionStorage.removeItem("clientName")

      // Clear the client ID cookie
      document.cookie = "clientId=; path=/; max-age=0"
      console.log("ClientContext: Cleared clientId cookie")
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

  const clearCaches = () => {
    console.log("ClientContext: Clearing all caches")

    // Clear any fetch cache
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name)
        })
      })
    }

    // Force a hard reload of all data
    window.sessionStorage.setItem("force-reload", Date.now().toString())
  }

  return (
    <ClientContext.Provider
      value={{
        client,
        setClient: (newClient) => {
          if (newClient?.id !== client?.id) {
            clearCaches()
          }
          setClient(newClient)
        },
        fetchClients,
      }}
    >
      {children}
    </ClientContext.Provider>
  )
}

export function useClientContext() {
  const context = useContext(ClientContext)
  if (context === undefined) {
    console.error("useClientContext must be used within a ClientProvider")
    throw new Error("useClientContext must be used within a ClientProvider")
  }
  return context
}
