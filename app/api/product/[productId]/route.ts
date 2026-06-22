import { deleteProduct } from "@/features/product/service/delete-product.service";
import { getProductById } from "@/features/product/service/get-product-by-id.service";
import { updateProduct } from "@/features/product/service/update-product.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { ValidationError } from "@/lib/errors";
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
    return getProductById(productId, companyId);
  })(request);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { productId } = await context.params;
  return routeHandler(async () => {
    const { companyId } = await getCurrentUser();
    return deleteProduct(productId, companyId);
  })(request);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { productId } = await context.params;
  return routeHandler(async () => {
    const formData = await request.formData();

    const image = formData.get("image") as File | null;
    const payloadRaw = formData.get("payload");

    if (!payloadRaw || typeof payloadRaw !== "string") {
      throw new ValidationError("Payload is required.");
    }
    const payload = JSON.parse(payloadRaw);
    const { companyId } = await getCurrentUser();
    return updateProduct(productId, companyId, {
      ...payload,
      image,
    });
  })(request);
}
