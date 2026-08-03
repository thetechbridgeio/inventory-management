import { deleteSupplier } from "@/features/suppliers/service/delete-supplier.service";
import { getSupplierById } from "@/features/suppliers/service/get-supplier-by-id.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { assertPermission } from "@/features/auth/constants/permissions";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    supplierId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { supplierId } = await context.params;

  return routeHandler(async () => {
    const { companyId } = await getCurrentUser();
    return getSupplierById(supplierId, companyId);
  })(request);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { supplierId } = await context.params;

  return routeHandler(async () => {
    const { companyId, role } = await getCurrentUser();

    assertPermission(role, "supplier:delete");

    return deleteSupplier(supplierId, companyId);
  })(request);
}
