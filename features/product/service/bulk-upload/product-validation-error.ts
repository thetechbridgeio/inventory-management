import { ProductImportField, ProductImportNumberField } from "./product-import-fields";

export enum ProductRowValidationError {
  REQUIRED = "REQUIRED",
  INVALID_NUMBER = "INVALID_NUMBER",
  MAX_LESS_THAN_MIN = "MAX_LESS_THAN_MIN",

  DUPLICATE_IN_FILE = "DUPLICATE_IN_FILE",
  DUPLICATE_EXISTING_PRODUCT = "DUPLICATE_EXISTING_PRODUCT",
}

// Messages that don't depend on which field triggered them.
export const PRODUCT_ROW_STATIC_MESSAGES: Record<
  | ProductRowValidationError.MAX_LESS_THAN_MIN
  | ProductRowValidationError.DUPLICATE_IN_FILE
  | ProductRowValidationError.DUPLICATE_EXISTING_PRODUCT,
  string
> = {
  [ProductRowValidationError.MAX_LESS_THAN_MIN]:
    "Max Order Qty cannot be less than Min Order Qty.",

  [ProductRowValidationError.DUPLICATE_IN_FILE]:
    "Duplicate product name and category within the uploaded file.",

  [ProductRowValidationError.DUPLICATE_EXISTING_PRODUCT]:
    "A product with this name and category already exists.",
};

export function getRequiredFieldMessage(field: ProductImportField): string {
  return `${field.header} is required.`;
}

export function getInvalidNumberMessage(
  field: ProductImportNumberField,
): string {
  const kind = field.integer ? "a whole number" : "a number";
  const constraint =
    field.min !== undefined ? ` greater than or equal to ${field.min}` : "";

  return `${field.header} must be ${kind}${constraint}.`;
}
