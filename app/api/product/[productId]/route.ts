import { deleteProduct } from "@/features/product/service/delete-product.service";
import { getProductById } from "@/features/product/service/get-product-by-id.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { createRouteHandler } from "@/lib/route-helpers/route-handlers";
import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { productId } = await context.params;

  return createRouteHandler(async () => {
    const { companyId } = await getCurrentUser();

    return getProductById(productId, companyId);
  })(request);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { productId } = await context.params;

  return createRouteHandler(async () => {
    const { companyId } = await getCurrentUser();

    return deleteProduct(productId, companyId);
  })(request);
}
