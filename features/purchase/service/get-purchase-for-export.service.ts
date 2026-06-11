import { GetPurchasesParams } from "../types/purchase.type";
import { buildPurchasesQuery } from "./build-purchase-query.service";

export async function getPurchasesForExport(
  companyId: string,
  filters: GetPurchasesParams = {},
) {
  return buildPurchasesQuery(companyId, filters);
}