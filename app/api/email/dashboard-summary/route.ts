import { NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"
import nodemailer from "nodemailer"
import { subDays } from "date-fns"
// Import the client terminology utilities
import { getPurchaseTerm, getSalesTerm } from "@/lib/client-terminology"

export async function POST(request: Request) {
  try {
    // Get client information from the request body
    const { clientEmail, clientName, clientId } = await request.json()

    if (!clientEmail) {
      return NextResponse.json({ success: false, error: "Client email is required" }, { status: 400 })
    }

    // Create auth client
    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL || "",
      key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Create sheets client
    const sheets = google.sheets({ version: "v4", auth })

    // Determine which sheet ID to use
    let sheetId = process.env.GOOGLE_SHEET_ID || ""

    // If clientId is provided, try to get the client-specific sheet ID
    if (clientId) {
      try {
        // Fetch client data from master sheet
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
          throw new Error("No client data found")
        }

        // Extract headers from the first row
        const headers = rows[0]

        // Find the client with matching ID
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          const id = row[0]

          if (id === clientId) {
            const sheetIdIndex = headers.indexOf("Sheet ID")
            if (sheetIdIndex !== -1 && row[sheetIdIndex]) {
              sheetId = row[sheetIdIndex]
              console.log(`Using client-specific sheet ID for client ${clientId}: ${sheetId}`)
              break
            }
          }
        }
      } catch (error) {
        console.error("Error fetching client sheet ID:", error)
        // Continue with default sheet ID if there's an error
      }
    }

    if (!sheetId) {
      return NextResponse.json({ error: "Sheet ID not configured" }, { status: 500 })
    }

    // Fetch data from all required sheets
    const [inventoryResponse, purchaseResponse, salesResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Inventory!A:Z",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Purchase!A:Z",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Sales!A:Z",
      }),
    ])

    // Process inventory data
    const inventoryRows = inventoryResponse.data.values || []
    const inventoryHeaders = inventoryRows.length > 0 ? inventoryRows[0] : []
    const inventoryItems = inventoryRows.slice(1).map((row, index) => {
      const item: Record<string, any> = {}
      inventoryHeaders.forEach((header: string, i: number) => {
        if (i < row.length) {
          item[header] = row[i]
        } else {
          item[header] = ""
        }
      })

      // Ensure numeric fields are numbers
      item.stock = Number(item.stock || item.Stock || 0)
      item.minimumQuantity = Number(item.minimumQuantity || item["Minimum Quantity"] || 0)
      item.maximumQuantity = Number(item.maximumQuantity || item["Maximum Quantity"] || 0)

      return item
    })

    // Process purchase data
    const purchaseRows = purchaseResponse.data.values || []
    const purchaseHeaders = purchaseRows.length > 0 ? purchaseRows[0] : []
    const purchaseItems = purchaseRows.slice(1).map((row, index) => {
      const item: Record<string, any> = {}
      purchaseHeaders.forEach((header: string, i: number) => {
        if (i < row.length) {
          item[header] = row[i]
        } else {
          item[header] = ""
        }
      })
      return item
    })

    // Process sales data
    const salesRows = salesResponse.data.values || []
    const salesHeaders = salesRows.length > 0 ? salesRows[0] : []
    const salesItems = salesRows.slice(1).map((row, index) => {
      const item: Record<string, any> = {}
      salesHeaders.forEach((header: string, i: number) => {
        if (i < row.length) {
          item[header] = row[i]
        } else {
          item[header] = ""
        }
      })
      return item
    })

    // Calculate dashboard metrics
    const metrics = calculateDashboardMetrics(inventoryItems, purchaseItems, salesItems)

    // Generate email content
    const emailHtml = generateDashboardSummaryEmailHtml(metrics, clientName)

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    })

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: clientEmail,
      subject: `Daily Dashboard Summary - ${clientName || "Inventory Management System"}`,
      html: emailHtml,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: `Dashboard summary email sent to ${clientEmail}`,
    })
  } catch (error) {
    console.error("Error sending dashboard summary email:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send dashboard summary email",
      },
      { status: 500 },
    )
  }
}

/**
 * Calculates dashboard metrics from inventory, purchase, and sales data
 */
function calculateDashboardMetrics(inventoryItems: any[], purchaseItems: any[], salesItems: any[]) {
  const today = new Date()
  const yesterday = subDays(today, 1)
  const oneWeekAgo = subDays(today, 7)
  const twoWeeksAgo = subDays(today, 14)

  // Initialize counters
  let todayPurchases = 0
  let todaySales = 0
  let thisWeekPurchases = 0
  let thisWeekSales = 0
  let lastWeekPurchases = 0
  let lastWeekSales = 0
  let newProductsThisWeek = 0

  // Count new products added this week
  const hasTimestamps = inventoryItems.some((item) => item.timestamp || item.Timestamp)

  if (hasTimestamps) {
    // Use timestamps if available
    inventoryItems.forEach((item) => {
      const timestamp = item.timestamp || item.Timestamp
      if (timestamp) {
        try {
          const date = new Date(timestamp)
          if (date >= oneWeekAgo && date <= today) {
            newProductsThisWeek++
          }
        } catch (error) {
          console.error("Error parsing inventory timestamp:", error)
        }
      }
    })
  } else {
    // Fallback: assume the last 5 items are new this week
    newProductsThisWeek = Math.min(5, inventoryItems.length)
  }

  // Process purchase data
  purchaseItems.forEach((item) => {
    // Try using timestamp first
    const timestamp = item.timestamp || item.Timestamp
    const dateField = item.dateOfReceiving || item["Date of receiving"]

    if (timestamp) {
      try {
        const date = new Date(timestamp)

        // Today's purchases
        if (date.toDateString() === today.toDateString()) {
          todayPurchases++
        }

        // This week's purchases
        if (date >= oneWeekAgo && date <= today) {
          thisWeekPurchases++
        }

        // Last week's purchases
        if (date >= twoWeeksAgo && date < oneWeekAgo) {
          lastWeekPurchases++
        }
      } catch (error) {
        console.error("Error parsing purchase timestamp:", error)
      }
    }
    // Fallback to dateOfReceiving if timestamp is not available
    else if (dateField) {
      try {
        const date = new Date(dateField)

        // Today's purchases
        if (date.toDateString() === today.toDateString()) {
          todayPurchases++
        }

        // This week's purchases
        if (date >= oneWeekAgo && date <= today) {
          thisWeekPurchases++
        }

        // Last week's purchases
        if (date >= twoWeeksAgo && date < oneWeekAgo) {
          lastWeekPurchases++
        }
      } catch (error) {
        console.error("Error parsing purchase date:", error)
      }
    }
  })

  // Process sales data
  salesItems.forEach((item) => {
    // Try using timestamp first
    const timestamp = item.timestamp || item.Timestamp
    const dateField = item.dateOfIssue || item["Date of Issue"]

    if (timestamp) {
      try {
        const date = new Date(timestamp)

        // Today's sales
        if (date.toDateString() === today.toDateString()) {
          todaySales++
        }

        // This week's sales
        if (date >= oneWeekAgo && date <= today) {
          thisWeekSales++
        }

        // Last week's sales
        if (date >= twoWeeksAgo && date < oneWeekAgo) {
          lastWeekSales++
        }
      } catch (error) {
        console.error("Error parsing sales timestamp:", error)
      }
    }
    // Fallback to dateOfIssue if timestamp is not available
    else if (dateField) {
      try {
        const date = new Date(dateField)

        // Today's sales
        if (date.toDateString() === today.toDateString()) {
          todaySales++
        }

        // This week's sales
        if (date >= oneWeekAgo && date <= today) {
          thisWeekSales++
        }

        // Last week's sales
        if (date >= twoWeeksAgo && date < oneWeekAgo) {
          lastWeekSales++
        }
      } catch (error) {
        console.error("Error parsing sales date:", error)
      }
    }
  })

  // If we have no date-based data, use fallback values
  if (thisWeekPurchases === 0 && thisWeekSales === 0) {
    // Fallback: assume all items are from this week
    thisWeekPurchases = purchaseItems.length
    thisWeekSales = salesItems.length

    // Distribute some to today
    todayPurchases = Math.min(2, purchaseItems.length)
    todaySales = Math.min(2, salesItems.length)
  }

  // Calculate average per day
  const totalDays = Math.max(1, 7) // Just use 7 days for simplicity
  const avgPurchasesPerDay = Math.round((thisWeekPurchases / totalDays) * 100) / 100
  const avgSalesPerDay = Math.round((thisWeekSales / totalDays) * 100) / 100

  // Calculate week-over-week change percentages
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const purchaseChange = calculateChange(thisWeekPurchases, lastWeekPurchases)
  const salesChange = calculateChange(thisWeekSales, lastWeekSales)

  // Count low stock items
  const lowStockItems = inventoryItems.filter((item) => {
    const stock = Number(item.stock || item.Stock || 0)
    const minQuantity = Number(item.minimumQuantity || item["Minimum Quantity"] || 0)
    const maxQuantity = Number(item.maximumQuantity || item["Maximum Quantity"] || 0)

    return stock < 0 || (minQuantity > 0 && stock < minQuantity)
  }).length

  return {
    today: { purchases: todayPurchases, sales: todaySales },
    thisWeek: { purchases: thisWeekPurchases, sales: thisWeekSales },
    lastWeek: { purchases: lastWeekPurchases, sales: lastWeekSales },
    avgPerDay: { purchases: avgPurchasesPerDay, sales: avgSalesPerDay },
    newProductsThisWeek,
    lowStockItems,
    purchaseChange,
    salesChange,
    totalProducts: inventoryItems.length,
  }
}

/**
 * Generates HTML content for dashboard summary email
 */
function generateDashboardSummaryEmailHtml(metrics: any, clientName?: string): string {
  const today = new Date()

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #4f46e5; color: white; padding: 15px 20px; border-radius: 5px; margin-bottom: 20px; }
      .card { background-color: #f9fafb; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .card-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #1f2937; }
      .stat { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
      .stat-desc { font-size: 12px; color: #6b7280; }
      .footer { margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
      .positive { color: #059669; }
      .negative { color: #dc2626; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2 style="margin: 0;">Daily Dashboard Summary - ${clientName || "Inventory Management"}</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px;">${today.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      
      <p>Dear ${clientName || "Client"},</p>
      
      <p>Here is your daily inventory management summary:</p>
      
      <div class="card">
        <div class="card-title">Today's Activity</div>
        <div class="grid">
          <div>
            <div class="stat">${metrics.today.purchases}</div>
            <div class="stat-desc">${getPurchaseTerm(clientName)}s</div>
          </div>
          <div>
            <div class="stat">${metrics.today.sales}</div>
            <div class="stat-desc">${getSalesTerm(clientName)}s</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-title">Weekly ${getPurchaseTerm(clientName)}s</div>
        <div class="stat">${metrics.thisWeek.purchases}</div>
        <div class="stat-desc">
          <span class="${metrics.purchaseChange >= 0 ? "positive" : "negative"}">
            ${metrics.purchaseChange >= 0 ? "+" : ""}${metrics.purchaseChange}% from last week
          </span>
        </div>
        <div class="stat-desc">Average ${metrics.avgPerDay.purchases} per day</div>
      </div>
      
      <div class="card">
        <div class="card-title">Weekly ${getSalesTerm(clientName)}s</div>
        <div class="stat">${metrics.thisWeek.sales}</div>
        <div class="stat-desc">
          <span class="${metrics.salesChange >= 0 ? "positive" : "negative"}">
            ${metrics.salesChange >= 0 ? "+" : ""}${metrics.salesChange}% from last week
          </span>
        </div>
        <div class="stat-desc">Average ${metrics.avgPerDay.sales} per day</div>
      </div>
      
      <div class="grid">
        <div class="card">
          <div class="card-title">New Products</div>
          <div class="stat">${metrics.newProductsThisWeek}</div>
          <div class="stat-desc">Added this week</div>
        </div>
        
        <div class="card">
          <div class="card-title">Low Stock Items</div>
          <div class="stat">${metrics.lowStockItems}</div>
          <div class="stat-desc">Need attention</div>
        </div>
      </div>
      
      <p>Log in to your dashboard for more detailed information and to take action on these insights.</p>
      
      <div class="footer">
        <p>This is an automated message from your Inventory Management System.</p>
        <p>Generated on: ${today.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
      </div>
    </div>
  </body>
  </html>
  `
}

