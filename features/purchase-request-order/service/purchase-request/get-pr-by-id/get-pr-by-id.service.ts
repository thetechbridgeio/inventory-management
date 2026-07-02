import { AuthorizationError, ValidationError } from "@/lib/errors";
import { ViewPurchaseRequestType } from "../../../types/purchase-request.type";
import { getPurchaseRequestHeader } from "./get-pr-header.service";
import { getPurchaseRequestProducts } from "./get-pr-products.service";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function getPurchaseRequestById(
  companyId: string,
  purchaseRequestId: string,
): Promise<ViewPurchaseRequestType> {
  try {
    if (!companyId) {
      throw new ValidationError("Company ID is required.");
    }

    if (!purchaseRequestId) {
      throw new ValidationError("Purchase Request ID is required.");
    }

    const [header, products] = await Promise.all([
      getPurchaseRequestHeader(companyId, purchaseRequestId),
      getPurchaseRequestProducts(purchaseRequestId),
    ]);

    if (!header) {
      throw new ValidationError("Purchase request not found.");
    }

    return {
      ...header,
      products,
    };
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof AuthorizationError
    ) {
      throw error;
    }

    throw mapDatabaseError(error);
  }
}