import { CreateProductFormType } from "../types/product.types";

export const CREATE_PRODUCT_DEFAULT_VALUES: CreateProductFormType = {
  name: "",
  description: "",
  category: "",
  unit: "",
  minOrderQty: 0,
  maxOrderQty: 0,
  reorderQty: 0,
  openingStock: 0,
  location: "",
  image: undefined,
  supplierIds: [],
};
