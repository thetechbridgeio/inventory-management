import { getProductDetail } from "@/features/product/service/product-details/get-product-detail.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { productId } = await context.params;
  return routeHandler(async () => {
    const { companyId } = await getCurrentUser();
    return getProductDetail(productId, companyId);
  })(request);
}