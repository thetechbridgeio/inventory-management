
"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useProductFilters() {
  return useQuery({
    queryKey: ["product-filters"],
    queryFn: async () => {
      const { data } = await axios.get("/api/product/filters");
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
