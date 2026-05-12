// features/clients/services/create-client.service.ts

import { Client } from "../types/client.types"

import { CreateClientInput } from "../schemas/client.schemas"

import { clientExists, normalizeClient } from "../handlers/client.handlers"

export async function createClientService({
  client,
  existingClients,
}: {
  client: CreateClientInput
  existingClients: Client[]
}) {
  const newClient: Client = {
    ...client,

    id: crypto.randomUUID(),

    createdAt: new Date().toISOString(),
  }

  const normalizedClient = normalizeClient(newClient)

  const alreadyExists = clientExists(existingClients, normalizedClient)

  if (alreadyExists) {
    throw new Error("Client already exists")
  }

  const response = await fetch("/api/clients", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      client: normalizedClient,
    }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to create client")
  }

  return result
}
