// features/clients/hooks/use-clients.ts

"use client"

import { useCallback, useEffect, useState } from "react"

import { toast } from "sonner"

import { Client } from "../types/client.types"

import { CreateClientInput } from "../schemas/client.schemas"

import { fetchClientsService } from "../services/fetch-clients.service"
import { createClientService } from "../services/create-client.service"
import { updateClientService } from "../services/update-client.service"
import { deleteClientService } from "../services/delete-client.service"

type UseClientsReturn = {
  clients: Client[]

  loading: boolean
  creating: boolean
  updating: boolean
  deleting: boolean

  error: string | null

  refreshClients: () => Promise<void>

  createClient: (client: CreateClientInput) => Promise<boolean>

  updateClient: (
    originalClient: Client,
    updatedClient: Client
  ) => Promise<boolean>

  deleteClient: (client: Client) => Promise<boolean>
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([])

  const [loading, setLoading] = useState(false)

  const [creating, setCreating] = useState(false)

  const [updating, setUpdating] = useState(false)

  const [deleting, setDeleting] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const handleError = (error: unknown, fallback: string) => {
    const message = error instanceof Error ? error.message : fallback

    setError(message)

    toast.error(message)
  }

  const refreshClients = useCallback(async () => {
    try {
      setLoading(true)

      setError(null)

      const data = await fetchClientsService()

      setClients(data)
    } catch (error) {
      handleError(error, "Failed to fetch clients")
    } finally {
      setLoading(false)
    }
  }, [])

  const createClient = useCallback(
    async (client: CreateClientInput): Promise<boolean> => {
      try {
        setCreating(true)

        setError(null)

        toast.loading("Creating client...")

        await createClientService({
          client,
          existingClients: clients,
        })

        toast.dismiss()

        toast.success("Client created successfully")

        await refreshClients()

        return true
      } catch (error) {
        toast.dismiss()

        handleError(error, "Failed to create client")

        return false
      } finally {
        setCreating(false)
      }
    },
    [clients, refreshClients]
  )

  const updateClient = useCallback(
    async (originalClient: Client, updatedClient: Client): Promise<boolean> => {
      try {
        setUpdating(true)

        setError(null)

        toast.loading("Updating client...")

        await updateClientService({
          originalClient,
          updatedClient,
          existingClients: clients,
        })

        toast.dismiss()

        toast.success("Client updated successfully")

        await refreshClients()

        return true
      } catch (error) {
        toast.dismiss()

        handleError(error, "Failed to update client")

        return false
      } finally {
        setUpdating(false)
      }
    },
    [clients, refreshClients]
  )

  const deleteClient = useCallback(
    async (client: Client): Promise<boolean> => {
      try {
        setDeleting(true)

        setError(null)

        toast.loading("Deleting client...")

        await deleteClientService(client)

        toast.dismiss()

        toast.success("Client deleted successfully")

        await refreshClients()

        return true
      } catch (error) {
        toast.dismiss()

        handleError(error, "Failed to delete client")

        return false
      } finally {
        setDeleting(false)
      }
    },
    [refreshClients]
  )

  useEffect(() => {
    refreshClients()
  }, [refreshClients])

  return {
    clients,

    loading,
    creating,
    updating,
    deleting,

    error,

    refreshClients,

    createClient,
    updateClient,
    deleteClient,
  }
}
