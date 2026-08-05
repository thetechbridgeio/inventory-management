import { deleteProduct } from "@/features/product/service/delete-product.service";
import { getProductById } from "@/features/product/service/get-product-by-id.service";
import { updateProduct } from "@/features/product/service/update-product.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { assertPermission } from "@/features/auth/constants/permissions";
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
    const { companyId, role } = await getCurrentUser();

    assertPermission(role, "product:delete");

    return deleteProduct(productId, companyId);
  })(request);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { productId } = await context.params;
  return routeHandler(async () => {
    const formData = await request.formData();

    const newImages = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File);
    const payloadRaw = formData.get("payload");

    if (!payloadRaw || typeof payloadRaw !== "string") {
      throw new ValidationError("Payload is required.");
    }
    const payload = JSON.parse(payloadRaw);

    const existingImages: string[] = Array.isArray(payload.images)
      ? payload.images.filter(
          (value: unknown): value is string => typeof value === "string",
        )
      : [];

    const { companyId } = await getCurrentUser();
    return updateProduct(productId, companyId, {
      ...payload,
      images: [...existingImages, ...newImages],
    });
  })(request);
}
