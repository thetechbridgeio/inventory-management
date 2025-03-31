import { NextResponse } from "next/server"
import { google } from "googleapis"
import { getSheetId } from "@/utils/get-sheet-id"

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

    // Fetch data from the Suppliers sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Suppliers!A:Z", // Wide range to capture all columns
    })

    const rows = response.data.values

    if (!rows || rows.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Extract headers from the first row
    const headers = rows[0]

    // Map the data to objects with proper keys
    const suppliers = rows.slice(1).map((row) => {
      const supplier: Record<string, any> = {}
      headers.forEach((header: string, index: number) => {
        // Convert header to camelCase for consistent property naming
        const key = header.toLowerCase().replace(/\s(.)/g, (_, char) => char.toUpperCase())
        supplier[key] = row[index] || ""
      })
      return supplier
    })

    return NextResponse.json({ data: suppliers })
  } catch (error) {
    console.error("Error fetching suppliers:", error)

    let errorMessage = "Failed to fetch suppliers"
    let statusCode = 500

    // Check for specific Google API errors
    if (error.response?.data?.error) {
      const googleError = error.response.data.error
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
    const supplierData = await request.json()

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

    // Check if Suppliers sheet exists, create it if not
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId })
    let suppliersSheetExists = false

    for (const sheet of spreadsheet.data.sheets || []) {
      if (sheet.properties?.title === "Suppliers") {
        suppliersSheetExists = true
        break
      }
    }

    if (!suppliersSheetExists) {
      // Add Suppliers sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Suppliers",
                },
              },
            },
          ],
        },
      })

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Suppliers!A1:E1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["ID", "Name", "Contact", "Email", "Address"]],
        },
      })
    }

    // Generate a unique ID if not provided
    if (!supplierData.id) {
      supplierData.id = `supplier_${Date.now()}`
    }

    // Append the new supplier
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Suppliers!A:E",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            supplierData.id,
            supplierData.name || "",
            supplierData.contact || "",
            supplierData.email || "",
            supplierData.address || "",
          ],
        ],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Supplier added successfully",
      supplier: supplierData,
    })
  } catch (error) {
    console.error("Error adding supplier:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add supplier" },
      { status: 500 },
    )
  }
}

