import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { ProductDetails } from "../types/product.types";
import { ApiSuccessResponse } from "@/lib/common-types";

export function useProduct(productId: string) {
  return useQuery<ProductDetails>({
    queryKey: ["product", productId],

    queryFn: async () => {
      const response = await axios.get<ApiSuccessResponse<ProductDetails>>(
        `/api/product/${productId}`
      );

      return response.data.data;
    },

    enabled: Boolean(productId),
  });
}