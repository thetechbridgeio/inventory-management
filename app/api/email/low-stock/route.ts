import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { getStockStatus } from "@/lib/utils"
import type { InventoryItem } from "@/lib/types"

export async function POST(request: Request) {
  try {
    // Get client information from the request body
    const { clientEmail, clientName, clientId } = await request.json()

    if (!clientEmail) {
      return NextResponse.json({ success: false, error: "Client email is required" }, { status: 400 })
    }

    // Fetch inventory data
    const response = await fetch(
      `${process.env.VERCEL_URL || "http://localhost:3000"}/api/sheets?sheet=Inventory&clientId=${clientId || ""}`,
      {
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory data: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.data || !Array.isArray(result.data)) {
      throw new Error("Invalid inventory data format")
    }

    // Process inventory data
    const inventoryItems: InventoryItem[] = result.data.map((item: any, index: number) => ({
      srNo: item.srNo || item["Sr. no"] || index + 1,
      product: item.product || item["Product"] || "Unknown Product",
      category: item.category || item["Category"] || "Uncategorized",
      unit: item.unit || item["Unit"] || "PCS",
      minimumQuantity: Number(item.minimumQuantity || item["Minimum Quantity"] || 0),
      maximumQuantity: Number(item.maximumQuantity || item["Maximum Quantity"] || 0),
      reorderQuantity: Number(item.reorderQuantity || item["Reorder Quantity"] || 0),
      stock: Number(item.stock || item["Stock"] || 0),
      pricePerUnit: Number(item.pricePerUnit || item["Price per Unit"] || 0),
      value: Number(item.value || item["Value"] || 0),
    }))

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

