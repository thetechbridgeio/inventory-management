import jsPDF from "jspdf";

import { CONTENT_WIDTH, PAGE, PDF_COLORS } from "./pdfConstants";
import { PurchaseOrderDocument } from "@/features/purchase-request-order/types/purchase-order.type";

/**
 * Draws a bordered "Vendor" panel with the supplier's details.
 * Returns the Y position where the next section should start.
 */
export function addPurchaseOrderDetails(
  doc: jsPDF,
  document: PurchaseOrderDocument,
  startY: number,
): number {
  const { supplier } = document;
  const left = PAGE.marginLeft;
  const panelPadding = 4;
  const labelWidth = 24;

  const rows: [string, string][] = [
    ["Vendor", supplier.companyName],
    ...(supplier.contactPersonName ? ([["Contact", supplier.contactPersonName]] as [string, string][]) : []),
    ...(supplier.phone ? ([["Phone", supplier.phone]] as [string, string][]) : []),
    ...(supplier.email ? ([["Email", supplier.email]] as [string, string][]) : []),
    ...(supplier.address ? ([["Address", supplier.address]] as [string, string][]) : []),
    ...(supplier.gst ? ([["GSTIN", supplier.gst]] as [string, string][]) : []),
  ];

  doc.setFontSize(8.5);
  const lineHeight = 5;
  const textMaxWidth = CONTENT_WIDTH - panelPadding * 2 - labelWidth;

  // Pre-measure wrapped line counts to size the panel before drawing it.
  let totalLines = 0;
  const wrapped = rows.map(([label, value]) => {
    const lines = doc.splitTextToSize(value, textMaxWidth);
    totalLines += lines.length;
    return { label, lines };
  });

  const panelHeight = panelPadding * 2 + 5 + totalLines * lineHeight;

  doc.setFillColor(...PDF_COLORS.panelBg);
  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(left, startY, CONTENT_WIDTH, panelHeight, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text("BILL TO / VENDOR", left + panelPadding, startY + panelPadding + 2);

  let rowY = startY + panelPadding + 8;
  for (const { label, lines } of wrapped) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PDF_COLORS.secondary);
    doc.text(`${label}:`, left + panelPadding, rowY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...PDF_COLORS.primary);
    doc.text(lines, left + panelPadding + labelWidth, rowY);

    rowY += lines.length * lineHeight;
  }

  return startY + panelHeight + 8;
}
