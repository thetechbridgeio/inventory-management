"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import axios from "axios";
import { saleKeys } from "../query/sale-keys";
import { CreateSaleFormType } from "../types/sales.type";
import { buildFormData } from "@/lib/build-payload";

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSaleFormType) => {
      const formData = buildFormData(data);
      const response = await axios.post("/api/sales", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: saleKeys.all,
      });
    },
  });
}
