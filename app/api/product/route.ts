
import { createProduct } from "@/features/product/service/create-product.service";
import { getProducts } from "@/features/product/service/get-products.service";
import { CreateProductFormSchema } from "@/features/product/validations/product.validation";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { createRouteHandler } from "@/lib/route-helpers/route-handlers";
import { validateRequest } from "@/lib/route-helpers/validate-request";

export const POST = createRouteHandler(async (request) => {
  const data = await validateRequest(request, CreateProductFormSchema);
  const { companyId } = await getCurrentUser();

  return createProduct(data, companyId);
});

export const GET = createRouteHandler(async (request) => {
  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page")) || undefined;
  const search = searchParams.get("search")?.trim() || undefined;

  const categories =
    searchParams
      .get("categories")
      ?.split(",")
      .map((v) => v.trim())
      .filter(Boolean) || undefined;

  const locations =
    searchParams
      .get("locations")
      ?.split(",")
      .map((v) => v.trim())
      .filter(Boolean) || undefined;

  const units =
    searchParams
      .get("units")
      ?.split(",")
      .map((v) => v.trim())
      .filter(Boolean) || undefined;

  const { companyId } = await getCurrentUser();

  return getProducts(companyId, {
    page,
    search,
    categories,
    locations,
    units,
  });
});