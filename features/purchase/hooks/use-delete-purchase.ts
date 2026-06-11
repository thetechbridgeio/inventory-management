"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { purchaseKeys } from "../query/purchase-keys";

export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchaseId: string) => {
      const response = await axios.delete(`/api/purchases/${purchaseId}`);

      return response.data.data;
    },

    onSuccess: (_, purchaseId) => {
      queryClient.invalidateQueries({
        queryKey: purchaseKeys.all,
      });

      queryClient.removeQueries({
        queryKey: purchaseKeys.detail(purchaseId),
      });
    },
  });
}
