"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { saleKeys } from "../query/sale-keys";

export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleId: string) => {
      const response = await axios.delete(`/api/sales/${saleId}`);

      return response.data.data;
    },

    onSuccess: (_, saleId) => {
      queryClient.invalidateQueries({
        queryKey: saleKeys.all,
      });

      queryClient.removeQueries({
        queryKey: saleKeys.detail(saleId),
      });
    },
  });
}
