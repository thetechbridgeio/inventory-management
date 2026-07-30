import "server-only";

import { db } from "@/db";

import {
  rollbackUploadedFiles,
  uploadImage,
} from "@/lib/storage/upload-image.service";

import { products } from "../schemas/product.schema";
import { productSuppliers } from "../schemas/product-supplier.schema";

import {
  CreateProductDTO,
  CreateProductFormType,
} from "../types/product.types";

import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { ExternalServiceError } from "@/lib/errors/external-service-error";
import { BusinessRuleError } from "@/lib/errors/business-rule-error";

import { CreateProductDTOSchema } from "../validations/product.validation";

export async function createProduct(
  data: CreateProductFormType,
  companyId: string,
) {
  if (data.maxOrderQty < data.minOrderQty) {
    throw new BusinessRuleError(
      "Maximum order quantity cannot be less than minimum order quantity.",
    );
  }

  const transactionContext = {
    uploadedFiles: [],
  };

  try {
    const imageFolder = `${companyId}/PRODUCTS`;

    return await db.transaction(async (tx) => {
      let imageUrl: string | null = null;

      if (data.image instanceof File) {
        const uploadedImage = await uploadImage({
          file: data.image,
          folder: imageFolder,
          transactionContext,
        });

        imageUrl = uploadedImage.publicUrl;
      }

      const dto: CreateProductDTO = CreateProductDTOSchema.parse({
        companyId,
        image: imageUrl,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        category: data.category,
        unit: data.unit.trim(),
        minOrderQty: data.minOrderQty,
        maxOrderQty: data.maxOrderQty,
        reorderQty: data.reorderQty,
        openingStock: data.openingStock,
        currentStock: data.openingStock,
        unitCost: data.unitCost !== undefined ? data.unitCost.toFixed(2) : null,
        location: data.location?.trim() || null,
      });

      const [product] = await tx.insert(products).values(dto).returning();

      if (data.supplierIds && data.supplierIds.length > 0) {
        await tx.insert(productSuppliers).values(
          data.supplierIds.map((supplierId) => ({
            companyId,
            productId: product.id,
            supplierId,
          })),
        );
      }

      return product;
    });
  } catch (error) {
    await rollbackUploadedFiles(transactionContext);

    if (error instanceof ExternalServiceError) {
      throw error;
    }

    mapDatabaseError(error);
  }
}
