import { getPurchaseFilters } from "@/features/purchase/service/get-purchase-filters.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

export const GET = routeHandler(async () => {
  const { companyId } = await getCurrentUser();

  return getPurchaseFilters(companyId);
});