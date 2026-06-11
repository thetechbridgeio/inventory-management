"use client";

import { purchaseKeys } from "@/features/purchase/query/purchase-keys";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GetSalesParams } from "../types/sales.type";


export function useSales(params: GetSalesParams) {
  return useQuery({
    queryKey: purchaseKeys.list(params),

    queryFn: async () => {
      const response = await axios.get("/api/sales", {
        params,
      });

      return response.data.data;
    },
  });
}
