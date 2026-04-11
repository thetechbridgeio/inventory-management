import { NextResponse } from "next/server"
import {
  startScheduler,
  runLowStockEmailJob,
  runDashboardSummaryEmailJob,
  runMonthlyReportEmailJob,
} from "@/lib/scheduler"

// This endpoint manages and triggers scheduler jobs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "run-low-stock") {
      // Manually trigger the low stock email job
      await runLowStockEmailJob()
      return NextResponse.json({
        success: true,
        message: "Low stock email job triggered successfully",
      })
    }

    if (action === "run-dashboard") {
      // Manually trigger the dashboard summary email job
      await runDashboardSummaryEmailJob()
      return NextResponse.json({
        success: true,
        message: "Dashboard summary email job triggered successfully",
      })
    }

    if (action === "run-monthly") {
      // Manually trigger the monthly inventory report
      await runMonthlyReportEmailJob()
      return NextResponse.json({
        success: true,
        message: "Monthly report email job triggered successfully",
      })
    }

    if (action === "run-all") {
      // Trigger all jobs simultaneously
      await Promise.all([
        runLowStockEmailJob(),
        runDashboardSummaryEmailJob(),
        runMonthlyReportEmailJob(),
      ])
      return NextResponse.json({
        success: true,
        message: "All email jobs triggered successfully",
      })
    }

    // Default: Start the scheduler
    startScheduler()
    return NextResponse.json({
      success: true,
      message: "Scheduler started successfully",
    })
  } catch (error: any) {
    console.error("Error with scheduler:", error)
    return NextResponse.json(
      {
        error: "Failed to process scheduler request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}