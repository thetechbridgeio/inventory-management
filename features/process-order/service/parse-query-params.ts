import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { GetProcessOrdersParams } from "../types/process-order.types";

export function parseProcessOrderQueryParams(
  searchParams: URLSearchParams,
): GetProcessOrdersParams {
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  return {
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE,
    search: searchParams.get("search")?.trim() || undefined,
    fromDate: fromDate ? new Date(fromDate) : undefined,
    toDate: toDate ? new Date(toDate) : undefined,
  };
}
