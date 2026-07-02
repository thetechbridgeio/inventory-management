import { generatePurchaseOrderPdf } from "./generate-PO-pdf.service";
import { getPurchaseOrderDocument } from "./get-PO-document.service";

export async function exportPurchaseOrder(
  purchaseOrderId: string,
  companyId: string,
): Promise<{
  pdf: Buffer;
  purchaseOrderNumber: string;
}> {
  const document = await getPurchaseOrderDocument(
    purchaseOrderId,
    companyId,
  );

  return {
    pdf: await generatePurchaseOrderPdf(document),
    purchaseOrderNumber: document.purchaseOrder.number,
  };
}