// features/clients/services/fetch-clients.service.ts

import { Client } from "../types/client.types"

export async function fetchClientsService(): Promise<Client[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/clients`,
    {
      method: "GET",
      cache: "no-store",
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch clients")
  }

  return result.data || []
}
