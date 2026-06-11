import { parseSupplierQueryParams } from "@/features/suppliers/query/suppliers.query";
import { createSupplier } from "@/features/suppliers/service/create-supplier.service";
import { getSuppliers } from "@/features/suppliers/service/get-suppliers.service";
import { supplierSchema } from "@/features/suppliers/validations/suppliers.validation";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { createRouteHandler } from "@/lib/route-helpers/route-handlers";
import { validateRequest } from "@/lib/route-helpers/validate-request";

export const GET = createRouteHandler(async (request) => {
  const { companyId } = await getCurrentUser();

  const { searchParams } = new URL(request.url);

  const filters = parseSupplierQueryParams(searchParams);

  return getSuppliers({
    companyId,
    ...filters,
  });
});

export const POST = createRouteHandler(async (request) => {
  const data = await validateRequest(request, supplierSchema);
  const { companyId } = await getCurrentUser();
  return createSupplier(data, companyId);
});
