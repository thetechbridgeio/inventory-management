import { jsPDF } from "jspdf"

import autoTable from "jspdf-autotable"

type CreatePDFParams = {
  title: string

  fileName: string

  headers: string[]

  rows: (string | number)[][]

  orientation?: "portrait" | "landscape"
}

export function createPDF({
  title,
  fileName,
  headers,
  rows,
  orientation = "landscape",
}: CreatePDFParams) {
  const doc = new jsPDF({
    orientation,
  })

  doc.setFontSize(20)

  doc.text(title, 14, 20)

  doc.setFontSize(10)

  doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 28)

  autoTable(doc, {
    head: [headers],

    body: rows,

    startY: 36,

    theme: "grid",

    styles: {
      fontSize: 9,
      valign: "middle",
    },

    headStyles: {
      fillColor: [24, 24, 27], // black/dark zinc

      textColor: [255, 255, 255], // white

      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },

    tableLineColor: [229, 231, 235],

    tableLineWidth: 0.1,
  })

  doc.save(fileName)
}
