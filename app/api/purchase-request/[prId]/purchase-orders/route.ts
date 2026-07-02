import { getPurchaseOrdersByPurchaseRequest } from "@/features/purchase-request-order/service/purchase-order/get-all-PO-by-PR.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    prId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { prId } = await context.params;

  return routeHandler(async () => {
    const { companyId } = await getCurrentUser();

    return getPurchaseOrdersByPurchaseRequest({
      companyId,
      purchaseRequestId: prId,
    });
  })(request);
}