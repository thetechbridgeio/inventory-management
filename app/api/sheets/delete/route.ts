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

export async function POST(request: Request) {
  try {
    const { sheetName, items, clientId } = await request.json()

    if (!sheetName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid request. sheetName and items array are required." }, { status: 400 })
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

    // Get the sheet data to find the rows to delete
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:Z`,
    })

    const rows = response.data.values || []
    if (rows.length === 0) {
      return NextResponse.json({ error: "No data found in the sheet" }, { status: 404 })
    }

    // Extract headers
    const headers = rows[0]

    // Different approach based on sheet type
    const rowsToDelete = []

    if (sheetName === "Inventory") {
      // For Inventory, use product name to identify rows (since products are unique)
      const productColIndex =
        headers.indexOf("product") !== -1 ? headers.indexOf("product") : headers.indexOf("Product")

      if (productColIndex === -1) {
        return NextResponse.json({ error: "Could not find product column in the sheet" }, { status: 400 })
      }

      // Find rows to delete by product name
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        const product = row[productColIndex]

        for (const item of items) {
          if (item.product === product) {
            // Add 1 to account for 0-indexing in our array but 1-indexing in Google Sheets
            // Add another 1 to account for the header row
            rowsToDelete.push(i + 1)
            break
          }
        }
      }
    } else {
      // For Purchase and Sales, use multiple fields to identify rows
      // First, get the column indices for all relevant fields
      const fieldIndices: Record<string, number> = {}

      // Common fields to match (excluding srNo)
      const fieldsToMatch = [
        "product",
        "quantity",
        "dateOfReceiving",
        "dateOfIssue",
        "supplier",
        "companyName",
        "contact",
      ]

      // Get the index for each field if it exists in the headers
      for (const field of fieldsToMatch) {
        // Check for different possible header names
        let index = headers.indexOf(field)
        if (index === -1) {
          // Try with capitalized first letter
          const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1)
          index = headers.indexOf(capitalizedField)

          // For date fields, try alternative formats
          if (index === -1 && field === "dateOfReceiving") {
            index = headers.indexOf("Date of receiving")
          } else if (index === -1 && field === "dateOfIssue") {
            index = headers.indexOf("Date of Issue")
          }
        }

        if (index !== -1) {
          fieldIndices[field] = index
        }
      }

      console.log("Field indices for matching:", fieldIndices)

      // Find rows to delete by matching multiple fields
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]

        for (const item of items) {
          // Skip the srNo field and use other fields to match
          let isMatch = true

          // Check each field that exists in both the item and the sheet
          for (const [field, index] of Object.entries(fieldIndices)) {
            if (item[field] !== undefined && row[index] !== undefined) {
              // Convert both values to strings for comparison
              const itemValue = String(item[field]).trim()
              const rowValue = String(row[index]).trim()

              // For date fields, try to normalize the format
              if (field === "dateOfReceiving" || field === "dateOfIssue") {
                try {
                  // Try to parse and format both dates
                  const itemDate = new Date(itemValue)
                  const rowDate = new Date(rowValue)

                  // If both are valid dates, compare them
                  if (!isNaN(itemDate.getTime()) && !isNaN(rowDate.getTime())) {
                    // Format as YYYY-MM-DD for comparison
                    const formattedItemDate = itemDate.toISOString().split("T")[0]
                    const formattedRowDate = rowDate.toISOString().split("T")[0]

                    if (formattedItemDate !== formattedRowDate) {
                      isMatch = false
                      break
                    }
                    continue
                  }
                } catch (error) {
                  // If date parsing fails, fall back to string comparison
                }
              }

              // For quantity, convert to number if possible
              if (field === "quantity") {
                const itemNum = Number(itemValue)
                const rowNum = Number(rowValue)

                if (!isNaN(itemNum) && !isNaN(rowNum) && itemNum !== rowNum) {
                  isMatch = false
                  break
                }
                continue
              }

              // Regular string comparison for other fields
              if (itemValue !== rowValue) {
                isMatch = false
                break
              }
            }
          }

          if (isMatch) {
            // Add 1 to account for 0-indexing in our array but 1-indexing in Google Sheets
            // Add another 1 to account for the header row
            rowsToDelete.push(i + 1)
            break
          }
        }
      }
    }

    if (rowsToDelete.length === 0) {
      return NextResponse.json({ error: "No matching rows found to delete" }, { status: 404 })
    }

    // Sort row indices in descending order to avoid shifting issues when deleting
    rowsToDelete.sort((a, b) => b - a)

    // Get the sheet ID (not the spreadsheet ID)
    const sheetsResponse = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    })

    // Find the sheet ID for the specified sheet name
    const sheet = sheetsResponse.data.sheets?.find(
      (s) => s.properties?.title?.toLowerCase() === sheetName.toLowerCase(),
    )

    if (!sheet || sheet.properties?.sheetId === undefined) {
      return NextResponse.json({ error: `Sheet "${sheetName}" not found in the spreadsheet` }, { status: 404 })
    }

    const sheetId = sheet.properties.sheetId

    // Delete each row
    for (const rowIndex of rowsToDelete) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheetId, // Use the actual sheet ID
                  dimension: "ROWS",
                  startIndex: rowIndex - 1, // 0-indexed in the API
                  endIndex: rowIndex, // exclusive end index
                },
              },
            },
          ],
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${rowsToDelete.length} rows from ${sheetName}`,
    })
  } catch (error) {
    console.error("Error deleting rows:", error)
    return NextResponse.json(
      {
        error: "Failed to delete rows",
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

