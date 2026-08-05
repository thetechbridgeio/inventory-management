import { NextRequest } from "next/server";

import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { assertPermission } from "@/features/auth/constants/permissions";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

import { approveSaleReturn } from "@/features/returns/service/approve-return.service";

type RouteContext = {
  params: Promise<{
    returnId: string;
  }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const { returnId } = await context.params;

  return routeHandler(async () => {
    const { companyId, role, id } = await getCurrentUser();

    assertPermission(role, "return:approve");

    return approveSaleReturn(returnId, companyId, id);
  })(request);
}
