import { NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

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

export const fetchCache = "force-no-store"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sheetName = searchParams.get("sheet") || "Inventory"
    const clientId = searchParams.get("clientId")

    if (!sheetName) {
      return NextResponse.json({ error: "Sheet name is required" }, { status: 400 })
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

    // Get the data from the specified sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:Z`,
    })

    const rows = response.data.values

    if (!rows || rows.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Extract headers from the first row
    const headers = rows[0]

    // Map the data to objects with proper keys
    const data = rows.slice(1).map((row) => {
      const item: Record<string, any> = {}
      headers.forEach((header: string, index: number) => {
        if (index < row.length) {
          item[header] = row[index]
        } else {
          item[header] = ""
        }
      })
      return item
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch data" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { sheetName, entry, clientId } = await request.json()

    if (!sheetName || !entry) {
      return NextResponse.json({ error: "Sheet name and entry are required" }, { status: 400 })
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

    // Get the current data to determine the next Sr. No
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:A`,
    })

    const rows = response.data.values || []
    let nextSrNo = 1

    if (rows.length > 1) {
      // Find the highest Sr. No and increment it
      const srNoHeader = rows[0][0]
      if (srNoHeader === "Sr. no" || srNoHeader === "srNo") {
        const srNos = rows.slice(1).map((row) => Number.parseInt(row[0]) || 0)
        nextSrNo = Math.max(...srNos, 0) + 1
      }
    }

    // Get the headers from the sheet
    const headersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!1:1`,
    })

    const headers = headersResponse.data.values?.[0] || []

    // Prepare the row data based on the headers
    const rowData: any[] = []
    headers.forEach((header: string) => {
      if (header === "Sr. no" || header === "srNo") {
        rowData.push(nextSrNo.toString())
      } else {
        // Convert header to camelCase for matching with entry properties
        const key = header.toLowerCase().replace(/\s(.)/g, (_, char) => char.toUpperCase())
        rowData.push(entry[key] !== undefined ? entry[key].toString() : "")
      }
    })

    // Append the new row
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowData],
      },
    })

    // Return the created entry with the assigned Sr. No
    const createdEntry = { ...entry, srNo: nextSrNo }

    return NextResponse.json({ success: true, data: createdEntry })
  } catch (error) {
    console.error("Error adding entry:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to add entry" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    // Log the raw request
    const requestText = await request.text()
    console.log("Raw request body:", requestText)

    // Parse the request body
    let requestData
    try {
      requestData = JSON.parse(requestText)
      console.log("Parsed request body:", requestData)
    } catch (error) {
      console.error("Failed to parse request body:", error)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { product, updatedData, clientId } = requestData

    console.log("Extracted values:", {
      product: product,
      updatedData: updatedData,
      clientId: clientId,
    })

    if (!product || !updatedData) {
      console.log("Validation failed:", {
        hasProduct: !!product,
        hasUpdatedData: !!updatedData,
      })
      return NextResponse.json(
        { error: "Invalid request. Product name and updated data are required." },
        { status: 400 },
      )
    }

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
      return NextResponse.json({ error: "No inventory data found" }, { status: 404 })
    }

    const headers = inventoryRows[0]

    // Look for either "product" or "Product" in the headers
    let productColIndex = headers.indexOf("product")
    if (productColIndex === -1) {
      productColIndex = headers.indexOf("Product")
    }

    if (productColIndex === -1) {
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
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update each field in the updatedData object
    const updatePromises = Object.entries(updatedData).map(async ([field, value]) => {
      // Find the column index for this field
      let colIndex = headers.indexOf(field)

      // Try alternative field names if not found
      if (colIndex === -1) {
        // Convert camelCase to Title Case with spaces
        const titleCaseField = field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
        colIndex = headers.indexOf(titleCaseField)

        // If still not found, try other common variations
        if (field === "minimumQuantity") colIndex = headers.indexOf("Minimum Quantity")
        else if (field === "maximumQuantity") colIndex = headers.indexOf("Maximum Quantity")
        else if (field === "reorderQuantity") colIndex = headers.indexOf("Reorder Quantity")
        else if (field === "pricePerUnit") colIndex = headers.indexOf("Price per Unit")
      }

      if (colIndex === -1) {
        console.warn(`Column for field "${field}" not found in headers`)
        return
      }

      // Convert column index to letter (A, B, C, etc.)
      const colLetter = String.fromCharCode(65 + colIndex)

      // Update the cell
      return sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Inventory!${colLetter}${rowIndex}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[value]],
        },
      })
    })

    // Wait for all updates to complete
    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      {
        error: "Failed to update product",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

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

