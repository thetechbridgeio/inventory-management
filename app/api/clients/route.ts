import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  try {
    // Initialize Google Sheets API
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"],
    )

    const sheets = google.sheets({ version: "v4", auth })

    // Get the spreadsheet ID from environment variables
    const spreadsheetId = process.env.MASTER_SHEET_ID || process.env.GOOGLE_SHEET_ID

    if (!spreadsheetId) {
      throw new Error("Master Sheet ID not found in environment variables")
    }

    // Fetch data from the Clients sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Clients!A:H", // Updated range to include username and password
    })

    const rows = response.data.values

    if (!rows || rows.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Extract headers from the first row
    const headers = rows[0]

    // Map the data to objects with proper keys
    const clients = rows.slice(1).map((row) => {
      const client: Record<string, any> = {}
      headers.forEach((header: string, index: number) => {
        // Convert header to camelCase for consistent property naming
        const key = header.toLowerCase().replace(/\s(.)/g, (_, char) => char.toUpperCase())
        client[key] = row[index] || ""
      })
      return client
    })

    return NextResponse.json({ data: clients })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch clients" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { client } = await request.json()

    if (!client || !client.name || !client.email) {
      return NextResponse.json({ error: "Client name and email are required" }, { status: 400 })
    }

    // Initialize Google Sheets API
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"],
    )

    const sheets = google.sheets({ version: "v4", auth })

    // Get the spreadsheet ID from environment variables
    const spreadsheetId = process.env.MASTER_SHEET_ID || process.env.GOOGLE_SHEET_ID

    if (!spreadsheetId) {
      throw new Error("Master Sheet ID not found in environment variables")
    }

    // Check if Clients sheet exists, create it if not
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
    let clientsSheetExists = false

    for (const sheet of spreadsheet.data.sheets || []) {
      if (sheet.properties?.title === "Clients") {
        clientsSheetExists = true
        break
      }
    }

    if (!clientsSheetExists) {
      // Add Clients sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Clients",
                },
              },
            },
          ],
        },
      })

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Clients!A1:H1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["ID", "Name", "Email", "Phone", "Logo URL", "Sheet ID", "Username", "Password"]],
        },
      })
    }

    // Generate a unique ID if not provided
    if (!client.id) {
      client.id = `client_${Date.now()}`
    }

    // Generate username and password if not provided
    if (!client.username) {
      client.username = client.name.replace(/\s+/g, "").toLowerCase()
    }

    if (!client.password) {
      client.password = `${client.username}@123`
    }

    // Append the new client
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Clients!A:H",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            client.id,
            client.name,
            client.email,
            client.phone || "",
            client.logoUrl || "",
            client.sheetId || "",
            client.username,
            client.password,
          ],
        ],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Client added successfully",
      client,
    })
  } catch (error) {
    console.error("Error adding client:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add client" },
      { status: 500 },
    )
  }
}

