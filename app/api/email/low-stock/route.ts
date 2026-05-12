import { fetchClientsService } from "@/features/clients/services/fetch-clients.service"
import { processLowStockAlert } from "@/lib/email/services/low-stock-alert.service"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    /**
     * Fetch all clients
     */
    const clients = await fetchClientsService()

    /**
     * Process all clients
     */
    await Promise.all(clients.map((client) => processLowStockAlert(client)))

    return NextResponse.json({
      success: true,
      message: "Low stock scheduler executed successfully",
    })
  } catch (error) {
    console.error("Manual Scheduler Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute scheduler",
      },
      {
        status: 500,
      }
    )
  }
}
