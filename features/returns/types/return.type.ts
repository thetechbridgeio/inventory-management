import z from "zod";

import { SaleReturnItemSchema } from "../validations/return.validation";
import { SaleReturnStatus } from "../constants/sale-return-status";

export type CreateSaleReturnItemFormType = z.infer<
  typeof SaleReturnItemSchema
>;

export type CreateSaleReturnFormType = {
  saleId: string;
  returnDate: string;
  reason?: string | null;
  items: CreateSaleReturnItemFormType[];
};

export type CreateSaleReturnType = {
  companyId: string;
  saleId: string;
  returnNumber: string;
  returnDate: string;
  reason: string | null;
  totalItems: number;
  totalReturnedQty: number;
  createdByUserId: string;
};

export type SaleReturnItemType = {
  saleReturnId: string;
  saleItemId: string;
  productId: string;
  quantity: number;
};

export type GetSaleReturnsParams = {
  page?: number;
  status?: SaleReturnStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortOrder?: "asc" | "desc";
};
