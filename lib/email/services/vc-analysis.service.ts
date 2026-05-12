import { Inventory } from "@/features/inventory/types/inventory.types"
import { SalesItem } from "@/features/sales/types/sales.types"

export function getVCAnalysis({
  inventory,
  sales,
}: {
  inventory: Inventory[]
  sales: SalesItem[]
}) {
  /**
   * Product sales volume map
   */
  const salesVolumeMap = new Map<string, number>()

  sales.forEach((sale) => {
    const existingVolume = salesVolumeMap.get(sale.product) || 0

    salesVolumeMap.set(sale.product, existingVolume + sale.quantity)
  })

  /**
   * Average value
   */
  const averageValue =
    inventory.reduce((sum, item) => sum + item.value, 0) /
    (inventory.length || 1)

  /**
   * Average sales volume
   */
  const averageVolume =
    Array.from(salesVolumeMap.values()).reduce(
      (sum, volume) => sum + volume,
      0
    ) / (salesVolumeMap.size || 1)

  const hvhv: Inventory[] = []
  const hvlv: Inventory[] = []
  const lvhv: Inventory[] = []
  const lvlv: Inventory[] = []

  inventory.forEach((item) => {
    const productValue = item.value

    const productVolume = salesVolumeMap.get(item.product) || 0

    const isHighValue = productValue >= averageValue

    const isHighVolume = productVolume >= averageVolume

    /**
     * Classification
     */
    if (isHighValue && isHighVolume) {
      hvhv.push(item)
      return
    }

    if (isHighValue && !isHighVolume) {
      hvlv.push(item)
      return
    }

    if (!isHighValue && isHighVolume) {
      lvhv.push(item)
      return
    }

    lvlv.push(item)
  })

  return {
    hvhv,
    hvlv,
    lvhv,
    lvlv,
  }
}
