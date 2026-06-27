import { PurchaseRequestStatus } from "../constants/purchase-request-status";

export type PurchaseRequestItem = {
  productId: string;
  productName: string;
  description?: string | null;
  category: string;
  unit: string;
  currentStock: number;
  minOrderQty: number;
  maxOrderQty: number;
  reorderQty: number;
  requestedQty: number;
  supplierId?: string | null;
  supplierName?: string | null;
};

export type PurchaseRequestListItem = {
  id: string;
  requestNumber: string;
  status: PurchaseRequestStatus;
  createdAt: string;
  createdByUserName: string;
  processedAt: string | null;
  processedByUserName: string | null;
  totalItems: number;
  totalRequestedQty: number;
};

export type EligiblePurchaseRequestProduct = Omit<
  PurchaseRequestItem,
  "requestedQty"
>;

export const PURCHASE_REQUEST_DEMO_DATA: PurchaseRequestItem[] = [
  {
    productId: "prod-001",
    productName: "Engine Oil 15W-40",
    description: "Premium heavy-duty diesel engine oil for generators.",
    category: "Lubricants",
    unit: "Litre",
    currentStock: 12,
    minOrderQty: 20,
    maxOrderQty: 100,
    reorderQty: 30,
    requestedQty: 30,
    supplierId: "sup-001",
    supplierName: "ABC Lubricants Pvt Ltd",
  },
  {
    productId: "prod-002",
    productName: "Fuel Filter",
    description: "High-performance fuel filter compatible with DG sets.",
    category: "Spare Parts",
    unit: "Nos",
    currentStock: 5,
    minOrderQty: 15,
    maxOrderQty: 80,
    reorderQty: 25,
    requestedQty: 25,
    supplierId: "sup-002",
    supplierName: "Delta Industrial Supplies",
  },
  {
    productId: "prod-003",
    productName: "Air Filter",
    description: "Industrial-grade air filter for diesel generators.",
    category: "Spare Parts",
    unit: "Nos",
    currentStock: 28,
    minOrderQty: 20,
    maxOrderQty: 120,
    reorderQty: 40,
    requestedQty: 40,
    // supplierId: "sup-003",
    // supplierName: "Prime Engineering Co.",
  },
  {
    productId: "prod-004",
    productName: "Coolant",
    description: "Long-life radiator coolant with corrosion protection.",
    category: "Chemicals",
    unit: "Litre",
    currentStock: 85,
    minOrderQty: 30,
    maxOrderQty: 80,
    reorderQty: 30,
    requestedQty: 40,
    supplierId: "sup-001",
    supplierName: "ABC Lubricants Pvt Ltd",
  },
  {
    productId: "prod-005",
    productName: "V-Belt",
    description: "Heavy-duty V-belt for industrial generator engines.",
    category: "Belts",
    unit: "Nos",
    currentStock: 2,
    minOrderQty: 10,
    maxOrderQty: 60,
    reorderQty: 15,
    requestedQty: 15,
    // supplierId: "sup-004",
    // supplierName: "Power Parts India",
  },
  {
    productId: "prod-006",
    productName: "V-Belt",
    description: "Heavy-duty V-belt for industrial generator engines.",
    category: "Belts",
    unit: "Nos",
    currentStock: 2,
    minOrderQty: 10,
    maxOrderQty: 60,
    reorderQty: 0,
    requestedQty: 15,
    supplierId: "sup-004",
    supplierName: "Power Parts India",
  },
];

export const PURCHASE_REQUEST_DEMO_DATA_LIST: PurchaseRequestListItem[] = [
  {
    id: "pr-1",
    requestNumber: "PR-20260627-0001",
    status: "PENDING_APPROVAL",
    createdAt: "2026-06-27T09:15:00Z",
    createdByUserName: "Rahul Sharma",
    processedAt: null,
    processedByUserName: null,
    totalItems: 4,
    totalRequestedQty: 125,
  },
  {
    id: "pr-2",
    requestNumber: "PR-20260626-0007",
    status: "APPROVED",
    createdAt: "2026-06-26T14:30:00Z",
    createdByUserName: "Priya Das",
    processedAt: "2026-06-26T17:10:00Z",
    processedByUserName: "Amit Roy",
    totalItems: 6,
    totalRequestedQty: 320,
  },
  {
    id: "pr-3",
    requestNumber: "PR-20260625-0012",
    status: "PARTIALLY_APPROVED",
    createdAt: "2026-06-25T11:45:00Z",
    createdByUserName: "Sourav Ghosh",
    processedAt: "2026-06-25T16:20:00Z",
    processedByUserName: "Amit Roy",
    totalItems: 8,
    totalRequestedQty: 560,
  },
  {
    id: "pr-4",
    requestNumber: "PR-20260624-0005",
    status: "REJECTED",
    createdAt: "2026-06-24T08:10:00Z",
    createdByUserName: "Neha Singh",
    processedAt: "2026-06-24T10:00:00Z",
    processedByUserName: "Vikram Patel",
    totalItems: 3,
    totalRequestedQty: 42,
  },
  {
    id: "pr-5",
    requestNumber: "PR-20260623-0003",
    status: "DRAFT",
    createdAt: "2026-06-23T15:50:00Z",
    createdByUserName: "Ankit Verma",
    processedAt: null,
    processedByUserName: null,
    totalItems: 5,
    totalRequestedQty: 180,
  },
];
