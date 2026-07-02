import jsPDF from "jspdf";

import { PAGE, PDF_COLORS } from "./pdfConstants";
import { PurchaseOrderDocument } from "@/features/purchase-request-order/types/purchase-order.type";

/**
 * Stamps a footer (company name, generated timestamp, page X of Y) onto
 * every page of the document. Must be called last, after all content is drawn.
 */
export function addFooter(doc: jsPDF, document: PurchaseOrderDocument): void {
  const pageCount = doc.getNumberOfPages();
  const left = PAGE.marginLeft;
  const right = PAGE.width - PAGE.marginRight;
  const y = PAGE.height - 12;

  const generatedOn = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);

    doc.setDrawColor(...PDF_COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(left, y - 4, right, y - 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.muted);

    doc.text(
      `${document.company.name} · PO ${document.purchaseOrder.number} · Generated on ${generatedOn}`,
      left,
      y,
    );

    doc.text(`Page ${page} of ${pageCount}`, right, y, { align: "right" });
  }
}
