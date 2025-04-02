import { NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"
import type { NextRequest } from "next/server"

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

// Update the GET function to use client-specific sheet ID
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sheet = searchParams.get("sheet")
  const clientId = searchParams.get("clientId")

  console.log(`API /sheets: Received request for sheet=${sheet}, clientId=${clientId}`)

  if (!sheet) {
    console.error("API /sheets: Missing sheet parameter")
    return NextResponse.json({ error: "Sheet parameter is required" }, { status: 400 })
  }

  try {
    // Determine which sheet ID to use
    let SHEET_ID = process.env.GOOGLE_SHEET_ID || ""

    // If clientId is provided, try to get the client-specific sheet ID
    if (clientId) {
      try {
        // Fetch client data from master sheet
        const clientData = await fetchClientData(clientId)
        if (clientData?.sheetId) {
          SHEET_ID = clientData.sheetId
          console.log(`Using client-specific sheet ID for client ${clientId}: ${SHEET_ID}`)
        }
      } catch (error) {
        console.error("Error fetching client sheet ID:", error)
        // Continue with default sheet ID if there's an error
      }
    }

    if (!SHEET_ID) {
      return NextResponse.json({ error: "Sheet ID not configured" }, { status: 500 })
    }

    // Add logging for the spreadsheet ID being used
    console.log(`API /sheets: Using spreadsheetId=${SHEET_ID} for clientId=${clientId}`)

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheet}!A:Z`, // Get all columns
    })

    const rows = response.data.values || []
    console.log(`Received ${rows.length} rows from Google Sheets (including header)`)

    if (rows.length === 0) {
      console.log("No data found in the sheet")
      return NextResponse.json({ error: "No data found" }, { status: 404 })
    }

    // Extract headers and data
    const headers = rows[0]

    const data = rows.slice(1).map((row, rowIndex) => {
      const item: Record<string, any> = {}

      // Add srNo if it doesn't exist in the sheet
      if (!headers.includes("srNo") && !headers.includes("Sr. no")) {
        item.srNo = rowIndex + 1
      }

      // First, log the entire row for debugging

      headers.forEach((header: string, index: number) => {
        // Make sure we have a value for this cell
        if (index < row.length) {
          // Special handling for date fields
          if (header.toLowerCase().includes("date")) {
            // Get the raw value
            const rawValue = row[index]

            // Log the raw date value

            // For Purchase sheet, map "Date of receiving" to "dateOfReceiving"
            if (sheet === "Purchase" && header === "Date of receiving") {
              item["dateOfReceiving"] = rawValue
            } else {
              // For other date fields, use the original header
              item[header] = rawValue
            }
          } else if (!isNaN(Number(row[index])) && row[index] !== "") {
            item[header] = Number(row[index])
          } else {
            item[header] = row[index] || ""
          }
        } else {
          // If the cell is missing, set a default value based on the header
          if (
            [
              "stock",
              "Stock",
              "quantity",
              "Quantity",
              "value",
              "Value",
              "pricePerUnit",
              "Price per Unit",
              "minimumQuantity",
              "Minimum Quantity",
              "maximumQuantity",
              "Maximum Quantity",
              "reorderQuantity",
              "Reorder Quantity",
            ].includes(header)
          ) {
            item[header] = 0
          } else {
            item[header] = ""
          }
        }
      })

      // Calculate value for inventory items if it's missing
      if (
        sheet === "Inventory" &&
        (item.stock !== undefined || item.Stock !== undefined) &&
        (item.pricePerUnit !== undefined || item["Price per Unit"] !== undefined) &&
        item.value === undefined &&
        item.Value === undefined
      ) {
        const stock = item.stock !== undefined ? item.stock : item.Stock
        const pricePerUnit = item.pricePerUnit !== undefined ? item.pricePerUnit : item["Price per Unit"]
        item.value = stock * pricePerUnit
        item.Value = stock * pricePerUnit
      }

      // For Purchase sheet, ensure dateOfReceiving is set
      if (sheet === "Purchase") {
        // If dateOfReceiving is not set but "Date of receiving" exists, map it
        if (!item.dateOfReceiving && item["Date of receiving"]) {
          item.dateOfReceiving = item["Date of receiving"]
          console.log(`Mapped "Date of receiving" to dateOfReceiving: "${item.dateOfReceiving}"`)
        }
      }

      // Log the processed item

      return item
    })

    console.log(`Processed ${data.length} data rows`)

    // After fetching data, log the result size
    console.log(`API /sheets: Fetched ${rows.length} rows from ${sheet} sheet`)

    // Log a sample of the processed data with focus on dates

    return NextResponse.json({ data })
  } catch (error) {
    console.error(`API /sheets: Error fetching ${sheet} data:`, error)
    return NextResponse.json(
      {
        error: "Failed to fetch data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Update the PUT method to use client-specific sheet ID
export async function PUT(request: Request) {
  try {
    const { product, newStock, newValue, clientId } = await request.json()
    console.log(`Updating inventory for product: ${product}, new stock: ${newStock}, new value: ${newValue}`)

    // Determine which sheet ID to use
    let SHEET_ID = process.env.GOOGLE_SHEET_ID || ""

    // If clientId is provided, try to get the client-specific sheet ID
    if (clientId) {
      try {
        // Fetch client data from master sheet
        const clientData = await fetchClientData(clientId)
        if (clientData?.sheetId) {
          SHEET_ID = clientData.sheetId
          console.log(`Using client-specific sheet ID for client ${clientId}: ${SHEET_ID}`)
        }
      } catch (error) {
        console.error("Error fetching client sheet ID:", error)
        // Continue with default sheet ID if there's an error
      }
    }

    if (!SHEET_ID) {
      return NextResponse.json({ error: "Sheet ID not configured" }, { status: 500 })
    }

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
      if (inventoryRows[i][productColIndex] === product) {
        rowIndex = i + 1 // +1 because Google Sheets is 1-indexed
        break
      }
    }

    if (rowIndex === -1) {
      console.log(`Product '${product}' not found in inventory`)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    console.log(`Found product at row index: ${rowIndex}`)

    // Find the column indices for stock and value
    let stockColIndex = headers.indexOf("stock") + 1 // +1 for 1-indexed columns
    if (stockColIndex === 0) {
      stockColIndex = headers.indexOf("Stock") + 1
    }

    let valueColIndex = headers.indexOf("value") + 1 // +1 for 1-indexed columns
    if (valueColIndex === 0) {
      valueColIndex = headers.indexOf("Value") + 1
    }

    if (stockColIndex === 0) {
      console.log("Stock column not found in headers")
      return NextResponse.json({ error: "Stock column not found" }, { status: 404 })
    }

    if (valueColIndex === 0) {
      console.log("Value column not found in headers")
      return NextResponse.json({ error: "Value column not found" }, { status: 404 })
    }

    // Update the stock in the sheet
    console.log(`Updating stock at column ${String.fromCharCode(64 + stockColIndex)}, row ${rowIndex}`)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Inventory!${String.fromCharCode(64 + stockColIndex)}${rowIndex}`, // Convert column index to letter
      valueInputOption: "RAW",
      requestBody: {
        values: [[newStock]],
      },
    })

    // Update the value in the sheet
    console.log(`Updating value at column ${String.fromCharCode(64 + valueColIndex)}, row ${rowIndex}`)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Inventory!${String.fromCharCode(64 + valueColIndex)}${rowIndex}`, // Convert column index to letter
      valueInputOption: "RAW",
      requestBody: {
        values: [[newValue]],
      },
    })

    console.log("Inventory updated successfully")
    return NextResponse.json({ success: true, message: "Inventory updated successfully" })
  } catch (error) {
    console.error("Error updating data in Google Sheets:", error)
    return NextResponse.json(
      {
        error: "Failed to update data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Update the POST method to use client-specific sheet ID
export async function POST(request: Request) {
  try {
    const { sheetName, entry, clientId } = await request.json()
    console.log(`Adding new entry to ${sheetName}:`, entry)

    // Determine which sheet ID to use
    let SHEET_ID = process.env.GOOGLE_SHEET_ID || ""

    // If clientId is provided, try to get the client-specific sheet ID
    if (clientId) {
      try {
        // Fetch client data from master sheet
        const clientData = await fetchClientData(clientId)
        if (clientData?.sheetId) {
          SHEET_ID = clientData.sheetId
          console.log(`Using client-specific sheet ID for client ${clientId}: ${SHEET_ID}`)
        }
      } catch (error) {
        console.error("Error fetching client sheet ID:", error)
        // Continue with default sheet ID if there's an error
      }
    }

    if (!SHEET_ID) {
      return NextResponse.json({ error: "Sheet ID not configured" }, { status: 500 })
    }

    // Get the current data to determine the next srNo
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:A`, // Just need the srNo column
    })

    const rows = response.data.values || []
    let nextSrNo = 1

    // If there are rows (beyond the header), find the max srNo and add 1
    if (rows.length > 1) {
      // Check if the first column is "srNo" or "Sr. no"
      const isFirstColumnSrNo = rows[0][0] === "srNo" || rows[0][0] === "Sr. no"

      if (isFirstColumnSrNo) {
        const srNos = rows
          .slice(1)
          .map((row) => (row[0] ? Number(row[0]) : 0))
          .filter((num) => !isNaN(num))

        if (srNos.length > 0) {
          nextSrNo = Math.max(...srNos) + 1
        }
      }
    }

    console.log(`Next srNo: ${nextSrNo}`)

    // Always override any provided srNo with our calculated one
    const entryWithSrNo = { srNo: nextSrNo, ...entry }

    // Get the headers to ensure we add data in the correct order
    const headersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!1:1`, // Just the header row
    })

    const headers = headersResponse.data.values?.[0] || []

    if (headers.length === 0) {
      console.log(`No headers found in sheet ${sheetName}`)
      return NextResponse.json({ error: "No headers found in sheet" }, { status: 404 })
    }

    console.log(`${sheetName} headers: ${headers.join(", ")}`)

    // Create a row with values in the correct order
    const rowValues = headers.map((header) => {
      // Map our lowercase field names to the actual header names in the sheet
      let value = entryWithSrNo[header]

      // If the header is srNo or Sr. no, always use our calculated nextSrNo
      if (header.toLowerCase() === "srno" || header.toLowerCase() === "sr. no" || header.toLowerCase() === "sr no") {
        return nextSrNo
      }

      // Add timestamp for the Timestamp column
      if (header.toLowerCase() === "timestamp") {
        return new Date().toISOString()
      }

      // If the value is undefined, try to find a matching field with different casing
      if (value === undefined) {
        // Convert header to lowercase for case-insensitive comparison
        const headerLower = header.toLowerCase()

        // Check for common field name patterns
        if (headerLower === "sr. no" || headerLower === "sr.no") {
          value = entryWithSrNo.srNo
        } else if (headerLower === "product") {
          value = entryWithSrNo.product
        } else if (headerLower === "quantity") {
          value = entryWithSrNo.quantity
        } else if (headerLower === "unit") {
          value = entryWithSrNo.unit
        } else if (headerLower === "po number") {
          value = entryWithSrNo.poNumber
        } else if (headerLower === "supplier") {
          value = entryWithSrNo.supplier
        } else if (headerLower === "date of receiving") {
          // For Purchase sheet, map dateOfReceiving to "Date of receiving"
          value = entryWithSrNo.dateOfReceiving
          console.log(`Mapped dateOfReceiving to "${header}": "${value}"`)
        } else if (headerLower === "date of issue") {
          // For Sales sheet, map dateOfIssue to "Date of Issue"
          value = entryWithSrNo.dateOfIssue
          console.log(`Mapped dateOfIssue to "${header}": "${value}"`)
        } else if (
          headerLower === "rack number" ||
          headerLower === "rack number/location of stock" ||
          headerLower === "location of stock"
        ) {
          value = entryWithSrNo.rackNumber
        } else if (headerLower === "contact") {
          value = entryWithSrNo.contact
        } else if (headerLower === "company name") {
          value = entryWithSrNo.companyName
        } else if (headerLower === "category") {
          value = entryWithSrNo.category
        } else if (headerLower === "minimum quantity") {
          value = entryWithSrNo.minimumQuantity
        } else if (headerLower === "maximum quantity") {
          value = entryWithSrNo.maximumQuantity
        } else if (headerLower === "reorder quantity") {
          value = entryWithSrNo.reorderQuantity
        } else if (headerLower === "stock") {
          value = entryWithSrNo.stock
        } else if (headerLower === "price per unit") {
          value = entryWithSrNo.pricePerUnit
        } else if (headerLower === "value") {
          value = entryWithSrNo.value
        }
      }

      // Make sure we return empty string for undefined values
      return value !== undefined ? value : ""
    })

    console.log(`Row values to append: ${rowValues.join(", ")}`)

    // Append the new row
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [rowValues],
      },
    })

    console.log(`New ${sheetName} entry added successfully`)
    return NextResponse.json({
      success: true,
      message: `New ${sheetName} entry added successfully`,
      data: entryWithSrNo,
    })
  } catch (error) {
    console.error(`Error adding entry:`, error)
    return NextResponse.json(
      {
        error: "Failed to add entry",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Add the fetchClientData function at the end of the file
async function fetchClientData(clientId: string) {
  try {
    const masterSheetId = process.env.MASTER_SHEET_ID
    if (!masterSheetId) {
      throw new Error("Master Sheet ID not found in environment variables")
    }

    // Fetch data from the Clients sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheetId,
      range: "Clients!A:F", // Includes ID and Sheet ID columns
    })

    const rows = response.data.values
    if (!rows || rows.length <= 1) {
      return null
    }

    // Extract headers from the first row
    const headers = rows[0]

    // Find the client with matching ID
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const id = row[0]

      if (id === clientId) {
        const client: Record<string, any> = {}
        headers.forEach((header: string, index: number) => {
          // Convert header to camelCase for consistent property naming
          const key = header.toLowerCase().replace(/\s(.)/g, (_, char) => char.toUpperCase())
          client[key] = row[index] || ""
        })
        return client
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching client data:", error)
    return null
  }
}

