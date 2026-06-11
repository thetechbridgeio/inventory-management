import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/pagination";

export type GetSuppliersParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
  estimatedDeliveryPeriod?: number;
  createdFrom?: Date;
  createdTo?: Date;
};

export function parseSupplierQueryParams(
  searchParams: URLSearchParams,
): GetSuppliersParams {
  const page =
    Number(searchParams.get("page")) || DEFAULT_PAGE;

  const pageSize =
    Number(searchParams.get("pageSize")) ||
    DEFAULT_PAGE_SIZE;

  const search =
    searchParams.get("search")?.trim() || undefined;

  const isActiveParam =
    searchParams.get("isActive");

  const isActive =
    isActiveParam === null
      ? undefined
      : isActiveParam === "true";

  const estimatedDeliveryPeriodParam =
    searchParams.get("estimatedDeliveryPeriod");

  const estimatedDeliveryPeriod =
    estimatedDeliveryPeriodParam
      ? Number(estimatedDeliveryPeriodParam)
      : undefined;

  const createdFromParam =
    searchParams.get("createdFrom");

  const createdToParam =
    searchParams.get("createdTo");

  return {
    page,
    pageSize,
    search,
    isActive,
    estimatedDeliveryPeriod,
    createdFrom: createdFromParam
      ? new Date(createdFromParam)
      : undefined,
    createdTo: createdToParam
      ? new Date(createdToParam)
      : undefined,
  };
}