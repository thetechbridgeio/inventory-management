import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { google } from "googleapis"
import { JWT } from "google-auth-library"
import { getStockStatus } from "@/lib/utils"
import type { InventoryItem } from "@/lib/types"

export async function POST(request: Request) {
  try {
    // Get client information from the request body
    const { clientEmail, clientName, clientId } = await request.json()

    if (!clientEmail) {
      return NextResponse.json({ success: false, error: "Client email is required" }, { status: 400 })
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

    // Fetch inventory data from the client's sheet
    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL || "",
      key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Inventory!A:Z",
    })

    const rows = response.data.values || []

    if (!rows || rows.length <= 1) {
      return NextResponse.json({
        success: true,
        message: "No inventory data found",
      })
    }

    // Extract headers from the first row
    const headers = rows[0]

    // Map the data to objects with proper keys
    const inventoryItems: InventoryItem[] = rows.slice(1).map((row) => {
      const item: Record<string, any> = {}
      headers.forEach((header: string, index: number) => {
        if (index < row.length) {
          item[header] = row[index]
        } else {
          item[header] = ""
        }
      })

      return {
        srNo: item.srNo || item["Sr. no"] || 0,
        product: item.product || item["Product"] || "Unknown Product",
        category: item.category || item["Category"] || "Uncategorized",
        unit: item.unit || item["Unit"] || "PCS",
        minimumQuantity: Number(item.minimumQuantity || item["Minimum Quantity"] || 0),
        maximumQuantity: Number(item.maximumQuantity || item["Maximum Quantity"] || 0),
        reorderQuantity: Number(item.reorderQuantity || item["Reorder Quantity"] || 0),
        stock: Number(item.stock || item["Stock"] || 0),
        pricePerUnit: Number(item.pricePerUnit || item["Price per Unit"] || 0),
        value: Number(item.value || item["Value"] || 0),
      }
    })

    // Filter for low stock items
    const lowStockItems = inventoryItems.filter(
      (item) => getStockStatus(item) === "low" || getStockStatus(item) === "negative",
    )

    if (lowStockItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No low stock items found",
      })
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    })

    // Format the email content with client-specific information
    const emailHtml = generateLowStockEmailHtml(lowStockItems, clientName)

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER, // From clienthelp.bgc@gmail.com
      to: clientEmail, // To the client's email
      subject: `Low Stock Alert - ${clientName || "Inventory Management System"}`,
      html: emailHtml,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: `Low stock alert sent to ${clientEmail} for ${lowStockItems.length} items`,
    })
  } catch (error) {
    console.error("Error sending low stock email:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send low stock email",
      },
      { status: 500 },
    )
  }
}

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
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

