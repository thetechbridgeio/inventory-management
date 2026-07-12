import { getProductMetrics } from "./get-product-metrics.service";
import { getProductOverview } from "./get-product-overview.service";
import { getProductPurchaseHistory } from "./get-product-purchase-history.service";
import { getProductSuppliers } from "./get-product-supplier.service";
import { getProductSaleHistory } from "./get-sale-history.service";

export async function getProductDetail(
  productId: string,
  companyId: string,
) {
  const [
    productOverview,
    metrics,
    suppliers,
    purchaseHistory,
    saleHistory,
  ] = await Promise.all([
    getProductOverview(productId, companyId),
    getProductMetrics(productId, companyId),
    getProductSuppliers(productId, companyId),
    getProductPurchaseHistory(productId, companyId),
    getProductSaleHistory(productId, companyId),
  ]);

  if (!productOverview || !metrics) {
    return null;
  }

  return {
    id: productOverview.id,
    productOverview,
    metrics,
    suppliers,
    purchaseHistory,
    saleHistory,
  };
}