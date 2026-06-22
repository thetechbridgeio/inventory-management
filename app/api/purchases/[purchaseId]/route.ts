import { deletePurchase } from "@/features/purchase/service/delete-purchase.service";
import { getPurchaseById } from "@/features/purchase/service/get-purchase-by-id.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    purchaseId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { purchaseId } = await context.params;

  return routeHandler(async () => {
    const { companyId } = await getCurrentUser();

    return getPurchaseById(purchaseId, companyId);
  })(request);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { purchaseId } = await context.params;

  return routeHandler(async () => {
    const { companyId } = await getCurrentUser();

    return deletePurchase(purchaseId, companyId);
  })(request);
}
