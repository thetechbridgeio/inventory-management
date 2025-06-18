import { NextResponse } from "next/server"
import { runLowStockEmailJob, runDashboardSummaryEmailJob } from "@/lib/scheduler"

// In-memory store to prevent duplicate runs (resets on function restart)
let lastRunTime = 0
const MIN_RUN_INTERVAL = 5 * 60 * 1000 // 5 minutes minimum between runs

export async function GET(request: Request) {
  try {
    const now = Date.now()
    console.log("Daily emails cron job triggered at:", new Date().toISOString())

    // Check if we've run recently to prevent duplicates
    if (now - lastRunTime < MIN_RUN_INTERVAL) {
      const timeSinceLastRun = Math.round((now - lastRunTime) / 1000)
      console.log(`Skipping duplicate run - last run was ${timeSinceLastRun} seconds ago`)
      return NextResponse.json({
        success: true,
        message: `Skipped - last run was ${timeSinceLastRun} seconds ago`,
        timestamp: new Date().toISOString(),
      })
    }

    // Update last run time
    lastRunTime = now

    console.log("Starting email jobs...")

    // Run both email jobs in parallel for faster execution
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
