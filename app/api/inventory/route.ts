import { NextResponse } from "next/server"
import { google } from "googleapis"
import { getSheetId } from "@/utils/get-sheet-id"

export const fetchCache = "force-no-store"

export async function GET(request: Request) {
  try {
    // Get the appropriate sheet ID for the current client
    const sheetId = await getSheetId(request)

    if (!sheetId) {
      return NextResponse.json(
        { error: "No sheet ID available. Please select a client or check configuration." },
        { status: 400 },
      )
    }

    // Initialize Google Sheets API
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"],
    )

    const sheets = google.sheets({ version: "v4", auth })

    // Fetch data from the Inventory sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Inventory!A:Z", // Wide range to capture all columns
    })

    const rows = response.data.values

    if (!rows || rows.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Extract headers from the first row
    const headers = rows[0]

    // Map the data to objects with proper keys
    const inventory = rows.slice(1).map((row) => {
      const item: Record<string, any> = {}
      headers.forEach((header: string, index: number) => {
        // Convert header to camelCase for consistent property naming
        const key = header.toLowerCase().replace(/\s(.)/g, (_, char) => char.toUpperCase())
        item[key] = row[index] || ""
      })
      return item
    })

    return NextResponse.json({ data: inventory })
  } catch (error) {
    console.error("Error fetching inventory:", error)

    let errorMessage = "Failed to fetch inventory"
    let statusCode = 500

    // Check for specific Google API errors
    if (error instanceof Error && "response" in error && (error as any).response?.data?.error) {
      const googleError = (error as any).response.data.error
      errorMessage = googleError.message || errorMessage

      // Handle permission errors specifically
      if (
        googleError.status === "PERMISSION_DENIED" ||
        errorMessage.includes("permission") ||
        errorMessage.includes("access")
      ) {
        statusCode = 403
        errorMessage = `Permission denied: ${errorMessage}. Please ensure the service account has access to this sheet.`
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function POST(request: Request) {
  try {
    const itemData = await request.json()

    // Get the appropriate sheet ID for the current client
    const sheetId = await getSheetId(request)

    if (!sheetId) {
      return NextResponse.json(
        { error: "No sheet ID available. Please select a client or check configuration." },
        { status: 400 },
      )
    }

    // Initialize Google Sheets API
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"],
    )

    const sheets = google.sheets({ version: "v4", auth })

    // Check if Inventory sheet exists, create it if not
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId })
    let inventorySheetExists = false

    for (const sheet of spreadsheet.data.sheets || []) {
      if (sheet.properties?.title === "Inventory") {
        inventorySheetExists = true
        break
      }
    }

    if (!inventorySheetExists) {
      // Add Inventory sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Inventory",
                },
              },
            },
          ],
        },
      })

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Inventory!A1:E1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["ID", "Name", "Category", "Quantity", "Unit Price"]],
        },
      })
    }

    // Generate a unique ID if not provided
    if (!itemData.id) {
      itemData.id = `item_${Date.now()}`
    }

    // Append the new item
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Inventory!A:E",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            itemData.id,
            itemData.name || "",
            itemData.category || "",
            itemData.quantity || "",
            itemData.unitPrice || "",
          ],
        ],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Inventory item added successfully",
      item: itemData,
    })
  } catch (error) {
    console.error("Error adding inventory item:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add inventory item" },
      { status: 500 },
    )
  }
}

