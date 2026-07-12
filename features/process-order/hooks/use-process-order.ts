import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import { ProcessOrderDetail } from "../types/process-order.types";

export function useProcessOrder(id: string) {
  return useQuery({
    queryKey: ["process-orders", id],

    queryFn: async (): Promise<ProcessOrderDetail> => {
      const { data } = await axios.get(
        `/api/process-order/${id}`
      );

      return data.data;
    },

    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });
}