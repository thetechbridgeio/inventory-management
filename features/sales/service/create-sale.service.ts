import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";

import { products } from "@/features/product/schemas/product.schema";

import {
  rollbackUploadedFiles,
  uploadImage,
} from "@/lib/storage/upload-image.service";

import { generateSaleNumber } from "./generate-sale-number.service";

import { sales } from "../schemas/sales.schema";
import { saleItems } from "../schemas/sales-item.schema";

import {
  CreateSaleFormType,
  CreateSaleType,
  SaleItemType,
} from "../types/sales.type";

export async function createSale(
  data: CreateSaleFormType,
  companyId: string,
  userId: string,
) {
  const IMAGE_FOLDER_NAME = `${companyId}/OUTGOINGS`;

  const transactionContext = {
    uploadedFiles: [],
  };

  try {
    return await db.transaction(async (tx) => {
      const saleNumber = await generateSaleNumber(tx, companyId);

      const grandTotal = data.items.reduce(
        (sum, item) => sum + item.quantity * item.sellingPrice,
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

      const saleData: CreateSaleType = {
        companyId,
        saleNumber,
        grandTotal: grandTotal.toFixed(2),
        saleDate: data.saleDate,
        remarks: data.remarks?.trim() || null,
        workOrderNumber: data.workOrderNumber?.trim() || null,
        challanNumber: data.challanNumber?.trim() || null,
        invoiceNumber: data.invoiceNumber?.trim() || null,
        isWarranty: data.isWarranty ?? false,
        image: imageUrl,
        soldTo: data.soldTo?.trim() || null,
        createdBy: userId,
      };

      const [sale] = await tx.insert(sales).values(saleData).returning();

      const saleItemValues: SaleItemType[] = data.items.map((item) => ({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice.toFixed(2),
        lineTotal: (item.quantity * item.sellingPrice).toFixed(2),
      }));

      await tx.insert(saleItems).values(saleItemValues);

      await Promise.all(
        data.items.map((item) =>
          tx
            .update(products)
            .set({
              currentStock: sql`${products.currentStock} - ${item.quantity}`,
            })
            .where(eq(products.id, item.productId)),
        ),
      );

      return sale;
    });
  } catch (error) {
    await rollbackUploadedFiles(transactionContext);

    throw error;
  }
}
