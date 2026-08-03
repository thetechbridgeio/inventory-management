import { StockStatus } from "../constants/product-stock-status";
import { StockMovement } from "../constants/product-stock-movement";
import { GetProductsParams } from "../types/product.types";

export function parseProductQueryParams(
  searchParams: URLSearchParams,
): GetProductsParams {
  return {
    page: Number(searchParams.get("page")) || undefined,

    search: searchParams.get("search")?.trim() || undefined,

    categories:
      searchParams
        .get("categories")
        ?.split(",")
        .map((v) => v.trim())
        .filter(Boolean) || undefined,

    locations:
      searchParams
        .get("locations")
        ?.split(",")
        .map((v) => v.trim())
        .filter(Boolean) || undefined,

    units:
      searchParams
        .get("units")
        ?.split(",")
        .map((v) => v.trim())
        .filter(Boolean) || undefined,

    stockStatuses:
      searchParams
        .get("stockStatuses")
        ?.split(",")
        .map((v) => v.trim() as StockStatus)
        .filter(Boolean) || undefined,

    stockMovements:
      searchParams
        .get("stockMovements")
        ?.split(",")
        .map((v) => v.trim() as StockMovement)
        .filter(Boolean) || undefined,
  };
}
