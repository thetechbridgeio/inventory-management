import { NextRequest } from "next/server";

import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { assertPermission } from "@/features/auth/constants/permissions";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

import { rejectSaleReturn } from "@/features/returns/service/reject-return.service";
import { RejectSaleReturnSchema } from "@/features/returns/validations/return.validation";

type RouteContext = {
  params: Promise<{
    returnId: string;
  }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  const { returnId } = await context.params;

  return routeHandler(async () => {
    const { companyId, role, id } = await getCurrentUser();

    assertPermission(role, "return:reject");

    const body = await request.json().catch(() => ({}));

    const parsed = RejectSaleReturnSchema.safeParse(body);

    return rejectSaleReturn(
      returnId,
      companyId,
      id,
      parsed.success ? parsed.data.rejectionReason : undefined,
    );
  })(request);
}
