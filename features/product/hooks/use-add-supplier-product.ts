import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

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
    }: AddSupplierToProductInput) =>
      (
        await axios.post(
          `/api/product/${productId}/supplier`,
          {
            supplierId,
          },
        )
      ).data,

    onSuccess: async (_, variables) => {
      toast.success("Supplier added successfully");

      await queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}