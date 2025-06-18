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

    // Check authorization
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (!authHeader || authHeader !== expectedAuth) {
      console.log("Unauthorized cron request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update last run time
    lastRunTime = now

    console.log("Authorization successful, starting email jobs...")

    // Set a timeout for the entire operation (25 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Operation timed out after 25 seconds")), 25000)
    })

    // Run both email jobs with timeout
    const emailJobsPromise = Promise.all([
      runLowStockEmailJob().catch((error) => {
        console.error("Low stock email job failed:", error)
        return { success: false, error: error.message }
      }),
      runDashboardSummaryEmailJob().catch((error) => {
        console.error("Dashboard summary email job failed:", error)
        return { success: false, error: error.message }
      }),
    ])

    const [lowStockResult, dashboardResult] = await Promise.race([emailJobsPromise, timeoutPromise])

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
