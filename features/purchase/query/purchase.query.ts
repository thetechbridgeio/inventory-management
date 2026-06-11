import { GetPurchasesParams } from "../types/purchase.type";

export function parsePurchaseQueryParams(
  searchParams: URLSearchParams,
): GetPurchasesParams {
  const page = Number(searchParams.get("page") ?? "1");

  const startDate = searchParams.get("startDate") ?? undefined;

  const endDate = searchParams.get("endDate") ?? undefined;

  const supplierIds =
    searchParams.get("supplierIds")?.split(",").filter(Boolean) ?? undefined;

  const search = searchParams.get("search") ?? undefined;

  const sortBy =
    (searchParams.get("sortBy") as GetPurchasesParams["sortBy"]) ?? undefined;

  const sortOrder =
    (searchParams.get("sortOrder") as GetPurchasesParams["sortOrder"]) ??
    undefined;

  return {
    page,
    startDate,
    endDate,
    search,
    supplierIds,
    sortBy,
    sortOrder,
  };
}
