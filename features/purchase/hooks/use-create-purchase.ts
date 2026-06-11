"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreatePurchaseFormType } from "../types/purchase.type";
import axios from "axios";
import { purchaseKeys } from "../query/purchase-keys";

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreatePurchaseFormType) => {
      const response = await axios.post("/api/purchases", values);

      return response.data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: purchaseKeys.all,
      });
    },
  });
}
