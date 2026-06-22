import { parseSupplierQueryParams } from "@/features/suppliers/query/suppliers.query";
import { createSupplier } from "@/features/suppliers/service/create-supplier.service";
import { getSuppliers } from "@/features/suppliers/service/get-suppliers.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

export const GET = routeHandler(async (request) => {
  const { companyId } = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const filters = parseSupplierQueryParams(searchParams);
  return getSuppliers(companyId, filters);
});

export const POST = routeHandler(async (request) => {
  const { companyId } = await getCurrentUser();
  const body = await request.json();
  const supplier = await createSupplier(body, companyId);
  return supplier;
});
