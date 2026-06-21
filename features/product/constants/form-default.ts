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