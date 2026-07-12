import { ProductSupplier } from "./product.types";

export type PurchaseHistory = {
  purchaseQty: number;
  purchasePrice: number;
  purchaseNumber: string;
  supplier: {
    id: string;
    supplierName: string;
  };
  purchaseDate: Date;
  challanNumber?: string;
  invoiceNumber?: string;
};

export type SaleHistory = {
  saleQty: number;
  sellingPrice: number;
  saleNumber: string;
  soldTo?: string;
  saleDate: Date;
  workOrderNumber?: string;
  challanNumber?: string;
  invoiceNumber?: string;
};

export type ProductMetrics = {
  // Inventory
  openingStock: number;
  currentStock: number;

  // Purchases
  totalPurchasedQty: number;
  totalPurchaseValue: number;
  averagePurchasePrice: number;
  latestPurchasePrice?: number;
  lastPurchaseDate?: Date;

  // Sales
  totalSoldQty: number;
  totalSalesValue: number;
  averageSellingPrice: number;
  latestSellingPrice?: number;
  lastSaleDate?: Date;

};

export type ProductOverview = {
  name: string;
  description?: string;
  category: string;
  unit: string;
  minOrderQty: number;
  maxOrderQty: number;
  reorderQty: number;
  location?: string;
  image?: string;
  lastUpdatedAt?: Date;
};

export type ProductDashboard= {
  id: string;
  productOverview: ProductOverview;
  metrics: ProductMetrics;
  suppliers: ProductSupplier[];
  purchaseHistory: PurchaseHistory[];
  saleHistory: SaleHistory[];
};