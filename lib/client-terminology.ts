/**
 * Determines the appropriate term for "Purchase" based on client name
 */
export function getPurchaseTerm(clientName?: string | null): string {
  if (!clientName) return "Purchase"

  // Convert to lowercase for case-insensitive comparison
  const normalizedName = clientName.toLowerCase()

  // Check if client uses custom terminology
  if (normalizedName === "smeltech" || normalizedName === "cranoist") {
    return "Received"
  }

  return "Purchase"
}

/**
 * Determines the appropriate term for "Sales" based on client name
 */
export function getSalesTerm(clientName?: string | null): string {
  if (!clientName) return "Sales"

  // Convert to lowercase for case-insensitive comparison
  const normalizedName = clientName.toLowerCase()

  // Check if client uses custom terminology
  if (normalizedName === "smeltech" || normalizedName === "cranoist") {
    return "Issue"
  }

  return "Sales"
}

