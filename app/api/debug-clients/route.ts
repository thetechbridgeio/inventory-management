import { NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

export async function GET() {
  try {
    console.log("Debug clients endpoint called at:", new Date().toISOString())

    // Check environment variables
    const envCheck = {
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_APP_PASSWORD: !!process.env.EMAIL_APP_PASSWORD,
      GOOGLE_CLIENT_EMAIL: !!process.env.GOOGLE_CLIENT_EMAIL,
      GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
      MASTER_SHEET_ID: !!process.env.MASTER_SHEET_ID,
      CRON_SECRET: !!process.env.CRON_SECRET,
    }

    if (!process.env.MASTER_SHEET_ID) {
      return NextResponse.json({
        success: false,
        error: "MASTER_SHEET_ID not found",
        environmentCheck: envCheck,
      })
    }

    // Create Google Sheets client
    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Fetch clients from master sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.MASTER_SHEET_ID,
      range: "Clients!A:F",
    })

    const rows = response.data.values || []
    console.log(`Found ${rows.length} rows in master sheet`)

    if (rows.length <= 1) {
      return NextResponse.json({
        success: true,
        message: "No client data found (only headers or empty sheet)",
        rowCount: rows.length,
        headers: rows[0] || [],
        environmentCheck: envCheck,
      })
    }

    const headers = rows[0]
    const clients = rows.slice(1).map((row, index) => {
      const client: any = { rowIndex: index + 2 } // +2 because of 0-based index and header row
      headers.forEach((header, headerIndex) => {
        const key = header.toLowerCase().replace(/\s(.)/g, (_, char) => char.toUpperCase())
        client[key] = row[headerIndex] || ""
      })

      // Ensure consistent property names
      client.clientId = client.id || client.clientId
      client.name = client.name || client.clientName
      client.email = client.email || client.clientEmail
      client.sheetId = client.sheetId || client.googleSheetId

      return client
    })

    // Group clients by email to identify duplicates
    const emailGroups: { [email: string]: any[] } = {}
    clients.forEach((client) => {
      if (client.email) {
        if (!emailGroups[client.email]) {
          emailGroups[client.email] = []
        }
        emailGroups[client.email].push(client)
      }
    })

    const duplicateEmails = Object.entries(emailGroups).filter(([_, clients]) => clients.length > 1)

    const validClients = clients.filter((client) => client.email && client.sheetId && client.clientId)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environmentCheck: envCheck,
      summary: {
        totalRows: rows.length,
        totalClients: clients.length,
        validClients: validClients.length,
        uniqueEmails: Object.keys(emailGroups).length,
        duplicateEmailCount: duplicateEmails.length,
      },
      headers,
      clients: clients.map((client) => ({
        rowIndex: client.rowIndex,
        name: client.name,
        email: client.email,
        clientId: client.clientId,
        hasSheetId: !!client.sheetId,
        isValid: !!(client.email && client.sheetId && client.clientId),
      })),
      duplicateEmails: duplicateEmails.map(([email, clients]) => ({
        email,
        count: clients.length,
        clients: clients.map((c) => ({ name: c.name, rowIndex: c.rowIndex })),
      })),
    })
  } catch (error) {
    console.error("Error in debug clients:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
