import { createProcessOrder } from "@/features/process-order/service/create-process-order.service";
import { getProcessOrders } from "@/features/process-order/service/get-process-orders.service";
import { parseProcessOrderQueryParams } from "@/features/process-order/service/parse-query-params";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

export const POST = routeHandler(async (request) => {
    const { companyId } = await getCurrentUser();
  const body = await request.json();
  return createProcessOrder(companyId, body);
});

export const GET = routeHandler(async (request) => {
  const { companyId } = await getCurrentUser();
  const filters = parseProcessOrderQueryParams(request.nextUrl.searchParams);

  return getProcessOrders(companyId, filters);
});
