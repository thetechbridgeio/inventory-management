import { createPurchaseRequest } from "@/features/purchase-request-order/service/create-purchase-request.service";
import { getPurchaseRequestItems } from "@/features/purchase-request-order/service/get-purchase-request-product/get-purchase-request-items.service";
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
  // const { companyId } = await getCurrentUser();
  const items = await getPurchaseRequestItems("8e962863-f4da-447c-8b7f-4a73b9396c98");
  return items;
});
