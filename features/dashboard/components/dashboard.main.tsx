import { useInventoryContext } from "@/features/inventory/context/inventory-provider"
import { usePurchasesContext } from "@/features/purchase/context/purchase-provider"
import { useSalesContext } from "@/features/sales/context/sales-provider"
import { useSuppliersContext } from "@/features/suppliers/context/supplier-provider"
import { DashboardOverview } from "./dashbaord-overview"
import { InventoryCategoryChart } from "./inventory-category"
import { SalesOverviewChart } from "./sales-overview-chart"
import { StockStatusSection } from "./stock-status-section"
import { SupplierOverviewCard } from "./suppplier-overview.card"
import SlowMovingStockCard from "./moving-stock-card"
import InventoryClassificationCards from "./moving-stock.main"

const DashbaordComponent = () => {
  const { inventory } = useInventoryContext()
  const { sales } = useSalesContext()
  const { purchases } = usePurchasesContext()
  const { suppliers } = useSuppliersContext()
  return (
    <div className="space-y-6">
      <DashboardOverview
        inventory={inventory}
        sales={sales}
        purchases={purchases}
      />

      <StockStatusSection inventory={inventory} />

      {/* <div className="grid gap-6 lg:grid-cols-3">
        <SalesOverviewChart sales={sales} inventory={inventory} />

        <InventoryCategoryChart inventory={inventory} />
      </div> */}
      <InventoryClassificationCards />

      {/* <SupplierOverviewCard suppliers={suppliers} /> */}
    </div>
  )
}

export default DashbaordComponent
