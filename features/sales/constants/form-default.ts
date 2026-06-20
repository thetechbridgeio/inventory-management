import { CreateSaleFormType } from "../types/sales.type";

export const CREATE_SALE_FORM_DEFAULT: CreateSaleFormType = {
  saleDate: "",
  remarks: "",
  image: undefined,
  items: [
    {
      productId: "",
      quantity: 0,
      sellingPrice: 0,
    },
  ],
};
