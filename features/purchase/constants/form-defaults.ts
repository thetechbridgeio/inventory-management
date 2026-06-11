import { CreatePurchaseFormType } from "../types/purchase.type";

export const CREATE_PURCHASE_FORM_DEFAULT: CreatePurchaseFormType = {
  supplierId: "",
  purchaseDate: "",
  remarks: "",
  items: [
    {
      productId: "",
      quantity: 0,
      purchasePrice: 0,
    },
  ],
};
