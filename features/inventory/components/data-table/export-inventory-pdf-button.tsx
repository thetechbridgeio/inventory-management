"use client"

import { format } from "date-fns"

import { Inventory } from "../../types/inventory.types"
import { createPDF } from "@/lib/create-pdf"
import { ExportButton } from "@/lib/export-button"

type Props = {
  data: Inventory[]
}

export function ExportInventoryPDFButton({ data }: Props) {
  const handleExport = () => {
    const rows = data.map((item, index) => [
      index + 1,

      item.product,

      item.category,

      item.unit,

      item.stock,

      item.pricePerUnit,

      item.value,

      item.location || "-",

      item.productType,

      item.timestamp ? format(new Date(item.timestamp), "dd MMM yyyy") : "-",
    ])

    createPDF({
      title: "Inventory Report",

      fileName: "inventory-report.pdf",

      headers: [
        "Sr",
        "Product",
        "Category",
        "Unit",
        "Stock",
        "Price",
        "Value",
        "Location",
        "Type",
        "Date",
      ],

      rows,
    })
  }

  return <ExportButton onExport={handleExport} label="PDF" />
}
