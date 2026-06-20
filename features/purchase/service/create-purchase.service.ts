import "server-only";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/features/product/schemas/product.schema";
import { purchaseItems } from "../schemas/purchase-item.schema";
import { purchases } from "../schemas/purchase.schema";

import {
  CreatePurchaseFormType,
  CreatePurchaseType,
  PurchaseItemType,
} from "../types/purchase.type";
import { generatePurchaseNumber } from "./generate-purchase-number.service";
import {
  rollbackUploadedFiles,
  uploadImage,
} from "@/lib/storage/upload-image.service";

export async function createPurchase(
  data: CreatePurchaseFormType,
  companyId: string,
  userId: string,
) {
  const IMAGE_FOLDER_NAME = `${companyId}/INCOMINGS`;

  const transactionContext = {
    uploadedFiles: [],
  };

  try {
    return await db.transaction(async (tx) => {
      const purchaseNumber = await generatePurchaseNumber(tx, companyId);

      const grandTotal = data.items.reduce(
        (sum, item) => sum + item.quantity * item.purchasePrice,
        0,
      );

      let imageUrl: string | undefined;

      if (data.image instanceof File) {
        const uploadedImage = await uploadImage({
          file: data.image,
          folder: IMAGE_FOLDER_NAME,
          transactionContext,
        });

        imageUrl = uploadedImage.publicUrl;
      }

      const purchaseData: CreatePurchaseType = {
        companyId,
        supplierId: data.supplierId,
        purchaseNumber,
        grandTotal: grandTotal.toFixed(2),
        purchaseDate: data.purchaseDate,
        remarks: data.remarks?.trim() || null,
        image: imageUrl,
        createdBy: userId,
      };

      const [purchase] = await tx
        .insert(purchases)
        .values(purchaseData)
        .returning();

      await tx.insert(purchaseItems).values(
        data.items.map((item) => ({
          purchaseId: purchase.id,
          productId: item.productId,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice.toFixed(2),
          lineTotal: (item.quantity * item.purchasePrice).toFixed(2),
        })),
      );

      await Promise.all(
        data.items.map((item) =>
          tx
            .update(products)
            .set({
              currentStock: sql`${products.currentStock} + ${item.quantity}`,
            })
            .where(eq(products.id, item.productId)),
        ),
      );

      return purchase;
    });
  } catch (error) {
    await rollbackUploadedFiles(transactionContext);

    throw error;
  }
}
