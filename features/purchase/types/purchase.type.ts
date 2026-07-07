import z from "zod";
import { PurchaseItemSchema } from "../validations/purchase.validation";

export type CreatePurchaseItemType = z.infer<typeof PurchaseItemSchema>;

export type CreatePurchaseFormType = {
  supplierId: string;
  purchaseDate: string;
  remarks?: string;
  challanNumber?: string;
  invoiceNumber?: string;
  image?: File | null;
  items: CreatePurchaseItemType[];
};

export type PurchaseItemType = {
  purchaseId: string;
  productId: string;
  quantity: number;
  purchasePrice: string;
  lineTotal: string;
};

export type CreatePurchaseType = {
  companyId: string;
  supplierId: string;
  purchaseNumber: string;
  challanNumber?: string;
  invoiceNumber?: string;
  grandTotal: string;
  purchaseDate: string;
  image?: string;
  remarks: string | null;
  createdBy: string;
};

export type GetPurchasesParams = {
  page?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  supplierIds?: string[];
  sortBy?: "supplier" | "grandTotal";
  sortOrder?: "asc" | "desc";
};
