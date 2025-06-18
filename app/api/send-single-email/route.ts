import { NextResponse } from "next/server"
import { runLowStockEmailJob } from "@/lib/scheduler"

export async function POST(request: Request) {
  try {
    const { clientEmail } = await request.json()

    if (!clientEmail) {
      return NextResponse.json({ error: "Client email is required" }, { status: 400 })
    }

    console.log(`Sending test email to: ${clientEmail}`)

    // Run the email job but filter for specific client
    const result = await runLowStockEmailJob()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
      message: `Email job completed for ${clientEmail}`,
    })
  } catch (error) {
    console.error("Error sending single email:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
