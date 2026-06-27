import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { PurchaseRequestItem } from "../../types/purchase-request.type";
import { getActivePurchaseRequestProductIds } from "./get-active-purchase-req-prod-id.service";
import { getEligiblePurchaseRequestProducts } from "./get-eligible-purchase-req-product.service";
import { mapToPurchaseRequestItems } from "./map-to-purchase-req-items.service";

export async function getPurchaseRequestItems(
  companyId: string,
): Promise<PurchaseRequestItem[]> {
  try {
    const [
      activePurchaseRequestProductIds,
      // activePurchaseOrderProductIds,
    ] = await Promise.all([
      getActivePurchaseRequestProductIds(companyId),
      // getActivePurchaseOrderProductIds(companyId),
    ]);

    const excludedProductIds = [
      ...new Set([
        ...activePurchaseRequestProductIds,
        // ...activePurchaseOrderProductIds,
      ]),
    ];

    const eligibleProducts = await getEligiblePurchaseRequestProducts(
      companyId,
      excludedProductIds,
    );

    return mapToPurchaseRequestItems(eligibleProducts);
  } catch (error) {
    console.error("Failed to get purchase request items:", error);

    throw mapDatabaseError("Unable to retrieve purchase request items.");
  }
}
