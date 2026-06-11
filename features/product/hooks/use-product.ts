import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ["product", productId],

    queryFn: async () => {
      const { data } = await axios.get(`/api/product/${productId}`);

      return data.data;
    },

    enabled: !!productId,
  });
}