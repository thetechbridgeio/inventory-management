import type { Handler } from "@netlify/functions"

import { executeJob } from "@/lib/scheduler/execute-job"

import { processLowStockAlert } from "@/lib/email/services/low-stock-alert.service"

import { fetchClientsService } from "@/features/clients/services/fetch-clients.service"

export const handler: Handler = async () => {
  try {
    /**
     * Fetch active clients
     */
    const clients = await fetchClientsService()

    /**
     * Execute scheduler job
     */
    const result = await executeJob({
      name: "daily-low-stock",

      items: clients,

      processor: processLowStockAlert,
    })

    return {
      statusCode: 200,

      body: JSON.stringify({
        success: true,

        message: "Daily low stock scheduler completed",

        result,
      }),
    }
  } catch (error) {
    console.error("Daily Low Stock Scheduler Error:", error)

    return {
      statusCode: 500,

      body: JSON.stringify({
        success: false,

        error: "Scheduler execution failed",
      }),
    }
  }
}
