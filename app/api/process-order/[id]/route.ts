import { deleteProcessOrder } from "@/features/process-order/service/delete-process-order.service";
import { getProcessOrderById } from "@/features/process-order/service/get-process-order-by-id.service";
import { updateProcessOrder } from "@/features/process-order/service/process-order-update.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { assertPermission } from "@/features/auth/constants/permissions";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return routeHandler(async () => {
    const { companyId } = await getCurrentUser();
    return getProcessOrderById(companyId, id);
  })(request);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return routeHandler(async () => {
    const { companyId, role } = await getCurrentUser();

    assertPermission(role, "process-order:delete");

    return deleteProcessOrder(companyId, id);
  })(request);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return routeHandler(async () => {
    const { companyId } = await getCurrentUser();
    const payload = await request.json();
    return updateProcessOrder(companyId, id, payload);
  })(request);
}
