// features/purchases/components/export-purchases-pdf-button.tsx

"use client"

import { format } from "date-fns"

import { Purchase } from "../../types/purchase.types"

import { createPDF } from "@/lib/create-pdf"

import { ExportButton } from "@/lib/export-button"

type Props = {
  data: Purchase[]
}

export function ExportPurchasesPDFButton({ data }: Props) {
  const handleExport = () => {
    const rows = data.map((item, index) => [
      index + 1,

      item.product,

      item.quantity,

      item.unit,

      item.poNumber,

      item.supplier,

      item.rackNumber,

      format(new Date(item.dateOfReceiving), "dd MMM yyyy"),
    ])

    createPDF({
      title: "Purchases Report",

      fileName: "purchases-report.pdf",

      headers: [
        "Sr",
        "Product",
        "Quantity",
        "Unit",
        "PO Number",
        "Supplier",
        "Rack Number",
        "Date",
      ],

      rows,
    })
  }

  return <ExportButton onExport={handleExport} label="PDF" />
}
