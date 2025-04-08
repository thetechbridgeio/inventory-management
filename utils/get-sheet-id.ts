import { cookies } from "next/headers"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

/**
 * Gets the appropriate Google Sheet ID based on the current client context
 *
 * @returns The client-specific sheet ID if available, or the default sheet ID
 */
export async function getSheetId(request?: Request): Promise<string> {
  // For server components and API routes
  let clientId = null

  if (request) {
    // Try to get client ID from query parameters first
    const url = new URL(request.url)
    clientId = url.searchParams.get("clientId")

    if (clientId) {
      console.log(`getSheetId: Found clientId=${clientId} in request query params`)
    } else {
      // Try to get client ID from cookies in the request
      const cookieHeader = request.headers.get("cookie")
      if (cookieHeader) {
        const clientIdMatch = cookieHeader.match(/clientId=([^;]+)/)
        clientId = clientIdMatch ? clientIdMatch[1] : null

        if (clientId) {
          console.log(`getSheetId: Found clientId=${clientId} in request cookies`)
        } else {
          console.log(`getSheetId: No clientId found in request cookies`)
        }
      } else {
        console.log(`getSheetId: No cookie header found in request`)
      }
    }
  } else {
    // For server components that can use the cookies() API directly
    try {
      const cookieStore = cookies()
      clientId = cookieStore.get("clientId")?.value

      if (clientId) {
        console.log(`getSheetId: Found clientId=${clientId} in cookie store`)
      } else {
        console.log(`getSheetId: No clientId found in cookie store`)
      }
    } catch (error) {
      console.error("Error accessing cookies:", error)
    }
  }

  // If we have a client ID, try to get the sheet ID
  if (clientId) {
    try {
      // Fetch the client's sheet ID from the master sheet
      const clientData = await fetchClientData(clientId)
      if (clientData?.sheetId) {
        console.log(`getSheetId: Using sheet ID ${clientData.sheetId} for client ${clientId}`)
        return clientData.sheetId
      } else {
        console.log(`getSheetId: No sheet ID found for client ${clientId}`)
      }
    } catch (error) {
      console.error(`getSheetId: Error fetching client data for ${clientId}:`, error)
    }
  }

  // Fallback to default sheet ID
  const defaultSheetId = process.env.GOOGLE_SHEET_ID || ""
  console.log(`getSheetId: Using default sheet ID: ${defaultSheetId.substring(0, 5)}...`)
  return defaultSheetId
}

/**
 * Fetches client data from the master sheet
 */
async function fetchClientData(clientId: string) {
  try {
    const masterSheetId = process.env.MASTER_SHEET_ID
    if (!masterSheetId) {
      throw new Error("Master Sheet ID not found in environment variables")
    }

    // Initialize Google Sheets API
    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Fetch data from the Clients sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheetId,
      range: "Clients!A:F", // Includes ID and Sheet ID columns
    })

    const rows = response.data.values
    if (!rows || rows.length <= 1) {
      return null
    }

    // Extract headers from the first row
    const headers = rows[0]

    // Find the client with matching ID
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const id = row[0]

      if (id === clientId) {
        const client: Record<string, any> = {}
        headers.forEach((header: string, index: number) => {
          // Convert header to camelCase for consistent property naming
          const key = header.toLowerCase().replace(/\s(.)/g, (_, char) => char.toUpperCase())
          client[key] = row[index] || ""
        })
        return client
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching client data:", error)
    return null
  }
}
