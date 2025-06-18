import { NextResponse } from "next/server"
import { runLowStockEmailJob, runDashboardSummaryEmailJob } from "@/lib/scheduler"

// This endpoint will be called by an external cron service (like cron-job.org or GitHub Actions)
export async function GET(request: Request) {
  try {
    // Verify the request is from a trusted source (optional security measure)
    const authHeader = request.headers.get("authorization")
    const expectedAuth = process.env.CRON_SECRET || "your-secret-key"

    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Running daily email cron job at:", new Date().toISOString())

    // Run both email jobs
    await Promise.all([runLowStockEmailJob(), runDashboardSummaryEmailJob()])

    return NextResponse.json({
      success: true,
      message: "Daily emails sent successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in daily email cron job:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send daily emails",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Also support POST method for flexibility
export async function POST(request: Request) {
  return GET(request)
}
