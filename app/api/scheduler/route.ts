import { NextResponse } from "next/server"
import {
  startScheduler,
  runLowStockEmailJob,
  runDashboardSummaryEmailJob,
  runMonthlyReportEmailJob,
} from "@/lib/scheduler"

import {
  runLowStockWhatsAppJob,
  runDashboardWhatsAppJob,
  runMonthlyReportWhatsAppJob,
} from "@/lib/whatsapp-scheduler"

// This endpoint manages and triggers scheduler jobs for both Email and WhatsApp
export async function GET(request: Request) {
  try {
    // 🔐 Secure the endpoint using CRON_SECRET
    // const authHeader = request.headers.get("authorization")
    // const cronSecret = process.env.CRON_SECRET

    // if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   )
    // }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    // 🔔 Run Low Stock Alerts
    if (action === "run-low-stock") {
      await Promise.all([
        runLowStockEmailJob(),
        runLowStockWhatsAppJob(),
      ])

      return NextResponse.json({
        success: true,
        message: "Low stock alerts triggered via Email and WhatsApp",
      })
    }

    // 📊 Run Dashboard Summary
    if (action === "run-dashboard") {
      await Promise.all([
        runDashboardSummaryEmailJob(),
        runDashboardWhatsAppJob(),
      ])

      return NextResponse.json({
        success: true,
        message: "Dashboard summary triggered via Email and WhatsApp",
      })
    }

    // 📅 Run Monthly Report
    if (action === "run-monthly") {
      await Promise.all([
        runMonthlyReportEmailJob(),
        runMonthlyReportWhatsAppJob(),
      ])

      return NextResponse.json({
        success: true,
        message: "Monthly reports triggered via Email and WhatsApp",
      })
    }

    // 🚀 Run All Jobs
    if (action === "run-all") {
      await Promise.all([
        runLowStockEmailJob(),
        runDashboardSummaryEmailJob(),
        runMonthlyReportEmailJob(),
        runLowStockWhatsAppJob(),
        runDashboardWhatsAppJob(),
        runMonthlyReportWhatsAppJob(),
      ])

      return NextResponse.json({
        success: true,
        message: "All Email and WhatsApp jobs triggered successfully",
      })
    }

    // ⏰ Start scheduler only in development (not in Netlify production)
    if (process.env.NODE_ENV === "development") {
      startScheduler()
      return NextResponse.json({
        success: true,
        message: "Local scheduler started successfully",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Scheduler is managed by Netlify Scheduled Functions in production",
    })
  } catch (error: unknown) {
    console.error("Error with scheduler:", error)

    return NextResponse.json(
      {
        error: "Failed to process scheduler request",
        details:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}