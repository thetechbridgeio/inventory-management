import { GetSalesParams } from "../types/sales.type";

export function parseSaleQueryParams(
  searchParams: URLSearchParams,
): GetSalesParams {
  const page = Number(searchParams.get("page") ?? "1");

  const startDate = searchParams.get("startDate") ?? undefined;

  const endDate = searchParams.get("endDate") ?? undefined;

  const search = searchParams.get("search") ?? undefined;

  const sortOrder =
    (searchParams.get("sortOrder") as GetSalesParams["sortOrder"]) ??
    undefined;

  return {
    page,
    startDate,
    endDate,
    search,
    sortOrder,
  };
}
