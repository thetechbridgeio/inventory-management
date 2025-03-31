import { NextResponse } from "next/server"
import { google } from "googleapis"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    // Get URL parameters
    const url = new URL(request.url)
    const sheetName = url.searchParams.get("sheet")
    let clientId = url.searchParams.get("clientId")

    // If clientId is not provided in the URL, try to get it from cookies
    if (!clientId) {
      const cookieStore = cookies()
      clientId = cookieStore.get("clientId")?.value

      // Also check the request cookies as a fallback
      if (!clientId) {
        const cookieHeader = request.headers.get("cookie")
        if (cookieHeader) {
          const clientIdMatch = cookieHeader.match(/clientId=([^;]+)/)
          clientId = clientIdMatch ? clientIdMatch[1] : null
        }
      }
    }

    // Determine which sheet ID to use
    let sheetId: string | null = null

    if (clientId) {
      // If we have a clientId, fetch the client's sheet ID from the master sheet
      const masterSheetId = process.env.MASTER_SHEET_ID

      if (masterSheetId) {
        // Initialize Google Sheets API
        const auth = new google.auth.JWT(
          process.env.GOOGLE_CLIENT_EMAIL,
          undefined,
          process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          ["https://www.googleapis.com/auth/spreadsheets"],
        )

        const sheets = google.sheets({ version: "v4", auth })

        // Fetch data from the Clients sheet
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: masterSheetId,
          range: "Clients!A:F", // Includes ID and Sheet ID columns
        })

        const rows = response.data.values
        if (rows && rows.length > 1) {
          // Find the client with matching ID
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i]
            const id = row[0]

            if (id === clientId) {
              // Sheet ID is in column F (index 5)
              sheetId = row[5] || null
              break
            }
          }
        }
      }
    }

    // If we couldn't find a client-specific sheet ID, fall back to the default
    if (!sheetId) {
      sheetId = process.env.GOOGLE_SHEET_ID || null

      // Log this fallback for debugging
      console.log(`No client-specific sheet ID found for clientId: ${clientId}, using default sheet`)
    }

    if (!sheetId) {
      return NextResponse.json(
        { error: "No sheet ID available. Please select a client or check configuration." },
        { status: 400 },
      )
    }

    if (!sheetName) {
      return NextResponse.json({ error: "Sheet name is required" }, { status: 400 })
    }

    // Initialize Google Sheets API
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"],
    )

    const sheets = google.sheets({ version: "v4", auth })

    // Fetch data from the specified sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:Z`, // Wide range to capture all columns
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
        // Convert header to camelCase for consistent property naming
        const key = header.toLowerCase().replace(/\s(.)/g, (_, char) => char.toUpperCase())
        item[key] = row[index] || ""
      })
      return item
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error(`Error fetching sheet data:`, error)

    let errorMessage = "Failed to fetch data"
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
    const url = new URL(request.url)
    const sheetName = url.searchParams.get("sheet")
    let clientId = url.searchParams.get("clientId")
    const data = await request.json()

    // If clientId is not provided in the URL, try to get it from cookies
    if (!clientId) {
      const cookieStore = cookies()
      clientId = cookieStore.get("clientId")?.value

      // Also check the request cookies as a fallback
      if (!clientId) {
        const cookieHeader = request.headers.get("cookie")
        if (cookieHeader) {
          const clientIdMatch = cookieHeader.match(/clientId=([^;]+)/)
          clientId = clientIdMatch ? clientIdMatch[1] : null
        }
      }
    }

    // Determine which sheet ID to use
    let sheetId: string | null = null

    if (clientId) {
      // If we have a clientId, fetch the client's sheet ID from the master sheet
      const masterSheetId = process.env.MASTER_SHEET_ID

      if (masterSheetId) {
        // Initialize Google Sheets API
        const auth = new google.auth.JWT(
          process.env.GOOGLE_CLIENT_EMAIL,
          undefined,
          process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          ["https://www.googleapis.com/auth/spreadsheets"],
        )

        const sheets = google.sheets({ version: "v4", auth })

        // Fetch data from the Clients sheet
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: masterSheetId,
          range: "Clients!A:F", // Includes ID and Sheet ID columns
        })

        const rows = response.data.values
        if (rows && rows.length > 1) {
          // Find the client with matching ID
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i]
            const id = row[0]

            if (id === clientId) {
              // Sheet ID is in column F (index 5)
              sheetId = row[5] || null
              break
            }
          }
        }
      }
    }

    // If we couldn't find a client-specific sheet ID, fall back to the default
    if (!sheetId) {
      sheetId = process.env.GOOGLE_SHEET_ID || null

      // Log this fallback for debugging
      console.log(`No client-specific sheet ID found for clientId: ${clientId}, using default sheet`)
    }

    if (!sheetId) {
      return NextResponse.json(
        { error: "No sheet ID available. Please select a client or check configuration." },
        { status: 400 },
      )
    }

    if (!sheetName) {
      return NextResponse.json({ error: "Sheet name is required" }, { status: 400 })
    }

    // Initialize Google Sheets API
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"],
    )

    const sheets = google.sheets({ version: "v4", auth })

    // Check if the specified sheet exists, create it if not
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId })
    let sheetExists = false

    for (const sheet of spreadsheet.data.sheets || []) {
      if (sheet.properties?.title === sheetName) {
        sheetExists = true
        break
      }
    }

    if (!sheetExists) {
      // Add the sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      })

      // Add headers based on the sheet type
      let headers: string[] = []

      switch (sheetName.toLowerCase()) {
        case "inventory":
          headers = ["ID", "Name", "Category", "Quantity", "Unit Price"]
          break
        case "purchases":
          headers = ["ID", "Date", "Supplier", "Product", "Quantity", "Unit Price", "Total"]
          break
        case "sales":
          headers = ["ID", "Date", "Customer", "Product", "Quantity", "Unit Price", "Total"]
          break
        case "suppliers":
          headers = ["ID", "Name", "Contact", "Email", "Address"]
          break
        default:
          // Use the keys from the data as headers
          headers = Object.keys(data).map((key) =>
            // Convert camelCase to Title Case
            key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase()),
          )
      }

      // Add the headers to the sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:Z1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [headers],
        },
      })
    }

    // Generate a unique ID if not provided
    if (!data.id) {
      data.id = `${sheetName.toLowerCase()}_${Date.now()}`
    }

    // Prepare the row data
    let rowData: any[] = []

    // Get the headers to ensure we're adding data in the correct order
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:Z1`,
    })

    const headers = headerResponse.data.values?.[0] || []

    if (headers.length > 0) {
      // Map data to match the header order
      rowData = headers.map((header) => {
        // Convert header to camelCase for matching with data object
        const key = header.toLowerCase().replace(/\s(.)/g, (_, char) => char.toUpperCase())
        return data[key] || ""
      })
    } else {
      // Fallback if headers can't be retrieved
      rowData = Object.values(data)
    }

    // Append the new row
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: "RAW",
      requestBody: {
        values: [rowData],
      },
    })

    return NextResponse.json({
      success: true,
      message: `${sheetName} data added successfully`,
      data,
    })
  } catch (error) {
    console.error(`Error adding data:`, error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to add data" }, { status: 500 })
  }
}

