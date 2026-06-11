export type SupplierProduct = {
  id: string;
  name: string;
  description: string | null;
  minOrderQty: number;
  maxOrderQty: number | null;
  reorderQty: number;
};

export type SupplierDetails = {
  id: string;
  companyId: string;
  companyName: string;
  contactPersonName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  gst: string | null;
  estimatedDeliveryPeriod: number | null;
  paymentTerm: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  products: SupplierProduct[];
};