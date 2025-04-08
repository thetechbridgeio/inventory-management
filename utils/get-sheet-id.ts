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
  if (request) {
    // Try to get client ID from cookies in the request
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      const clientIdMatch = cookieHeader.match(/clientId=([^;]+)/)
      const clientId = clientIdMatch ? clientIdMatch[1] : null

      if (clientId) {
        console.log(`getSheetId: Found clientId=${clientId} in request cookies`)
        // Fetch the client's sheet ID from the master sheet
        const clientData = await fetchClientData(clientId)
        if (clientData?.sheetId) {
          console.log(`getSheetId: Using sheet ID ${clientData.sheetId} for client ${clientId}`)
          return clientData.sheetId
        } else {
          console.log(`getSheetId: No sheet ID found for client ${clientId}`)
        }
      } else {
        console.log(`getSheetId: No clientId found in request cookies`)
      }
    } else {
      console.log(`getSheetId: No cookie header found in request`)
    }
  } else {
    // For server components that can use the cookies() API directly
    const cookieStore = cookies()
    const clientId = cookieStore.get("clientId")?.value

    if (clientId) {
      console.log(`getSheetId: Found clientId=${clientId} in cookie store`)
      // Fetch the client's sheet ID from the master sheet
      const clientData = await fetchClientData(clientId)
      if (clientData?.sheetId) {
        console.log(`getSheetId: Using sheet ID ${clientData.sheetId} for client ${clientId}`)
        return clientData.sheetId
      } else {
        console.log(`getSheetId: No sheet ID found for client ${clientId}`)
      }
    } else {
      console.log(`getSheetId: No clientId found in cookie store`)
    }
  }

  // Fallback to default sheet ID
  console.log(`getSheetId: Using default sheet ID`)
  return process.env.GOOGLE_SHEET_ID || ""
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
