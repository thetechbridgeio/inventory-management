import type { Handler } from "@netlify/functions"

import { executeJob } from "@/lib/scheduler/execute-job"

import { fetchClientsService } from "@/features/clients/services/fetch-clients.service"
import { processVCAnalysis } from "@/lib/email/services/process-vc-analysis"

export const handler: Handler = async () => {
  try {
    const clients = await fetchClientsService()

    const result = await executeJob({
      name: "monthly-vc-analysis",

      items: clients,

      processor: processVCAnalysis,
    })

    return {
      statusCode: 200,

      body: JSON.stringify({
        success: true,
        result,
      }),
    }
  } catch (error) {
    console.error("Monthly VC Scheduler Error:", error)

    return {
      statusCode: 500,

      body: JSON.stringify({
        success: false,
      }),
    }
  }
}
