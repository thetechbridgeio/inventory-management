import { RowValidationResult } from "@/lib/bulk-upload/row-validation-error";

import { ParsedProductRow } from "../../types/parsed-product-row";
import { ProductRowValidationError } from "./product-validation-error";
import { validateProductRow } from "./validate-product-row.service";

export const validateProductRows = (
  rows: ParsedProductRow[],
): RowValidationResult<ParsedProductRow, ProductRowValidationError>[] => {
  const errors: RowValidationResult<
    ParsedProductRow,
    ProductRowValidationError
  >[] = [];

  for (const row of rows) {
    const error = validateProductRow(row);

    if (error) {
      errors.push(error);
    }
  }

  return errors;
};
