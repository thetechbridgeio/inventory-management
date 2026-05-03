"use client"

import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import { DataTable } from "@/components/data-table/data-table"
import { salesColumns } from "@/components/data-table/columns/sales-columns"
import { useClientContext } from "@/context/client-context"
import { getSalesTerm } from "@/lib/client-terminology"
import { AddSaleDialog } from "@/features/sales/components/add-sale-form"
import { DeleteSelectedButton } from "@/components/helpers/delete-selected-button"
import SalesFilter from "@/features/sales/components/sales-filter"

import { exportSalesPDF } from "@/features/sales/services/export-sales-pdf"
import { fetchSalesPageData } from "@/features/sales/services/fetch-sales-data"
import { mapSales, mapInventory, mapSuppliers } from "@/features/sales/services/sales-mapper"
import { filterSales } from "@/features/sales/services/filter-sales"
import { sortByDateDesc } from "@/features/sales/utils/sort-date-desc"
import { SalesFilterState, SalesItem } from "@/features/sales/types/sale-entry-form.types"
import { InventoryItem, Supplier } from "@/lib/types"

export default function SalesPage() {
  const { client } = useClientContext()

  const [data, setData] = useState<SalesItem[]>([])
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const [supplierData, setSupplierData] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<SalesItem[]>([])

  const [filters, setFilters] = useState<SalesFilterState>({
    product: [],
    company: [],
    dateRange: { from: undefined, to: undefined },
    search: "",
  })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchSalesPageData(client?.id)

        setData(sortByDateDesc(mapSales(res.sales)))
        setInventoryData(mapInventory(res.inventory))
        setSupplierData(mapSuppliers(res.suppliers))
      } catch (e) {
        console.error(e)
        toast.error("Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [client?.id])

  const filteredData: SalesItem[] = useMemo(
    () => filterSales(data, filters),
    [data, filters]
  )

  const handleExportPDF = () => {
    try {
      const count = exportSalesPDF({ data: filteredData, filters })
      toast.success(`PDF exported (${count} records)`)
    } catch {
      toast.error("Failed to export PDF")
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">
          {getSalesTerm(client?.name)} Management
        </h1>

        <div className="flex gap-2">
          <AddSaleDialog
            productOptions={[]} // unchanged contract
            companyOptions={[]}
            inventoryData={inventoryData}
            client={client}
            onSuccess={({ newSalesItems, updatedInventory }) => {
              setData((prev) => sortByDateDesc([...newSalesItems, ...prev]))
              setInventoryData(updatedInventory)
            }}
          />

          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>

          <SalesFilter
            isFiltersOpen={false}
            setIsFiltersOpen={() => { }}
            filters={filters}
            setFilters={setFilters}
            productFilters={{}}
            setProductFilters={() => { }}
            companyFilters={{}}
            setCompanyFilters={() => { }}
          />

          <DeleteSelectedButton
            sheetName="Sales"
            selectedRows={selectedRows}
            data={data}
            setData={setData}
            setSelectedRows={setSelectedRows}
            clientId={client?.id}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>{getSalesTerm(client?.name)} Items</CardTitle>

          <Input
            placeholder="Search..."
            className="w-72"
            value={filters.search}
            onChange={(e) =>
              setFilters((p) => ({ ...p, search: e.target.value }))
            }
          />
        </CardHeader>

        <CardContent>
          <DataTable
            columns={salesColumns}
            data={filteredData}
            onRowSelectionChange={setSelectedRows}
          />
        </CardContent>
      </Card>
    </div>
  )
}