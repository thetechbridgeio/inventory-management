"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { saleKeys } from "@/features/sales/query/sale-keys";

import { returnKeys } from "../query/return-keys";
import { CreateSaleReturnFormType } from "../types/return.type";

export function useCreateSaleReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSaleReturnFormType) => {
      const response = await axios.post("/api/returns", data);

      return response.data.data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: returnKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: saleKeys.detail(variables.saleId),
      });
    },
  });
}
