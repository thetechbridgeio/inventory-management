import { addSupplierToProduct } from "@/features/product/service/add-supplier-to-product.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { productId } = await context.params;

  return routeHandler(async () => {
    const { companyId } = await getCurrentUser();
    const body = await request.json();
    return addSupplierToProduct(companyId, productId, body.supplierId);
  })(request);
}
