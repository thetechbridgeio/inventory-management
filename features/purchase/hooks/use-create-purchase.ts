"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreatePurchaseFormType } from "../types/purchase.type";
import axios from "axios";
import { purchaseKeys } from "../query/purchase-keys";
import { buildFormData } from "@/lib/build-payload";

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePurchaseFormType) => {
      const formData = buildFormData(data);
      const response = await axios.post("/api/purchases", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }); 
      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: purchaseKeys.all,
      });
    },
  });
}
