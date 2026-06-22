import { parsePurchaseQueryParams } from "@/features/purchase/query/purchase.query";
import { createPurchase } from "@/features/purchase/service/create-purchase.service";
import { getPurchases } from "@/features/purchase/service/get-purchases.service";
import { CreatePurchaseFormSchema } from "@/features/purchase/validations/purchase.validation";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { validateRequest } from "@/lib/route-helpers/validate-request";
import { NextResponse } from "next/server";

export const POST = routeHandler(async (request) => {
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
  const { companyId, id } = await getCurrentUser();
  return createPurchase(
    {
      ...payload,
      image,
    },
    companyId,
    id,
  );
});

export const GET = routeHandler(async (request) => {
  const { companyId } = await getCurrentUser();

  const { searchParams } = new URL(request.url);

  const filters = parsePurchaseQueryParams(searchParams);

  return getPurchases(companyId, {
    ...filters,
  });
});
