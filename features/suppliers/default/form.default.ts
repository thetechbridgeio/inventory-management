import { CreateSupplierFormType } from "../types/suppliers.type";

export const CREATE_SUPPLIER_FORM_DEFAULT: CreateSupplierFormType = {
  companyName: "",
  contactPersonName: undefined,
  email: undefined,
  phone: undefined,
  address: undefined,
  description: undefined,
  gst: undefined,
  estimatedDeliveryPeriod: undefined,
  paymentTerm: undefined,
};
