import { parsePurchaseQueryParams } from "@/features/purchase/query/purchase.query";
import { getPurchasesForExport } from "@/features/purchase/service/get-purchase-for-export.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

export const GET = routeHandler(async (request) => {
  const { companyId } = await getCurrentUser();

  const { searchParams } = new URL(request.url);

  const filters = parsePurchaseQueryParams(searchParams);

  return getPurchasesForExport(companyId, filters);
});