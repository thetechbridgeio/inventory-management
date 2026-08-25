import z from "zod";

import {
  CreateProductFormSchema,
  UpdateProductFormSchema,
  CreateProductDTOSchema,
  UpdateProductDTOSchema,
} from "../validations/product.validation";
import { products } from "../schemas/product.schema";
import { PaginatedResponse } from "@/lib/common-types";
import { StockStatus } from "../constants/product-stock-status";
import { StockMovement } from "../constants/product-stock-movement";

export type CreateProductFormType = z.infer<typeof CreateProductFormSchema>;

export type UpdateProductFormType = z.infer<typeof UpdateProductFormSchema>;

export type CreateProductDTO = z.infer<typeof CreateProductDTOSchema>;

export type UpdateProductDTO = z.infer<typeof UpdateProductDTOSchema>;

export type Product = typeof products.$inferSelect;

export type GetProductsResponse = PaginatedResponse<Product>;

export type ProductSupplier = {
  id: string;
  companyName: string;
  contactPersonName: string | null;
  email: string | null;
  phone: string | null;
  estimatedDeliveryPeriod: number | null;
  paymentTerm: string | null;
  isActive: boolean;
};

export type ProductDetails = Product & {
  suppliers: ProductSupplier[];
};

/* ---------- QUERY TYPES ---------- */

export type GetProductsParams = {
  page?: number;
  search?: string;
  categories?: string[];
  stockStatuses?: StockStatus[]
  stockMovements?: StockMovement[];
  locations?: string[];
  units?: string[];
  sortOrder?: "asc" | "desc";
  updatedFrom?: string;
  updatedTo?: string;
};
