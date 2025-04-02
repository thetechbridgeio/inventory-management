import { NextResponse } from "next/server"
import { startScheduler, runLowStockEmailJob, runDashboardSummaryEmailJob } from "@/lib/scheduler"

// This is a simple endpoint that can be used to start the scheduler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "run-low-stock") {
      // Manually trigger the low stock email job
      await runLowStockEmailJob()
      return NextResponse.json({ success: true, message: "Low stock email job triggered successfully" })
    } else if (action === "run-dashboard") {
      // Manually trigger the dashboard summary email job
      await runDashboardSummaryEmailJob()
      return NextResponse.json({ success: true, message: "Dashboard summary email job triggered successfully" })
    } else if (action === "run-all") {
      // Trigger both jobs
      await Promise.all([runLowStockEmailJob(), runDashboardSummaryEmailJob()])
      return NextResponse.json({ success: true, message: "All email jobs triggered successfully" })
    } else {
      // Start the scheduler
      startScheduler()
      return NextResponse.json({ success: true, message: "Scheduler started successfully" })
    }
  } catch (error) {
    console.error("Error with scheduler:", error)
    return NextResponse.json(
      { error: "Failed to process scheduler request", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

