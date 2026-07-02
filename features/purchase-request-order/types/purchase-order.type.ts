import { PurchaseOrderStatus } from "../constants/purchase-order-status";

export type PurchaseOrderListItem = {
  id: string;
  purchaseOrderNumber: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  totalItems: number;
  totalOrderedQty: number;
  createdAt: string;
};

export type PurchaseOrderDocument = {
  purchaseOrder: {
    id: string;
    number: string;
    date: Date;
    remarks: string | null;
  };

  company: {
    name: string;
    address: string | null;
    gst: string | null;
    logoUrl: string | null;
    website: string | null;
    contactPersonName: string | null;
    contactPersonEmail: string | null;
    contactPersonPhone: string | null;
  };

  supplier: {
    companyName: string;
    contactPersonName: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    gst: string | null;
  };

  items: {
    productName: string;
    description: string | null;
    unit: string;
    orderedQty: number;
  }[];

  summary: {
    totalItems: number;
    totalOrderedQty: number;
  };
};