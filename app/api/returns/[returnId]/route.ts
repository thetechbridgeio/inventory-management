import { NextRequest } from "next/server";

import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

import { getSaleReturnById } from "@/features/returns/service/get-return-by-id.service";

type RouteContext = {
  params: Promise<{
    returnId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { returnId } = await context.params;

  return routeHandler(async () => {
    const { companyId } = await getCurrentUser();

    return getSaleReturnById(returnId, companyId);
  })(request);
}
