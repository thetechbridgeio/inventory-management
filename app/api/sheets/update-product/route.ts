import { google } from "googleapis"
import { NextResponse } from "next/server"
import { JWT } from "google-auth-library"

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { originalProduct, updatedProduct, clientId } = body

    console.log("Update product request:", {
      originalProduct,
      updatedProduct: updatedProduct ? { ...updatedProduct } : null,
      clientId,
    })

    // Validate request with more detailed checks
    if (!originalProduct) {
      console.error("Missing originalProduct in request")
      return NextResponse.json({ error: "Product name is required." }, { status: 400 })
    }

    if (!updatedProduct) {
      console.error("Missing updatedProduct in request")
      return NextResponse.json({ error: "Updated product data is required." }, { status: 400 })
    }

    // Direct Google Sheets authentication
    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = process.env.GOOGLE_SHEET_ID

    if (!spreadsheetId) {
      console.error("Google Sheet ID not found")
      return NextResponse.json({ error: "Google Sheet ID not found" }, { status: 500 })
    }

    try {
      // Skip the sheet detection and directly get the inventory data
      console.log("Attempting to directly access the sheet data")

      // Try to get all values from the spreadsheet first to see what's available
      const allSheetsResponse = await sheets.spreadsheets.get({
        spreadsheetId,
      })

      console.log(
        "All sheets in spreadsheet:",
        allSheetsResponse.data.sheets?.map((s) => s.properties?.title),
      )

      // Try to access the Inventory sheet directly
      const response = await sheets.spreadsheets.values
        .get({
          spreadsheetId,
          range: "Inventory!A:Z", // Try a wider range
        })
        .catch(async (err) => {
          console.error("Error accessing Inventory sheet:", err.message)

          // If that fails, try to get the first sheet
          const firstSheetName = allSheetsResponse.data.sheets?.[0]?.properties?.title
          console.log("Falling back to first sheet:", firstSheetName)

          if (firstSheetName) {
            return await sheets.spreadsheets.values.get({
              spreadsheetId,
              range: `${firstSheetName}!A:Z`,
            })
          }
          throw new Error("Could not access any sheet in the spreadsheet")
        })

      const rows = response.data.values || []
      if (rows.length === 0) {
        console.error("No data found in sheet")
        return NextResponse.json({ error: "No data found in sheet" }, { status: 404 })
      }

      // Find the header row to map column names
      const headers = rows[0]
      console.log("Headers found:", headers)

      const productColumnIndex = headers.findIndex(
        (header: string) =>
          header &&
          typeof header === "string" &&
          (header.toLowerCase().includes("product") ||
            header.toLowerCase().includes("item") ||
            header.toLowerCase().includes("name")),
      )

      if (productColumnIndex === -1) {
        console.error("Product column not found in headers:", headers)
        return NextResponse.json({ error: "Product column not found" }, { status: 404 })
      }

      console.log("Looking for product:", originalProduct, "in column index:", productColumnIndex)

      // Get all products for debugging
      const allProducts = rows
        .slice(1)
        .map((row) => row && row[productColumnIndex])
        .filter(Boolean)

      console.log("All products in sheet:", allProducts)

      // Find the row with the original product name - with more flexible matching
      let rowIndex = -1
      const originalProductStr = String(originalProduct).trim()

      // First try exact match
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        if (row && row[productColumnIndex] === originalProductStr) {
          rowIndex = i
          console.log("Found exact product match at row:", rowIndex + 1)
          break
        }
      }

      // If no exact match, try case-insensitive match
      if (rowIndex === -1) {
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          if (
            row &&
            row[productColumnIndex] &&
            String(row[productColumnIndex]).trim().toLowerCase() === originalProductStr.toLowerCase()
          ) {
            rowIndex = i
            console.log("Found case-insensitive product match at row:", rowIndex + 1)
            break
          }
        }
      }

      // If still no match, try partial match
      if (rowIndex === -1) {
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          if (
            row &&
            row[productColumnIndex] &&
            String(row[productColumnIndex]).trim().toLowerCase().includes(originalProductStr.toLowerCase())
          ) {
            rowIndex = i
            console.log("Found partial product match at row:", rowIndex + 1)
            break
          }
        }
      }

      if (rowIndex === -1) {
        console.error(`Product "${originalProduct}" not found in inventory.`)
        console.log("Available products:", allProducts)
        return NextResponse.json({ error: `Product "${originalProduct}" not found in inventory` }, { status: 404 })
      }

      // Create updated row values
      const updatedRow: any[] = Array(headers.length).fill("")

      // First, copy the existing row data as a base
      const existingRow = rows[rowIndex]
      for (let i = 0; i < existingRow.length; i++) {
        updatedRow[i] = existingRow[i]
      }

      // Then, map the updated product fields to the correct columns
      Object.keys(updatedProduct).forEach((key) => {
        const columnIndex = headers.findIndex(
          (header: string) =>
            header &&
            typeof header === "string" &&
            (header.toLowerCase() === key.toLowerCase() ||
              header.toLowerCase().includes(key.toLowerCase()) ||
              header.toLowerCase().includes(key.replace(/([A-Z])/g, " $1").toLowerCase())),
        )

        if (columnIndex !== -1) {
          updatedRow[columnIndex] = updatedProduct[key as keyof typeof updatedProduct]
          console.log(
            `Updating column "${headers[columnIndex]}" (index ${columnIndex}) with value:`,
            updatedRow[columnIndex],
          )
        } else {
          console.log(`Could not find column for field "${key}"`)
        }
      })

      console.log("Original row:", existingRow)
      console.log("Updated row:", updatedRow)

      // Get the sheet name that we're actually using
      const sheetName = response.config?.params?.range?.split("!")[0] || "Inventory"
      console.log("Using sheet name for update:", sheetName)

      // Update the row in the sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex + 1}:${String.fromCharCode(65 + headers.length - 1)}${rowIndex + 1}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [updatedRow],
        },
      })

      return NextResponse.json({ success: true, message: "Product updated successfully" })
    } catch (sheetError) {
      console.error("Error accessing or updating sheet:", sheetError)
      return NextResponse.json(
        {
          error: `Error accessing or updating sheet: ${sheetError.message}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      {
        error: `Failed to update product: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

