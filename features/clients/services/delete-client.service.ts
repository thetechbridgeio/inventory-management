// features/clients/services/delete-client.service.ts

import { Client } from "../types/client.types"

export async function deleteClientService(client: Client) {
  const response = await fetch("/api/sheet-rows", {
    method: "DELETE",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      sheetName: "Clients",

      items: [client],

      matchFields: ["companyName", "id"],
    }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to delete client")
  }

  return result
}
