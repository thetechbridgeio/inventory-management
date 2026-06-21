import z from "zod";

import {
  CreateProductFormSchema,
  UpdateProductFormSchema,
} from "../validations/product.validation";

import { products } from "../schemas/product.schema";

export type Product = typeof products.$inferSelect;

/* ---------- FORM TYPES ---------- */

export type CreateProductFormType = z.infer<
  typeof CreateProductFormSchema
>;

export type CreateProductFormInput = z.input<
  typeof CreateProductFormSchema
>;

export type UpdateProductFormType = z.infer<
  typeof UpdateProductFormSchema
>;

export type UpdateProductFormInput = z.input<
  typeof UpdateProductFormSchema
>;

/* ---------- DB INSERT TYPES ---------- */

export type CreateProductType = {
  companyId: string;
  name: string;
  description?: string | null;
  category: string;
  unit: string;
  image?: string | null;
  minOrderQty: number;
  maxOrderQty: number;
  reorderQty: number;
  openingStock: number;
  currentStock: number;
  location?: string | null;
};

export type UpdateProductType = Omit<
  CreateProductType,
  "companyId" | "openingStock" | "currentStock"
>;

/* ---------- QUERY TYPES ---------- */

export type GetProductsParams = {
  page?: number;
  search?: string;
  categories?: string[];
  locations?: string[];
  units?: string[];
};