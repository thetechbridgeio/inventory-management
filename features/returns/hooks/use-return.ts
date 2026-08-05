"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { returnKeys } from "../query/return-keys";

export function useSaleReturn(returnId?: string) {
  return useQuery({
    queryKey: returnKeys.detail(returnId ?? ""),
    enabled: !!returnId,
    queryFn: async () => {
      const response = await axios.get(`/api/returns/${returnId}`);

      return response.data.data;
    },
  });
}
