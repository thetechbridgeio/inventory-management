import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";

import {
  rollbackUploadedFiles,
  uploadImage,
} from "@/lib/storage/upload-image.service";
import { deleteImage } from "@/lib/storage/delete-image.service";

import { products } from "../schemas/product.schema";
import { productSuppliers } from "../schemas/product-supplier.schema";

import { assertNoDuplicateProduct } from "./check-duplicate-product.service";

import {
  UpdateProductDTO,
  UpdateProductFormType,
} from "../types/product.types";

import { NotFoundError } from "@/lib/errors/not-found-error";
import { BusinessRuleError } from "@/lib/errors/business-rule-error";
import { ExternalServiceError } from "@/lib/errors/external-service-error";
import { ConflictError } from "@/lib/errors/conflict-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { UpdateProductDTOSchema } from "../validations/product.validation";

export async function updateProduct(
  productId: string,
  companyId: string,
  data: UpdateProductFormType,
) {
  if (data.maxOrderQty < data.minOrderQty) {
    throw new BusinessRuleError(
      "Maximum order quantity cannot be less than minimum order quantity.",
    );
  }

  const transactionContext = {
    uploadedFiles: [],
  };

  let oldImageToDelete: string | null = null;

  try {
    const imageFolder = `${companyId}/PRODUCTS`;

    const updatedProduct = await db.transaction(async (tx) => {
      const [existingProduct] = await tx
        .select()
        .from(products)
        .where(
          and(eq(products.id, productId), eq(products.companyId, companyId)),
        )
        .limit(1);

      if (!existingProduct) {
        throw new NotFoundError("Product not found");
      }

      await assertNoDuplicateProduct(
        tx,
        companyId,
        data.name,
        data.category,
        productId,
      );

      let imageUrl = existingProduct.image;

      if (data.image instanceof File) {
        const uploadedImage = await uploadImage({
          file: data.image,
          folder: imageFolder,
          transactionContext,
        });

        imageUrl = uploadedImage.publicUrl;
        oldImageToDelete = existingProduct.image;
      } else if (data.image === null) {
        imageUrl = null;
        oldImageToDelete = existingProduct.image;
      }

      const dto: UpdateProductDTO = UpdateProductDTOSchema.parse({
        companyId,
        image: imageUrl,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        category: data.category,
        unit: data.unit.trim(),
        minOrderQty: data.minOrderQty,
        maxOrderQty: data.maxOrderQty,
        reorderQty: data.reorderQty,
        currentStock: data.currentStock,
        unitCost: data.unitCost !== undefined ? data.unitCost.toFixed(2) : null,
        location: data.location?.trim() || null,
      });

      const [product] = await tx
        .update(products)
        .set(dto)
        .where(
          and(eq(products.id, productId), eq(products.companyId, companyId)),
        )
        .returning();

      await tx
        .delete(productSuppliers)
        .where(
          and(
            eq(productSuppliers.productId, productId),
            eq(productSuppliers.companyId, companyId),
          ),
        );

      if (data.supplierIds.length > 0) {
        await tx.insert(productSuppliers).values(
          data.supplierIds.map((supplierId) => ({
            companyId,
            productId,
            supplierId,
          })),
        );
      }

      return product;
    });

    if (oldImageToDelete) {
      try {
        await deleteImage(oldImageToDelete);
      } catch (error) {
        console.error(
          "Failed to delete old product image:",
          oldImageToDelete,
          error,
        );
      }
    }

    return updatedProduct;
  } catch (error) {
    await rollbackUploadedFiles(transactionContext);

    if (
      error instanceof NotFoundError ||
      error instanceof BusinessRuleError ||
      error instanceof ExternalServiceError ||
      error instanceof ConflictError
    ) {
      throw error;
    }

    mapDatabaseError(error);
  }
}
