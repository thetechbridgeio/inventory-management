import { parsePurchaseQueryParams } from "@/features/purchase/query/purchase.query";
import { createPurchase } from "@/features/purchase/service/create-purchase.service";
import { getPurchases } from "@/features/purchase/service/get-purchases.service";
import { CreatePurchaseFormSchema } from "@/features/purchase/validations/purchase.validation";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { createRouteHandler } from "@/lib/route-helpers/route-handlers";
import { validateRequest } from "@/lib/route-helpers/validate-request";


export const POST = createRouteHandler(async (request) => {
  const data = await validateRequest(request, CreatePurchaseFormSchema);
  const { companyId, id } = await getCurrentUser();
  return createPurchase(data, companyId, id);
});

export const GET = createRouteHandler(async (request) => {
  const { companyId } = await getCurrentUser();

  const { searchParams } = new URL(request.url);

  const filters = parsePurchaseQueryParams(searchParams);

  return getPurchases(companyId, {
    ...filters,
  });
});
