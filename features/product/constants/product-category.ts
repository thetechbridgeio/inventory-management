export const PRODUCT_CATEGORIES = {
  RAW: "RAW",
  FINISHED: "FINISHED",
  SPARE: "SPARE",
} as const;

export type ProductCategory =
  (typeof PRODUCT_CATEGORIES)[keyof typeof PRODUCT_CATEGORIES];

export const PRODUCT_CATEGORY_LABELS: Record<
  ProductCategory,
  string
> = {
  [PRODUCT_CATEGORIES.RAW]: "Raw Material",
  [PRODUCT_CATEGORIES.FINISHED]: "Finished Product",
  [PRODUCT_CATEGORIES.SPARE]: "Spare Part",
};