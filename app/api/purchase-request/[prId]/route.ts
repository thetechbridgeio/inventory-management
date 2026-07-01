import { getPurchaseRequestById } from "@/features/purchase-request-order/service/get-pr-by-id/get-pr-by-id.service";
import { approvePurchaseRequest } from "@/features/purchase-request-order/service/handle-pr/approve-pr.service";
import { rejectPurchaseRequest } from "@/features/purchase-request-order/service/handle-pr/reject-pr.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { AuthorizationError } from "@/lib/errors";
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

    return getPurchaseRequestById(companyId, prId);
  })(request);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { prId } = await context.params;

  return routeHandler(async () => {
    const { companyId, role, id } = await getCurrentUser();

    if (role !== "SUPER_ADMIN") {
      throw new AuthorizationError("User is not authorized");
    }

    const body = await request.json();

    return approvePurchaseRequest(companyId,id, prId, body);
  })(request);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { prId } = await context.params;

  return routeHandler(async () => {
    const { companyId, role } = await getCurrentUser();

    if (role === "SUPER_ADMIN") {
      return rejectPurchaseRequest(companyId, prId);
    } else {
      throw new AuthorizationError("User is not authorized");
    }
  })(request);
}
