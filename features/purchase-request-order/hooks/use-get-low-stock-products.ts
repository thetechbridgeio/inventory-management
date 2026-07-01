import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { PurchaseRequestProduct } from "../types/purchase-request.type";

export function useGetPRProduct() {
  return useQuery<PurchaseRequestProduct[]>({
    queryKey: ["purchase-requests-products"],
    queryFn: async () => {
      const { data } = await axios.get<{
        data: PurchaseRequestProduct[];
      }>("/api/purchase-request/product");

      return data.data;
    },
  });
}
