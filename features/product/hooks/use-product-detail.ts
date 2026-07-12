import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ProductDashboard } from "../types/product-details.type";

export function useProductDashboard(productId: string) {
  return useQuery<ProductDashboard>({
    queryKey: ["product-detail", productId],

    queryFn: async () => {
      const response = await axios.get(`/api/product/detail/${productId}`);

      return response.data.data;
    },

    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });
}
