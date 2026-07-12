import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import {
  GetProcessOrdersFilters,
  ProcessOrderList,
} from "../types/process-order.types";
import { PaginatedResponse } from "@/lib/common-types";

export function useProcessOrders({
  page,
  search,
  fromDate,
  toDate,
}: GetProcessOrdersFilters) {
  return useQuery({
    queryKey: [
      "process-orders",
      {
        page,
        search,
        fromDate,
        toDate,
      },
    ],

    queryFn: async (): Promise<PaginatedResponse<ProcessOrderList>> => {
      const { data } = await axios.get(
        "/api/process-order",
        {
          params: {
            page,
            search,
            fromDate: fromDate?.toISOString(),
            toDate: toDate?.toISOString(),
          },
        },
      );

      return data.data;
    },

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  });
}
