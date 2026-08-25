import { StockStatus } from "../constants/product-stock-status";

export type MonthlyReportRow = {
  id: string;
  name: string;
  category: string;
  unit: string;
  minOrderQty: number;
  maxOrderQty: number;
  currentStock: number;
  status: StockStatus;
  soldQty: number;
  soldValue: number;
  pendingPoQty: number;
  pendingIndentQty: number;
};

export type MonthlyReportTotals = {
  productCount: number;
  soldQty: number;
  soldValue: number;
  pendingPoQty: number;
  pendingIndentQty: number;
  lowStockCount: number;
  omittedCount: number;
};

export type MonthlyReportSections = {
  needsAttention: MonthlyReportRow[];
  topMovers: MonthlyReportRow[];
  pendingPurchaseOrders: MonthlyReportRow[];
  pendingIndents: MonthlyReportRow[];
};

export type MonthlyReportData = {
  monthLabel: string;
  totals: MonthlyReportTotals;
  sections: MonthlyReportSections;
};
