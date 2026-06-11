import { deleteSale } from "@/features/sales/service/delete-sale.service";
import { getSaleById } from "@/features/sales/service/get-sale-by-id.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { createRouteHandler } from "@/lib/route-helpers/route-handlers";
import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    saleId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { saleId } = await context.params;

  return createRouteHandler(async () => {
    const { companyId } = await getCurrentUser();

    return getSaleById(saleId, companyId);
  })(request);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { saleId } = await context.params;

  return createRouteHandler(async () => {
    const { companyId } = await getCurrentUser();

    return deleteSale(saleId, companyId);
  })(request);
}
