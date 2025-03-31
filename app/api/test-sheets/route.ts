import { NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

// This would normally come from environment variables
const SHEET_ID = "1uciOxoRw9k5HwNFtvYK1CWqcMDDGz2clqWj3CaHdQ5I"

// Get environment variables
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || ""
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") || ""

export async function GET() {
  try {
    // Log the credentials (partially redacted for security)
    console.log(
      "Client email:",
      GOOGLE_CLIENT_EMAIL
        ? `${GOOGLE_CLIENT_EMAIL.substring(0, 5)}...${GOOGLE_CLIENT_EMAIL.substring(GOOGLE_CLIENT_EMAIL.indexOf("@"))}`
        : "Not provided",
    )

    console.log("Private key provided:", !!GOOGLE_PRIVATE_KEY)

    if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        {
          error: "Missing credentials",
          clientEmail: !!GOOGLE_CLIENT_EMAIL,
          privateKey: !!GOOGLE_PRIVATE_KEY,
        },
        { status: 400 },
      )
    }

    // Create auth client
    const auth = new JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Create sheets client
    const sheets = google.sheets({ version: "v4", auth })

    // Test connection by getting spreadsheet info
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    })

    // Get list of sheets
    const sheetsList = spreadsheet.data.sheets?.map((sheet) => ({
      title: sheet.properties?.title,
      sheetId: sheet.properties?.sheetId,
      index: sheet.properties?.index,
    }))

    // Get a sample of data from each sheet
    const sheetsData = {}

    if (sheetsList) {
      for (const sheet of sheetsList) {
        if (sheet.title) {
          try {
            const response = await sheets.spreadsheets.values.get({
              spreadsheetId: SHEET_ID,
              range: `${sheet.title}!A1:E2`, // Just get headers and first row
            })

            sheetsData[sheet.title] = {
              headers: response.data.values?.[0] || [],
              firstRow: response.data.values?.[1] || [],
            }
          } catch (error) {
            sheetsData[sheet.title] = { error: "Failed to fetch data" }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      spreadsheetTitle: spreadsheet.data.properties?.title,
      sheets: sheetsList,
      sheetsData,
    })
  } catch (error) {
    console.error("Error testing Google Sheets connection:", error)
    return NextResponse.json(
      {
        error: "Failed to connect to Google Sheets",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

