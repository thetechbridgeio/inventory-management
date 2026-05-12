// features/clients/services/update-client.service.ts

import { Client } from "../types/client.types"

import { clientsMatch, normalizeClient } from "../handlers/client.handlers"

export async function updateClientService({
  originalClient,
  updatedClient,
  existingClients,
}: {
  originalClient: Client
  updatedClient: Client
  existingClients: Client[]
}) {
  const normalizedClient = normalizeClient(updatedClient)

  const duplicateExists = existingClients.some((client) => {
    if (clientsMatch(client, originalClient)) {
      return false
    }

    return clientsMatch(client, normalizedClient)
  })

  if (duplicateExists) {
    throw new Error("Another client already exists")
  }

  const response = await fetch("/api/sheet-rows", {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      sheetName: "Clients",

      match: {
        companyName: originalClient.companyName,
      },

      updates: normalizedClient,
    }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to update client")
  }

  return result
}
