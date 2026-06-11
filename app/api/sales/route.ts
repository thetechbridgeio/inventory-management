import { parseSaleQueryParams } from "@/features/sales/query/sale.query";
import { createSale } from "@/features/sales/service/create-sale.service";
import { getSales } from "@/features/sales/service/get-sales/get-sales.service";
import { CreateSaleFormSchema } from "@/features/sales/validations/sales.validation";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { createRouteHandler } from "@/lib/route-helpers/route-handlers";
import { validateRequest } from "@/lib/route-helpers/validate-request";



export const POST = createRouteHandler(async (request) => {
  const data = await validateRequest(request, CreateSaleFormSchema);
  const { companyId, id } = await getCurrentUser();
  return createSale(data, companyId, id);
});

export const GET = createRouteHandler(async (request) => {
  const { companyId } = await getCurrentUser();

  const { searchParams } = new URL(request.url);

  const filters = parseSaleQueryParams(searchParams);

  return getSales(companyId, {
    ...filters,
  });
});
