import {
    runLowStockEmailJob,
    runDashboardSummaryEmailJob,
    runMonthlyReportEmailJob,
} from "@/lib/scheduler"

export default async () => {
    console.log("Running Netlify Scheduled Job")

    await Promise.all([
        runLowStockEmailJob(),
        runDashboardSummaryEmailJob(),
    ])

    // Run on the 1st of every month
    const now = new Date()
    const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))

    if (ist.getDate() === 1) {
        await runMonthlyReportEmailJob()
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Scheduled jobs executed successfully" }),
    }
}