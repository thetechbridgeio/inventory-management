import jsPDF from "jspdf";

import { PAGE, PDF_COLORS } from "./pdfConstants";
import { loadImageAsBase64 } from "./loadImage";
import { PurchaseOrderDocument } from "@/features/purchase-request-order/types/purchase-order.type";

/**
 * Draws the company branding block on the left and a "PURCHASE ORDER"
 * title block (with PO number + date) on the right, followed by a divider.
 * Returns the Y position where the next section should start.
 */
export async function addHeader(
  doc: jsPDF,
  document: PurchaseOrderDocument,
): Promise<number> {
  const { company, purchaseOrder } = document;
  const left = PAGE.marginLeft;
  const right = PAGE.width - PAGE.marginRight;
  let cursorY = PAGE.marginTop;

  const logo = await loadImageAsBase64(company.logoUrl);

  const logoSize = 20;
  const textStartX = logo ? left + logoSize + 5 : left;

  if (logo) {
    try {
      doc.addImage(logo.dataUrl, logo.format, left, cursorY, logoSize, logoSize);
    } catch {
      // If the logo fails to decode, silently continue without it.
    }
  }

  // Company name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text(company.name, textStartX, cursorY + 5);

  // Company meta lines (address / gst / website / contact person)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLORS.secondary);

  let metaY = cursorY + 10;
  const metaLineHeight = 4;
  const maxMetaWidth = right - textStartX - 55; // leave room for title block

  if (company.address) {
    const lines = doc.splitTextToSize(company.address, maxMetaWidth);
    doc.text(lines, textStartX, metaY);
    metaY += lines.length * metaLineHeight;
  }
  if (company.gst) {
    doc.text(`GSTIN: ${company.gst}`, textStartX, metaY);
    metaY += metaLineHeight;
  }
  const contactBits = [company.contactPersonName, company.contactPersonPhone, company.contactPersonEmail]
    .filter(Boolean)
    .join("  |  ");
  if (contactBits) {
    doc.text(contactBits, textStartX, metaY);
    metaY += metaLineHeight;
  }
  if (company.website) {
    doc.setTextColor(...PDF_COLORS.accent);
    doc.text(company.website, textStartX, metaY);
    metaY += metaLineHeight;
  }

  // "PURCHASE ORDER" title block, right aligned
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...PDF_COLORS.accent);
  doc.text("PURCHASE ORDER", right, cursorY + 5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...PDF_COLORS.secondary);
  doc.text(`PO Number: ${purchaseOrder.number}`, right, cursorY + 12, {
    align: "right",
  });
  doc.text(
    `Date: ${formatDate(purchaseOrder.date)}`,
    right,
    cursorY + 17,
    { align: "right" },
  );

  cursorY = Math.max(metaY, cursorY + 20) + 4;

  // Divider
  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(left, cursorY, right, cursorY);

  return cursorY + 8;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
