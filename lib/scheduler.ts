import nodemailer from "nodemailer"
import { google } from "googleapis"
import { JWT } from "google-auth-library"
import { getStockStatus } from "./utils"
import type { InventoryItem } from "./types"

// Create email transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  })
}

// Create Google Sheets client with proper authentication
function createSheetsClient() {
  const auth = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  return google.sheets({ version: "v4", auth })
}

// Fetch all clients from master sheet
async function fetchAllClients() {
  try {
    console.log("Fetching clients from master sheet...")

    if (!process.env.MASTER_SHEET_ID) {
      throw new Error("MASTER_SHEET_ID environment variable not found")
    }

    const sheets = createSheetsClient()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.MASTER_SHEET_ID,
      range: "Clients!A:F",
    })

    const rows = response.data.values || []
    console.log(`Found ${rows.length} rows in master sheet`)

    if (rows.length <= 1) {
      console.log("No client data found")
      return []
    }

    const headers = rows[0]
    console.log("Headers found:", headers)

    const clients = rows.slice(1).map((row) => {
      const client: any = {}
      headers.forEach((header, headerIndex) => {
        const key = header.toLowerCase().replace(/\s(.)/g, (_, char) => char.toUpperCase())
        client[key] = row[headerIndex] || ""
      })

      // Ensure consistent property names
      client.clientId = client.id || client.clientId
      client.name = client.name || client.clientName
      client.email = client.email || client.clientEmail
      client.sheetId = client.sheetId || client.googleSheetId

      return client
    })

    const validClients = clients.filter((client) => client.email && client.sheetId && client.clientId)
    console.log(`Found ${validClients.length} valid clients`)

    // Log client details for debugging
    validClients.forEach((client, index) => {
      console.log(`Client ${index + 1}: ${client.name} (${client.email})`)
    })

    return validClients
  } catch (error) {
    console.error("Error fetching clients:", error)
    return []
  }
}

// Fetch inventory data directly from Google Sheets
async function fetchClientInventory(sheetId: string) {
  try {
    const sheets = createSheetsClient()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Inventory!A:Z",
    })

    const rows = response.data.values || []
    if (rows.length <= 1) {
      return []
    }

    const headers = rows[0]
    return rows.slice(1).map((row: any, index: number) => {
      const item: InventoryItem = {
        srNo: Number(row[headers.indexOf("srNo")] || row[headers.indexOf("Sr. no")] || index + 1),
        product: row[headers.indexOf("product")] || row[headers.indexOf("Product")] || "Unknown Product",
        category: row[headers.indexOf("category")] || row[headers.indexOf("Category")] || "Uncategorized",
        unit: row[headers.indexOf("unit")] || row[headers.indexOf("Unit")] || "PCS",
        minimumQuantity: Number(
          row[headers.indexOf("minimumQuantity")] || row[headers.indexOf("Minimum Quantity")] || 0,
        ),
        maximumQuantity: Number(
          row[headers.indexOf("maximumQuantity")] || row[headers.indexOf("Maximum Quantity")] || 0,
        ),
        reorderQuantity: Number(
          row[headers.indexOf("reorderQuantity")] || row[headers.indexOf("Reorder Quantity")] || 0,
        ),
        stock: Number(row[headers.indexOf("stock")] || row[headers.indexOf("Stock")] || 0),
        pricePerUnit: Number(row[headers.indexOf("pricePerUnit")] || row[headers.indexOf("Price per Unit")] || 0),
        value: Number(row[headers.indexOf("value")] || row[headers.indexOf("Value")] || 0),
      }
      return item
    })
  } catch (error) {
    console.error(`Error fetching inventory for sheet ${sheetId}:`, error)
    return []
  }
}

// Fetch purchase data directly from Google Sheets
async function fetchClientPurchases(sheetId: string) {
  try {
    const sheets = createSheetsClient()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Purchase!A:Z",
    })

    const rows = response.data.values || []
    if (rows.length <= 1) {
      return []
    }

    const headers = rows[0]
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
  } catch (error) {
    console.error(`Error fetching purchases for sheet ${sheetId}:`, error)
    return []
  }
}

// Fetch sales data directly from Google Sheets
async function fetchClientSales(sheetId: string) {
  try {
    const sheets = createSheetsClient()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Sales!A:Z",
    })

    const rows = response.data.values || []
    if (rows.length <= 1) {
      return []
    }

    const headers = rows[0]
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
  } catch (error) {
    console.error(`Error fetching sales for sheet ${sheetId}:`, error)
    return []
  }
}

// Send consolidated low stock email to a specific client
async function sendLowStockEmailForClient(client: any) {
  try {
    console.log(`Processing low stock email for client: ${client.name} (${client.clientId})`)

    // Fetch inventory data directly from Google Sheets
    const inventoryItems = await fetchClientInventory(client.sheetId)
    console.log(`Found ${inventoryItems.length} inventory items for ${client.name}`)

    // Find low stock items
    const lowStockItems = inventoryItems.filter((item) => {
      const status = getStockStatus(item)
      return status === "low" || status === "negative"
    })

    console.log(`Found ${lowStockItems.length} low stock items for ${client.name}`)

    if (lowStockItems.length === 0) {
      console.log(`No low stock items for client: ${client.name}`)
      return { success: true, message: "No low stock items", skipped: true }
    }

    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🚨 Low Stock Alert - ${client.name}</h2>
        <p>The following ${lowStockItems.length} item${lowStockItems.length > 1 ? "s are" : " is"} running low and need${lowStockItems.length > 1 ? "" : "s"} to be restocked:</p>
        
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
                (item) => `
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 12px;">${item.product}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px;">${item.category}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center; color: #dc2626; font-weight: bold;">${item.stock} ${item.unit}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">${item.minimumQuantity} ${item.unit}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">${item.reorderQuantity} ${item.unit}</td>
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
          This is an automated alert from your Inventory Management System.<br>
          Generated on: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
        </p>
      </div>
    `

    // Create and send email
    const transporter = createTransporter()
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: `🚨 Low Stock Alert - ${client.name} (${lowStockItems.length} items)`,
      html: emailContent,
    }

    await transporter.sendMail(mailOptions)

    console.log(`Low stock email sent successfully to ${client.email} for ${lowStockItems.length} items`)
    return { success: true, message: `Email sent to ${client.email}`, itemCount: lowStockItems.length }
  } catch (error) {
    console.error(`Error sending low stock email to ${client.email}:`, error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Send dashboard summary email for a specific client
async function sendDashboardSummaryForClient(client: any) {
  try {
    console.log(`Processing dashboard summary for client: ${client.name} (${client.clientId})`)

    // Fetch data directly from Google Sheets
    const [inventoryItems, purchaseItems, salesItems] = await Promise.all([
      fetchClientInventory(client.sheetId),
      fetchClientPurchases(client.sheetId),
      fetchClientSales(client.sheetId),
    ])

    // Calculate metrics
    const totalProducts = inventoryItems.length
    const lowStockItems = inventoryItems.filter((item) => {
      const status = getStockStatus(item)
      return status === "low" || status === "negative"
    })
    const totalStockValue = inventoryItems.reduce((sum, item) => sum + (item.value || 0), 0)
    const recentPurchases = purchaseItems.length
    const recentSales = salesItems.length

    console.log(`Dashboard metrics for ${client.name}:`, {
      totalProducts,
      lowStockCount: lowStockItems.length,
      totalStockValue,
      recentPurchases,
      recentSales,
    })

    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">📊 Daily Dashboard Summary - ${client.name}</h2>
        <p>Here's your daily inventory summary for ${new Date().toLocaleDateString("en-IN")}:</p>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <h3 style="margin: 0 0 10px 0; color: #0ea5e9;">Total Products</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 0;">${totalProducts}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h3 style="margin: 0 0 10px 0; color: #f59e0b;">Low Stock Items</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 0;">${lowStockItems.length}</p>
          </div>
          
          <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e;">
            <h3 style="margin: 0 0 10px 0; color: #22c55e;">Total Stock Value</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 0;">₹${totalStockValue.toLocaleString("en-IN")}</p>
          </div>
          
          <div style="background-color: #fce7f3; padding: 20px; border-radius: 8px; border-left: 4px solid #ec4899;">
            <h3 style="margin: 0 0 10px 0; color: #ec4899;">Recent Transactions</h3>
            <p style="font-size: 24px; font-weight: bold; margin: 0;">${recentPurchases + recentSales}</p>
          </div>
        </div>
        
        ${
          lowStockItems.length > 0
            ? `
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #ef4444;">⚠️ Action Required</h3>
          <p style="margin: 0;">You have ${lowStockItems.length} items running low on stock. Consider restocking soon.</p>
        </div>
        `
            : ""
        }
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #9ca3af;">
          This is your daily automated summary from the Inventory Management System.<br>
          Generated on: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
        </p>
      </div>
    `

    // Create and send email
    const transporter = createTransporter()
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: `📊 Daily Summary - ${client.name} - ${new Date().toLocaleDateString("en-IN")}`,
      html: emailContent,
    }

    await transporter.sendMail(mailOptions)

    console.log(`Dashboard summary email sent successfully to ${client.email}`)
    return {
      success: true,
      message: `Email sent to ${client.email}`,
      metrics: { totalProducts, lowStockCount: lowStockItems.length, totalStockValue },
    }
  } catch (error) {
    console.error(`Error sending dashboard summary to ${client.email}:`, error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Run low stock email job for all clients with better timeout handling
export async function runLowStockEmailJob() {
  console.log("Starting low stock email job...")

  const clients = await fetchAllClients()
  if (clients.length === 0) {
    console.log("No clients found")
    return { success: false, message: "No clients found" }
  }

  console.log(`Processing ${clients.length} clients for low stock emails`)
  const results = []

  // Process clients with timeout protection
  for (let i = 0; i < clients.length; i++) {
    const client = clients[i]
    console.log(`Processing client ${i + 1}/${clients.length}: ${client.name}`)

    try {
      // Set timeout for each client (5 seconds max)
      const clientPromise = sendLowStockEmailForClient(client)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Timeout processing ${client.name}`)), 5000)
      })

      const result = await Promise.race([clientPromise, timeoutPromise])
      results.push({ client: client.name, ...result })

      // Add delay between emails to avoid rate limiting
      if (!result.skipped) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error(`Error processing client ${client.name}:`, error)
      results.push({
        client: client.name,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const sentEmails = results.filter((r) => r.success && !r.skipped).length
  console.log(`Low stock email job completed: ${sentEmails} emails sent out of ${clients.length} clients`)
  return { success: true, results, summary: `${sentEmails} emails sent` }
}

// Run dashboard summary email job for all clients with better timeout handling
export async function runDashboardSummaryEmailJob() {
  console.log("Starting dashboard summary email job...")

  const clients = await fetchAllClients()
  if (clients.length === 0) {
    console.log("No clients found")
    return { success: false, message: "No clients found" }
  }

  console.log(`Processing ${clients.length} clients for dashboard summary emails`)
  const results = []

  // Process clients with timeout protection
  for (let i = 0; i < clients.length; i++) {
    const client = clients[i]
    console.log(`Processing client ${i + 1}/${clients.length}: ${client.name}`)

    try {
      // Set timeout for each client (5 seconds max)
      const clientPromise = sendDashboardSummaryForClient(client)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Timeout processing ${client.name}`)), 5000)
      })

      const result = await Promise.race([clientPromise, timeoutPromise])
      results.push({ client: client.name, ...result })

      // Add delay between emails to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Error processing client ${client.name}:`, error)
      results.push({
        client: client.name,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const sentEmails = results.filter((r) => r.success).length
  console.log(`Dashboard summary email job completed: ${sentEmails} emails sent out of ${clients.length} clients`)
  return { success: true, results, summary: `${sentEmails} emails sent` }
}
