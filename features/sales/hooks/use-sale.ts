"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { saleKeys } from "../query/sale-keys";

export function useSale(saleId?: string) {
  return useQuery({
    queryKey: saleKeys.detail(saleId ?? ""),
    enabled: !!saleId,
    queryFn: async () => {
      const response = await axios.get(`/api/sales/${saleId}`);

      return response.data.data;
    },
  });
}
