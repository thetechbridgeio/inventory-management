"use client";

import { saleKeys } from "@/features/sales/query/sale-keys";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GetSalesParams } from "../types/sales.type";


export function useSales(params: GetSalesParams) {
  return useQuery({
    queryKey: saleKeys.list(params),

    queryFn: async () => {
      const response = await axios.get("/api/sales", {
        params,
      });

      return response.data.data;
    },
  });
}
