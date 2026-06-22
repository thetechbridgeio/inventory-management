"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useProductFilters() {
  return useQuery({
    queryKey: ["product-filters"],

    queryFn: async () => (await axios.get("/api/product/filters")).data.data,

    staleTime: 1000 * 60 * 5,
  });
}
