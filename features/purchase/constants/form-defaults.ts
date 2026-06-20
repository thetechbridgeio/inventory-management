import { CreatePurchaseFormType } from "../types/purchase.type";

export const CREATE_PURCHASE_FORM_DEFAULT: CreatePurchaseFormType = {
  supplierId: "",
  purchaseDate: "",
  remarks: "",
  image: undefined,
  items: [
    {
      productId: "",
      quantity: 0,
      purchasePrice: 0,
    },
  ],
};
