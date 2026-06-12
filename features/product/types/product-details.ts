export type ProductDetails = {
  id: string;
  companyId: string;

  name: string;
  description: string | null;

  category: string | null;
  unit: string;

  minOrderQty: number;
  maxOrderQty: number | null;
  reorderQty: number;

  openingStock: number;
  currentStock: number;

  location: string | null;

  createdAt: Date;
  updatedAt: Date;

  suppliers: {
    id: string;
    companyName: string;
    contactPersonName: string | null;
    email: string | null;
    phone: string | null;
    estimatedDeliveryPeriod: number | null;
    paymentTerm: string | null;
    isActive: boolean;
  }[];
};