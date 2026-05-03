import { classifyVC } from "@/lib/analytics"

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!
const API_VERSION = "v19.0"

const WHATSAPP_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`

export async function sendWhatsAppText(
  to: string,
  message: string
) {
  const response = await fetch(WHATSAPP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Failed to send WhatsApp message"
    )
  }

  return data
}

export function generateLowStockWhatsAppMessage(
  items: any[],
  clientName?: string
) {
  let message = `🚨 *Low Stock Alert - ${clientName}*\n\n`
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.product}\nStock: ${
      item.stock
    }\nMinimum: ${item.minimumQuantity}\n\n`
  })
  return message
}

export function generateDashboardWhatsAppMessage(
  totalProducts: number,
  lowStockItems: number,
  clientName?: string
) {
  return `📊 *Daily Dashboard Summary - ${clientName}*\n\nTotal Products: ${totalProducts}\nLow Stock Items: ${lowStockItems}`
}

export function generateMonthlyReportWhatsAppMessage(
  items: any[],
  clientName?: string
) {
  let message = `📅 *Monthly Report - ${clientName}*\n\n`
  items.slice(0, 10).forEach((item) => {
    const opening = Number(item.openingStock || 0)
    const closing = Number(item.stock || 0)
    const consumption = opening - closing
    const vc = classifyVC(item)

    message += `${item.product}\nOpening: ${opening}\nClosing: ${closing}\nConsumption: ${consumption}\nVC: ${vc}\n\n`
  })
  return message
}