// features/sales/components/export-sales-pdf-button.tsx

"use client"

import { format } from "date-fns"

import { SalesItem } from "../../types/sales.types"

import { createPDF } from "@/lib/create-pdf"

import { ExportButton } from "@/lib/export-button"

type Props = {
  data: SalesItem[]
}

export function ExportSalesPDFButton({ data }: Props) {
  const handleExport = () => {
    const rows = data.map((item, index) => [
      index + 1,

      item.product,

      item.quantity,

      item.unit,

      item.contact,

      item.companyName,

      format(new Date(item.dateOfIssue), "dd MMM yyyy"),
    ])

    createPDF({
      title: "Sales Report",

      fileName: "sales-report.pdf",

      headers: [
        "Sr",
        "Product",
        "Quantity",
        "Unit",
        "Contact",
        "Company",
        "Date",
      ],

      rows,
    })
  }

  return <ExportButton onExport={handleExport} label="PDF" />
}
