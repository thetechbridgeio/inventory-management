import { google } from "googleapis"
import { JWT } from "google-auth-library"
import { getStockStatus } from "./utils"
import { classifyVC } from "./analytics"
import type { InventoryItem } from "./types"
import {
  sendWhatsAppText,
  generateLowStockWhatsAppMessage,
  generateDashboardWhatsAppMessage,
  generateMonthlyReportWhatsAppMessage,
} from "@/utils/whatsapp-message-util"

// Create auth client
const auth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL || "",
  key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

// Create sheets client
const sheets = google.sheets({ version: "v4", auth })

let schedulerRunning = false
let schedulerInterval: NodeJS.Timeout | null = null

/**
 * Fetch all clients
 */
async function fetchAllClients() {
  const masterSheetId = process.env.MASTER_SHEET_ID
  if (!masterSheetId) {
    throw new Error("Master Sheet ID not found")
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: masterSheetId,
    range: "Clients!A:G",
  })

  const rows = response.data.values || []
  if (rows.length <= 1) return []

  const headers = rows[0]

  const clients = rows.slice(1).map((row) => {
    const client: Record<string, any> = {}
    headers.forEach((header: string, index: number) => {
      const key = header
        .toLowerCase()
        .replace(/\s(.)/g, (_, char) => char.toUpperCase())
      client[key] = row[index] || ""
    })
    return client
  })

  return clients.filter(
    (client) => client.sheetId && client.whatsapp
  )
}

/**
 * Fetch client inventory
 */
async function fetchClientInventory(sheetId: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Inventory!A:Z",
  })

  const rows = response.data.values || []
  if (rows.length <= 1) return []

  const headers = rows[0]

  return rows.slice(1).map((row: any, index: number) => {
    const item: InventoryItem = {
      srNo: index + 1,
      product: row[headers.indexOf("Product")] || "Unknown Product",
      category: row[headers.indexOf("Category")] || "",
      unit: row[headers.indexOf("Unit")] || "PCS",
      minimumQuantity: Number(
        row[headers.indexOf("Minimum Quantity")] || 0
      ),
      maximumQuantity: 0,
      reorderQuantity: Number(
        row[headers.indexOf("Reorder Quantity")] || 0
      ),
      stock: Number(row[headers.indexOf("Stock")] || 0),
      pricePerUnit: Number(
        row[headers.indexOf("Price per Unit")] || 0
      ),
      value: Number(row[headers.indexOf("Value")] || 0),
      productType:
        row[headers.indexOf("Product Type")] || "Raw Material",
    }
    return item
  })
}

/**
 * Send low stock WhatsApp alerts
 */
async function sendLowStockWhatsAppToAllClients() {
  console.log("Starting low stock WhatsApp job")

  const clients = await fetchAllClients()

  for (const client of clients) {
    try {
      const inventory = await fetchClientInventory(client.sheetId)

      const lowStockItems = inventory.filter(
        (item) =>
          getStockStatus(item) === "low" ||
          getStockStatus(item) === "negative"
      )

      if (lowStockItems.length === 0) continue

      const message = generateLowStockWhatsAppMessage(
        lowStockItems,
        client.name
      )

      await sendWhatsAppText(client.whatsapp, message)

      console.log(
        `WhatsApp low stock alert sent to ${client.name}`
      )
    } catch (error) {
      console.error(
        `Error sending WhatsApp low stock alert to ${client.name}:`,
        error
      )
    }
  }
}

/**
 * Send dashboard summary via WhatsApp
 */
async function sendDashboardSummaryWhatsAppToAllClients() {
  console.log("Starting dashboard WhatsApp job")

  const clients = await fetchAllClients()

  for (const client of clients) {
    try {
      const inventory = await fetchClientInventory(client.sheetId)

      const lowStockItems = inventory.filter(
        (item) =>
          getStockStatus(item) === "low" ||
          getStockStatus(item) === "negative"
      )

      const message = generateDashboardWhatsAppMessage(
        inventory.length,
        lowStockItems.length,
        client.name
      )

      await sendWhatsAppText(client.whatsapp, message)

      console.log(
        `WhatsApp dashboard summary sent to ${client.name}`
      )
    } catch (error) {
      console.error(
        `Error sending dashboard WhatsApp to ${client.name}:`,
        error
      )
    }
  }
}

/**
 * Send monthly reports via WhatsApp
 */
async function sendMonthlyReportWhatsAppToAllClients() {
  console.log("Starting monthly WhatsApp report job")

  const clients = await fetchAllClients()

  for (const client of clients) {
    try {
      const inventory = await fetchClientInventory(client.sheetId)

      const message =
        generateMonthlyReportWhatsAppMessage(
          inventory,
          client.name
        )

      await sendWhatsAppText(client.whatsapp, message)

      console.log(
        `Monthly WhatsApp report sent to ${client.name}`
      )
    } catch (error) {
      console.error(
        `Error sending monthly WhatsApp report to ${client.name}:`,
        error
      )
    }
  }
}

/**
 * Scheduler timing checks
 */
function isTimeToSendWhatsApp(): boolean {
  const now = new Date()
  const ist = new Date(
    now.getTime() + 5.5 * 60 * 60 * 1000
  )
  return ist.getHours() === 18 && ist.getMinutes() < 5
}

function isFirstDayOfMonthIST(): boolean {
  const now = new Date()
  const ist = new Date(
    now.getTime() + 5.5 * 60 * 60 * 1000
  )
  return ist.getDate() === 1 && ist.getHours() === 18
}

/**
 * Start WhatsApp Scheduler
 */
export function startWhatsAppScheduler() {
  if (schedulerRunning) {
    console.log("WhatsApp Scheduler already running")
    return
  }

  let lastRunDate: string | null = null

  schedulerInterval = setInterval(async () => {
    try {
      const today = new Date().toISOString().split("T")[0]

      if (isTimeToSendWhatsApp() && lastRunDate !== today) {
        console.log(
          "Running scheduled WhatsApp jobs at 6 PM IST"
        )

        await Promise.all([
          sendLowStockWhatsAppToAllClients(),
          sendDashboardSummaryWhatsAppToAllClients(),
        ])

        if (isFirstDayOfMonthIST()) {
          await sendMonthlyReportWhatsAppToAllClients()
        }

        lastRunDate = today
      }
    } catch (error) {
      console.error(
        "Error in WhatsApp scheduler:",
        error
      )
    }
  }, 60000)

  schedulerRunning = true
  console.log(
    "WhatsApp scheduler started - runs daily at 6:00 PM IST"
  )
}

/**
 * Manual triggers
 */
export async function runLowStockWhatsAppJob() {
  await sendLowStockWhatsAppToAllClients()
}

export async function runDashboardWhatsAppJob() {
  await sendDashboardSummaryWhatsAppToAllClients()
}

export async function runMonthlyReportWhatsAppJob() {
  await sendMonthlyReportWhatsAppToAllClients()
}