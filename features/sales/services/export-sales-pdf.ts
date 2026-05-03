import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"
import { SalesFilterState, SalesItem } from "../types/sale-entry-form.types"

interface ExportSalesPDFParams {
  data: SalesItem[]
  filters: SalesFilterState
  fileName?: string
}

export function exportSalesPDF({
  data,
  filters,
  fileName = "sales-report.pdf",
}: ExportSalesPDFParams) {
  // ─────────────────────────────────────────────
  // 1. FILTER DATA (pure logic)
  // ─────────────────────────────────────────────
  const filteredItems = data.filter((item) => {
    if (filters.product.length && !filters.product.includes(item.product)) return false
    if (filters.company.length && !filters.company.includes(item.companyName)) return false

    if (filters.dateRange.from || filters.dateRange.to) {
      const itemDate = new Date(item.dateOfIssue)

      if (filters.dateRange.from && itemDate < filters.dateRange.from) return false

      if (filters.dateRange.to) {
        const end = new Date(filters.dateRange.to)
        end.setDate(end.getDate() + 1)
        if (itemDate > end) return false
      }
    }

    if (filters.search) {
      const s = filters.search.toLowerCase()
      return (
        item.product?.toLowerCase().includes(s) ||
        item.contact?.toLowerCase().includes(s) ||
        item.companyName?.toLowerCase().includes(s)
      )
    }

    return true
  })

  // ─────────────────────────────────────────────
  // 2. PREPARE TABLE DATA
  // ─────────────────────────────────────────────
  const rows = filteredItems.map((item, index) => [
    index + 1,
    item.product,
    item.quantity,
    item.unit,
    item.contact,
    item.companyName,
    format(new Date(item.dateOfIssue), "MMM d, yyyy"),
  ])

  // ─────────────────────────────────────────────
  // 3. GENERATE PDF
  // ─────────────────────────────────────────────
  const doc = new jsPDF({ orientation: "landscape" })

  doc.setFontSize(18)
  doc.text("Sales Report", 14, 22)

  doc.setFontSize(11)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

  autoTable(doc, {
    head: [["Sr. No", "Product", "Quantity", "Unit", "Contact", "Company", "Date"]],
    body: rows,
    startY: 40,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellWidth: "wrap",
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: 15 },
      2: { cellWidth: 20 },
      3: { cellWidth: 15 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30 },
      6: { cellWidth: 25 },
    },
    headStyles: {
      fillColor: [51, 51, 51],
      textColor: 255,
      fontStyle: "bold",
    },
  })

  doc.save(fileName)

  return filteredItems.length
}