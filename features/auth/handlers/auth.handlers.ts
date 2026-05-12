// features/auth/handlers/auth.handlers.ts

import type { Client } from "@/features/clients/types/client.types"

import type { AuthClient, LoginCredentials } from "../types/auth.types"

const SESSION_KEY = "client-session"

export function createAuthClient(client: Client): AuthClient {
  return {
    id: client.id,

    sheetId: client.sheetId,

    companyName: client.companyName,

    logoUrl: client.logoUrl,
  }
}

export function saveClientSession(client: AuthClient) {
  if (typeof window === "undefined") {
    return
  }

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(client))
}

export function getClientSession(): AuthClient | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw = sessionStorage.getItem(SESSION_KEY)

    if (!raw) {
      return null
    }

    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearClientSession() {
  if (typeof window === "undefined") {
    return
  }

  sessionStorage.removeItem(SESSION_KEY)
}

export function validateLogin(
  clients: Client[],
  credentials: LoginCredentials
): Client | null {
  return (
    clients.find(
      (client) =>
        client.username === credentials.username &&
        client.password === credentials.password
    ) || null
  )
}

export function isAdminClient(client?: AuthClient | null) {
  if (!client) {
    return false
  }

  return client.id === process.env.NEXT_PUBLIC_ADMIN_CLIENT_ID
}
