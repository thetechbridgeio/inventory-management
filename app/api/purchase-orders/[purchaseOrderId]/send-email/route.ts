import { sendPurchaseOrderEmail } from "@/features/purchase-request-order/service/purchase-order/send-PO-email.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { NextRequest } from "next/server";


export const POST = routeHandler(async (request: NextRequest) => {
  const purchaseOrderId = request.nextUrl.pathname.split("/")[3];

  const user = await getCurrentUser();

  await sendPurchaseOrderEmail(
    purchaseOrderId,
    user.companyId,
  );

  return {
    message: "Purchase order emailed successfully.",
  };
});