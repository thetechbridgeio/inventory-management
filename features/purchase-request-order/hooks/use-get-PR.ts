import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { PurchaseRequest } from "../types/purchase-request.type";

export function useGetPR() {
  return useQuery<PurchaseRequest[]>({
    queryKey: ["purchase-requests"],
    queryFn: async () => {
      const { data } = await axios.get<{
        data: PurchaseRequest[];
      }>("/api/purchase-request");

      return data.data;
    },
  });
}
