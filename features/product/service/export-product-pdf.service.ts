import "server-only";

import { GetProductsParams } from "../types/product.types";
import { getProductsForExport } from "./get-products-for-export.service";
import { generateProductsPdf } from "./generate-products-pdf.service";

export async function exportProductsPdf(
  companyId: string,
  filters: GetProductsParams,
  companyLogo: string | null,
  companyName: string,
): Promise<Uint8Array> {
  const products = await getProductsForExport(companyId, filters);

  return await generateProductsPdf({
    companyName,
    companyLogo,
    products,
  });
}
