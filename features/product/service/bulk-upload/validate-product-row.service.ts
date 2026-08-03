import { RowValidationResult } from "@/lib/bulk-upload/row-validation-error";

import { ParsedProductRow } from "../../types/parsed-product-row";
import { PRODUCT_IMPORT_FIELDS } from "./product-import-fields";
import {
  getInvalidNumberMessage,
  getRequiredFieldMessage,
  PRODUCT_ROW_STATIC_MESSAGES,
  ProductRowValidationError,
} from "./product-validation-error";

export const validateProductRow = (
  row: ParsedProductRow,
): RowValidationResult<ParsedProductRow, ProductRowValidationError> | null => {
  for (const field of PRODUCT_IMPORT_FIELDS) {
    const value = row[field.key];

    if (field.type === "text") {
      const isEmpty = typeof value !== "string" || !value.trim();

      if (field.required && isEmpty) {
        return {
          rowNumber: row.rowNumber,
          field: field.key,
          error: ProductRowValidationError.REQUIRED,
          message: getRequiredFieldMessage(field),
        };
      }

      continue;
    }

    if (value === undefined) {
      if (field.required) {
        return {
          rowNumber: row.rowNumber,
          field: field.key,
          error: ProductRowValidationError.REQUIRED,
          message: getRequiredFieldMessage(field),
        };
      }

      continue;
    }

    const isInvalid =
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      (field.integer === true && !Number.isInteger(value)) ||
      (field.min !== undefined && value < field.min);

    if (isInvalid) {
      return {
        rowNumber: row.rowNumber,
        field: field.key,
        error: ProductRowValidationError.INVALID_NUMBER,
        message: getInvalidNumberMessage(field),
      };
    }
  }

  if (row.maxOrderQty < row.minOrderQty) {
    return {
      rowNumber: row.rowNumber,
      field: "maxOrderQty",
      error: ProductRowValidationError.MAX_LESS_THAN_MIN,
      message:
        PRODUCT_ROW_STATIC_MESSAGES[ProductRowValidationError.MAX_LESS_THAN_MIN],
    };
  }

  return null;
};
