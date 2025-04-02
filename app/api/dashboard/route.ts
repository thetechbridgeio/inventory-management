import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const clientId = searchParams.get("clientId")

  try {
    // Authenticate with Google Sheets API
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"],
    )

    const sheets = google.sheets({ version: "v4", auth })

    // Determine which spreadsheet to use based on clientId
    // If clientId is provided, use the client-specific sheet, otherwise use the master sheet
    const spreadsheetId = clientId
      ? process.env.GOOGLE_SHEET_ID // This should be the client-specific sheet ID
      : process.env.MASTER_SHEET_ID

    if (!spreadsheetId) {
      return NextResponse.json({ error: "Sheet ID not configured" }, { status: 500 })
    }

    // Fetch dashboard data from multiple sheets
    const [inventoryResponse, salesResponse, purchasesResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Inventory!A:Z",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Sales!A:Z",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Purchases!A:Z",
      }),
    ])

    // Process the data for the dashboard
    const dashboardData = {
      inventory: inventoryResponse.data.values || [],
      sales: salesResponse.data.values || [],
      purchases: purchasesResponse.data.values || [],
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

