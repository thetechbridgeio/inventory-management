"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { GetPurchasesParams } from "../types/purchase.type";
import axios from "axios";
import { purchaseKeys } from "../query/purchase-keys";

export function usePurchases(params: GetPurchasesParams) {
  return useQuery({
    queryKey: purchaseKeys.list(params),

    queryFn: async () => {
      const response = await axios.get("/api/purchases", {
        params,
      });

      return response.data.data;
    },
  });
}

export function useExportPurchases() {
  return useMutation({
    mutationFn: async (filters: GetPurchasesParams) => {
      const { data } = await axios.get("/api/purchases/export", {
        params: filters,
      });

      return data.data;
    },
  });
}
