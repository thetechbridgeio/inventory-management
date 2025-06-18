import { NextResponse } from "next/server"
import { runLowStockEmailJob, runDashboardSummaryEmailJob } from "@/lib/scheduler"

// This endpoint is now used only for manual triggering of email jobs
// Automated scheduling is handled by Netlify scheduled functions
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
      // Return info about available actions since startScheduler is no longer available
      return NextResponse.json({
        success: true,
        message:
          "Scheduler endpoint available. Use ?action=run-low-stock, ?action=run-dashboard, or ?action=run-all to trigger email jobs manually.",
        note: "Automated scheduling is now handled by Netlify scheduled functions at 6 PM IST daily.",
      })
    }
  } catch (error) {
    console.error("Error with scheduler:", error)
    return NextResponse.json(
      { error: "Failed to process scheduler request", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
