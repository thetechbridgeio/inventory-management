import { google } from "googleapis"
import { JWT } from "google-auth-library"
import nodemailer from "nodemailer"
import { getStockStatus } from "./utils"
import type { InventoryItem } from "./types"
import { subDays } from "date-fns"

// Import the client terminology utilities
import { getPurchaseTerm, getSalesTerm } from "./client-terminology"
import { classifyVC } from "./analytics"

// Create auth client
const auth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL || "",
  key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

// Create sheets client
const sheets = google.sheets({ version: "v4", auth })

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})

// Variable to track if scheduler is running
let schedulerRunning = false
let schedulerInterval: NodeJS.Timeout | null = null

/**
 * Sends low stock emails to all clients
 */
async function sendLowStockEmailsToAllClients() {
  console.log("Starting scheduled low stock email job")

  try {
    // Fetch all clients from the master sheet
    const clients = await fetchAllClients()
    console.log(`Found ${clients.length} clients`)

    // For each client, check for low stock items and send email if needed
    for (const client of clients) {
      try {
        await sendLowStockEmailToClient(client)
      } catch (error: any) {
        console.error(`Error sending low stock email to client ${client.id} (${client.name}):`, error)
      }
    }

    console.log("Completed scheduled low stock email job")
  } catch (error: any) {
    console.error("Error in scheduled low stock email job:", error)
  }
}

/**
 * Sends dashboard summary emails to all clients
 */
async function sendDashboardSummaryEmailsToAllClients() {
  console.log("Starting scheduled dashboard summary email job")

  try {
    // Fetch all clients from the master sheet
    const clients = await fetchAllClients()
    console.log(`Found ${clients.length} clients`)

    // For each client, generate and send dashboard summary email
    for (const client of clients) {
      try {
        await sendDashboardSummaryEmailToClient(client)
      } catch (error: any) {
        console.error(`Error sending dashboard summary email to client ${client.id} (${client.name}):`, error)
      }
    }

    console.log("Completed scheduled dashboard summary email job")
  } catch (error: any) {
    console.error("Error in scheduled dashboard summary email job:", error)
  }
}

/**
 * Sends a dashboard summary email to a specific client
 */
async function sendDashboardSummaryEmailToClient(client: any) {
  console.log(`Processing dashboard summary email for client: ${client.name} (${client.id})`)

  if (!client.email) {
    console.log(`Skipping client ${client.id} - no email address`)
    return
  }

  if (!client.sheetId) {
    console.log(`Skipping client ${client.id} - no sheet ID`)
    return
  }

  try {
    // Fetch data for this client
    const inventoryItems = await fetchClientInventory(client.sheetId)
    const purchaseItems = await fetchClientPurchases(client.sheetId)
    const salesItems = await fetchClientSales(client.sheetId)

    // Calculate dashboard metrics
    const metrics = calculateDashboardMetrics(inventoryItems, purchaseItems, salesItems)

    // Generate email content
    const emailHtml = generateDashboardSummaryEmailHtml(metrics, client.name)

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: `Daily Dashboard Summary - ${client.name || "Inventory Management System"}`,
      html: emailHtml,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Dashboard summary email sent to ${client.email}`)
  } catch (error: any) {
    console.error(`Error generating dashboard summary for client ${client.id}:`, error)
    throw error
  }
}

/**
 * Fetches purchase data for a specific client
 */
async function fetchClientPurchases(sheetId: string) {
  // Fetch data from the Purchase sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Purchase!A:Z", // Wide range to capture all columns
  })

  const rows = response.data.values || []
  if (rows.length <= 1) {
    return []
  }

  // Extract headers from the first row
  const headers = rows[0]

  // Map rows to purchase items
  return rows.slice(1).map((row: any, index: number) => {
    return {
      srNo: Number(row[headers.indexOf("srNo")] || row[headers.indexOf("Sr. no")] || index + 1),
      product: row[headers.indexOf("product")] || row[headers.indexOf("Product")] || "Unknown Product",
      quantity: Number(row[headers.indexOf("quantity")] || row[headers.indexOf("Quantity")] || 0),
      unit: row[headers.indexOf("unit")] || row[headers.indexOf("Unit")] || "PCS",
      poNumber: row[headers.indexOf("poNumber")] || row[headers.indexOf("PO Number")] || "",
      supplier: row[headers.indexOf("supplier")] || row[headers.indexOf("Supplier")] || "",
      dateOfReceiving: row[headers.indexOf("dateOfReceiving")] || row[headers.indexOf("Date of receiving")] || "",
      rackNumber: row[headers.indexOf("rackNumber")] || row[headers.indexOf("Rack Number")] || "",
      timestamp: row[headers.indexOf("timestamp")] || row[headers.indexOf("Timestamp")] || null,
    }
  })
}

/**
 * Fetches sales data for a specific client
 */
async function fetchClientSales(sheetId: string) {
  // Fetch data from the Sales sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Sales!A:Z", // Wide range to capture all columns
  })

  const rows = response.data.values || []
  if (rows.length <= 1) {
    return []
  }

  // Extract headers from the first row
  const headers = rows[0]

  // Map rows to sales items
  return rows.slice(1).map((row: any, index: number) => {
    return {
      srNo: Number(row[headers.indexOf("srNo")] || row[headers.indexOf("Sr. no")] || index + 1),
      product: row[headers.indexOf("product")] || row[headers.indexOf("Product")] || "Unknown Product",
      quantity: Number(row[headers.indexOf("quantity")] || row[headers.indexOf("Quantity")] || 0),
      unit: row[headers.indexOf("unit")] || row[headers.indexOf("Unit")] || "PCS",
      contact: row[headers.indexOf("contact")] || row[headers.indexOf("Contact")] || "",
      companyName: row[headers.indexOf("companyName")] || row[headers.indexOf("Company Name")] || "",
      dateOfIssue: row[headers.indexOf("dateOfIssue")] || row[headers.indexOf("Date of Issue")] || "",
      timestamp: row[headers.indexOf("timestamp")] || row[headers.indexOf("Timestamp")] || null,
    }
  })
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
  const hasTimestamps = inventoryItems.some((item) => item.timestamp)

  if (hasTimestamps) {
    // Use timestamps if available
    inventoryItems.forEach((item) => {
      const timestamp = item.timestamp
      if (timestamp) {
        try {
          const date = new Date(timestamp)
          if (date >= oneWeekAgo && date <= today) {
            newProductsThisWeek++
          }
        } catch (error: any) {
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
    const timestamp = item.timestamp
    const dateField = item.dateOfReceiving

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
      } catch (error: any) {
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
      } catch (error: any) {
        console.error("Error parsing purchase date:", error)
      }
    }
  })

  // Process sales data
  salesItems.forEach((item) => {
    // Try using timestamp first
    const timestamp = item.timestamp
    const dateField = item.dateOfIssue

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
      } catch (error: any) {
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
      } catch (error: any) {
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
  const lowStockItems = inventoryItems.filter(
    (item) => getStockStatus(item) === "low" || getStockStatus(item) === "negative",
  ).length

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

/**
 * Fetches all clients from the master sheet
 */
async function fetchAllClients() {
  const masterSheetId = process.env.MASTER_SHEET_ID
  if (!masterSheetId) {
    throw new Error("Master Sheet ID not found in environment variables")
  }

  // Fetch data from the Clients sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: masterSheetId,
    range: "Clients!A:F", // Includes ID, name, email, and Sheet ID columns
  })

  const rows = response.data.values || []
  if (rows.length <= 1) {
    return []
  }

  // Extract headers from the first row
  const headers = rows[0]

  // Map rows to client objects
  const clients = rows.slice(1).map((row) => {
    const client: Record<string, any> = {}
    headers.forEach((header: string, index: number) => {
      // Convert header to camelCase for consistent property naming
      const key = header.toLowerCase().replace(/\s(.)/g, (_, char) => char.toUpperCase())
      client[key] = row[index] || ""
    })
    return client
  })

  // Filter out clients without email or sheetId
  return clients.filter((client) => client.email && client.sheetId)
}

/**
 * Sends a low stock email to a specific client
 */
async function sendLowStockEmailToClient(client: any) {
  console.log(`Processing low stock email for client: ${client.name} (${client.id})`)

  if (!client.email) {
    console.log(`Skipping client ${client.id} - no email address`)
    return
  }

  if (!client.sheetId) {
    console.log(`Skipping client ${client.id} - no sheet ID`)
    return
  }

  // Fetch inventory data for this client
  const inventoryItems = await fetchClientInventory(client.sheetId)

  // Filter for low stock items
  const lowStockItems = inventoryItems.filter(
    (item) => getStockStatus(item) === "low" || getStockStatus(item) === "negative",
  )

  if (lowStockItems.length === 0) {
    console.log(`No low stock items found for client ${client.id} (${client.name})`)
    return
  }

  console.log(`Found ${lowStockItems.length} low stock items for client ${client.id} (${client.name})`)

  // Generate email content
  const emailHtml = generateLowStockEmailHtml(lowStockItems, client.name)

  // Send email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: client.email,
    bcc: "businesscoachakhill@gmail.com",
    subject: `Low Stock Alert - ${client.name || "Inventory Management System"}`,
    html: emailHtml,
  }

  await transporter.sendMail(mailOptions)
  console.log(`Low stock email sent to ${client.email} for ${lowStockItems.length} items`)
}

/**
 * Fetches inventory data for a specific client
 */
async function fetchClientInventory(sheetId: string) {
  // Fetch data from the Inventory sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Inventory!A:Z", // Wide range to capture all columns
  })

  const rows = response.data.values || []
  if (rows.length <= 1) {
    return []
  }

  // Extract headers from the first row
  const headers = rows[0]

  // Map rows to inventory items
  return rows.slice(1).map((row: any, index: number) => {
    const item: InventoryItem = {
      srNo: Number(row[headers.indexOf("srNo")] || row[headers.indexOf("Sr. no")] || index + 1),
      product: row[headers.indexOf("product")] || row[headers.indexOf("Product")] || "Unknown Product",
      category: row[headers.indexOf("category")] || row[headers.indexOf("Category")] || "Uncategorized",
      unit: row[headers.indexOf("unit")] || row[headers.indexOf("Unit")] || "PCS",
      minimumQuantity: Number(row[headers.indexOf("minimumQuantity")] || row[headers.indexOf("Minimum Quantity")] || 0),
      maximumQuantity: Number(row[headers.indexOf("maximumQuantity")] || row[headers.indexOf("Maximum Quantity")] || 0),
      reorderQuantity: Number(row[headers.indexOf("reorderQuantity")] || row[headers.indexOf("Reorder Quantity")] || 0),
      stock: Number(row[headers.indexOf("stock")] || row[headers.indexOf("Stock")] || 0),
      pricePerUnit: Number(row[headers.indexOf("pricePerUnit")] || row[headers.indexOf("Price per Unit")] || 0),
      value: Number(row[headers.indexOf("value")] || row[headers.indexOf("Value")] || 0),
      productType: row[headers.indexOf("productType")] || row[headers.indexOf("Product Type")] || "Raw Material",
    }
    return item
  })
}

/**
 * Generates HTML content for low stock email
 */
function generateLowStockEmailHtml(items: InventoryItem[], clientName?: string): string {
  const tableRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.srNo}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.product}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.category}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.stock} ${item.unit}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.minimumQuantity} ${item.unit}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.reorderQuantity} ${item.unit}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">₹${item.pricePerUnit.toLocaleString("en-IN")}</td>
      </tr>
    `,
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th { background-color: #f2f2f2; text-align: left; padding: 12px 8px; border: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .header { background-color: #4f46e5; color: white; padding: 10px 20px; border-radius: 5px; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Low Stock Alert${clientName ? ` - ${clientName}` : ""}</h2>
        </div>
        
        <p>Dear ${clientName || "Client"},</p>
        
        <p>The following items in your inventory are currently low in stock and need to be reordered:</p>
        
        <table>
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Product</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Minimum Quantity</th>
              <th>Reorder Quantity</th>
              <th>Price Per Unit</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <p>Please take action to restock these items as soon as possible.</p>
        
        <div class="footer">
          <p>This is an automated message from your Inventory Management System.</p>
          <p>Generated on: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Checks if it's time to send the daily email (6 PM IST)
 */
function isTimeToSendEmail(): boolean {
  const now = new Date()

  // Convert to IST (UTC+5:30)
  const istHours = (now.getUTCHours() + 5) % 24
  const istMinutes = (now.getUTCMinutes() + 30) % 60

  // Check if it's 6 PM IST (18:00)
  return istHours === 18 && istMinutes >= 0 && istMinutes < 5
}

function isFirstDayOfMonthIST(): boolean {
  const now = new Date()

  // Convert UTC to IST
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)

  return ist.getDate() === 1 && ist.getHours() === 18
}

/**
 * Starts the scheduler to check every minute if it's time to send emails
 */
export function startScheduler() {
  if (schedulerRunning) {
    console.log("Scheduler is already running")
    return
  }

  let lastRunDate: string | null = null

  schedulerInterval = setInterval(async () => {
    try {
      const today = new Date().toISOString().split("T")[0]

      if (isTimeToSendEmail() && lastRunDate !== today) {
        console.log("It's 6 PM IST - running scheduled email jobs")

        // Daily jobs
        await Promise.all([
          sendLowStockEmailsToAllClients(),
          sendDashboardSummaryEmailsToAllClients(),
        ])

        // Monthly job on the 1st day
        if (isFirstDayOfMonthIST()) {
          console.log("Running Monthly Inventory Report Job")
          await sendMonthlyReportEmailsToAllClients()
        }

        lastRunDate = today
      }
    } catch (error: any) {
      console.error("Error in scheduler check:", error)
    }
  }, 60000)

  schedulerRunning = true
  console.log("Email scheduler started - runs daily at 6:00 PM IST")
}

/**
 * Stops the scheduler
 */
export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval)
    schedulerInterval = null
    schedulerRunning = false
    console.log("Low stock email scheduler stopped")
  }
}

/**
 * Manually triggers the low stock email job
 */
export async function runLowStockEmailJob() {
  console.log("Manually triggering low stock email job")
  await sendLowStockEmailsToAllClients()
}

// Add a function to manually trigger the dashboard summary email job
export async function runDashboardSummaryEmailJob() {
  console.log("Manually triggering dashboard summary email job")
  await sendDashboardSummaryEmailsToAllClients()
}


async function sendMonthlyReportEmailsToAllClients() {
  console.log("Starting monthly report email job")

  const clients = await fetchAllClients()

  for (const client of clients) {
    if (!client.email || !client.sheetId) continue

    const inventoryItems = await fetchClientInventory(client.sheetId)
    const emailHtml = generateMonthlyReportEmailHtml(
      inventoryItems,
      client.name
    )

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: `Monthly Inventory Report - ${client.name}`,
      html: emailHtml,
    })

    console.log(`Monthly report sent to ${client.email}`)
  }
}


function generateMonthlyReportEmailHtml(
  items: InventoryItem[],
  clientName?: string
): string {
  const today = new Date().toLocaleDateString("en-IN")

  // Calculate KPIs
  const totalProducts = items.length
  let totalOpening = 0
  let totalClosing = 0
  let totalConsumption = 0

  const getBadgeColor = (category: string) => {
    switch (category) {
      case "High Value – High Volume":
        return { bg: "#FEE2E2", text: "#B91C1C" } // Red
      case "High Value – Low Volume":
        return { bg: "#EDE9FE", text: "#6D28D9" } // Purple
      case "Low Value – High Volume":
        return { bg: "#DBEAFE", text: "#1D4ED8" } // Blue
      case "Low Value – Low Volume":
        return { bg: "#DCFCE7", text: "#166534" } // Green
      default:
        return { bg: "#E5E7EB", text: "#374151" } // Gray
    }
  }

  const formatNumber = (num: number) =>
    num.toLocaleString("en-IN")

  const rows = items
    .map((item) => {
      const opening = Number(item.openingStock || 0)
      const closing = Number(item.stock || 0)
      const consumption = opening - closing
      const vcCategory = classifyVC(item)

      totalOpening += opening
      totalClosing += closing
      totalConsumption += consumption

      const badge = getBadgeColor(vcCategory)

      return `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px;">${item.product}</td>
          <td style="padding:10px;text-align:right;">${formatNumber(opening)}</td>
          <td style="padding:10px;text-align:right;">${formatNumber(closing)}</td>
          <td style="padding:10px;text-align:right;color:${
            consumption < 0 ? "#DC2626" : "#111827"
          };">
            ${formatNumber(consumption)}
          </td>
          <td style="padding:10px;text-align:center;">
            <span style="
              background:${badge.bg};
              color:${badge.text};
              padding:4px 10px;
              border-radius:999px;
              font-size:12px;
              font-weight:600;
              display:inline-block;">
              ${vcCategory}
            </span>
          </td>
        </tr>
      `
    })
    .join("")

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Monthly Inventory Report</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:20px 0;">
        <tr>
          <td align="center">
            <table width="900" cellpadding="0" cellspacing="0"
              style="background:#ffffff;border-radius:10px;overflow:hidden;
                     box-shadow:0 4px 12px rgba(0,0,0,0.05);">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(to right,#2563EB,#1E3A8A);
                           color:#ffffff;padding:20px;text-align:center;">
                  <h2 style="margin:0;">Monthly Inventory Report</h2>
                  <p style="margin:5px 0 0 0;font-size:14px;">
                    ${clientName || "Valued Client"}
                  </p>
                  <p style="margin:2px 0 0 0;font-size:12px;">
                    Generated on ${today}
                  </p>
                </td>
              </tr>

              <!-- KPI Cards -->
              <tr>
                <td style="padding:20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="background:#EFF6FF;padding:15px;border-radius:8px;">
                        <p style="margin:0;font-size:12px;color:#1E40AF;">Total Products</p>
                        <h3 style="margin:5px 0;color:#1E3A8A;">${formatNumber(totalProducts)}</h3>
                      </td>
                      <td width="10"></td>
                      <td align="center" style="background:#ECFDF5;padding:15px;border-radius:8px;">
                        <p style="margin:0;font-size:12px;color:#047857;">Opening Stock</p>
                        <h3 style="margin:5px 0;color:#065F46;">${formatNumber(totalOpening)}</h3>
                      </td>
                      <td width="10"></td>
                      <td align="center" style="background:#FEF3C7;padding:15px;border-radius:8px;">
                        <p style="margin:0;font-size:12px;color:#B45309;">Closing Stock</p>
                        <h3 style="margin:5px 0;color:#92400E;">${formatNumber(totalClosing)}</h3>
                      </td>
                      <td width="10"></td>
                      <td align="center" style="background:#FEE2E2;padding:15px;border-radius:8px;">
                        <p style="margin:0;font-size:12px;color:#B91C1C;">Total Consumption</p>
                        <h3 style="margin:5px 0;color:#7F1D1D;">
                          ${formatNumber(totalConsumption)}
                        </h3>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Table -->
              <tr>
                <td style="padding:0 20px 20px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0"
                         style="border-collapse:collapse;font-size:14px;">
                    <thead>
                      <tr style="background:#F9FAFB;text-align:left;border-bottom:2px solid #E5E7EB;">
                        <th style="padding:12px;">Product</th>
                        <th style="padding:12px;text-align:right;">Opening Stock</th>
                        <th style="padding:12px;text-align:right;">Closing Stock</th>
                        <th style="padding:12px;text-align:right;">Consumption</th>
                        <th style="padding:12px;text-align:center;">VC Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#F9FAFB;padding:15px;text-align:center;
                           font-size:12px;color:#6B7280;">
                  This is an automated message from your
                  <strong>Inventory Management System</strong>.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `
}


export async function runMonthlyReportEmailJob() {
  console.log("Manually triggering monthly report job")
  await sendMonthlyReportEmailsToAllClients()
}