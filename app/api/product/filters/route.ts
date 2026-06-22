import { getProductFilters } from "@/features/product/service/get-product-filters.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

export const GET = routeHandler(async () => {
  const { companyId } = await getCurrentUser();
  return getProductFilters(companyId);
});