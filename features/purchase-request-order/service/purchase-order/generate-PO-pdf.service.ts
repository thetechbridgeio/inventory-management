import jsPDF from "jspdf";

import { addHeader } from "./helpers/addHeader";
import { addPurchaseOrderDetails } from "./helpers/addPurchaseOrderDetails";
import { addItemsTable } from "./helpers/addItemsTable";
import { addSummary } from "./helpers/addSummary";
import { addRemarks } from "./helpers/addRemarks";
import { addFooter } from "./helpers/addFooter";
import { PurchaseOrderDocument } from "../../types/purchase-order.type";

export async function generatePurchaseOrderPdf(
  document: PurchaseOrderDocument,
): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Company Header (async: fetches + embeds the logo)
  let cursorY = await addHeader(doc, document);

  // Supplier & PO Information
  cursorY = addPurchaseOrderDetails(doc, document, cursorY);

  // Products Table
  cursorY = addItemsTable(doc, document, cursorY);

  // Summary
  cursorY = addSummary(doc, document, cursorY);

  // Remarks (no-op if none provided)
  addRemarks(doc, document, cursorY);

  // Footer (stamped on every page, must run last)
  addFooter(doc, document);

  return Buffer.from(doc.output("arraybuffer"));
}
