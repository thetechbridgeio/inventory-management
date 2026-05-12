import { Client } from "@/features/clients/types/client.types"
import { fetchInventory } from "@/features/inventory/services/fetch-inventory"
import { sendVCAnalysis } from "./send-vs-analysis-email"
import { getVCAnalysis } from "./vc-analysis.service"
import { fetchSales } from "@/features/sales/services/fetch-sales"

export async function processVCAnalysis(client: Client) {
  try {
    if (!client.isActive) {
      return
    }

    /**
     * Fetch data
     */
    const [inventory, sales] = await Promise.all([
      fetchInventory(client.sheetId),

      fetchSales({
        sheetId: client.sheetId,
      }),
    ])

    /**
     * Generate analysis
     */
    const { hvhv, hvlv, lvhv, lvlv } = getVCAnalysis({
      inventory,
      sales,
    })

    /**
     * Send report
     */
    await sendVCAnalysis({
      companyName: client.companyName,

      email: client.contactPersonEmail,

      hvhv,
      hvlv,
      lvhv,
      lvlv,
    })

    console.log(`VC report sent to ${client.companyName}`)
  } catch (error) {
    console.error(`VC analysis failed for ${client.companyName}`, error)
  }
}
