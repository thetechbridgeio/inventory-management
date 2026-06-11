"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { purchaseKeys } from "../query/purchase-keys";

export function usePurchase(purchaseId?: string) {
  return useQuery({
    queryKey: purchaseKeys.detail(purchaseId ?? ""),
    enabled: !!purchaseId,
    queryFn: async () => {
      const response = await axios.get(`/api/purchases/${purchaseId}`);

      return response.data.data;
    },
  });
}
