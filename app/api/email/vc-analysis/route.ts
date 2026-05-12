import { fetchClientsService } from "@/features/clients/services/fetch-clients.service"
import { processVCAnalysis } from "@/lib/email/services/process-vc-analysis"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const clients = await fetchClientsService()

    await Promise.all(clients.map((client) => processVCAnalysis(client)))

    return NextResponse.json({
      success: true,
      message: "VC analysis completed successfully",
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute VC analysis",
      },
      {
        status: 500,
      }
    )
  }
}
