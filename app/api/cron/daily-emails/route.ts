import { NextResponse } from "next/server"
import { runLowStockEmailJob, runDashboardSummaryEmailJob } from "@/lib/scheduler"

export async function GET(request: Request) {
  try {
    console.log("Daily emails cron job triggered at:", new Date().toISOString())

    // Check authorization
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (!authHeader || authHeader !== expectedAuth) {
      console.log("Unauthorized cron request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Authorization successful, starting email jobs...")

    // Run both email jobs
    const [lowStockResult, dashboardResult] = await Promise.all([
      runLowStockEmailJob().catch((error) => {
        console.error("Low stock email job failed:", error)
        return { success: false, error: error.message }
      }),
      runDashboardSummaryEmailJob().catch((error) => {
        console.error("Dashboard summary email job failed:", error)
        return { success: false, error: error.message }
      }),
    ])

    console.log("Low stock email result:", lowStockResult)
    console.log("Dashboard summary result:", dashboardResult)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        lowStock: lowStockResult,
        dashboard: dashboardResult,
      },
    })
  } catch (error) {
    console.error("Error in daily emails cron job:", error)
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

// Also support POST method for external cron services
export async function POST(request: Request) {
  return GET(request)
}
