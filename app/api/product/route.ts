import { parseProductQueryParams } from "@/features/product/query/parse-product-query";
import { createProduct } from "@/features/product/service/create-product.service";
import { getProducts } from "@/features/product/service/get-products.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { ValidationError } from "@/lib/errors";
import {
  routeHandler,
} from "@/lib/route-helpers/route-handlers";

export const POST = routeHandler(async (request) => {
  const formData = await request.formData();

  const image = formData.get("image") as File | null;
  const payloadRaw = formData.get("payload");

  if (!payloadRaw || typeof payloadRaw !== "string") {
    throw new ValidationError("Payload is required.");
  }
  const payload = JSON.parse(payloadRaw);
  const { companyId } = await getCurrentUser();
  return createProduct(
    {
      ...payload,
      image,
    },
    companyId,
  );
});

export const GET = routeHandler(async (request) => {
  const { companyId } = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const filters = parseProductQueryParams(searchParams);
  return getProducts(companyId, filters);
});
