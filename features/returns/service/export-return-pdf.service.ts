import "server-only";

import { GetSaleReturnsParams } from "../types/return.type";
import { getSaleReturnsForExport } from "./get-returns-for-export.service";
import { generateReturnsPdf } from "./generate-returns-pdf.service";

export async function exportSaleReturnsPdf(
  companyId: string,
  filters: GetSaleReturnsParams,
  companyLogo: string | null,
  companyName: string,
): Promise<Uint8Array> {
  const returns = await getSaleReturnsForExport(companyId, filters);

  return await generateReturnsPdf({
    companyName,
    companyLogo,
    returns,
    filters,
  });
}
