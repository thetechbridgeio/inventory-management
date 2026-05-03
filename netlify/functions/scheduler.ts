// netlify/functions/scheduler.ts

import {
  runLowStockEmailJob,
  runDashboardSummaryEmailJob,
  runMonthlyReportEmailJob,
} from "../../lib/scheduler"

import {
  runLowStockWhatsAppJob,
  runDashboardWhatsAppJob,
  runMonthlyReportWhatsAppJob,
} from "../../lib/whatsapp-scheduler"

/**
 * Netlify Scheduled Function Entry Point
 * This function is triggered by cron (netlify.toml)
 */
export async function handler() {
  const startTime = Date.now()

  try {
    console.log("🚀 Scheduler started")

    // Convert to IST
    const now = new Date()
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)

    const isFirstDayOfMonth = ist.getDate() === 1

    console.log("🕒 IST Time:", ist.toISOString())

    // -------------------------------
    // 🔹 DAILY JOBS
    // -------------------------------
    console.log("📧 Running daily jobs (Email + WhatsApp)")

    await Promise.all([
      runLowStockEmailJob(),
      runDashboardSummaryEmailJob(),
      runLowStockWhatsAppJob(),
      runDashboardWhatsAppJob(),
    ])

    // -------------------------------
    // 🔹 MONTHLY JOB (1st of month)
    // -------------------------------
    if (isFirstDayOfMonth) {
      console.log("📅 Running monthly jobs")

      await Promise.all([
        runMonthlyReportEmailJob(),
        runMonthlyReportWhatsAppJob(),
      ])
    }

    const duration = Date.now() - startTime

    console.log(`✅ Scheduler completed in ${duration}ms`)

    return new Response(
      JSON.stringify({
        success: true,
        message: "Scheduler executed successfully",
        ranMonthly: isFirstDayOfMonth,
        duration,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error: any) {
    console.error("❌ Scheduler failed:", error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "Unknown error",
      }),
      { status: 500 }
    )
  }
}