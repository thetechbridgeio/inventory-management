import { parseSaleQueryParams } from "@/features/sales/query/sale.query";
import { createSale } from "@/features/sales/service/create-sale.service";
import { getSales } from "@/features/sales/service/get-sales/get-sales.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
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
  return createSale(
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

  const filters = parseSaleQueryParams(searchParams);

  return getSales(companyId, {
    ...filters,
  });
});
