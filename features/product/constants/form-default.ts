export const CREATE_PRODUCT_DEFAULT_VALUES = {
  name: "",
  description: undefined,
  category: "",
  unit: "",
  minOrderQty: undefined,
  maxOrderQty: undefined,
  reorderQty: undefined,
  openingStock: undefined,
  location: undefined,
  image: undefined,
  supplierIds: [],
};


import { UpdateProductFormType } from "../types/product.types";

export const UPDATE_PRODUCT_DEFAULT_VALUES: UpdateProductFormType = {
  name: "",
  description: "",
  category: "",
  unit: "",
  minOrderQty: 0,
  maxOrderQty: 0,
  reorderQty: 0,
  currentStock: 0,
  location: "",
  image: undefined,
  supplierIds: [],
};