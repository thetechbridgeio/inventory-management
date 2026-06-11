// app/api/product/filters/route.ts

import { getProductFilters } from "@/features/product/service/get-product-filters.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { createRouteHandler } from "@/lib/route-helpers/route-handlers";

export const GET = createRouteHandler(async () => {
  const { companyId } = await getCurrentUser();

  return getProductFilters(companyId);
});