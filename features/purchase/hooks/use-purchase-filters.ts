"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function usePurchaseFilters() {
  return useQuery({
    queryKey: ["purchase-filters"],
    queryFn: async () => {
      const { data } = await axios.get("/api/purchase/filters");
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
