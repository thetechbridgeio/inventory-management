import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/errors/handle-api-error";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { exportPurchaseOrder } from "@/features/purchase-request-order/service/purchase-order/export-PO.service";

export async function GET(request: NextRequest) {
  try {
    const purchaseOrderId = request.nextUrl.pathname.split("/")[3];

    const user = await getCurrentUser();

    const { pdf, purchaseOrderNumber } = await exportPurchaseOrder(
      purchaseOrderId,
      user.companyId,
    );

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${purchaseOrderNumber}.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}