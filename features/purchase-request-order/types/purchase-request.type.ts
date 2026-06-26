export type PurchaseRequestItem = {
  productId: string;
  productName: string;
  description: string;
  category: string;
  unit: string;
  currentStock: number;
  minOrderQty: number;
  maxOrderQty: number;
  reorderQty: number;      
  requestedQty: number;    
  supplierId?: string | null;
  supplierName?: string | null
};

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