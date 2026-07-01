import { getPurchaseRequestItems } from "@/features/purchase-request-order/service/get-purchase-request-product/get-purchase-request-items.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

export const GET = routeHandler(async () => {
  const { companyId } = await getCurrentUser();
  const items = await getPurchaseRequestItems(companyId);
  return items;
});
