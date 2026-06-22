import z from "zod";

import { suppliers } from "../schemas/supplier.schema";
import { PaginatedResponse } from "@/lib/common-types";
import {
  CreateSupplierFormSchema,
  UpdateSupplierFormSchema,
  CreateSupplierDTOSchema,
} from "../validations/suppliers.validation";

export type CreateSupplierFormType = z.infer<typeof CreateSupplierFormSchema>;

export type UpdateSupplierFormType = z.infer<typeof UpdateSupplierFormSchema>;

export type CreateSupplierDTO = z.infer<typeof CreateSupplierDTOSchema>;

export type UpdateSupplierDTO = CreateSupplierDTO;

export type Supplier = typeof suppliers.$inferSelect;

export type GetSuppliersResponse = PaginatedResponse<Supplier>;

export type SupplierProduct = {
  id: string;
  name: string;
  description: string | null;
  minOrderQty: number;
  maxOrderQty: number | null;
  reorderQty: number;
};

export type SupplierDetails = Supplier & {
  products: SupplierProduct[];
};

/* ---------- QUERY TYPES ---------- */

export type GetSuppliersParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  estimatedDeliveryPeriod?: number;
  createdFrom?: Date;
  createdTo?: Date;
};