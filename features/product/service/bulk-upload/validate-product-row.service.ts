import { RowValidationResult } from "@/lib/bulk-upload/row-validation-error";

import { ParsedProductRow } from "../../types/parsed-product-row";
import {
  PRODUCT_ROW_VALIDATION_MESSAGES,
  ProductRowValidationError,
} from "./product-validation-error";

export const validateProductRow = (
  row: ParsedProductRow,
): RowValidationResult<ParsedProductRow, ProductRowValidationError> | null => {
  const createError = (
    field: keyof ParsedProductRow,
    error: ProductRowValidationError,
  ): RowValidationResult<ParsedProductRow, ProductRowValidationError> => ({
    rowNumber: row.rowNumber,
    field,
    error,
    message: PRODUCT_ROW_VALIDATION_MESSAGES[error],
  });

  switch (true) {
    case !row.name.trim():
      return createError("name", ProductRowValidationError.NAME_REQUIRED);

    case !row.category.trim():
      return createError(
        "category",
        ProductRowValidationError.CATEGORY_REQUIRED,
      );

    case !row.unit.trim():
      return createError("unit", ProductRowValidationError.UNIT_REQUIRED);

    case !Number.isFinite(row.minOrderQty):
      return createError(
        "minOrderQty",
        ProductRowValidationError.MIN_ORDER_QTY_REQUIRED,
      );

    case !Number.isInteger(row.minOrderQty) || row.minOrderQty < 0:
      return createError(
        "minOrderQty",
        ProductRowValidationError.INVALID_MIN_ORDER_QTY,
      );

    case !Number.isFinite(row.maxOrderQty):
      return createError(
        "maxOrderQty",
        ProductRowValidationError.MAX_ORDER_QTY_REQUIRED,
      );

    case !Number.isInteger(row.maxOrderQty) || row.maxOrderQty < 0:
      return createError(
        "maxOrderQty",
        ProductRowValidationError.INVALID_MAX_ORDER_QTY,
      );

    case row.maxOrderQty < row.minOrderQty:
      return createError(
        "maxOrderQty",
        ProductRowValidationError.MAX_LESS_THAN_MIN,
      );

    case !Number.isFinite(row.reorderQty):
      return createError(
        "reorderQty",
        ProductRowValidationError.REORDER_QTY_REQUIRED,
      );

    case !Number.isInteger(row.reorderQty) || row.reorderQty < 0:
      return createError(
        "reorderQty",
        ProductRowValidationError.INVALID_REORDER_QTY,
      );

    case !Number.isFinite(row.openingStock):
      return createError(
        "openingStock",
        ProductRowValidationError.OPENING_STOCK_REQUIRED,
      );

    case !Number.isInteger(row.openingStock) || row.openingStock < 0:
      return createError(
        "openingStock",
        ProductRowValidationError.INVALID_OPENING_STOCK,
      );

    default:
      return null;
  }
};
