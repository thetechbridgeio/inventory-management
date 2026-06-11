import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type AddSupplierToProductInput = {
  productId: string;
  supplierId: string;
};

export function useAddSupplierToProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      supplierId,
    }: AddSupplierToProductInput) => {
      const { data } = await axios.post(
        `/api/product/${productId}/supplier`,
        {
          supplierId,
        },
      );

      return data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
    },
  });
}