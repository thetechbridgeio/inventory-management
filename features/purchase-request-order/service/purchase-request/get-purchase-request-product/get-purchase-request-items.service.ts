import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { getActivePurchaseRequestProductIds } from "./get-active-purchase-req-prod-id.service";
import { getEligiblePurchaseRequestProducts } from "./get-eligible-purchase-req-product.service";
import { PurchaseRequestProduct } from "../../../types/purchase-request.type";

export async function getPurchaseRequestItems(
  companyId: string,
): Promise<PurchaseRequestProduct[]> {
  try {
    const [activePurchaseRequestProductIds] = await Promise.all([
      getActivePurchaseRequestProductIds(companyId),
    ]);

    console.log(activePurchaseRequestProductIds)

    const excludedProductIds = [
      ...new Set([...activePurchaseRequestProductIds]),
    ];

    const eligibleProducts = await getEligiblePurchaseRequestProducts(
      companyId,
      excludedProductIds,
    );

    return Array.from(
      new Map(
        eligibleProducts.map((product) => [product.productId, product]),
      ).values(),
    );
  } catch (error) {
    console.error("Failed to get purchase request items:", error);

    throw mapDatabaseError("Unable to retrieve purchase request items.");
  }
}
