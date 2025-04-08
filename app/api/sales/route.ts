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
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\\n"),
      ["https://www.googleapis.com/auth/spreadsheets"],
    )

    const sheets = google.sheets({ version: "v4", auth })

    // Fetch data from the Sales sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Sales!A:Z", // Wide range to capture all columns
    })

    const rows = response.data.values

    if (!rows || rows.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Extract headers from the first row
    const headers = rows[0]

    // Map the data to objects with proper keys
    const sales = rows.slice(1).map((row) => {
      const sale: Record<string, any> = {}
      headers.forEach((header: string, index: number) => {
        // Convert header to camelCase for consistent property naming
        const key = header.toLowerCase().replace(/\s(.)/g, (_, char) => char.toUpperCase())
        sale[key] = row[index] || ""
      })
      return sale
    })

    return NextResponse.json({ data: sales })
  } catch (error) {
    console.error("Error fetching sales:", error)

    let errorMessage = "Failed to fetch sales"
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
    const saleData = await request.json()

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
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\\n"),
      ["https://www.googleapis.com/auth/spreadsheets"],
    )

    const sheets = google.sheets({ version: "v4", auth })

    // Check if Sales sheet exists, create it if not
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId })
    let salesSheetExists = false

    for (const sheet of spreadsheet.data.sheets || []) {
      if (sheet.properties?.title === "Sales") {
        salesSheetExists = true
        break
      }
    }

    if (!salesSheetExists) {
      // Add Sales sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Sales",
                },
              },
            },
          ],
        },
      })

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Sales!A1:H1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [["ID", "Date", "Customer", "Product", "Quantity", "Unit Price", "Total", "Indent Number"]],
        },
      })
    }

    // Generate a unique ID if not provided
    if (!saleData.id) {
      saleData.id = `sale_${Date.now()}`
    }

    // Calculate total if not provided
    if (!saleData.total && saleData.quantity && saleData.unitPrice) {
      saleData.total = (Number.parseFloat(saleData.quantity) * Number.parseFloat(saleData.unitPrice)).toString()
    }

    // Append the new sale
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sales!A:H",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            saleData.id,
            saleData.date || new Date().toISOString().split("T")[0],
            saleData.customer || "",
            saleData.product || "",
            saleData.quantity || "",
            saleData.unitPrice || "",
            saleData.total || "",
            saleData.indentNumber || "",
          ],
        ],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Sale added successfully",
      sale: saleData,
    })
  } catch (error) {
    console.error("Error adding sale:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to add sale" }, { status: 500 })
  }
}
