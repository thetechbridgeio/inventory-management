import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";

import { RowValidationResult } from "@/lib/bulk-upload/row-validation-error";

import { products } from "../../schemas/product.schema";
import { ParsedProductRow } from "../../types/parsed-product-row";
import { ProductRowValidationError } from "./product-validation-error";
import { PRODUCT_ROW_STATIC_MESSAGES } from "./product-validation-error";

const normalize = (value: string) => value.trim().toLowerCase();

export async function checkDuplicateProductRows(
  rows: ParsedProductRow[],
  companyId: string,
): Promise<
  RowValidationResult<ParsedProductRow, ProductRowValidationError>[]
> {
  const errors: RowValidationResult<
    ParsedProductRow,
    ProductRowValidationError
  >[] = [];

  const seenInFile = new Map<string, number>();

  for (const row of rows) {
    const key = `${normalize(row.name)}::${normalize(row.category)}`;

    if (seenInFile.has(key)) {
      errors.push({
        rowNumber: row.rowNumber,
        field: "name",
        error: ProductRowValidationError.DUPLICATE_IN_FILE,
        message: PRODUCT_ROW_STATIC_MESSAGES[
          ProductRowValidationError.DUPLICATE_IN_FILE
        ],
      });
      continue;
    }

    seenInFile.set(key, row.rowNumber);
  }

  const uniqueRows = rows.filter((row) => {
    const key = `${normalize(row.name)}::${normalize(row.category)}`;
    return seenInFile.get(key) === row.rowNumber;
  });

  if (uniqueRows.length === 0) {
    return errors;
  }

  const existingProducts = await db
    .select({ name: products.name, category: products.category })
    .from(products)
    .where(eq(products.companyId, companyId));

  const existingKeys = new Set(
    existingProducts.map(
      (product) => `${normalize(product.name)}::${normalize(product.category)}`,
    ),
  );

  for (const row of uniqueRows) {
    const key = `${normalize(row.name)}::${normalize(row.category)}`;

    if (existingKeys.has(key)) {
      errors.push({
        rowNumber: row.rowNumber,
        field: "name",
        error: ProductRowValidationError.DUPLICATE_EXISTING_PRODUCT,
        message: PRODUCT_ROW_STATIC_MESSAGES[
          ProductRowValidationError.DUPLICATE_EXISTING_PRODUCT
        ],
      });
    }
  }

  return errors;
}
