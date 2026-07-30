export enum ProductRowValidationError {
  NAME_REQUIRED = "NAME_REQUIRED",
  CATEGORY_REQUIRED = "CATEGORY_REQUIRED",
  UNIT_REQUIRED = "UNIT_REQUIRED",

  MIN_ORDER_QTY_REQUIRED = "MIN_ORDER_QTY_REQUIRED",
  INVALID_MIN_ORDER_QTY = "INVALID_MIN_ORDER_QTY",

  MAX_ORDER_QTY_REQUIRED = "MAX_ORDER_QTY_REQUIRED",
  INVALID_MAX_ORDER_QTY = "INVALID_MAX_ORDER_QTY",
  MAX_LESS_THAN_MIN = "MAX_LESS_THAN_MIN",

  REORDER_QTY_REQUIRED = "REORDER_QTY_REQUIRED",
  INVALID_REORDER_QTY = "INVALID_REORDER_QTY",

  OPENING_STOCK_REQUIRED = "OPENING_STOCK_REQUIRED",
  INVALID_OPENING_STOCK = "INVALID_OPENING_STOCK",
}

export const PRODUCT_ROW_VALIDATION_MESSAGES: Record<
  ProductRowValidationError,
  string
> = {
  [ProductRowValidationError.NAME_REQUIRED]: "Product Name is required.",

  [ProductRowValidationError.CATEGORY_REQUIRED]: "Category is required.",

  [ProductRowValidationError.UNIT_REQUIRED]: "Unit is required.",

  [ProductRowValidationError.MIN_ORDER_QTY_REQUIRED]:
    "Min Order Qty is required.",

  [ProductRowValidationError.INVALID_MIN_ORDER_QTY]:
    "Min Order Qty must be a whole number greater than or equal to 0.",

  [ProductRowValidationError.MAX_ORDER_QTY_REQUIRED]:
    "Max Order Qty is required.",

  [ProductRowValidationError.INVALID_MAX_ORDER_QTY]:
    "Max Order Qty must be a whole number greater than or equal to 0.",

  [ProductRowValidationError.MAX_LESS_THAN_MIN]:
    "Max Order Qty cannot be less than Min Order Qty.",

  [ProductRowValidationError.REORDER_QTY_REQUIRED]:
    "Reorder Qty is required.",

  [ProductRowValidationError.INVALID_REORDER_QTY]:
    "Reorder Qty must be a whole number greater than or equal to 0.",

  [ProductRowValidationError.OPENING_STOCK_REQUIRED]:
    "Opening Stock is required.",

  [ProductRowValidationError.INVALID_OPENING_STOCK]:
    "Opening Stock must be a whole number greater than or equal to 0.",
};
