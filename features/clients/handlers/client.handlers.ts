// features/clients/handlers/client.handlers.ts

import { Client } from "../types/client.types"

// ─────────────────────────────────────
// Normalize Client
// ─────────────────────────────────────

export function normalizeClient(client: Client): Client {
  return {
    ...client,

    id: client.id.trim(),

    sheetId: client.sheetId.trim(),

    companyName: client.companyName.trim(),

    gstNumber: client.gstNumber.trim(),

    address: client.address.trim(),

    description: client.description?.trim() || "",

    logoUrl: client.logoUrl?.trim() || "",

    website: client.website?.trim() || "",

    contactPersonName: client.contactPersonName.trim(),

    contactPersonEmail: client.contactPersonEmail.trim().toLowerCase(),

    contactPersonPhone: client.contactPersonPhone.trim(),

    superAdminName: client.superAdminName.trim(),

    superAdminEmail: client.superAdminEmail.trim().toLowerCase(),

    superAdminPhoneNumber: client.superAdminPhoneNumber.trim(),

    username: client.username.trim(),

    password: client.password.trim(),

    createdAt: client.createdAt.trim(),
  }
}

// ─────────────────────────────────────
// Generate Username
// ─────────────────────────────────────

export function generateUsername(companyName: string) {
  return companyName.trim().toLowerCase().replace(/\s+/g, "")
}

// ─────────────────────────────────────
// Generate Default Password
// ─────────────────────────────────────

export function generatePassword(companyName: string) {
  const normalized = companyName.trim().toLowerCase().replace(/\s+/g, "")

  return `${normalized}@123`
}

// ─────────────────────────────────────
// Generate Client ID
// ─────────────────────────────────────

export function generateClientId() {
  return `client_${Date.now()}`
}

// ─────────────────────────────────────
// Generate Created At
// ─────────────────────────────────────

export function generateCreatedAt() {
  return new Date().toISOString()
}

// ─────────────────────────────────────
// Match Clients
// ─────────────────────────────────────

export function clientsMatch(a: Client, b: Client) {
  return (
    a.companyName.trim().toLowerCase() === b.companyName.trim().toLowerCase()
  )
}

// ─────────────────────────────────────
// Check Duplicate
// ─────────────────────────────────────

export function clientExists(clients: Client[], client: Client) {
  return clients.some((item) => clientsMatch(item, client))
}
