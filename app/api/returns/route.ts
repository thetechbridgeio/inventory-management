import { NextResponse } from "next/server";

import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { assertPermission } from "@/features/auth/constants/permissions";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

import { parseSaleReturnQueryParams } from "@/features/returns/query/return.query";
import { createSaleReturn } from "@/features/returns/service/create-return.service";
import { getSaleReturns } from "@/features/returns/service/get-returns.service";
import { CreateSaleReturnFormSchema } from "@/features/returns/validations/return.validation";

export const POST = routeHandler(async (request) => {
  const { companyId, role, id } = await getCurrentUser();

  assertPermission(role, "return:create");

  const body = await request.json();

  const parsed = CreateSaleReturnFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid return payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  return createSaleReturn(parsed.data, companyId, id);
});

export const GET = routeHandler(async (request) => {
  const { companyId } = await getCurrentUser();

  const { searchParams } = new URL(request.url);

  const filters = parseSaleReturnQueryParams(searchParams);

  return getSaleReturns(companyId, filters);
});
