import { google } from "googleapis"

/**
 * Fetches client data from the master sheet
 */
export async function fetchClientData(clientId: string) {
  try {
    console.log(`fetchClientData: Fetching data for client ID: ${clientId}`)

    const masterSheetId = process.env.MASTER_SHEET_ID
    if (!masterSheetId) {
      console.error("fetchClientData: Master Sheet ID not found in environment variables")
      throw new Error("Master Sheet ID not found in environment variables")
    }

    console.log(`fetchClientData: Using master sheet ID: ${masterSheetId.substring(0, 5)}...`)
    console.log(`fetchClientData: Will search for client ID ${clientId} in master sheet`)

    // Initialize Google Sheets API
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"],
    )

    const sheets = google.sheets({ version: "v4", auth })

    // Fetch data from the Clients sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheetId,
      range: "Clients!A:F", // Includes ID and Sheet ID columns
    })

    const rows = response.data.values
    if (!rows || rows.length <= 1) {
      console.log("fetchClientData: No client data found in master sheet")
      return null
    }

    console.log(`fetchClientData: Found ${rows.length - 1} clients in master sheet`)

    // Extract headers from the first row
    const headers = rows[0]
    console.log(`fetchClientData: Headers: ${headers.join(", ")}`)

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

        console.log(`fetchClientData: Found client with ID ${clientId} at row ${i + 1}`)
        console.log(
          `fetchClientData: Client ${clientId} found with sheet ID: ${client.sheetId?.substring(0, 5) || "undefined"}...`,
        )

        console.log(`fetchClientData: Client data: ${JSON.stringify(client)}`)
        return client
      }
    }

    console.log(`fetchClientData: No client found with ID ${clientId}`)
    console.log(`fetchClientData: Will return null for client ${clientId}`)
    return null
  } catch (error) {
    console.error("fetchClientData: Error fetching client data:", error)
    return null
  }
}
