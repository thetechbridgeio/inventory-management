"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import axios from "axios";
import { saleKeys } from "../query/sale-keys";
import { CreateSaleFormType } from "../types/sales.type";

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateSaleFormType) => {
      const response = await axios.post("/api/sales", values);

      return response.data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: saleKeys.all,
      });
    },
  });
}
