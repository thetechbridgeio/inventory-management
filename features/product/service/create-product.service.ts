import "server-only";

import { db } from "@/db";

import {
  rollbackUploadedFiles,
  uploadImage,
} from "@/lib/storage/upload-image.service";

import { products } from "../schemas/product.schema";
import { productSuppliers } from "../schemas/product-supplier.schema";

import {
  CreateProductFormType,
  CreateProductType,
} from "../types/product.types";

export async function createProduct(
  data: CreateProductFormType,
  companyId: string,
) {
  const transactionContext = {
    uploadedFiles: [],
  };

  try {
    const IMAGE_FOLDER_NAME = `${companyId}/PRODUCTS`;


    return await db.transaction(async (tx) => {
      let imageUrl: string | undefined;

      if (data.image instanceof File) {
        const uploadedImage = await uploadImage({
          file: data.image,
          folder: IMAGE_FOLDER_NAME,
          transactionContext,
        });

        imageUrl = uploadedImage.publicUrl;
      }

      const { image, supplierIds, ...productData } = data;

      const modifiedData: CreateProductType = {
        ...productData,
        companyId,
        image: imageUrl,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        unit: data.unit.trim(),
        currentStock: data.openingStock,
        location: data.location?.trim() || null,
      };

      const [product] = await tx
        .insert(products)
        .values(modifiedData)
        .returning();

      if (supplierIds.length > 0) {
        await tx.insert(productSuppliers).values(
          supplierIds.map((supplierId) => ({
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

    throw error;
  }
}
