import { NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

export async function POST(request: Request) {
  try {
    const { sheetName, items, clientId } = await request.json()

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items to delete" }, { status: 400 })
    }

    // Get client-specific sheet ID if clientId is provided
    let sheetId = process.env.GOOGLE_SHEET_ID // Default sheet ID

    if (clientId) {
      // Fetch the client's sheet ID from the Clients sheet
      const auth = new JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL || "",
        key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      })

      const sheets = google.sheets({ version: "v4", auth })

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "Clients!A:F",
      })

      const rows = response.data.values || []

      if (rows.length > 1) {
        // Find the client by ID
        const headers = rows[0]
        const sheetIdIndex = headers.findIndex((h: string) => h === "Sheet ID")
        const idIndex = headers.findIndex((h: string) => h === "ID")

        if (idIndex !== -1 && sheetIdIndex !== -1) {
          for (let i = 1; i < rows.length; i++) {
            if (rows[i][idIndex] === clientId && rows[i][sheetIdIndex]) {
              sheetId = rows[i][sheetIdIndex]
              break
            }
          }
        }
      }
    }

    // Create auth client
    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL || "",
      key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Create sheets client
    const sheets = google.sheets({ version: "v4", auth })

    // Get the spreadsheet to find all sheet names
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    })

    // Get all sheet names from the spreadsheet
    const allSheets = spreadsheet.data.sheets || []
    const sheetTitles = allSheets.map((s) => s.properties?.title || "")

    // Get the current data to find the rows to delete
    let response
    try {
      response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:Z`, // Get all columns
      })
    } catch (error) {
      // Try with each available sheet name to see if any work
      let foundSheet = false
      for (const title of sheetTitles) {
        try {
          response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `${title}!A:Z`,
          })
          foundSheet = true
          break
        } catch (innerError) {}
      }

      if (!foundSheet) {
        return NextResponse.json(
          {
            error: `Could not access any sheet. Available sheets: ${sheetTitles.join(", ")}`,
          },
          { status: 404 },
        )
      }
    }

    const rows = response.data.values || []
    if (rows.length <= 1) {
      // Only header row or empty
      return NextResponse.json({ error: "No data found in sheet" }, { status: 404 })
    }

    const headers = rows[0]

    // Find the index of the srNo column
    let srNoColIndex = headers.indexOf("srNo")
    if (srNoColIndex === -1) {
      srNoColIndex = headers.indexOf("Sr. no")
    }
    if (srNoColIndex === -1) {
      srNoColIndex = headers.findIndex(
        (h) => typeof h === "string" && h.toLowerCase().includes("sr") && h.toLowerCase().includes("no"),
      )
    }
    if (srNoColIndex === -1) {
      return NextResponse.json({ error: "Could not find srNo column" }, { status: 404 })
    }

    // Get the srNo values of the items to delete
    const srNosToDelete = items.map((item) => item.srNo)

    // Find the row indices to delete (1-indexed for Google Sheets API, and +1 for header row)
    const rowsToDelete = []
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length <= srNoColIndex) continue // Skip empty rows or rows without srNo

      const srNo = row[srNoColIndex]
      // Convert to number for comparison if needed
      if (srNosToDelete.includes(Number(srNo)) || srNosToDelete.includes(srNo)) {
        // +1 for header row, +1 because Google Sheets is 1-indexed
        rowsToDelete.push(i + 1)
      }
    }

    if (rowsToDelete.length === 0) {
      return NextResponse.json({ error: "No matching rows found to delete" }, { status: 404 })
    }

    // Find the sheet ID for the sheet we're working with
    // We need to find the sheet ID regardless of case sensitivity
    let targetSheetId = null
    for (const sheet of allSheets) {
      const title = sheet.properties?.title || ""
      if (title.toLowerCase() === sheetName.toLowerCase()) {
        targetSheetId = sheet.properties?.sheetId
        break
      }
    }

    if (targetSheetId === null) {
      return NextResponse.json(
        {
          error: `Could not find sheet ID for ${sheetName}. Available sheets: ${sheetTitles.join(", ")}`,
        },
        { status: 404 },
      )
    }

    // Sort in descending order to avoid shifting indices when deleting multiple rows
    rowsToDelete.sort((a, b) => b - a)

    // Delete each row
    const requests = rowsToDelete.map((rowIndex) => ({
      deleteDimension: {
        range: {
          sheetId: targetSheetId,
          dimension: "ROWS",
          startIndex: rowIndex - 1, // 0-indexed in the request
          endIndex: rowIndex, // exclusive end index
        },
      },
    }))

    // Execute the batch update
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: requests,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${rowsToDelete.length} items from ${sheetName}`,
      deletedCount: rowsToDelete.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to delete items",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

