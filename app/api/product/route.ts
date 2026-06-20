import { createProduct } from "@/features/product/service/create-product.service";
import { getProducts } from "@/features/product/service/get-products.service";
import { CreateProductFormSchema } from "@/features/product/validations/product.validation";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { createRouteHandler } from "@/lib/route-helpers/route-handlers";
import { validateRequest } from "@/lib/route-helpers/validate-request";
import { NextResponse } from "next/server";

export const POST = createRouteHandler(async (request) => {
  const formData = await request.formData();
  const image = formData.get("image") as File | null;
  const payloadRaw = formData.get("payload");

  if (!payloadRaw || typeof payloadRaw !== "string") {
    return NextResponse.json(
      { message: "Payload is required" },
      { status: 400 },
    );
  }

  const payload = JSON.parse(payloadRaw);
  const { companyId } = await getCurrentUser();
  // const validatedData = await validateRequest(
  //   {
  //     ...payload,
  //     image,
  //   },
  //   CreateProductFormSchema,
  // );
  return createProduct(
    {
      ...payload,
      image,
    },
    companyId,
  );
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
