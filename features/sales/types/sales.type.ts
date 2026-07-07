import z from "zod";
import {
  SaleItemSchema,
} from "../validations/sales.validation";

export type CreateSaleItemFormType = z.infer<typeof SaleItemSchema>;

export type CreateSaleFormType = {
  saleDate: string;
  remarks?: string | null;
  image?: File | null;
  soldTo?: string | null;
  workOrderNumber?: string;
  challanNumber?: string;
  invoiceNumber?: string;
  items: CreateSaleItemFormType[];
};

export type CreateSaleType = {
  companyId: string;
  saleNumber: string;
  saleDate: string;
  image?: string;
  soldTo?: string | null;
  remarks: string | null;
  workOrderNumber: string | null;
  challanNumber: string | null;
  invoiceNumber: string | null;
  grandTotal: string;
  createdBy: string;
};

export type SaleItemType = {
  saleId: string;
  productId: string;
  quantity: number;
  sellingPrice: string;
  lineTotal: string;
};

export type GetSalesParams = {
  page?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortOrder?: "asc" | "desc";
};
