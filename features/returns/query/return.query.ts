import { SALE_RETURN_STATUS, SaleReturnStatus } from "../constants/sale-return-status";
import { GetSaleReturnsParams } from "../types/return.type";

const VALID_STATUSES = Object.values(SALE_RETURN_STATUS) as string[];

export function parseSaleReturnQueryParams(
  searchParams: URLSearchParams,
): GetSaleReturnsParams {
  const page = Number(searchParams.get("page") ?? "1");

  const statusParam = searchParams.get("status") ?? undefined;

  const status = VALID_STATUSES.includes(statusParam ?? "")
    ? (statusParam as SaleReturnStatus)
    : undefined;

  const startDate = searchParams.get("startDate") ?? undefined;

  const endDate = searchParams.get("endDate") ?? undefined;

  const search = searchParams.get("search") ?? undefined;

  const sortOrder =
    (searchParams.get("sortOrder") as GetSaleReturnsParams["sortOrder"]) ??
    undefined;

  return {
    page,
    status,
    startDate,
    endDate,
    search,
    sortOrder,
  };
}
