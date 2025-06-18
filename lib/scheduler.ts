import nodemailer from "nodemailer"
import { google } from "googleapis"

// Create email transporter
function createTransporter() {
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  })
}

// Get base URL for different environments
function getBaseUrl() {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000"
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (process.env.URL) {
    return process.env.URL
  }
  return "https://client-inventory-management.netlify.app"
}

// Fetch all clients from master sheet
async function fetchAllClients() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.MASTER_SHEET_ID,
      range: "Clients!A:E",
    })

    const rows = response.data.values || []
    if (rows.length <= 1) return []

    const headers = rows[0]
    const clients = rows.slice(1).map((row) => {
      const client: any = {}
      headers.forEach((header, index) => {
        client[header] = row[index] || ""
      })
      return client
    })

    return clients.filter((client) => client.email && client.sheetId)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return []
  }
}

// Send low stock email for a specific client
async function sendLowStockEmailForClient(client: any) {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sheets?clientId=${client.clientId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory data: ${response.status}`)
    }

    const data = await response.json()
    const inventory = data.inventory || []

    // Find low stock items
    const lowStockItems = inventory.filter((item: any) => {
      const stock = Number.parseInt(item.stock) || 0
      const minQty = Number.parseInt(item.minimumQuantity) || 0
      return stock < minQty && minQty > 0
    })

    if (lowStockItems.length === 0) {
      console.log(`No low stock items for client: ${client.name}`)
      return { success: true, message: "No low stock items" }
    }

    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🚨 Low Stock Alert - ${client.name}</h2>
        <p>The following items are running low and need to be restocked:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Product</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Category</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">Current Stock</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">Minimum Required</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">Reorder Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${lowStockItems
              .map(
                (item: any) => `
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 12px;">${item.product || "N/A"}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px;">${item.category || "N/A"}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center; color: #dc2626; font-weight: bold;">${item.stock || 0}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">${item.minimumQuantity || 0}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">${item.reorderQuantity || "N/A"}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <p style="margin-top: 20px; color: #6b7280;">
          Please restock these items as soon as possible to avoid stockouts.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af;">
          This is an automated alert from your Inventory Management System.
        </p>
      </div>
    `

    const transporter = createTransporter()
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: `🚨 Low Stock Alert - ${client.name}`,
      html: emailContent,
    })

    console.log(`Low stock email sent successfully to ${client.email}`)
    return { success: true, message: `Email sent to ${client.email}` }
  } catch (error) {
    console.error(`Error sending low stock email to ${client.email}:`, error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Send dashboard summary email for a specific client
async function sendDashboardSummaryForClient(client: any) {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/dashboard?clientId=${client.clientId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.status}`)
    }

    const data = await response.json()

    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">📊 Daily Dashboard Summary - ${client.name}</h2>
        <p>Here's your daily inventory summary for ${new Date().toLocaleDateString()}:</p>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <h3 style="margin: 0 0 10px 0; color: #0ea5e9;">Total Products</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 0;">${data.totalProducts || 0}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h3 style="margin: 0 0 10px 0; color: #f59e0b;">Low Stock Items</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 0;">${data.lowStockCount || 0}</p>
          </div>
          
          <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e;">
            <h3 style="margin: 0 0 10px 0; color: #22c55e;">Total Stock Value</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 0;">₹${(data.totalStockValue || 0).toLocaleString()}</p>
          </div>
          
          <div style="background-color: #fce7f3; padding: 20px; border-radius: 8px; border-left: 4px solid #ec4899;">
            <h3 style="margin: 0 0 10px 0; color: #ec4899;">Recent Transactions</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 0;">${(data.recentPurchases || 0) + (data.recentSales || 0)}</p>
          </div>
        </div>
        
        ${
          data.lowStockCount > 0
            ? `
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #ef4444;">⚠️ Action Required</h3>
          <p style="margin: 0;">You have ${data.lowStockCount} items running low on stock. Consider restocking soon.</p>
        </div>
        `
            : ""
        }
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af;">
          This is your daily automated summary from the Inventory Management System.
        </p>
      </div>
    `

    const transporter = createTransporter()
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: `📊 Daily Summary - ${client.name} - ${new Date().toLocaleDateString()}`,
      html: emailContent,
    })

    console.log(`Dashboard summary email sent successfully to ${client.email}`)
    return { success: true, message: `Email sent to ${client.email}` }
  } catch (error) {
    console.error(`Error sending dashboard summary to ${client.email}:`, error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Run low stock email job for all clients
export async function runLowStockEmailJob() {
  console.log("Starting low stock email job...")

  const clients = await fetchAllClients()
  if (clients.length === 0) {
    console.log("No clients found")
    return { success: false, message: "No clients found" }
  }

  const results = []
  for (const client of clients) {
    const result = await sendLowStockEmailForClient(client)
    results.push({ client: client.name, ...result })
  }

  console.log("Low stock email job completed:", results)
  return { success: true, results }
}

// Run dashboard summary email job for all clients
export async function runDashboardSummaryEmailJob() {
  console.log("Starting dashboard summary email job...")

  const clients = await fetchAllClients()
  if (clients.length === 0) {
    console.log("No clients found")
    return { success: false, message: "No clients found" }
  }

  const results = []
  for (const client of clients) {
    const result = await sendDashboardSummaryForClient(client)
    results.push({ client: client.name, ...result })
  }

  console.log("Dashboard summary email job completed:", results)
  return { success: true, results }
}
