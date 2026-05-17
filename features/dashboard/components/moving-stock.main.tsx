"use client"

import { useInventoryContext } from "@/features/inventory/context/inventory-provider"

import { useSalesContext } from "@/features/sales/context/sales-provider"

import { getInventoryClassification } from "../services/slow-moving-stock"
import InventoryOverviewCard from "./moving-stock-card"

export default function InventoryClassificationCards() {
  const { inventory } = useInventoryContext()

  const { sales } = useSalesContext()

  const {
    fastMovingHighValue,
    mediumMovingMediumValue,
    slowMovingLowValue,
    deadStock,

    totals,
  } = getInventoryClassification({
    inventory,
    sales,
  })

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {/* FAST MOVING */}
      <InventoryOverviewCard
        title="Fast Moving"
        count={totals.fastMovingHighValue}
        description="Frequently sold high-value inventory with strong movement."
        color="#DDF6E8"
        products={fastMovingHighValue.map((item) => ({
          product: item.product,
          quantity: item.stock,
        }))}
      />

      {/* MEDIUM MOVING */}
      <InventoryOverviewCard
        title="Medium Moving"
        count={totals.mediumMovingMediumValue}
        description="Inventory with moderate sales movement and medium value."
        color="#E3EEFF"
        products={mediumMovingMediumValue.map((item) => ({
          product: item.product,
          quantity: item.stock,
        }))}
      />

      {/* SLOW MOVING */}
      <InventoryOverviewCard
        title="Slow Moving"
        count={totals.slowMovingLowValue}
        description="Products with low sales activity and slower turnover."
        color="#FFF1D6"
        products={slowMovingLowValue.map((item) => ({
          product: item.product,
          quantity: item.stock,
        }))}
      />

      {/* DEAD STOCK */}
      <InventoryOverviewCard
        title="Dead Stock"
        count={totals.deadStock}
        description="Products with no recent sales movement or activity."
        color="#FFE2E2"
        products={deadStock.map((item) => ({
          product: item.product,
          quantity: item.stock,
        }))}
      />
    </div>
  )
}
