import { NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

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
        spreadsheetId: process.env.MASTER_SHEET_ID || process.env.GOOGLE_SHEET_ID,
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
    const { product, newStock, newValue, clientId } = await request.json()

    if (!product || newStock === undefined) {
      return NextResponse.json({ error: "Product and new stock are required" }, { status: 400 })
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

    // Get the current inventory data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Inventory!A:Z",
    })

    const rows = response.data.values || []
    if (rows.length <= 1) {
      return NextResponse.json({ error: "No inventory data found" }, { status: 404 })
    }

    // Find the product row and column indices
    const headers = rows[0]
    const productColIndex = headers.findIndex((h: string) => h === "Product")
    const stockColIndex = headers.findIndex((h: string) => h === "Stock")
    const valueColIndex = headers.findIndex((h: string) => h === "Value")

    if (productColIndex === -1 || stockColIndex === -1) {
      return NextResponse.json({ error: "Product or Stock column not found" }, { status: 404 })
    }

    // Find the row with the matching product
    let productRowIndex = -1
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][productColIndex] === product) {
        productRowIndex = i
        break
      }
    }

    if (productRowIndex === -1) {
      return NextResponse.json({ error: "Product not found in inventory" }, { status: 404 })
    }

    // Update the stock and value
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Inventory!${String.fromCharCode(65 + stockColIndex)}${productRowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[newStock]],
      },
    })

    // Update the value if provided
    if (newValue !== undefined && valueColIndex !== -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Inventory!${String.fromCharCode(65 + valueColIndex)}${productRowIndex + 1}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[newValue]],
        },
      })
    }

    return NextResponse.json({ success: true, message: "Inventory updated successfully" })
  } catch (error) {
    console.error("Error updating inventory:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update inventory" },
      { status: 500 },
    )
  }
}

