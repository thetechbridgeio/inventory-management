"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { returnKeys } from "../query/return-keys";
import { GetSaleReturnsParams } from "../types/return.type";

export function useSaleReturns(params: GetSaleReturnsParams) {
  return useQuery({
    queryKey: returnKeys.list(params),

    queryFn: async () => {
      const response = await axios.get("/api/returns", {
        params,
      });

      return response.data.data;
    },
  });
}
