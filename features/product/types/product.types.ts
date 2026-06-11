import z from "zod";
import { CreateProductFormSchema } from "../validations/product.validation";
import { ProductCategory } from "../constants/product-category";
import { products } from "../schemas/product.schema";

export type CreateProductFormType = z.infer<typeof CreateProductFormSchema>;
export type CreateProductFormInput = z.input<typeof CreateProductFormSchema>;

export type Product = typeof products.$inferSelect

export type CreateProductType = {
  companyId: string;
  name: string;
  description?: string | null;
  category: ProductCategory;
  unit: string;
  minOrderQty: number;
  maxOrderQty: number;
  reorderQty: number;
  openingStock: number;
  currentStock: number;
  location?: string | null;
};

export type GetProductsParams = {
  page?: number;
  search?: string;
  categories?: ProductCategory[];
  locations?: string[];
  units?: string[];
};
