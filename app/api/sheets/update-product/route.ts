import { NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

// This would normally come from environment variables
const SHEET_ID = "1uciOxoRw9k5HwNFtvYK1CWqcMDDGz2clqWj3CaHdQ5I"

// Get environment variables
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || ""
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") || ""

// Create auth client
const auth = new JWT({
  email: GOOGLE_CLIENT_EMAIL,
  key: GOOGLE_PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

// Create sheets client
const sheets = google.sheets({ version: "v4", auth })

export async function PUT(request: Request) {
  try {
    const { originalProduct, updatedProduct } = await request.json()
    console.log(`Updating product: ${originalProduct} with:`, updatedProduct)

    // Find the row index for the product in the Inventory sheet
    const inventoryResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Inventory!A:Z", // Get all columns to find the headers
    })

    const inventoryRows = inventoryResponse.data.values || []
    if (inventoryRows.length === 0) {
      console.log("No inventory data found")
      return NextResponse.json({ error: "No inventory data found" }, { status: 404 })
    }

    const headers = inventoryRows[0]
    console.log(`Inventory headers: ${headers.join(", ")}`)

    // Look for either "product" or "Product" in the headers
    let productColIndex = headers.indexOf("product")
    if (productColIndex === -1) {
      productColIndex = headers.indexOf("Product")
    }

    if (productColIndex === -1) {
      console.log("Product column not found in headers")
      return NextResponse.json({ error: "Product column not found" }, { status: 404 })
    }

    // Find the product row index (add 1 because Google Sheets is 1-indexed and we skip the header row)
    let rowIndex = -1
    for (let i = 1; i < inventoryRows.length; i++) {
      if (inventoryRows[i][productColIndex] === originalProduct) {
        rowIndex = i + 1 // +1 because Google Sheets is 1-indexed
        break
      }
    }

    if (rowIndex === -1) {
      console.log(`Product '${originalProduct}' not found in inventory`)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    console.log(`Found product at row index: ${rowIndex}`)

    // Create a row with values in the correct order
    const rowValues = headers.map((header: string) => {
      // Map our lowercase field names to the actual header names in the sheet
      const headerLower = header.toLowerCase()

      // Add timestamp for the Timestamp column
      if (headerLower === "timestamp") {
        return new Date().toISOString()
      }

      if (headerLower === "sr. no" || headerLower === "sr.no" || headerLower === "srno") {
        return updatedProduct.srNo
      } else if (headerLower === "product") {
        return updatedProduct.product
      } else if (headerLower === "category") {
        return updatedProduct.category
      } else if (headerLower === "unit") {
        return updatedProduct.unit
      } else if (headerLower === "minimum quantity") {
        return updatedProduct.minimumQuantity
      } else if (headerLower === "maximum quantity") {
        return updatedProduct.maximumQuantity
      } else if (headerLower === "reorder quantity") {
        return updatedProduct.reorderQuantity
      } else if (headerLower === "stock") {
        return updatedProduct.stock
      } else if (headerLower === "price per unit") {
        return updatedProduct.pricePerUnit
      } else if (headerLower === "value") {
        return updatedProduct.value
      }

      // Return empty string for unknown headers
      return ""
    })

    // Update the entire row in the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Inventory!A${rowIndex}:${String.fromCharCode(64 + headers.length)}${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [rowValues],
      },
    })

    console.log("Product updated successfully")
    return NextResponse.json({ success: true, message: "Product updated successfully" })
  } catch (error) {
    console.error("Error updating product in Google Sheets:", error)
    return NextResponse.json(
      {
        error: "Failed to update product",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

