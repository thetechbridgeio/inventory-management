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
import { UpdateProductFormType, UpdateProductType } from "../types/product.types";

export async function updateProduct(
  productId: string,
  companyId: string,
  data: UpdateProductFormType,
) {
  const transactionContext = {
    uploadedFiles: [],
  };

  let oldImageToDelete: string | null = null;

  try {
    const IMAGE_FOLDER_NAME = `${companyId}/PRODUCTS`;

    const product = await db.transaction(async (tx) => {
      const [existingProduct] = await tx
        .select()
        .from(products)
        .where(
          and(eq(products.id, productId), eq(products.companyId, companyId)),
        )
        .limit(1);

      if (!existingProduct) {
        throw new Error("Product not found");
      }

      let imageUrl = existingProduct.image;

      if (data.image instanceof File) {
        const uploadedImage = await uploadImage({
          file: data.image,
          folder: IMAGE_FOLDER_NAME,
          transactionContext,
        });

        imageUrl = uploadedImage.publicUrl;

        if (existingProduct.image) {
          oldImageToDelete = existingProduct.image;
        }
      }

      const { image, supplierIds, ...productData } = data;

      const modifiedData: Partial<UpdateProductType> = {
        ...productData,
        image: imageUrl?.trim() || null,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        unit: data.unit.trim(),
        location: data.location?.trim() || null,
      };

      const [updatedProduct] = await tx
        .update(products)
        .set(modifiedData)
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

      if (supplierIds.length > 0) {
        await tx.insert(productSuppliers).values(
          supplierIds.map((supplierId: string) => ({
            companyId,
            productId,
            supplierId,
          })),
        );
      }

      return updatedProduct;
    });

    if (oldImageToDelete) {
      await deleteImage(oldImageToDelete);
    }

    return product;
  } catch (error) {
    await rollbackUploadedFiles(transactionContext);
    throw error;
  }
}
