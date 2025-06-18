import { NextResponse } from "next/server"
import { runLowStockEmailJob, runDashboardSummaryEmailJob } from "@/lib/scheduler"

export async function GET() {
  try {
    console.log("Manual cron test triggered at:", new Date().toISOString())

    // Test environment variables
    const envCheck = {
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_APP_PASSWORD: !!process.env.EMAIL_APP_PASSWORD,
      GOOGLE_CLIENT_EMAIL: !!process.env.GOOGLE_CLIENT_EMAIL,
      GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
      MASTER_SHEET_ID: !!process.env.MASTER_SHEET_ID,
      CRON_SECRET: !!process.env.CRON_SECRET,
    }

    console.log("Environment variables check:", envCheck)

    // Run email jobs
    console.log("Starting email jobs...")

    const lowStockResult = await runLowStockEmailJob().catch((error) => {
      console.error("Low stock email job failed:", error)
      return { success: false, error: error.message }
    })

    const dashboardResult = await runDashboardSummaryEmailJob().catch((error) => {
      console.error("Dashboard summary email job failed:", error)
      return { success: false, error: error.message }
    })

    console.log("Email jobs completed")

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environmentCheck: envCheck,
      results: {
        lowStock: lowStockResult,
        dashboard: dashboardResult,
      },
    })
  } catch (error) {
    console.error("Error in manual cron test:", error)
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
