import { createPurchaseRequest } from "@/features/purchase-request-order/service/purchase-request/create-purchase-request.service";
import { getPurchaseRequests } from "@/features/purchase-request-order/service/purchase-request/get-purchase-request.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

export const POST = routeHandler(async (request) => {
  const { companyId, id: createdByUserId } = await getCurrentUser();

  const body = await request.json();

  const purchaseRequest = await createPurchaseRequest(
    body,
    companyId,
    createdByUserId,
  );

  return purchaseRequest;
});

export const GET = routeHandler(async () => {
  const { companyId } = await getCurrentUser();
  const items = await getPurchaseRequests(companyId);
  return items;
});
