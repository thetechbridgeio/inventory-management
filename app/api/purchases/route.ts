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

    // Fetch data from the Purchases sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Purchases!A:Z", // Wide range to capture all columns
    })

    const rows = response.data.values

    if (!rows || rows.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Extract headers from the first row
    const headers = rows[0]

    // Map the data to objects with proper keys
    const purchases = rows.slice(1).map((row) => {
      const purchase: Record<string, any> = {}
      headers.forEach((header: string, index: number) => {
        // Convert header to camelCase for consistent property naming
        const key = header.toLowerCase().replace(/\s(.)/g, (_, char) => char.toUpperCase())
        purchase[key] = row[index] || ""
      })
      return purchase
    })

    return NextResponse.json({ data: purchases })
  } catch (error) {
    console.error("Error fetching purchases:", error)

    let errorMessage = "Failed to fetch purchases"
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
    const purchaseData = await request.json()

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

    // Check if Purchases sheet exists, create it if not
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId })
    let purchasesSheetExists = false

    for (const sheet of spreadsheet.data.sheets || []) {
      if (sheet.properties?.title === "Purchases") {
        purchasesSheetExists = true
        break
      }
    }

    if (!purchasesSheetExists) {
      // Add Purchases sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Purchases",
                },
              },
            },
          ],
        },
      })

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Purchases!A1:G1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["ID", "Date", "Supplier", "Product", "Quantity", "Unit Price", "Total"]],
        },
      })
    }

    // Generate a unique ID if not provided
    if (!purchaseData.id) {
      purchaseData.id = `purchase_${Date.now()}`
    }

    // Calculate total if not provided
    if (!purchaseData.total && purchaseData.quantity && purchaseData.unitPrice) {
      purchaseData.total = (
        Number.parseFloat(purchaseData.quantity) * Number.parseFloat(purchaseData.unitPrice)
      ).toString()
    }

    // Append the new purchase
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Purchases!A:G",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            purchaseData.id,
            purchaseData.date || new Date().toISOString().split("T")[0],
            purchaseData.supplier || "",
            purchaseData.product || "",
            purchaseData.quantity || "",
            purchaseData.unitPrice || "",
            purchaseData.total || "",
          ],
        ],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Purchase added successfully",
      purchase: purchaseData,
    })
  } catch (error) {
    console.error("Error adding purchase:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add purchase" },
      { status: 500 },
    )
  }
}

