import { Client } from "@/features/clients/types/client.types"
import { getStockStatus } from "@/features/dashboard/services/stock.service"
import { fetchInventory } from "@/features/inventory/services/fetch-inventory"
import { sendLowStockAlert } from "./send-low-stock-alert.service"

export async function processLowStockAlert(client: Client) {
  try {
    console.log("Processing low stock alert for client: ", client)
    /**
     * Ignore inactive clients
     */
    if (!client.isActive) {
      return
    }

    /**
     * Fetch inventory
     */
    const inventory = await fetchInventory(client.sheetId)

    /**
     * Get low stock products
     */
    const { lowStockProducts, negativeStockProducts } =
      getStockStatus(inventory)

    /**
     * No low stock
     */
    if (lowStockProducts.length === 0 || negativeStockProducts.length === 0) {
      console.log(`No low stock items for ${client.companyName}`)

      return
    }

    /**
     * Send email
     */
    await sendLowStockAlert({
      companyName: client.companyName,

      email: client.contactPersonEmail,

      products: [...lowStockProducts, ...negativeStockProducts],
    })

    console.log(`Low stock alert sent to ${client.companyName}`)
  } catch (error) {
    console.error(`Low stock alert failed for ${client.companyName}`, error)
  }
}
